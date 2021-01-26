import _ from "lodash";
import { Provider, Block } from "@ethersproject/providers";
import { Multiplexer } from "../typechain/Multiplexer";
import { assert } from "ts-essentials";
import logger from "./logger";

const sleep = (ms: number) =>
    new Promise((res) => {
        logger.info(`going to sleep for ${ms / 1000 / 60} minutes`);
        setTimeout(() => {
            logger.info(`waking up`);
            res();
        }, ms);
    });

const wait_for_block = async (
    provider: Provider,
    blockNumber: number,
    rate: number
) => {
    let n = await provider.getBlockNumber();
    while (n < blockNumber + 30) {
        logger.info('wait_for_block: sleep')
        await sleep(rate);
        n = await provider.getBlockNumber();
    }
    return provider.getBlock(n);
};

const wait_for_time = async (provider: Provider, time: number, rate: number) => {
    let b = await provider.getBlock((await provider.getBlockNumber()) - 30);
    while (b.timestamp < time) {
        logger.info('wait_for_time: sleep')
        await sleep(rate);
        b = await provider.getBlock((await provider.getBlockNumber()) - 30);
    }
    return b;
};

const wait_for_next_proposed = async (
    provider: Provider,
    multiplexer: Multiplexer,
    fromBlock: number,
    lastCycle: number,
    rate: number
) => {
    let block = await provider.getBlock("latest");
    if (block.number - fromBlock >= 30) {
        await wait_for_block(provider, block.number, rate);
    }
    const filter = {
        address: multiplexer.address,
        fromBlock: fromBlock,
        topics: [multiplexer.interface.getEventTopic("RootProposed")],
    };
    let done = false;
    const proposedBlocks: number[] = [];
    while (!done) {
        const bn = await provider.getBlockNumber();
        if (bn <= filter.fromBlock + 30) {
            logger.info("wait_for_next_proposed: sleep")
            await sleep(rate);
            continue;
        }
        logger.info(
            `waiting for next proposal: fetching logs for proposed hash events from blocks ${filter.fromBlock} to ${bn}`
        );
        const logs = await provider.getLogs({ ...filter, toBlock: bn });
        for (const log of logs) {
            try {
                const parsed = multiplexer.interface.parseLog(log);
                if (parsed.name === "RootProposed") {
                    if (parsed.args.cycle.toNumber() > lastCycle) {
                        proposedBlocks.push(log.blockNumber);
                        done = true;
                    }
                } else {
                    logger.error(
                        `wait_for_next_proposed: unexpected event ${JSON.stringify(
                            log
                        )} ${JSON.stringify(parsed)}`
                    );
                }
            } catch (e) {
                logger.error(
                    `wait_for_next_proposed: failed to parse log ${log} error: ${e}`
                );
            }
        }
        filter.fromBlock = bn + 1;
    }
    const proposeBlock = _.last(proposedBlocks)! + 1;
    const lastConfirmed = await multiplexer.lastProposedMerkleData({
        blockTag: proposeBlock,
    });
    const last = await multiplexer.lastProposedMerkleData();
    assert(
        _.isEqual(last, lastConfirmed),
        "wait_for_next_proposed: multiple proposed in short period - are two proposers running?"
    );
    const lastPublished = await multiplexer.lastPublishedMerkleData();
    assert(
        last.cycle > lastPublished.cycle,
        "wait_for_next_proposed: last published and last confirmed are the same - is approver running too aggressively, or are there two approvers?"
    );
    return { publishNow: lastPublished, lastPropose: last, block: proposeBlock };
};

export { wait_for_block, wait_for_next_proposed, wait_for_time, sleep };
