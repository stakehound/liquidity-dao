import { BigNumber } from "ethers";
import { AbiCoder } from "@ethersproject/abi";
import _ from "lodash";
import { keccak256 } from "ethereumjs-util";
import MerkleTree from "./merkle";

import { Rewards, rewards_to_integer } from "./calc_stakes";
const coder = new AbiCoder();

interface Claim {
    account: string;
    cycle: number;
    tokens: string[];
    amounts: string[];
}

const encode_claim = (c: Claim) =>
    MerkleTree.bufferify(
        coder.encode(
            ["address", "uint256", "address[]", "uint256[]"],
            [c.account, c.cycle, c.tokens, c.amounts]
        )
    );

const rewards_to_claims = (r: Rewards) => {
    const _r = rewards_to_integer(r);
    return _.keys(_r.users).sort().map(
        (u): Claim => {
            const userRewards = _r.users[u].reward;
            const tokens = _.keys(userRewards).sort();
            return {
                cycle: r.cycle,
                account: u,
                tokens: tokens,
                amounts: tokens.map((t) => {
                    return userRewards[t].toFixed();
                }),
            };
        }
    );
};

const encode_claims = (claims: Claim[]) => claims.map(encode_claim);

class MultiMerkle {
    merkle: MerkleTree;
    claims: Claim[];
    encoded: Buffer[];
    constructor(claims: Claim[]) {
        this.claims = claims
        this.encoded = encode_claims(this.claims);
        this.merkle = new MerkleTree(this.encoded, keccak256, {
            sort: true,
            sortPairs: true,
            hashLeaves: true,
        });
    }
    getHexProof(claim: Claim) {
        return this.merkle.getHexProof(encode_claim(claim));
    }
    getHexRoot() {
        return this.merkle.getHexRoot();
    }
}

export default MultiMerkle;

export { rewards_to_claims, encode_claim };
