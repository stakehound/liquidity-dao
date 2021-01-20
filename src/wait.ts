import _ from "lodash";
import { Provider } from "@ethersproject/providers";
import { Multiplexer } from "../typechain/Multiplexer";

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
    return provider.getBlock(0);
};

const wait_for_time = async (provider: Provider, time: number, rate: number) => {
    let b = await provider.getBlock(await provider.getBlockNumber() - 30);
    while (b.timestamp < time) {
        await sleep(rate);
        b = await provider.getBlock(await provider.getBlockNumber() - 30);
    }
    return b;
};

const wait_for_next_proposed = async (
    provider: Provider,
    multiplexer: Multiplexer,
    cycle: number,
    rate: number
) => {
    const block = await provider.getBlock("latest");
    const last = await multiplexer.lastPublishedMerkleData();
    if (last.cycle.toNumber() === cycle) {
        return last;
    }
    if (last.cycle.toNumber() > cycle) {
        throw new Error("wait_for_next_proposed: expected cycle already passed");
    }
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
                    if (parsed.args.cycle.toNumber() >= cycle) {
                        proposedBlocks.push(log.blockNumber);
                        done = true;
                    }
                } else {
                    console.error(
                        `wait_for_next_proposed: unexpected event ${log} ${parsed}`
                    );
                }
            } catch (e) {
                console.error(
                    `wait_for_next_proposed: failed to parse log ${log} error: ${e}`
                );
            }
        }
        filter.fromBlock = bn
    }
    const proposeBlock = _.last(proposedBlocks)!;
    return multiplexer.lastProposedMerkleData({ blockTag: proposeBlock });
};

export { wait_for_block, wait_for_next_proposed, wait_for_time, sleep };