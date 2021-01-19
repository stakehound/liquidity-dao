import { BigNumber } from "bignumber.js";
import { Log, Provider } from "@ethersproject/providers";
import { GeyserAction } from "./calc_stakes";
import { ethers } from "ethers";
import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import { StakehoundGeyser } from "../typechain";
import { getAddress } from "ethers/lib/utils";

const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];

const fetchEvents = async (
    address: string,
    fromBlock: number,
    toBlock: number,
    provider: Provider
) => {
    const filter = {
        address,
        fromBlock,
        toBlock,
    };
    const logs: Log[] = [];
    try {
        while (filter.fromBlock! < toBlock) {
            logs.push(...(await provider.getLogs(filter)));
            filter.fromBlock = filter.fromBlock + 10000;
            const nextTo = filter.toBlock + 9999;
            filter.toBlock = toBlock < nextTo ? toBlock : nextTo;
        }
        return logs.sort((x, y) =>
            x.blockNumber < y.blockNumber
                ? -1
                : x.blockNumber > y.blockNumber
                ? 1
                : x.logIndex < y.logIndex
                ? -1
                : x.logIndex > y.logIndex
                ? 1
                : 0
        );
    } catch (e) {
        console.error("failed fetching events", e);
        return [];
    }
};

const collectActions = (logs: Log[]) => {
    const acts: GeyserAction[] = [];
    for (const log of logs) {
        try {
            const parsed = giface.parseLog(log);
            const type =
                parsed.name === "Staked"
                    ? "stake"
                    : parsed.name === "Unstaked"
                    ? "unstake"
                    : parsed.name === "UnlockScheduleSet"
                    ? "unlock"
                    : parsed.name === "ClearSchedules"
                    ? "clear"
                    : null;
            if (!type) {
                console.error("parseEvent: unexpected event");
                continue;
            }
            if (type === "clear") {
                acts.push({
                    type,
                    token: getAddress(parsed.args.token),
                    timestamp: parsed.args.timestamp.toNumber(),
                });
                continue;
            }
            if (type === "unlock") {
                acts.push({
                    type,
                    timestamp: parsed.args.timestamp.toNumber(),
                    token: getAddress(parsed.args.token),
                    sharesLocked: new BigNumber(parsed.args.sharesLocked.toString()),
                    startTime: parsed.args.startTime.toNumber(),
                    endTime: parsed.args.endTime.toNumber(),
                    duration: parsed.args.durationSec.toNumber(),
                });
                continue;
            }
            acts.push({
                type,
                user: getAddress(parsed.args.user),
                shares: new BigNumber(parsed.args.shares.toString()),
                timestamp: parsed.args.timestamp.toNumber(),
                block: log.blockNumber,
                total: new BigNumber(parsed.args.total.toString()),
            });
        } catch (e) {
            console.error(`parseEvents: failed to parse event ${log} error:${e}`);
        }
    }
    return acts;
};

export { collectActions, fetchEvents };
