import assert from "assert";
import _ from "lodash";
import { BigNumber } from "bignumber.js";
import { Provider } from "@ethersproject/providers";

import { StakehoundConfig } from "./config";
import { collectActions, fetchEvents } from "./events";
import { StakehoundGeyser__factory } from "../typechain";

BigNumber.set({
    ROUNDING_MODE: BigNumber.ROUND_FLOOR,
    DECIMAL_PLACES: 200,
    POW_PRECISION: 20,
});

interface Stake {
    shares: BigNumber;
    timestamp: number;
}

interface Schedules {
    [token: string]: UnlockScheduleAction[];
}

interface dUser {
    user: string;
    shareSecondsRange: BigNumber;
    shareSeconds: BigNumber;
}

interface dState {
    users: { [user: string]: dUser };
    totalShareSeconds: BigNumber;
    totalShareSecondsRange: BigNumber;
    totalRewards: TokenReward;
    totalRewardsInRange: TokenReward;
}

interface UserState {
    user: string;
    total: BigNumber;
    stakes: Stake[];
    lastUpdate: number;
    reward: TokenReward;
    rewardInRange: TokenReward;
}

interface UnlockScheduleAction {
    type: "unlock";
    token: string;
    timestamp: number;
    sharesLocked: BigNumber;
    startTime: number;
    endTime: number;
    duration: number;
}

interface ClearScheduleAction {
    type: "clear";
    token: string;
    timestamp: number;
}

interface StakeAction {
    type: "stake";
    user: string;
    shares: BigNumber;
    total: BigNumber;
    timestamp: number;
    block: number;
}

interface UnstakeAction {
    type: "unstake";
    user: string;
    shares: BigNumber;
    total: BigNumber;
    timestamp: number;
    block: number;
}

type GeyserAction =
    | StakeAction
    | UnstakeAction
    | UnlockScheduleAction
    | ClearScheduleAction;

interface ActionsMap {
    users: {
        [user: string]: GeyserAction[];
    };
    schedules: Schedules;
}

interface TokenReward {
    [token: string]: BigNumber;
}

interface GeyserState {
    users: { [user: string]: UserState };
    totalRewards: TokenReward;
    totalRewardsInRange: TokenReward;
    // totalDistributed: TokenReward;
    // totalDistributedInRange: TokenReward;
    rewardTokens: string[];
    schedules: Schedules;
    absTime: number;
    relTime: number;
    endTime: number;
    lastUpdate: number;
}

interface UserRewards {
    reward: TokenReward;
    rewardInRange: TokenReward;
}

interface Rewards {
    cycle: number;
    rewards: TokenReward;
    rewardsInRange: TokenReward;
    rewardsDistributed: TokenReward;
    rewardsDistributedInRange: TokenReward;
    users: { [user: string]: UserRewards };
}

const token_reward_to_integer = (r: TokenReward): TokenReward => {
    return _.transform(
        r,
        (acc: TokenReward, val, key) => {
            acc[key] = val.integerValue();
        },
        {}
    );
};

const user_reward_to_integer = (r: UserRewards): UserRewards => {
    return {
        reward: token_reward_to_integer(r.reward),
        rewardInRange: token_reward_to_integer(r.rewardInRange),
    };
};

const rewards_to_integer = (r: Rewards): Rewards => {
    return {
        cycle: r.cycle,
        rewards: token_reward_to_integer(r.rewards),
        rewardsInRange: token_reward_to_integer(r.rewardsInRange),
        rewardsDistributed: token_reward_to_integer(r.rewards),
        rewardsDistributedInRange: token_reward_to_integer(r.rewardsInRange),
        users: _.transform(
            r.users,
            (acc: { [user: string]: UserRewards }, val, key) => {
                acc[key] = user_reward_to_integer(val);
            },
            {}
        ),
    };
};

const parse_token_reward_fixed = (
    r: ReturnType<typeof token_reward_to_fixed>
): TokenReward => {
    return _.transform(
        r,
        (acc: TokenReward, val, key) => {
            acc[key] = new BigNumber(val);
        },
        {}
    );
};

const parse_user_reward_fixed = (
    r: ReturnType<typeof user_reward_to_fixed>
): UserRewards => {
    return {
        reward: parse_token_reward_fixed(r.reward),
        rewardInRange: parse_token_reward_fixed(r.rewardInRange),
    };
};

const parse_rewards_fixed = (r: RewardsFixed): Rewards => {
    return {
        cycle: r.cycle,
        rewards: parse_token_reward_fixed(r.rewards),
        rewardsInRange: parse_token_reward_fixed(r.rewardsInRange),
        rewardsDistributed: parse_token_reward_fixed(r.rewards),
        rewardsDistributedInRange: parse_token_reward_fixed(r.rewardsInRange),
        users: _.transform(
            r.users,
            (acc: { [user: string]: UserRewards }, val, key) => {
                acc[key] = parse_user_reward_fixed(val);
            },
            {}
        ),
    };
};

const token_reward_to_fixed = (r: TokenReward) => {
    return _.transform(
        r,
        (acc: { [t: string]: string }, val, key) => {
            acc[key] = val.toFixed(0);
        },
        {}
    );
};

const user_reward_to_fixed = (r: UserRewards) => {
    return {
        reward: token_reward_to_fixed(r.reward),
        rewardInRange: token_reward_to_fixed(r.rewardInRange),
    };
};

const rewards_to_fixed = (r: Rewards) => {
    return {
        cycle: r.cycle,
        rewards: token_reward_to_fixed(r.rewards),
        rewardsInRange: token_reward_to_fixed(r.rewardsInRange),
        rewardsDistributed: token_reward_to_fixed(r.rewards),
        rewardsDistributedInRange: token_reward_to_fixed(r.rewardsInRange),
        users: _.transform(
            r.users,
            (
                acc: { [user: string]: ReturnType<typeof user_reward_to_fixed> },
                val,
                key
            ) => {
                acc[key] = user_reward_to_fixed(val);
            },
            {}
        ),
    };
};

type RewardsFixed = ReturnType<typeof rewards_to_fixed>;

const get_rewards = (st: GeyserState, cycle: number): Rewards => {
    const r: Rewards = {
        cycle,
        rewards: {},
        rewardsInRange: {},
        rewardsDistributed: {},
        rewardsDistributedInRange: {},
        users: {},
    };

    for (const t of st.rewardTokens) {
        r.rewards[t] = st.totalRewards[t].integerValue();
        r.rewardsInRange[t] = st.totalRewardsInRange[t].integerValue();
    }
    for (const u of _.values(st.users)) {
        r.users[u.user] = {
            reward: _.pick(
                u.reward,
                _.keys(u.reward).filter((t) => !!u.reward[t] && u.reward[t].gt(0))
            ),
            rewardInRange: _.pick(
                u.rewardInRange,
                _.keys(u.rewardInRange).filter(
                    (t) => !!u.rewardInRange[t] && u.rewardInRange[t].gt(0)
                )
            ),
        };
    }
    const { rewards, rewardsInRange } = get_distributed(r);
    r.rewardsDistributed = rewards;
    r.rewardsDistributedInRange = rewardsInRange;
    return r;
};

const pow10 = (pow: number) => new BigNumber(10).pow(pow);

const sum_rewards = (rewards: Rewards[]) => {
    const cycle = rewards[0].cycle;
    const tokens = _.union(_.flatten(rewards.map((r) => _.keys(r.rewards)))).sort();
    const useraddrs = _.union(_.flatten(rewards.map((r) => _.keys(r.users)))).sort();
    const comb: Rewards = {
        cycle,
        rewards: create_rewards(tokens),
        rewardsInRange: create_rewards(tokens),
        rewardsDistributed: create_rewards(tokens),
        rewardsDistributedInRange: create_rewards(tokens),
        users: create_u_rewards(useraddrs, tokens),
    };
    for (const r of rewards) {
        for (const t of _.keys(r.rewards)) {
            comb.rewards[t] = comb.rewards[t].plus(r.rewards[t]);
            comb.rewardsInRange[t] = comb.rewardsInRange[t].plus(r.rewardsInRange[t]);
            comb.rewardsDistributed[t] = comb.rewardsDistributed[t].plus(
                r.rewardsDistributed[t]
            );
            comb.rewardsDistributedInRange[t] = comb.rewardsDistributedInRange[t].plus(
                r.rewardsDistributedInRange[t]
            );
        }
        for (const u of _.keys(r.users)) {
            for (const t of _.keys(r.users[u].reward)) {
                comb.users[u].reward[t] = comb.users[u].reward[t].plus(
                    r.users[u].reward[t]
                );
            }
            for (const t of _.keys(r.users[u].reward)) {
                comb.users[u].rewardInRange[t] = comb.users[u].rewardInRange[t].plus(
                    r.users[u].rewardInRange[t]
                );
            }
        }
    }
    return comb;
};

const get_distributed = (r: Rewards) => {
    const rewards = create_rewards(_.keys(r.rewards));
    const rewardsInRange = create_rewards(_.keys(r.rewardsInRange));
    for (const u of _.values(r.users)) {
        for (const t of _.keys(u.reward)) {
            rewards[t] = rewards[t] || new BigNumber(0);
            rewards[t] = rewards[t].plus(u.reward[t]);
        }
        for (const t of _.keys(u.reward)) {
            rewardsInRange[t] = rewardsInRange[t] || new BigNumber(0);
            rewardsInRange[t] = rewardsInRange[t].plus(u.rewardInRange[t]);
        }
    }
    return { rewards, rewardsInRange };
};

const compare_distributed = (r0: Rewards, r1: Rewards) => {
    const tokens = _.keys(r0.rewards).sort();
    if (!_.isEqual(tokens, _.keys(r1.rewards).sort())) return false;
    const users = _.keys(r0.users).sort();
    if (!_.isEqual(users, _.keys(r1.users).sort())) return false;
    if (!compare_token_rewards([r0.rewardsDistributed, r1.rewardsDistributed]))
        return false;
    if (
        !compare_token_rewards([
            r0.rewardsDistributedInRange,
            r1.rewardsDistributedInRange,
        ])
    )
        return false;
    return true;
};

const compare_rewards = (r0: Rewards, r1: Rewards) => {
    const tokens = _.keys(r0.rewards).sort();
    if (!_.isEqual(tokens, _.keys(r1.rewards).sort())) return false;
    const users = _.keys(r0.users).sort();
    if (!_.isEqual(users, _.keys(r1.users).sort())) return false;
    if (!compare_token_rewards([r0.rewards, r1.rewards])) return false;
    if (!compare_token_rewards([r0.rewardsInRange, r1.rewardsInRange])) return false;
    return compare_distributed(r0, r1) && compare_users(r0, r1);
};

const compare_users = (r0: Rewards, r1: Rewards) => {
    const tokens = _.keys(r0.rewards).sort();
    if (!_.isEqual(tokens, _.keys(r1.rewards).sort())) return false;
    const users = _.keys(r0.users).sort();
    if (!_.isEqual(users, _.keys(r1.users).sort())) return false;
    for (const u of users) {
        if (
            !compare_token_rewards([r0.users[u].reward, r1.users[u].reward]) ||
            !compare_token_rewards([
                r0.users[u].rewardInRange,
                r1.users[u].rewardInRange,
            ])
        )
            return false;
    }
    return true;
};

const create_rewards = (tokens: string[]) =>
    _.transform(tokens, (acc: TokenReward, val) => (acc[val] = new BigNumber(0)), {});

const create_u_rewards = (users: string[], tokens: string[]) =>
    _.transform(
        users,
        (acc: { [user: string]: UserRewards }, val) =>
            (acc[val] = {
                reward: create_rewards(tokens),
                rewardInRange: create_rewards(tokens),
            }),
        {}
    );

const combine_rewards = (cycle: number, rewards: Rewards[]) => {
    const tokens = _.union(_.flatten(rewards.map((r) => _.keys(r.rewards)))).sort();
    const tokensInRange = _.union(
        _.flatten(rewards.map((r) => _.keys(r.rewardsInRange)))
    ).sort();
    const users = _.union(_.flatten(rewards.map((r) => _.keys(r.users)))).sort();

    const comb: Rewards = {
        cycle,
        rewards: create_rewards(tokens),
        rewardsInRange: create_rewards(tokensInRange),
        rewardsDistributed: create_rewards(tokens),
        rewardsDistributedInRange: create_rewards(tokensInRange),
        users: create_u_rewards(users, tokens),
    };
    for (const r of rewards) {
        for (const t of _.keys(r.rewards)) {
            // only increasing cycles -> rewards just get set to the last Reward
            comb.rewards[t] = r.rewards[t];
            comb.rewardsDistributed[t] = r.rewardsDistributed[t];
            comb.rewardsInRange[t] = comb.rewardsInRange[t] || new BigNumber(0);
            comb.rewardsInRange[t] = comb.rewardsInRange[t].plus(r.rewardsInRange[t]);
            comb.rewardsDistributedInRange[t] =
                comb.rewardsDistributedInRange[t] || new BigNumber(0);
            comb.rewardsDistributedInRange[t] = comb.rewardsDistributedInRange[t].plus(
                r.rewardsInRange[t]
            );
        }
        for (const u of _.keys(r.users)) {
            comb.users[u] = comb.users[u] || {};
            // TODO: ensure new reward sum of old reward + new in range
            for (const t of _.keys(r.users[u].reward)) {
                comb.users[u].reward[t] = comb.users[u].reward[t] || new BigNumber(0);
                comb.users[u].reward[t] = comb.users[u].reward[t].plus(
                    r.users[u].rewardInRange[t]
                );
            }
            for (const t of _.keys(r.users[u].reward)) {
                comb.users[u].rewardInRange[t] =
                    comb.users[u].rewardInRange[t] || new BigNumber(0);
                comb.users[u].rewardInRange[t] = comb.users[u].rewardInRange[t].plus(
                    r.users[u].rewardInRange[t]
                );
            }
        }
    }
    return comb;
};

const compare_token_rewards = (r: TokenReward[]) => {
    const rest = r.slice(1);
    return _.keys(r[0]).every((addr, i) =>
        rest.every((t) =>
            r[0][addr]
                .minus(t[addr])
                .abs()
                .lt(pow10(r[0][addr].toFixed(0).length - 2))
        )
    );
};

const validate_rewards = (r: Rewards) => {
    // console.log(
    //     "validate_rewards:\n",
    //     _.zip(_.values(r.rewards), _.values(r.rewardsDistributed)).map(([x, y]) => [
    //         x!.toFixed(0),
    //         y!.toFixed(0),
    //     ]),
    //     '\nvalidate_rewards range:\n',
    //     _.zip(
    //         _.values(r.rewardsInRange),
    //         _.values(r.rewardsDistributedInRange)
    //     ).map(([x, y]) => [x!.toFixed(0), y!.toFixed(0)]),
    //     validate_distributed(r),
    //     compare_token_rewards([r.rewardsDistributed, r.rewards]),
    //     compare_token_rewards([r.rewardsDistributedInRange, r.rewardsInRange])
    // );
    return (
        validate_distributed(r) &&
        compare_token_rewards([r.rewardsDistributed, r.rewards]) &&
        compare_token_rewards([r.rewardsDistributedInRange, r.rewardsInRange])
    );
};

const validate_distributed = (r: Rewards) => {
    const { rewards, rewardsInRange } = get_distributed(r);
    return (
        compare_token_rewards([rewards, r.rewardsDistributed]) &&
        compare_token_rewards([rewardsInRange, r.rewardsDistributedInRange])
    );
};

interface SystemState {
    [geyserAddress: string]: GeyserState;
}

interface SystemActions {
    [geyserAddress: string]: GeyserAction[];
}
interface SystemConfig {
    [geyserAddress: string]: StakehoundConfig;
}

const fetch_system_config = async (
    provider: Provider,
    geysers: string[]
): Promise<SystemConfig> => {
    return Promise.all(
        geysers.map((x) =>
            StakehoundGeyser__factory.connect(x, provider).globalStartTime()
        )
    ).then((all) =>
        _.transform(
            all,
            (acc: SystemConfig, val, i) => {
                acc[geysers[i]] = { globalStartTime: val.toNumber() };
            },
            {}
        )
    );
};

const fetch_system_actions = async (
    provider: Provider,
    geysers: string[],
    fromBlock: number,
    endBlock: number
) => {
    const logs = await Promise.all(
        geysers.map((g) => fetchEvents(g, fromBlock, endBlock, provider))
    );
    return _.transform(
        geysers,
        (acc: SystemActions, addr, i) => {
            acc[addr] = collectActions(logs[i]);
        },
        {}
    );
};

const fetch_system_rewards = async (
    provider: Provider,
    geysers: string[],
    startBlock: number,
    endBlock: number,
    endTime: number,
    cycle: number,
    validate: boolean = true
) => {
    const absTime = await provider.getBlock(startBlock).then((b) => b.timestamp);
    const config = await fetch_system_config(provider, geysers);
    const acts = await fetch_system_actions(provider, geysers, startBlock, endBlock);
    const calc = create_calc_system_stakes(config);
    const system = calc(acts, absTime, absTime, endTime);
    const r = get_system_rewards(system, cycle);
    if (validate) {
        assert(validate_rewards(r), "fetched rewards did not validate");
    }
    return r;
};

const play_system_rewards = async (
    lastRewards: Rewards,
    provider: Provider,
    geysers: string[],
    startBlock: number,
    endBlock: number,
    relTime: number,
    endTime: number,
    validate: boolean = true
) => {
    const absTime = await provider.getBlock(startBlock).then((b) => b.timestamp);
    const config = await fetch_system_config(provider, geysers);
    const acts = await fetch_system_actions(provider, geysers, startBlock, endBlock);
    const calc = create_calc_system_stakes(config);
    const systemAbs = calc(acts, absTime, absTime, endTime);
    const systemRel = calc(acts, absTime, relTime, endTime);
    const ra = get_system_rewards(systemAbs, lastRewards.cycle + 1);
    const rr = get_system_rewards(systemRel, lastRewards.cycle + 1);
    const comb = combine_rewards(lastRewards.cycle + 1, [lastRewards, rr]);
    if (validate) {
        assert(compare_rewards(ra, comb), "played rewards did not match total replay");
        assert(validate_rewards(ra), "played rewards did not validate");
    }
    return ra;
};

const get_system_rewards = (st: SystemState, cycle: number) => {
    return sum_rewards(_.values(st).map((x) => get_rewards(x, cycle)));
};

const create_calc_system_stakes = (geysers: { [addr: string]: StakehoundConfig }) => {
    const cgs = _.transform(
        geysers,
        (acc, val, key) => {
            acc[key] = create_calc_geyser_stakes(val);
        },
        {} as { [addr: string]: ReturnType<typeof create_calc_geyser_stakes> }
    );
    return (
        acts: SystemActions,
        absTime: number,
        relTime: number,
        endTime: number
    ): SystemState =>
        _.transform(
            cgs,
            (acc: SystemState, calc, key) => {
                acc[key] = calc(acts[key], absTime, relTime, endTime);
                // validate_rewards(get_rewards(acc[key], 0))
            },
            <SystemState>{}
        );
};

const create_calc_geyser_stakes = (config: StakehoundConfig) => {
    const calc_geyser_stakes = (
        acts: GeyserAction[],
        absTime: number,
        relTime: number,
        endTime: number
    ) => {
        let st = create_g(absTime, relTime, endTime);
        process_actions(st, acts);
        return st;
    };

    const process_actions = (st: GeyserState, acts: GeyserAction[]) => {
        for (const act of acts) {
            if (act.timestamp > st.endTime) {
                continue; // throw ?
            } else if (act.type === "unlock") {
                unlock(st, act);
                continue;
            } else if (act.type === "clear") {
                clear(st, act);
                continue;
            }
            st.users[act.user] =
                st.users[act.user] || create_u(act.user, st.rewardTokens);
            if (act.type == "stake") {
                stake(st, act.user, act);
            } else if (act.type == "unstake") {
                unstake(st, act.user, act);
            }
        }

        process_share_seconds(st, st.endTime);
        st.lastUpdate = st.endTime;
    };

    const unlock = (st: GeyserState, act: UnlockScheduleAction) => {
        process_share_seconds(st, act.timestamp);
        st.lastUpdate = act.timestamp;
        st.rewardTokens.push(act.token);
        st.rewardTokens = _.union(st.rewardTokens).sort();
        st.schedules[act.token] = st.schedules[act.token] || [];
        st.schedules[act.token].push(act);
        for (const t of st.rewardTokens) {
            st.totalRewards[t] = st.totalRewards[t] || new BigNumber(0);
            st.totalRewards[t] = st.totalRewards[t] || new BigNumber(0);
        }
        for (const u of _.values(st.users)) {
            for (const t of st.rewardTokens) {
                u.reward[t] = u.reward[t] || new BigNumber(0);
                u.rewardInRange[t] = u.rewardInRange[t] || new BigNumber(0);
            }
        }
    };

    const clear = (st: GeyserState, act: ClearScheduleAction) => {
        process_share_seconds(st, act.timestamp);
        st.lastUpdate = act.timestamp;
        st.schedules[act.token] = [];
    };

    const stake = (st: GeyserState, user: string, stake: StakeAction) => {
        process_share_seconds(st, stake.timestamp);
        st.lastUpdate = stake.timestamp;
        const u = st.users[user];
        u.stakes.push(stake);
    };

    const unstake = (st: GeyserState, user: string, unstake: UnstakeAction) => {
        if (unstake.shares.gt(0)) {
            process_share_seconds(st, unstake.timestamp);
            st.lastUpdate = unstake.timestamp;
            let toUnstake = unstake.shares;
            const u = st.users[user];
            let i = u.stakes.length - 1;
            while (toUnstake.gt(0)) {
                if (i < 0) {
                    console.error(
                        "calc_stakes_unstake: more shares being unstaked than were registered staked"
                    );
                    break;
                }
                const stake = u.stakes[i];
                if (stake.shares.lte(toUnstake)) {
                    u.stakes.pop();
                    toUnstake = toUnstake.minus(stake.shares);
                } else {
                    stake.shares = stake.shares.minus(toUnstake);
                    toUnstake = new BigNumber(0);
                }
                i--;
            }
        }
    };

    const calc_token_reward = (
        st: GeyserState,
        token: string,
        startTime: number,
        endTime: number
    ) => {
        let total = new BigNumber(0);
        let range = 0;
        for (const sch of st.schedules[token]) {
            if (
                (range =
                    _.min([endTime, _.min([endTime, sch.endTime])])! -
                    _.max([startTime, _.max([startTime, sch.startTime])])!) > 0
            ) {
                total = total.plus(
                    BigNumber.min(
                        sch.sharesLocked,
                        sch.sharesLocked.times(range).div(sch.duration)
                    )
                );
            }
        }
        return total;
    };

    const calc_all_rewards = (st: GeyserState, ds: dState, ts: number) => {
        const relguard = _.max([st.relTime, st.lastUpdate])!;
        const absguard = _.max([st.absTime, st.lastUpdate])!;
        for (const t of st.rewardTokens) {
            st.totalRewards[t] = st.totalRewards[t] || new BigNumber(0);
            st.totalRewardsInRange[t] = st.totalRewardsInRange[t] || new BigNumber(0);
            if (ts > st.lastUpdate) {
                // TODO: FIX/make diff state for slice, also w/ user
                if (ts > st.relTime) {
                    ds.totalRewardsInRange[t] = calc_token_reward(st, t, relguard, ts);
                    st.totalRewardsInRange[t] = st.totalRewardsInRange[t].plus(
                        calc_token_reward(st, t, relguard, ts)
                    );
                }
                ds.totalRewards[t] = calc_token_reward(st, t, absguard, ts);
                st.totalRewards[t] = st.totalRewards[t].plus(
                    calc_token_reward(st, t, absguard, ts)
                );
            }
        }
        st.lastUpdate = ts;
    };

    const calc_users_rewards = (st: GeyserState, ds: dState, ts: number) => {
        for (const u of _.values(st.users)) {
            const du = ds.users[u.user];
            if (ts >= st.absTime && ts <= st.endTime) {
                for (const t of st.rewardTokens) {
                    let dtr = ds.totalRewards[t];
                    let dtrir = ds.totalRewardsInRange[t];
                    u.reward[t] = u.reward[t] || new BigNumber(0);
                    u.rewardInRange[t] = u.rewardInRange[t] || new BigNumber(0);
                    if (ds.totalShareSeconds.gt(0)) {
                        u.reward[t] = u.reward[t].plus(
                            dtr.times(du.shareSeconds).div(ds.totalShareSeconds)
                        );
                    }
                    if (ds.totalShareSecondsRange.gt(0)) {
                        u.rewardInRange[t] = u.rewardInRange[t].plus(
                            dtrir
                                .times(du.shareSecondsRange)
                                .div(ds.totalShareSecondsRange)
                        );
                    }
                }
            }
        }
    };
    const process_share_seconds = (st: GeyserState, ts: number) => {
        const ds = create_ds(_.keys(st.users), st.rewardTokens);
        for (const u of _.values(st.users)) {
            const du = ds.users[u.user];
            if (!u) {
                return;
            }
            const timeSinceLastAction = ts - u.lastUpdate;
            if (timeSinceLastAction <= 0) {
                return;
            }
            let toAdd = new BigNumber(0);
            let toAddInRange = new BigNumber(0);

            const reltime = _.max([st.relTime, u.lastUpdate])!;
            const abstime = _.max([st.absTime, u.lastUpdate])!;
            for (const stake of u.stakes) {
                if (ts >= abstime && ts >= stake.timestamp) {
                    if (ts >= reltime) {
                        toAddInRange = toAddInRange.plus(
                            stake.shares.times(ts - reltime)
                        );
                    }
                    toAdd = toAdd.plus(stake.shares.times(ts - abstime));
                }
            }
            du.shareSeconds = toAdd;
            du.shareSecondsRange = toAddInRange;
            u.lastUpdate = ts;
            ds.totalShareSeconds = ds.totalShareSeconds.plus(toAdd);
            ds.totalShareSecondsRange = ds.totalShareSecondsRange.plus(toAddInRange);
        }

        calc_all_rewards(st, ds, ts);
        calc_users_rewards(st, ds, ts);
    };

    const create_g = (
        absTime: number,
        relTime: number,
        endTime: number
    ): GeyserState => ({
        users: {},
        rewardTokens: [],
        absTime,
        relTime,
        endTime,
        schedules: {},
        totalRewards: {},
        totalRewardsInRange: {},
        lastUpdate: absTime - 1,
    });

    const create_ds = (users: string[], tokens: string[]): dState => ({
        users: _.transform(
            users,
            (acc: { [u: string]: dUser }, user, {}) =>
                (acc[user] = create_du(user, tokens))
        ),
        totalShareSecondsRange: new BigNumber(0),
        totalShareSeconds: new BigNumber(0),
        totalRewardsInRange: create_rewards(tokens),
        totalRewards: create_rewards(tokens),
    });

    const create_du = (user: string, tokens: string[]): dUser => ({
        user,
        shareSecondsRange: new BigNumber(0),
        shareSeconds: new BigNumber(0),
    });

    const create_u = (user: string, tokens: string[]): UserState => ({
        user,
        total: new BigNumber(0),
        stakes: [],
        lastUpdate: config.globalStartTime,
        reward: create_rewards(tokens),
        rewardInRange: create_rewards(tokens),
    });
    return calc_geyser_stakes;
};

export {
    GeyserAction,
    StakeAction,
    UnstakeAction,
    ActionsMap,
    Rewards,
    RewardsFixed,
    TokenReward,
    parse_rewards_fixed,
    create_calc_geyser_stakes,
    compare_token_rewards,
    combine_rewards,
    compare_rewards,
    sum_rewards,
    get_rewards,
    rewards_to_integer,
    validate_rewards,
    fetch_system_rewards,
    play_system_rewards,
    validate_distributed,
    compare_distributed,
    rewards_to_fixed,
    compare_users,
    pow10,
};
