import _ from 'lodash'
import { Rewards } from "../src/calc_stakes";

const log_pair = (r0: Rewards, r1: Rewards) => {
    console.log("users");
    console.log(
        _.zip(
            _.values(r0.users).map((u) => _.values(u.reward).map((t) => t.toFixed(0))),
            _.values(r1.users).map((u) => _.values(u.reward).map((t) => t.toFixed(0)))
        )
    );
    console.log("users in range");
    console.log(
        _.zip(
            _.values(r0.users).map((u) =>
                _.values(u.rewardInRange).map((t) => t.toFixed(0))
            ),
            _.values(r1.users).map((u) =>
                _.values(u.rewardInRange).map((t) => t.toFixed(0))
            )
        )
    );
    console.log("tokens");
    console.log(
        _.zip(
            _.values(r0.rewards).map((t) => t.toFixed(0)),
            _.values(r1.rewards).map((t) => t.toFixed(0))
        )
    );
    console.log("tokens in range");
    console.log(
        _.zip(
            _.values(r0.rewardsInRange).map((t) => t.toFixed(0)),
            _.values(r1.rewardsInRange).map((t) => t.toFixed(0))
        )
    );

    console.log("tokens distributed");
    console.log(
        _.zip(
            _.values(r0.rewardsDistributed).map((t) => t.toFixed(0)),
            _.values(r1.rewardsDistributed).map((t) => t.toFixed(0))
        )
    );
    console.log("tokens distributed in range");
    console.log(
        _.zip(
            _.values(r0.rewardsDistributedInRange).map((t) => t.toFixed(0)),
            _.values(r1.rewardsDistributedInRange).map((t) => t.toFixed(0))
        )
    );
};


export { log_pair }