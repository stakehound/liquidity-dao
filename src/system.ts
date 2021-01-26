import _ from "lodash";
import { Awaited } from "ts-essentials";
import { Multiplexer } from "../typechain";
import { Provider, Block } from "@ethersproject/providers";
import { Signer, logger } from "ethers";
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
import { wait_for_block, wait_for_time, wait_for_next_proposed, sleep } from "./wait";

interface StakehoundContext {
    geysers: string[];
    startBlock: Block;
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

const init_rewards = async (context: StakehoundContext, proposer: Signer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer) };
    const { s3, provider, startBlock, multiplexer } = context;
    const last = await multiplexer.lastProposedMerkleData();
    assert(last.cycle.toNumber() === 0, "init_rewards: system already initialized");
    let end = await provider.getBlock((await provider.getBlockNumber()) - 30);
    const latestConfirmedEpoch =
        startBlock.timestamp +
        Math.floor((end.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    // lower bound - to be precise would need more aggressive block fetching
    logger.info("sad!", latestConfirmedEpoch - startBlock.timestamp);
    if (0 >= latestConfirmedEpoch - startBlock.timestamp) {
        end = await wait_for_time(provider, startBlock.timestamp, context.rate);
    }
    const endTime = end.timestamp;
    assert(
        end.number > startBlock.number && endTime - startBlock.timestamp > 0,
        "init_rewards: starting too early"
    );
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        startBlock.number,
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
    assert(
        _.keys(merkle.merkleRewards.claims).length > 0,
        "init_rewards: no claims, either no staking or too early"
    );
    await upload_rewards(s3, merkle.merkleRewards);
    const tx = await multiplexer.proposeRoot(
        merkle.root,
        merkle.root,
        merkle.cycle,
        end.number
    );
    logger.info(
        `Init: Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx ${tx.hash}`
    );
    const seven = tx.wait(7).then((tx) => {
        logger.info(
            `Init: Mined into block ${tx.blockNumber} with hash ${tx.blockNumber}`
        );
    });
    const thirty = tx.wait(30).then((tx) => {
        logger.info(`Init: Reached thirty confirmations`);
    });
    return { seven, thirty, tx };
};

const bump_rewards = async (context: StakehoundContext, proposer: Signer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer) };
    const { s3, provider, startBlock, multiplexer } = context;
    const last = await multiplexer.lastProposedMerkleData();
    const lastEnd = await provider.getBlock(last.endBlock.toNumber());
    const fetchedLastRewards = await fetch_rewards(s3, last.root);
    assert(
        last.root === fetchedLastRewards.merkleRoot,
        "bump_rewards: last published start block does not match last start block"
    );
    // const lastConfirmedEpoch =
    //     startBlock.timestamp +
    //     Math.floor((lastEnd.timestamp - startBlock.timestamp) / context.epoch) *
    //         context.epoch;
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        startBlock.number,
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
    assert(
        compare_merkle_rewards(calcMerkle.merkleRewards, fetchedLastRewards),
        "bump_rewards: fetched last rewards and calculated last rewards failed to match"
    );

    let end = await provider.getBlock((await provider.getBlockNumber()) - 30);

    const latestConfirmedEpoch =
        startBlock.timestamp +
        Math.floor((end.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    if (0 >= latestConfirmedEpoch - lastEnd.timestamp) {
        end = await wait_for_time(
            provider,
            latestConfirmedEpoch + context.epoch,
            context.rate
        );
    }

    const newRewards = await play_system_rewards(
        r,
        provider,
        context.geysers,
        startBlock.number,
        end.number,
        lastEnd.timestamp,
        end.timestamp
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
    const tx = await multiplexer.proposeRoot(
        merkle.root,
        merkle.root,
        merkle.cycle,
        end.number
    );
    logger.info(
        `Bump: Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx hash ${tx.hash}`
    );
    const seven = tx.wait(7).then((tx) => {
        logger.info(
            `Bump: Mined into block ${tx.blockNumber} with hash ${tx.blockHash}`
        );
        return tx;
    });
    const thirty = tx.wait(30).then((tx) => {
        logger.info(`Bump: Reached thirty confirmations`);
        return tx;
    });
    return { seven, thirty, tx };
};

// Approver

const approve_rewards = async (context: StakehoundContext, approver: Signer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(approver) };

    const { s3, provider, startBlock, multiplexer } = context;
    const nowBlock = await provider.getBlock("latest");
    let publishedNow = await multiplexer.lastPublishedMerkleData();
    let proposedNow = await multiplexer.lastProposedMerkleData();
    let published = await multiplexer.lastPublishedMerkleData({
        blockTag: nowBlock.number - 30,
    });
    let proposed = await multiplexer.lastProposedMerkleData({
        blockTag: nowBlock.number - 30,
    });
    assert(
        _.isEqual(proposedNow, proposedNow) ||
            (await provider.getBlock(proposedNow.endBlock.toNumber())).timestamp -
                (await provider.getBlock(proposed.endBlock.toNumber())).timestamp >
                context.epoch,
        "approve_rewards: multiple proposed within one epoch, are multiple proposers running?"
    );
    assert(
        _.isEqual(publishedNow, publishedNow) ||
            (await provider.getBlock(publishedNow.endBlock.toNumber())).timestamp -
                (await provider.getBlock(published.endBlock.toNumber())).timestamp >
                context.epoch,
        "approve_rewards: multiple published in one epoch, are multiple approvers and proposers running?"
    );

    // could we turn this into its own waiter - i.e. keep going until no changes for 30 blocks
    if (_.isEqual(proposed, published) || !_.isEqual(proposed, proposedNow)) {
        const { lastPropose, publishNow, block } = await wait_for_next_proposed(
            provider,
            multiplexer,
            proposedNow.endBlock.toNumber(),
            published.cycle.toNumber(),
            context.rate
        );
        proposed = lastPropose;
        published = await multiplexer.lastPublishedMerkleData({ blockTag: block });
        publishedNow = publishNow;
        assert(
            !_.isEqual(proposed, published) || !_.isEqual(proposed, proposedNow),
            "approve_rewards: pwned"
        );
    }

    assert(
        published.cycle.lt(proposed.cycle),
        "approve_rewards: proposed cycle not greater than last published cycle"
    );
    const proposedEnd = await provider.getBlock(proposed.endBlock.toNumber());
    const r = await fetch_system_rewards(
        provider,
        context.geysers,
        startBlock.number,
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
    const tx = await multiplexer.approveRoot(
        merkle.root,
        merkle.root,
        merkle.cycle,
        proposedEnd.number
    );
    logger.info(`Approve: Approving merkle root ${merkle.root} ${tx.hash}`);
    const seven = tx.wait(7).then((txn) => {
        logger.info(
            `Approve: Mined into block ${txn.blockNumber} with hash ${txn.blockNumber} and 7 confirmations`
        );
        return txn;
    });
    const thirty = tx.wait(30).then((txn) => {
        logger.info(`Approve: Reached thirty confirmations`);
        return txn;
    });
    return { tx, seven, thirty };
};

const run_propose = async (context: StakehoundContext, proposer: Signer) => {
    while (true) {
        try {
            const bumped = await Promise.race([
                bump_rewards(context, proposer),
                sleep(1000 * (context.epoch + 60 * 10)).then(() => ({
                    error: "timeout",
                })),
            ]);
            if ("error" in bumped) {
                throw new Error("approve took too long");
            } else {
                await Promise.all([bumped.seven, bumped.thirty]);
            }
        } catch (e) {
            console.error(`run_propose: ${e}`);
            await sleep(1000 * 60 * 10); // try again in ten minutes
        }
    }
};

const run_approve = async (context: StakehoundContext, approver: Signer) => {
    while (true) {
        try {
            const approved = await Promise.race([
                approve_rewards(context, approver),
                sleep(1000 * (context.epoch + 60 * 10)).then(() => ({
                    error: "timeout",
                })),
            ]);
            if ("error" in approved) {
                throw new Error("approve took too long");
            } else {
                await Promise.all([approved.seven, approved.thirty]);
            }
        } catch (e) {
            console.error(`run_approve: ${e}`);
            await sleep(1000 * 60 * 10); // try again in ten minutes
        }
    }
};

const run_init = async (context: StakehoundContext, proposer: Signer) => {
    let done = false
    while (!done) {
        try {
            const init = await Promise.race([
                init_rewards(context, proposer),
                sleep(1000 * (context.epoch + 60 * 10)).then(() => ({
                    error: "timeout",
                })),
            ]);
            if ("error" in init) {
                throw new Error("approve took too long");
            } else {
                await Promise.all([init.seven, init.thirty]);
            }
        } catch (e) {
            console.error(`run_approve: ${e}`);
            await sleep(1000 * 60 * 10); // try again in ten minutes
        }
    }
};

export {
    StakehoundContext,
    init_rewards,
    bump_rewards,
    approve_rewards,
    run_approve,
    run_init,
    run_propose,
};
