import { BigNumber } from "bignumber.js";
import { StakehoundConfig } from "./config";
import _ from "lodash";
import assert from "assert";
import { Provider } from "@ethersproject/providers";
import { collectActions, fetchEvents } from "./events";
import { StakehoundGeyser__factory } from "../../typechain";

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

interface UserShareSeconds {
    user: string;
    shareSecondsRange: BigNumber;
    shareSeconds: BigNumber;
}

interface GeyserShareSeconds {
    users: { [user: string]: UserShareSeconds };
    totalShareSeconds: BigNumber;
    totalShareSecondsRange: BigNumber;
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
    tokens: TokenReward;
    tokensInRange: TokenReward;
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
        tokens: token_reward_to_integer(r.tokens),
        tokensInRange: token_reward_to_integer(r.tokensInRange),
        users: _.transform(
            r.users,
            (acc: { [user: string]: UserRewards }, val, key) => {
                acc[key] = user_reward_to_integer(val);
            },
            {}
        ),
    };
};

const get_rewards = (st: GeyserState, cycle: number): Rewards => {
    const r: Rewards = {
        cycle,
        tokens: {},
        tokensInRange: {},
        users: {},
    };

    for (const t of st.rewardTokens) {
        r.tokens[t] = st.totalRewards[t].integerValue();
        r.tokensInRange[t] = st.totalRewardsInRange[t].integerValue();
    }
    for (const u of _.values(st.users)) {
        r.users[u.user] = {
            reward: u.reward,
            rewardInRange: u.rewardInRange,
        };
    }
    return r;
};

const pow10 = (pow: number) => new BigNumber(10).pow(pow);

const sum_rewards = (rewards: Rewards[]) => {
    const cycle = rewards[0].cycle;
    assert(
        rewards.every((r) => r.cycle === cycle),
        "sum_rewards: not all rewards same cycle"
    );
    const tokens = _.union(_.flatten(rewards.map((r) => _.keys(r.tokens)))).sort();
    const useraddrs = _.union(_.flatten(rewards.map((r) => _.keys(r.users)))).sort();
    const comb: Rewards = {
        cycle,
        tokens: create_rewards(tokens),
        users: create_u_rewards(useraddrs, tokens),
        tokensInRange: create_rewards(tokens),
    };
    for (const r of rewards) {
        for (const t of _.keys(r.tokens)) {
            comb.tokens[t] = comb.tokens[t].plus(r.tokens[t]);
            comb.tokensInRange[t] = comb.tokensInRange[t].plus(r.tokensInRange[t]);
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

const compare_rewards = (r0: Rewards, r1: Rewards) => {
    const tokens = _.keys(r0.tokens).sort();
    if (!_.isEqual(tokens, _.keys(r1.tokens).sort())) return false;
    const users = _.keys(r0.users).sort();
    if (!_.isEqual(users, _.keys(r1.users).sort())) return false;
    if (
        !tokens.every((t) =>
            r0.tokens[t]
                .minus(r1.tokens[t])
                .abs()
                .lt(pow10(r0.tokens[t].toFixed().length - 2))
        )
    )
        return false;
    if (
        !tokens.every((t) =>
            r0.tokensInRange[t]
                .minus(r1.tokensInRange[t])
                .abs()
                .lt(pow10(r0.tokensInRange[t].toFixed().length - 2))
        )
    )
        return false;
    if (
        !users.every((u, i) => {
            const tokens = _.keys(r0.users[u].reward).sort();
            const tokensInRange = _.keys(r0.users[u].rewardInRange).sort();
            if (!_.isEqual(tokens, _.keys(r1.users[u].reward).sort())) return false;
            if (!_.isEqual(tokensInRange, _.keys(r1.users[u].rewardInRange).sort()))
                return false;

            if (
                !tokens.every((t) =>
                    r0.users[u].reward[t]
                        .minus(r1.users[u].reward[t])
                        .abs()
                        .lt(pow10(r0.users[u].reward[t].toFixed().length - 4))
                )
            )
                return false;
            if (
                !tokens.every((t) =>
                    r0.users[u].rewardInRange[t]
                        .minus(r1.users[u].rewardInRange[t])
                        .abs()
                        .lt(pow10(r0.users[u].rewardInRange[t].toFixed().length - 4))
                )
            )
                return false;
            return true;
        })
    )
        return false;
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
    let curcycle: number = 0;

    const tokens = _.union(_.flatten(rewards.map((r) => _.keys(r.tokens)))).sort();
    const tokensInRange = _.union(
        _.flatten(rewards.map((r) => _.keys(r.tokensInRange)))
    ).sort();
    const users = _.union(_.flatten(rewards.map((r) => _.keys(r.users)))).sort();

    const comb: Rewards = {
        cycle,
        tokens: create_rewards(tokens),
        tokensInRange: create_rewards(tokensInRange),
        users: create_u_rewards(users, tokens),
    };
    for (const r of rewards) {
        assert(
            curcycle + 1 == r.cycle && curcycle < cycle,
            `combine_rewards: missing cycle ${curcycle + 1}`
        );
        curcycle++;
        for (const t of _.keys(r.tokens)) {
            comb.tokens[t] = r.tokens[t];
            comb.tokensInRange[t] = comb.tokensInRange[t] || new BigNumber(0);
            comb.tokensInRange[t] = comb.tokensInRange[t].plus(r.tokensInRange[t]);
        }
        for (const u of _.keys(r.users)) {
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

const validate_token_rewards = (r: TokenReward[]) => {
    const rest = r.slice(1);
    return _.keys(r[0]).every((addr, i) =>
        rest.every((t) =>
            r[0][addr]
                .minus(t[addr])
                .abs()
                .lt(pow10(r[0][addr].toFixed().length - 4))
        )
    );
};

const validate_rewards = (r: Rewards) => {
    const acc: { tokenReward: TokenReward; tokenRewardInRange: TokenReward } = {
        tokenReward: {},
        tokenRewardInRange: {},
    };
    for (const u of _.values(r.users)) {
        for (const t of _.keys(u.reward)) {
            acc.tokenReward[t] = acc.tokenReward[t] || new BigNumber(0);
            acc.tokenReward[t] = acc.tokenReward[t].plus(u.reward[t]);
        }
        for (const t of _.keys(u.rewardInRange)) {
            acc.tokenRewardInRange[t] = acc.tokenRewardInRange[t] || new BigNumber(0);
            acc.tokenRewardInRange[t] = acc.tokenRewardInRange[t].plus(
                u.rewardInRange[t]
            );
        }
    }
    return (
        validate_token_rewards([acc.tokenReward, r.tokens]) &&
        validate_token_rewards([acc.tokenRewardInRange, r.tokensInRange])
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
    cycle: number
) => {
    const absTime = await provider.getBlock(startBlock).then((b) => b.timestamp);
    const config = await fetch_system_config(provider, geysers);
    const acts = await fetch_system_actions(provider, geysers, startBlock, endBlock);
    const calc = create_calc_system_stakes(config);
    const system = calc(acts, absTime, absTime, endTime);
    const r = get_system_rewards(system, cycle);
    assert(validate_rewards(r), "fetched rewards did not validate");
    return r;
};

const play_system_rewards = async (
    lastRewards: Rewards,
    provider: Provider,
    geysers: string[],
    startBlock: number,
    endBlock: number,
    relTime: number,
    endTime: number
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
    assert(compare_rewards(ra, comb), "played rewards did not match total replay");
    assert(validate_rewards(ra), "played rewards did not validate");
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
        process_share_seconds(st, unstake.timestamp);
        st.lastUpdate = unstake.timestamp;
        let toUnstake = unstake.shares;
        const u = st.users[user];
        let i = u.stakes.length - 1;
        while (toUnstake.gt(0)) {
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

    const calc_all_rewards = (st: GeyserState, ts: number) => {
        const relguard = _.max([st.relTime, st.lastUpdate])!;
        const absguard = _.max([st.absTime, st.lastUpdate])!;
        for (const t of st.rewardTokens) {
            st.totalRewards[t] = st.totalRewards[t] || new BigNumber(0);
            st.totalRewardsInRange[t] = st.totalRewardsInRange[t] || new BigNumber(0);
            if (ts > st.lastUpdate) {
                // TODO: FIX/make diff state for slice, also w/ user
                if (ts > st.relTime) {
                    st.totalRewardsInRange[t] =
                        // st.totalRewardsInRange[t].plus(
                        calc_token_reward(st, t, relguard, ts);
                    // );
                }
                st.totalRewards[t] =
                    // st.totalRewards[t].plus(
                    calc_token_reward(st, t, absguard, ts);
                // );
            }
        }
        st.lastUpdate = ts;
    };

    const calc_users_rewards = (
        st: GeyserState,
        gss: GeyserShareSeconds,
        ts: number
    ) => {
        for (const u of _.values(st.users)) {
            const uss = gss.users[u.user];
            if (ts >= st.absTime && ts <= st.endTime) {
                for (const t of st.rewardTokens) {
                    let tr = st.totalRewards[t];
                    let trir = st.totalRewardsInRange[t];
                    u.reward[t] = u.reward[t] || new BigNumber(0);
                    u.rewardInRange[t] = u.rewardInRange[t] || new BigNumber(0);
                    if (gss.totalShareSeconds.gt(0)) {
                        u.reward[t] = u.reward[t].plus(
                            tr.times(uss.shareSeconds).div(gss.totalShareSeconds)
                        );
                    }
                    if (gss.totalShareSecondsRange.gt(0)) {
                        u.rewardInRange[t] = u.rewardInRange[t].plus(
                            trir
                                .times(uss.shareSecondsRange)
                                .div(gss.totalShareSecondsRange)
                        );
                    }
                }
            }
        }
    };
    const process_share_seconds = (st: GeyserState, ts: number) => {
        const gss = create_gss(_.keys(st.users), st.rewardTokens);
        for (const u of _.values(st.users)) {
            const uss = gss.users[u.user];
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
            uss.shareSeconds = toAdd;
            uss.shareSecondsRange = toAddInRange;
            u.lastUpdate = ts;
            gss.totalShareSeconds = gss.totalShareSeconds.plus(toAdd);
            gss.totalShareSecondsRange = gss.totalShareSecondsRange.plus(toAddInRange);
        }

        calc_all_rewards(st, ts);
        calc_users_rewards(st, gss, ts);
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

    const create_gss = (users: string[], tokens: string[]): GeyserShareSeconds => ({
        users: _.transform(
            users,
            (acc: { [u: string]: UserShareSeconds }, user, {}) =>
                (acc[user] = create_uss(user, tokens))
        ),
        totalShareSecondsRange: new BigNumber(0),
        totalShareSeconds: new BigNumber(0),
    });

    const create_uss = (user: string, tokens: string[]): UserShareSeconds => ({
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
    create_calc_geyser_stakes,
    combine_rewards,
    compare_rewards,
    sum_rewards,
    get_rewards,
    rewards_to_integer,
    validate_rewards,
    fetch_system_rewards,
    play_system_rewards,
};
