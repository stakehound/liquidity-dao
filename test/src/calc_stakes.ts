import { BigNumber } from "bignumber.js";
import { StakehoundConfig } from "./config";
import _ from "lodash";
import assert from "assert";
import { start } from "repl";

BigNumber.set({
    ROUNDING_MODE: BigNumber.ROUND_FLOOR,
    DECIMAL_PLACES: 100,
    POW_PRECISION: 20,
});

interface Stake {
    shares: BigNumber;
    timestamp: number;
}

interface Schedules {
    [token: string]: UnlockScheduleAction[];
}

interface UserState {
    user: string;
    total: BigNumber;
    stakes: Stake[];
    lastUpdate: number;
    shareSeconds: BigNumber;
    shareSecondsInRange: BigNumber;
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

type GeyserAction = StakeAction | UnstakeAction | UnlockScheduleAction;

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
    totalShareSeconds: BigNumber;
    totalShareSecondsInRange: BigNumber;
    schedules: Schedules;
    absTime: number;
    relTime: number;
    endTime: number;
}

interface UserRewards {
    reward: TokenReward;
    rewardInRange: TokenReward;
}

interface Rewards {
    cycle: number;
    tokens: TokenReward;
    users: { [user: string]: UserRewards };
}

const token_reward_to_fixed = (r: TokenReward) => {
    return _.transform(
        r,
        (acc: TokenReward, val, key) => {
            acc[key] = val.integerValue();
        },
        {}
    );
};

const get_rewards = (st: GeyserState, cycle: number): Rewards => {
    const r: Rewards = {
        cycle,
        tokens: {},
        users: {},
    };

    for (const t of st.rewardTokens) {
        r.tokens[t] = st.totalRewardsInRange[t].integerValue();
        // .integerValue();
    }
    for (const u of _.values(st.users)) {
        r.users[u.user] = {
            reward:
                // token_reward_to_fixed(
                u.reward,
            // )
            rewardInRange:
                // token_reward_to_fixed(
                u.rewardInRange,
            // )
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
    const comb: Rewards = { cycle, tokens: {}, users: {} };
    for (const r of rewards) {
        for (const t of _.keys(r.tokens)) {
            comb.tokens[t] = comb.tokens[t] || new BigNumber(0);
            comb.tokens[t] = comb.tokens[t].plus(r.tokens[t]);
        }
        for (const u of _.keys(r.users)) {
            for (const t of _.keys(r.users[u].reward)) {
                comb.users[u].reward[t] = comb.users[u].reward[t] || new BigNumber(0);
                comb.users[u].reward[t] = comb.users[u].reward[t].plus(r.tokens[t]);
            }
            for (const t of _.keys(r.users[u].reward)) {
                comb.users[u].rewardInRange[t] =
                    comb.users[u].rewardInRange[t] || new BigNumber(0);
                comb.users[u].rewardInRange[t] = comb.users[u].rewardInRange[t].plus(
                    r.tokens[t]
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
                .lt(pow10(r0.tokens[t].toFixed().length - 4))
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

    const tokens = _.union(_.flatten(rewards.map((r) => _.keys(r.tokens).sort())));
    const users = _.union(_.flatten(rewards.map((r) => _.keys(r.users).sort())));

    const comb: Rewards = {
        cycle,
        tokens: create_rewards(tokens),
        users: create_u_rewards(users, tokens),
    };
    for (const r of rewards) {
        assert(
            curcycle + 1 == r.cycle,
            `combine_rewards: missing cycle ${curcycle + 1}`
        );
        curcycle++;
        for (const t of _.keys(r.tokens)) {
            comb.tokens[t] = comb.tokens[t] || new BigNumber(0);
            comb.tokens[t] = comb.tokens[t].plus(r.tokens[t]);
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

const create_calc_geyser_stakes = (config: StakehoundConfig) => {
    const calc_geyser_stakes = (
        acts: GeyserAction[],
        absTime: number,
        relTime: number,
        endTime: number
    ) => {
        let st = create_g(absTime, relTime, endTime);
        st = process_actions(st, acts);
        return st;
    };

    const process_actions = (st: GeyserState, acts: GeyserAction[]) => {
        for (const act of acts) {
            if (act.timestamp > st.endTime) {
                continue; // throw ?
            } else if (act.type === "unlock") {
                st = unlock(st, act);
                continue;
            }
            st.users[act.user] =
                st.users[act.user] || create_u(act.user, st.rewardTokens);
            if (act.type == "stake") {
                st = stake(st, act.user, act);
            } else if (act.type == "unstake") {
                st = unstake(st, act.user, act);
            }
        }
        for (const u of _.values(st.users)) {
            st = calc_end_share_seconds(st, u.user);
        }
        return st;
    };

    const unlock = (st: GeyserState, act: UnlockScheduleAction) => {
        for (const u of _.values(st.users)) {
            st = process_share_seconds(st, u.user, act.timestamp);
        }
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
        return st;
    };

    const stake = (st: GeyserState, user: string, stake: StakeAction) => {
        st = process_share_seconds(st, user, stake.timestamp);
        const u = st.users[user];
        u.stakes.push(stake);
        st.users[user].lastUpdate = stake.timestamp;
        st.users[user].total = stake.total;
        return st;
    };

    const unstake = (st: GeyserState, user: string, unstake: UnstakeAction) => {
        st = process_share_seconds(st, user, unstake.timestamp);
        let toUnstake = unstake.shares;
        const u = st.users[user];
        let i = u.stakes.length - 1;
        while (toUnstake.gt(0)) {
            const stake = u.stakes[i];
            if (stake.shares.lte(toUnstake)) {
                u.stakes.pop();
                toUnstake = toUnstake.minus(stake.shares);
            } else {
                u.stakes[i].shares.minus(stake.shares);
            }
        }
        st.users[user].lastUpdate = unstake.timestamp;
        st.users[user].total = unstake.total;
        return st;
    };

    const calc_end_share_seconds = (st: GeyserState, user: string) => {
        st = process_share_seconds(st, user, st.endTime);
        st.users[user].lastUpdate = st.endTime;
        return st;
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
                    _.min([endTime, sch.endTime])! -
                    _.max([startTime, sch.startTime])!) > 0
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

    const calc_all_rewards = (st: GeyserState, relTime: number, endTime: number) => {
        for (const t of st.rewardTokens) {
            st.totalRewards[t] = calc_token_reward(st, t, st.absTime, endTime);
            st.totalRewardsInRange[t] = calc_token_reward(st, t, relTime, endTime);
        }
        return st;
    };

    const process_share_seconds = (
        st: GeyserState,
        user: string,
        ts: number
    ): GeyserState => {
        const u = st.users[user];
        if (!u) {
            return st;
        }
        const timeSinceLastAction = ts - u.lastUpdate;
        if (timeSinceLastAction <= 0) {
            return st;
        }
        let toAdd = new BigNumber(0);
        let toAddInRange = new BigNumber(0);

        const relguard = _.max([st.relTime, u.lastUpdate])!;
        const absguard = _.max([st.absTime, u.lastUpdate])!;
        const reltime = _.max([relguard, u.lastUpdate])!;
        const abstime = _.max([absguard, u.lastUpdate])!;
        for (const stake of u.stakes) {
            for (const sch of _.flatten(_.values(st.schedules))) {
                if (
                    ts >= abstime &&
                    ts >= stake.timestamp &&
                    ts <= sch.endTime &&
                    ts >= sch.startTime
                ) {
                    if (ts >= reltime) {
                        toAddInRange = toAddInRange.plus(
                            stake.shares.times(ts - reltime)
                        );
                    }
                    toAdd = toAdd.plus(stake.shares.times(ts - abstime));
                }
            }
        }
        u.shareSeconds = u.shareSeconds.plus(toAdd);
        u.shareSecondsInRange = u.shareSecondsInRange.plus(toAddInRange);
        st.totalShareSeconds = st.totalShareSeconds.plus(toAdd);
        st.totalShareSecondsInRange = st.totalShareSecondsInRange.plus(toAddInRange);
        if (ts >= abstime && ts <= st.endTime && ts >= relguard) {
            st = calc_all_rewards(st, relguard, ts);
        }
        for (const t of st.rewardTokens) {
            let tr = st.totalRewards[t];
            let trir = st.totalRewardsInRange[t];
            if (st.totalShareSeconds.gt(0)) {
                u.reward[t] = tr.times(u.shareSeconds).div(st.totalShareSeconds);
            }
            if (st.totalShareSecondsInRange.gt(0)) {
                u.rewardInRange[t] = trir
                    .times(u.shareSecondsInRange)
                    .div(st.totalShareSecondsInRange);
            }
        }

        return st;
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
        totalShareSeconds: new BigNumber(0),
        totalShareSecondsInRange: new BigNumber(0),
    });

    const create_u = (user: string, tokens: string[]): UserState => ({
        user,
        total: new BigNumber(0),
        stakes: [],
        lastUpdate: config.globalStartTime,
        shareSeconds: new BigNumber(0),
        shareSecondsInRange: new BigNumber(0),
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
    create_calc_geyser_stakes,
    combine_rewards,
    compare_rewards,
    sum_rewards,
    get_rewards,
};
