import _ from "lodash";
import { Awaited } from "ts-essentials";
import { Multiplexer } from "../typechain";
import { Provider, Block } from "@ethersproject/providers";
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
import { wait_for_block, wait_for_time, wait_for_next_proposed } from "./wait";
import { log_merkle_pair } from "../test/utils/test";

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
    epoch: number;
}

//  Proposer

const init_rewards = async (context: Context, proposer: Signer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer)}
    const { s3, provider } = context;
    const end = await provider.getBlock((await provider.getBlockNumber()) - 30);
    const startBlock = await provider.getBlock(context.startBlock);
    const endTime =
        startBlock.timestamp +
        Math.floor((end.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    assert(
        end.number > startBlock.number && endTime > 0,
        "init_rewards: starting too early"
    );
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        context.startBlock,
        end.number,
        endTime,
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

const bump_rewards = async (
    context: Context,
    proposer: Signer,
    last: Awaited<ReturnType<Context["multiplexer"]["lastPublishedMerkleData"]>>,
    lastStart: Block,
    lastEnd: Block,
    nextEnd: Block
) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer)}
    const { s3, provider } = context;
    assert(
        lastStart.number === context.startBlock,
        "bump_rewards: last published start block does not match contextured start block"
    );
    const startBlock = await provider.getBlock(context.startBlock);
    const lastEndTime =
        startBlock.timestamp +
        Math.floor((lastEnd.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        context.startBlock,
        lastEnd.number,
        lastEndTime,
        last.cycle.toNumber()
    );
    const calcLastRewards = sum_rewards([
        r,
        parse_rewards_fixed(context.initDistribution),
    ]);
    const fetchedLastRewards = await fetch_rewards(s3, last.root);

    assert(
        validate_rewards(calcLastRewards),
        "bump_rewards: validate last rewards with initial distribution failed"
    );
    const calcMerkle = MultiMerkle.fromRewards(calcLastRewards);
    assert(
        calcMerkle.root === last.root,
        "bump_rewards last reward root and calculated reward root failed to match"
    );
    assert(
        compare_merkle_rewards(calcMerkle.merkleRewards, fetchedLastRewards),
        "bump_rewards: fetched last rewards and calculated last rewards failed to match"
    );

    const nextEndTime =
        startBlock.timestamp +
        Math.floor((nextEnd.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;

    const newRewards = await play_system_rewards(
        r,
        provider,
        context.geysers,
        context.startBlock,
        nextEnd.number,
        lastEndTime,
        nextEndTime
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
    return context.multiplexer.lastProposedMerkleData();
};

// Approver

const approve_rewards = async (context: Context, approver: Signer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(approver)}

    const { s3, provider } = context;
    const proposed = await context.multiplexer.lastProposedMerkleData();
    const published = await context.multiplexer.lastPublishedMerkleData();
    assert(
        published.cycle < proposed.cycle,
        "approve_rewards: proposed cycle not greater than last published cycle"
    );
    const proposedStart = await provider.getBlock(proposed.startBlock.toNumber());
    const proposedEnd = await provider.getBlock(proposed.endBlock.toNumber());
    const startBlock = await provider.getBlock(context.startBlock);
    const endTime =
        startBlock.timestamp +
        Math.floor((proposedEnd.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    assert(
        proposedStart.number === context.startBlock,
        "approve_rewards: proposed published start block does not match contextured start block"
    );
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        context.startBlock,
        proposedEnd.number,
        endTime,
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

const run_propose = async (context: Context, proposer: Signer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer)}
    const { provider } = context;
    const current = await provider.getBlockNumber();
    while (true) {
        let last = await context.multiplexer.lastPublishedMerkleData();
        let lastConfirmed = await context.multiplexer.lastPublishedMerkleData({
            blockTag: current - 30,
        });
        if (!_.isEqual(last, lastConfirmed)) {
            await wait_for_block(provider, current, context.rate); // waits 30 confirmations
            lastConfirmed = await context.multiplexer.lastPublishedMerkleData({
                blockTag: current,
            });
        }
        last = await context.multiplexer.lastPublishedMerkleData();
        assert(
            _.isEqual(last, lastConfirmed),
            "run_propose: abnormalities in last published merkle data, another proposer is running?"
        );
        const startBlock = await provider.getBlock(context.startBlock);
        const lastStart = await provider.getBlock(last.startBlock.toNumber());
        const lastEnd = await provider.getBlock(last.endBlock.toNumber());
        const nextEndTime = // since it's complicated because of contract logic to make cycles perfectly match up with epochs
            startBlock.timestamp +
            (Math.floor((lastEnd.timestamp - startBlock.timestamp) / context.epoch) +
                1) *
                context.epoch;
        const nextEnd = await wait_for_time(provider, nextEndTime, context.rate);
        const propose = await bump_rewards(context, proposer, last, lastStart, lastEnd, nextEnd);
        const fromEvent = await wait_for_next_proposed(
            provider,
            context.multiplexer,
            context.rate,
            last.cycle.toNumber()
        );
        assert(
            _.isEqual(propose, fromEvent),
            "run_propose: proposed root does not match root from event, another proposer is running?"
        );
    }
};

export { Context, init_rewards, bump_rewards, approve_rewards, run_propose };
