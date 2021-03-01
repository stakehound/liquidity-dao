import { BigNumber } from "bignumber.js";
import { AbiCoder } from "@ethersproject/abi";
import _ from "lodash";
import { keccak256 } from "ethereumjs-util";
import MerkleTree from "./merkle";
import { writeFileSync } from "fs";
import { Rewards, rewards_to_fixed, RewardsFixed, pow10 } from "./calc_stakes";
import { assert } from "ts-essentials";
const coder = new AbiCoder();

interface Claim {
    account: string;
    cycle: number;
    tokens: string[];
    amounts: string[];
}
interface MerkleRewards {
    cycle: number;
    merkleRoot: string;
    tokenTotals: { [tokens: string]: string };
    claims: {
        [userAddress: string]: {
            amounts: string[];
            tokens: string[];
            proof: string[];
        };
    };
}

const encode_claim = (c: Claim) =>
    MerkleTree.bufferify(
        coder.encode(
            ["address", "uint256", "address[]", "uint256[]"],
            [c.account, c.cycle, c.tokens, c.amounts]
        )
    );

const rewards_to_claims = (_r: RewardsFixed) => {
    return _.keys(_r.users)
        .sort()
        .map(
            (u): Claim => {
                const userRewards = _r.users[u].reward;
                const tokens = _.keys(userRewards).sort();
                return {
                    cycle: _r.cycle,
                    account: u,
                    tokens: tokens,
                    amounts: tokens.map((t) => {
                        return userRewards[t];
                    }),
                };
            }
        );
};

const compare_merkle_rewards = (m0: MerkleRewards, m1: MerkleRewards) => {
    const u0 = _.keys(m0.claims).sort();
    const u1 = _.keys(m1.claims).sort();
    const users = _.union(u0, u1).sort();
    if (!_.isEqual(users, u1) || !_.isEqual(users, u0)) return false;
    const t0 = _.keys(m0.tokenTotals).sort();
    const t1 = _.keys(m1.tokenTotals).sort();
    const tokens = _.union(t0, t1).sort();
    if (!_.isEqual(tokens, t1) || !_.isEqual(tokens, t0)) return false;
    for (const t of tokens) {
        if (
            m0.tokenTotals[t].length !== m1.tokenTotals[t].length ||
            !_.every(m0.tokenTotals[t], (c, i) => {
                const _c = new BigNumber(c);
                return _c
                    .minus(m1.tokenTotals[t][i])
                    .abs()
                    .lt(pow10(_c.toFixed(0).length - 2));
            })
        )
            return false;
    }
    for (const u of users) {
        const c0 = m0.claims[u];
        const c1 = m1.claims[u];
        if (!_.isEqual(c0.tokens, c1.tokens)) {
            return false;
        }
        if (
            c0.amounts.length !== c1.amounts.length ||
            !_.every(c0.amounts, (c, i) => {
                const _c = new BigNumber(c);
                return _c
                    .minus(c1.amounts[i])
                    .abs()
                    .lt(pow10(_c.toFixed(0).length - 2));
            })
        )
            return false;
    }
    return true;
};

const encode_claims = (claims: Claim[]) => claims.map(encode_claim);

class MultiMerkle {
    private constructor(
        public cycle: number,
        public root: string,
        public merkleRewards: MerkleRewards,
        private merkle: MerkleTree
    ) {}

    static fromMerkleRewards(cycle: number, merkleRewards: MerkleRewards) {
        const claims = _.transform(
            _.keys(merkleRewards.claims).sort(),
            (acc: Claim[], key) => {
                acc.push({
                    account: key,
                    cycle,
                    amounts: merkleRewards.claims[key].amounts,
                    tokens: merkleRewards.claims[key].tokens,
                });
            },
            []
        );
        const encoded = encode_claims(claims);
        const merkle = new MerkleTree(encoded, keccak256, {
            sort: true,
            sortPairs: true,
            hashLeaves: true,
        });
        const root = merkle.getHexRoot();
        const _merkleRewards = _.transform(
            claims,
            (acc: MerkleRewards, val) => {
                acc.claims[val.account] = {
                    amounts: val.amounts,
                    tokens: val.tokens,
                    proof: this._getHexProof(merkle, val),
                };
            },
            {
                cycle: cycle,
                merkleRoot: merkle.getHexRoot(),
                tokenTotals: merkleRewards.tokenTotals,
                claims: {},
            }
        );
        assert(
            merkleRewards.merkleRoot === _merkleRewards.merkleRoot &&
                compare_merkle_rewards(merkleRewards, _merkleRewards),
            "MultiMerkle.fromMerkleRewards proofs or root do not match claims"
        );
        return new MultiMerkle(merkleRewards.cycle, root, merkleRewards, merkle);
    }

    static fromRewards(rewards: Rewards) {
        const rewardsFixed = rewards_to_fixed(rewards);
        const claims = rewards_to_claims(rewardsFixed);
        const encoded = encode_claims(claims);
        const merkle = new MerkleTree(encoded, keccak256, {
            sort: true,
            sortPairs: true,
            hashLeaves: true,
        });
        const root = merkle.getHexRoot();
        const merkleRewards = _.transform(
            claims,
            (acc: MerkleRewards, val) => {
                acc.claims[val.account] = {
                    amounts: val.amounts,
                    tokens: val.tokens,
                    proof: this._getHexProof(merkle, val),
                };
            },
            {
                cycle: rewards.cycle,
                merkleRoot: merkle.getHexRoot(),
                tokenTotals: rewardsFixed.rewards,
                claims: {},
            }
        );
        return new MultiMerkle(rewards.cycle, root, merkleRewards, merkle);
    }
    private static _getHexProof(merkle: MerkleTree, claim: Claim) {
        return merkle.getHexProof(encode_claim(claim));
    }

    getHexProof(claim: Claim) {
        return this.merkle.getHexProof(encode_claim(claim));
    }

    getHexRoot() {
        return this.merkle.getHexRoot();
    }
}

export default MultiMerkle;

export { rewards_to_claims, encode_claim, MerkleRewards, compare_merkle_rewards };
