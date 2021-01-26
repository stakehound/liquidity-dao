import { BigNumber } from "bignumber.js";
import { Log, Provider } from "@ethersproject/providers";
import { GeyserAction } from "./calc_stakes";
import { ethers } from "ethers";
import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import { StakehoundGeyser } from "../typechain";
import { getAddress } from "ethers/lib/utils";
import logger from "./logger";

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
        while (filter.fromBlock! <= toBlock) {
            logs.push(...(await provider.getLogs(filter)));
            filter.fromBlock = filter.fromBlock + 10000;
            const nextTo = filter.fromBlock + 9999;
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
        logger.error("failed fetching events", e);
        return [];
    }
};

const collectActions = (logs: Log[]) => {
    const acts: GeyserAction[] = [];
    for (const log of logs.sort((x, y) =>
        x.blockNumber < y.blockNumber
            ? -1
            : x.blockNumber > y.blockNumber
            ? 1
            : x.logIndex - y.logIndex
    )) {
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
                if(!parsed.name.includes('Role')) {
                    logger.error(`parseEvent: unexpected event ${parsed.name}`);
                }
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
            logger.error(`parseEvents: failed to parse event ${log} error:${e}`);
        }
    }
    for (let i = 0; i < acts.length; i++) {
        for (let j = i + 1; j < acts.length; j++) {
            if (acts[j].timestamp === acts[i].timestamp) {
                acts[j].timestamp++;
            } else {
                break;
            }
        }
    }
    return acts;
};

export { collectActions, fetchEvents };
