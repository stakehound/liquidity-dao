import _ from "lodash";
import { Provider, Block } from "@ethersproject/providers";
import { Multiplexer } from "../typechain/Multiplexer";
import { assert } from "ts-essentials";
import logger from "./logger";

const sleep = (ms: number, loud: boolean = true) =>
    new Promise<void>((res) => {
        if (loud) {
            logger.info(`going to sleep for ${ms / 1000 / 60} minutes`);
        }
        setTimeout(() => {
            if (loud) {
                logger.info(`waking up`);
            }
            res();
        }, ms);
    });

const wait_for_confirmations = async (
    provider: Provider,
    txHash: string,
    logMethod?: string
) => {
    let sevenR: () => void;
    const seven = new Promise<void>(function (res, rej) {
        sevenR = res;
    });
    const thirty = new Promise<void>(async function (res, rej) {
        let confirmations = 0;
        let sevenConfirmed = false;
        while (confirmations < 30) {
            try {
                const txr = await provider.getTransaction(txHash);

                confirmations = txr.confirmations;
                // .then((x) => x.confirmations);
                if (confirmations >= 7 && !sevenConfirmed) {
                    logger.info(
                        `${logMethod ? logMethod + ": " : ""}Mined into block ${
                            txr.blockNumber
                        } block hash ${
                            txr.blockHash
                        } tx hash ${txHash} with 7 confirmations`
                    );
                    sevenConfirmed = true;
                    sevenR!();
                }
                if (confirmations >= 30) {
                    logger.info(
                        `${logMethod ? logMethod + ": " : ""}Mined into block ${
                            txr.blockNumber
                        } block hash ${
                            txr.blockHash
                        } tx hash ${txHash} with 30 confirmations`
                    );
                    res();
                }
                await sleep(10000);
            } catch (e) {
                logger.error(`wait_for_confirmations: ${e}`);
            }
        }
    });

    return { seven, thirty };
};

const wait_for_block = async (
    provider: Provider,
    blockNumber: number,
    rate: number
) => {
    logger.info(`wait_for_block called`);
    let n = await provider.getBlockNumber();
    while (n < blockNumber + 30) {
        logger.info("wait_for_block: sleep");
        await sleep(rate);
        n = await provider.getBlockNumber();
    }
    return provider.getBlock(n);
};

const wait_for_time = async (provider: Provider, time: number, rate: number) => {
    logger.info(`wait_for_time called`);
    let b = await provider.getBlock((await provider.getBlockNumber()) - 30);
    while (b.timestamp < time) {
        logger.info("wait_for_time: sleep");
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
    logger.info(`wait_for_next_proposed called`);
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
            logger.info("wait_for_next_proposed: sleep");
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
    const publishNow = await multiplexer.lastPublishedMerkleData();
    assert(
        last.cycle > publishNow.cycle,
        "wait_for_next_proposed: last published and last confirmed are the same - is approver running too aggressively, or are there two approvers?"
    );
    return { publishNow, lastPropose: last, block: proposeBlock };
};

export {
    wait_for_block,
    wait_for_next_proposed,
    wait_for_time,
    sleep,
    wait_for_confirmations,
};
