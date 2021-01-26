import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import _ from "lodash";
import {
    StakehoundGeyser,
    Multiplexer,
    MerkleMock__factory,
    StakedToken__factory,
    StakedToken,
} from "../typechain";

import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import stakedTokenAbi from "../src/abi/StakedToken.json";
import { Interface, LogDescription, BytesLike } from "ethers/lib/utils";

import {
    wait_for_next_proposed,
    wait_for_block,
    wait_for_time,
    sleep,
} from "../src/wait";
import MultiMerkle, { rewards_to_claims, encode_claim } from "../src/MultiMerkle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import S3 from "aws-sdk/clients/s3";
import cids from "cids";
import { fetch_rewards } from "../src/s3";
import { approve_rewards, init_rewards, bump_rewards, Context } from "../src/system";
import { deploy_test_scenario } from "../scripts/test/lib/test-scenario";
import { deploy_staked_token } from "../scripts/test/lib/staked-token";
import { deploy_geyser } from "../scripts/lib/deploy";
import { sharesToValue, valueToShares } from "../src/utils";

const MAX_INT = BigNumber.from(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

describe("Stakehound", function () {
    let signers: SignerWithAddress[];
    let token: StakedToken;
    let geyser: StakehoundGeyser;

    this.beforeAll(async function () {
        this.timeout(100000);
        signers = await ethers.getSigners();
        await HRE.network.provider.request({
            method: "evm_mine",
        });
        const block = await ethers.provider.getBlock("latest");
        token = await deploy_staked_token("foo", "bar", 8);
        geyser = await deploy_geyser(
            token,
            block.timestamp,
            signers[0].address,
            signers[0].address
        );

    });
    it("rewards type", async function () {
        const amt =  BigNumber.from(10).pow(18)
        await token.mint(signers[0].address,amt);
        await token.approve(geyser.address, MAX_INT);
        const txr = await geyser.stake(amt, "0x")
        const tx = await txr.wait(1)
        console.log(tx.gasUsed.toString())
    });
});
