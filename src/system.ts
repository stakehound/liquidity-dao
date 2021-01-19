import _ from "lodash";
import { Multiplexer } from "../typechain";
import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import {
    fetch_system_rewards,
    RewardsFixed,
    parse_rewards_fixed,
    play_system_rewards,
    validate_rewards,
    sum_rewards,
} from "./calc_stakes";
import S3 from "aws-sdk/clients/s3";
import { upload_rewards, fetch_rewards } from "./s3";
import MultiMerkle, { compare_merkle_rewards } from "./MultiMerkle";
import { assert } from "ts-essentials";

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEYID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

interface Config {
    geysers: string[];
    startBlock: number;
    initDistribution: RewardsFixed;
    multiplexer: Multiplexer;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    signer: Signer;
}

//  Proposer

const init_rewards = async (
    config: Config,
    s3: S3,
    provider: Provider,
    endBlock: number
) => {
    const start = await provider.getBlock(endBlock);
    const end = await provider.getBlock(endBlock);
    const r = await fetch_system_rewards(
        provider,
        config.geysers,
        config.startBlock,
        end.number,
        end.timestamp,
        1
    );
    const rewards = sum_rewards([r, parse_rewards_fixed(config.initDistribution)]);
    assert(
        validate_rewards(rewards),
        "init_rewards: new calculated rewards with init distribution did not validate"
    );

    const merkle = MultiMerkle.fromRewards(rewards);
    await upload_rewards(s3, merkle.merkleRewards);
    const txr = await config.multiplexer
        .proposeRoot(
            merkle.root,
            merkle.root,
            merkle.cycle,
            config.startBlock,
            end.number
        )
        .then((x) => x.wait(1));
    console.log(
        `Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx ${txr.transactionHash}`
    );
};

const bump_rewards = async (
    config: Config,
    s3: S3,
    provider: Provider,
    endBlock: number
) => {
    const last = await config.multiplexer.lastPublishedMerkleData();
    const lastStart = await provider.getBlock(last.startBlock.toNumber());
    const lastEnd = await provider.getBlock(last.endBlock.toNumber());
    assert(
        lastStart.number === config.startBlock,
        "bump_rewards: last published start block does not match configured start block"
    );
    const r = await fetch_system_rewards(
        provider,
        config.geysers,
        config.startBlock,
        lastEnd.number,
        lastEnd.timestamp,
        last.cycle.toNumber()
    );
    const calcLastRewards = sum_rewards([
        r,
        parse_rewards_fixed(config.initDistribution),
    ]);

    assert(
        validate_rewards(calcLastRewards),
        "bump_rewards: validate last rewards with initial distribution failed"
    );
    const calcMerkle = MultiMerkle.fromRewards(calcLastRewards);
    assert(
        calcMerkle.root === last.root,
        "bump_rewards last reward root and calculated reward root failed to match"
    );
    const fetchedLastRewards = await fetch_rewards(s3, last.root);
    assert(
        compare_merkle_rewards(calcMerkle.merkleRewards, fetchedLastRewards),
        "bump_rewards: fetched last rewards and calculated last rewards failed to match"
    );

    const nextEnd = await provider.getBlock(endBlock);
    const newRewards = await play_system_rewards(
        r,
        provider,
        config.geysers,
        config.startBlock,
        nextEnd.number,
        lastEnd.timestamp,
        nextEnd.timestamp
    );

    const newWithInit = sum_rewards([
        newRewards,
        parse_rewards_fixed(config.initDistribution),
    ]);

    assert(
        validate_rewards(newWithInit),
        "bump_rewards: new calculated rewards with init distribution did not validate"
    );
    const merkle = MultiMerkle.fromRewards(newWithInit);
    await upload_rewards(s3, merkle.merkleRewards);
    const txr = await config.multiplexer
        .proposeRoot(
            merkle.root,
            merkle.root,
            merkle.cycle,
            config.startBlock,
            nextEnd.number
        )
        .then((x) => x.wait(1));
    console.log(
        `Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx ${txr.transactionHash}`
    );
};

// Approver

const approve_rewards = async (config: Config, s3: S3, provider: Provider) => {
    const proposed = await config.multiplexer.lastProposedMerkleData();
    const published = await config.multiplexer.lastPublishedMerkleData();
    assert(
        published.cycle < proposed.cycle,
        "approve_rewards: proposed cycle not greater than last published cycle"
    );
    const proposedStart = await provider.getBlock(proposed.startBlock.toNumber());
    const proposedEnd = await provider.getBlock(proposed.endBlock.toNumber());
    assert(
        proposedStart.number === config.startBlock,
        "approve_rewards: proposed published start block does not match configured start block"
    );
    const r = await fetch_system_rewards(
        provider,
        config.geysers,
        config.startBlock,
        proposedEnd.number,
        proposedEnd.timestamp,
        proposed.cycle.toNumber()
    );
    const calcedRewards = sum_rewards([
        r,
        parse_rewards_fixed(config.initDistribution),
    ]);
    assert(
        validate_rewards(calcedRewards),
        "approve_rewards: calculated rewards with init distribution did not validate"
    );
    const merkle = MultiMerkle.fromRewards(calcedRewards);
    const fetchedRewards = await fetch_rewards(s3, proposed.root);

    assert(
        merkle.root === proposed.root,
        "approve_rewards: calculated root does not match proposed"
    );
    assert(
        compare_merkle_rewards(fetchedRewards, merkle.merkleRewards),
        "approve_rewards: fetched rewards did not match calculated"
    );
    const txr = await config.multiplexer
        .approveRoot(
            merkle.root,
            merkle.root,
            merkle.cycle,
            config.startBlock,
            proposedEnd.number
        )
        .then((x) => x.wait(1));
    console.log(`Approving merkle root ${merkle.root} ${txr.transactionHash}`);
};

export { init_rewards, bump_rewards, approve_rewards };
