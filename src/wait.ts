import _ from "lodash";
import { Provider } from "@ethersproject/providers";
import { Multiplexer } from "../typechain/Multiplexer";
import { assert } from "ts-essentials";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const wait_for_block = async (
    provider: Provider,
    blockNumber: number,
    rate: number
) => {
    let n = await provider.getBlockNumber();
    while (n < blockNumber + 30) {
        await sleep(rate);
        n = await provider.getBlockNumber();
    }
    return provider.getBlock(n);
};

const wait_for_time = async (provider: Provider, time: number, rate: number) => {
    let b = await provider.getBlock((await provider.getBlockNumber()) - 30);
    while (b.timestamp < time) {
        await sleep(rate);
        b = await provider.getBlock((await provider.getBlockNumber()) - 30);
    }
    return b;
};

const wait_for_next_proposed = async (
    provider: Provider,
    multiplexer: Multiplexer,
    lastCycle: number,
    rate: number
) => {
    const block = await provider.getBlock("latest");
    const filter = {
        address: multiplexer.address,
        fromBlock: block.number - 60,
        topics: [multiplexer.interface.getEventTopic("RootProposed")],
    };
    let done = false;
    await sleep(rate);
    const proposedBlocks: any[] = [];
    while (!done) {
        await sleep(rate);
        const bn = await provider.getBlockNumber();
        if (bn <= filter.fromBlock + 30) {
            continue;
        }
        console.log(
            `fetching logs for proposed hash events from blocks ${filter.fromBlock} to ${bn}`
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
                    console.error(
                        `wait_for_next_proposed: unexpected event ${JSON.stringify(log)} ${JSON.stringify(parsed)}`
                    );
                }
            } catch (e) {
                console.error(
                    `wait_for_next_proposed: failed to parse log ${log} error: ${e}`
                );
            }
        }
        filter.fromBlock = bn;
    }
    const proposeBlock = _.last(proposedBlocks)!;
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
        !_.isEqual(last, lastPublished),
        "wait_for_next_proposed: last published and last confirmed are the same - is approver running too aggressively, or are there two approvers?"
    );
    return last;
};

export { wait_for_block, wait_for_next_proposed, wait_for_time, sleep };
