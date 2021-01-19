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
import { wait_for_block } from "./wait";

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEYID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

interface Context {
    geysers: string[];
    startBlock: number;
    initDistribution: RewardsFixed;
    multiplexer: Multiplexer;
    s3: S3;
    provider: Provider;
    rate: number;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    signer: Signer;
}

//  Proposer

const init_rewards = async (context: Context, endBlock: number) => {
    const { s3, provider } = context;
    const start = await provider.getBlock(endBlock);
    const end = await provider.getBlock(endBlock);
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        context.startBlock,
        end.number,
        end.timestamp,
        1
    );
    const rewards = sum_rewards([r, parse_rewards_fixed(context.initDistribution)]);
    assert(
        validate_rewards(rewards),
        "init_rewards: new calculated rewards with init distribution did not validate"
    );

    const merkle = MultiMerkle.fromRewards(rewards);
    await upload_rewards(s3, merkle.merkleRewards);
    const txr = await context.multiplexer
        .proposeRoot(
            merkle.root,
            merkle.root,
            merkle.cycle,
            context.startBlock,
            end.number
        )
        .then((x) => x.wait(1));
    console.log(
        `Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx ${txr.transactionHash}`
    );
};

const bump_rewards = async (context: Context, endBlock: number) => {
    const { s3, provider } = context;
    const last = await context.multiplexer.lastPublishedMerkleData();
    const lastStart = await provider.getBlock(last.startBlock.toNumber());
    const lastEnd = await provider.getBlock(last.endBlock.toNumber());
    assert(
        lastStart.number === context.startBlock,
        "bump_rewards: last published start block does not match contextured start block"
    );
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        context.startBlock,
        lastEnd.number,
        lastEnd.timestamp,
        last.cycle.toNumber()
    );
    const calcLastRewards = sum_rewards([
        r,
        parse_rewards_fixed(context.initDistribution),
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
        context.geysers,
        context.startBlock,
        nextEnd.number,
        lastEnd.timestamp,
        nextEnd.timestamp
    );

    const newWithInit = sum_rewards([
        newRewards,
        parse_rewards_fixed(context.initDistribution),
    ]);

    assert(
        validate_rewards(newWithInit),
        "bump_rewards: new calculated rewards with init distribution did not validate"
    );
    const merkle = MultiMerkle.fromRewards(newWithInit);
    await upload_rewards(s3, merkle.merkleRewards);
    const txr = await context.multiplexer
        .proposeRoot(
            merkle.root,
            merkle.root,
            merkle.cycle,
            context.startBlock,
            nextEnd.number
        )
        .then((x) => x.wait(1));
    console.log(
        `Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx ${txr.transactionHash}`
    );
};

// Approver

const approve_rewards = async (context: Context) => {
    const { s3, provider } = context;
    const proposed = await context.multiplexer.lastProposedMerkleData();
    const published = await context.multiplexer.lastPublishedMerkleData();
    assert(
        published.cycle < proposed.cycle,
        "approve_rewards: proposed cycle not greater than last published cycle"
    );
    const proposedStart = await provider.getBlock(proposed.startBlock.toNumber());
    const proposedEnd = await provider.getBlock(proposed.endBlock.toNumber());
    assert(
        proposedStart.number === context.startBlock,
        "approve_rewards: proposed published start block does not match contextured start block"
    );
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        context.startBlock,
        proposedEnd.number,
        proposedEnd.timestamp,
        proposed.cycle.toNumber()
    );
    const calcedRewards = sum_rewards([
        r,
        parse_rewards_fixed(context.initDistribution),
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
    const txr = await context.multiplexer
        .approveRoot(
            merkle.root,
            merkle.root,
            merkle.cycle,
            context.startBlock,
            proposedEnd.number
        )
        .then((x) => x.wait(1));
    console.log(`Approving merkle root ${merkle.root} ${txr.transactionHash}`);
};

const run_init = async (context: Context) => {
    const { provider } = context;
    let current_block = await provider.getBlock((await provider.getBlockNumber()) - 30);
    if (current_block.number < context.startBlock) {
        current_block = await wait_for_block(
            provider,
            context.startBlock,
            context.rate
        );
    }
    await init_rewards(context, current_block.number);
};

const run_propose = async (context: Context) => {
    const { provider } = context;
    let current_block = await provider.getBlock((await provider.getBlockNumber()) - 30);
    assert(
        current_block.number < context.startBlock,
        "run_propose: not yet past start block"
    );
    current_block = await wait_for_block(provider, context.startBlock, context.rate);

    await bump_rewards(context, current_block.number);
};


export { Context, init_rewards, bump_rewards, approve_rewards, run_init, run_propose };
