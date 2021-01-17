import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import { getAccounts } from "./utils";
import _ from "lodash";
import { StakehoundGeyser, Multiplexer, MerkleMock__factory } from "../typechain";
import {
    deploy_test,
    init_test,
    DeployTestContext,
    unstake_all,
} from "./src/deploy-test";
import { JsonRpcSigner, Log } from "@ethersproject/providers";
import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import stakedTokenAbi from "./src/abi/StakedToken.json";
import { StakedToken, StakedToken__factory } from "./src/types";
import { Interface, LogDescription } from "ethers/lib/utils";
import { fetchEvents, collectActions } from "./src/events";
import { keccak256 } from "ethereumjs-util";
import {
    fetch_system_rewards,
    create_calc_geyser_stakes,
    get_rewards,
    combine_rewards,
    compare_rewards,
    play_system_rewards,
    validate_rewards,
    Rewards,
} from "./src/calc_stakes";
import MultiMerkle, { rewards_to_claims, encode_claim } from "./src/MultiMerkle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];
const siface = new ethers.utils.Interface(stakedTokenAbi) as StakedToken["interface"];

use(solidity);

const MAX_NUMBER = BigNumber.from(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

const log_pair = (r0: Rewards, r1: Rewards) => {
    console.log("users");
    console.log(
        _.zip(
            _.values(r0.users).map((u) => _.values(u.reward).map((t) => t.toFixed(0))),
            _.values(r1.users).map((u) => _.values(u.reward).map((t) => t.toFixed(0)))
        )
    );
    console.log("tokens");
    console.log(
        _.zip(
            _.values(r0.tokens).map((t) => t.toFixed(0)),
            _.values(r1.tokens).map((t) => t.toFixed(0))
        )
    );
};

function tryParseLogs(logs: Log[], ifaces: Interface[]) {
    const out: LogDescription[] = [];
    for (const log of logs) {
        for (const iface of ifaces) {
            try {
                out.push(iface.parseLog(log));
                break;
            } catch (e) {}
        }
    }
    return out;
}

describe("Action tests", function () {
    let signers: SignerWithAddress[];
    let multiplexer: Multiplexer;
    let con: DeployTestContext;
    this.beforeAll(async function () {
        this.timeout(100000);
        signers = await ethers.getSigners();
    });
    this.beforeEach(async function () {
        this.timeout(100000);
        con = await deploy_test();
        ({ multiplexer } = con);
    });
    // it("clear schedules stops rewards from accumulating", async function () {
    //     this.timeout(100000);
    //     const startBlock = await ethers.provider.getBlock(
    //         await ethers.provider.getBlockNumber()
    //     );
    //     await init_test(con);
    //     const endBlock = await ethers.provider.getBlock(
    //         await ethers.provider.getBlockNumber()
    //     );
    //     const geysers = [
    //         con.geysers.seth.address,
    //         con.geysers.sfiro.address,
    //         con.geysers.seth.address,
    //     ];
    //     const oneday = await fetch_system_rewards(
    //         ethers.provider,
    //         geysers,
    //         startBlock.number,
    //         endBlock.number,
    //         startBlock.timestamp + 60 * 60 * 24,
    //         1
    //     );

    //     await HRE.network.provider.request({
    //         method: "evm_setNextBlockTimestamp",
    //         params: [startBlock.timestamp + 60 * 60 * 24],
    //     });

    //     await Promise.all(
    //         _.values(con.geysers).map((g) =>
    //             Promise.all(
    //                 _.values(con.tokens).map((t) => g.clearSchedules(t.address))
    //             )
    //         )
    //     );
    //     const newEnd = await ethers.provider.getBlock(
    //         await ethers.provider.getBlockNumber()
    //     );

    //     const twodays = await fetch_system_rewards(
    //         ethers.provider,
    //         geysers,
    //         startBlock.number,
    //         newEnd.number,
    //         startBlock.timestamp + 60 * 60 * 24 * 2,
    //         1
    //     );

    //     expect(validate_rewards(oneday)).to.eq(true);
    //     expect(validate_rewards(twodays)).to.eq(true);
    //     expect(compare_rewards(oneday, twodays)).to.eq(true);
    // });
    it("clear schedules stops rewards from accumulating", async function () {
        this.timeout(100000);
        const startBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        await init_test(con);
        const endBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const geysers = [
            con.geysers.seth.address,
            con.geysers.sfiro.address,
            con.geysers.seth.address,
        ];
        const oneday = await fetch_system_rewards(
            ethers.provider,
            geysers,
            startBlock.number,
            endBlock.number,
            startBlock.timestamp + 60 * 60 * 24,
            1
        );

        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [startBlock.timestamp + 60 * 60 * 24],
        });

        await unstake_all(con);
        const newEnd = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );

        const twodays = await fetch_system_rewards(
            ethers.provider,
            geysers,
            startBlock.number,
            newEnd.number,
            startBlock.timestamp + 60 * 60 * 24 * 2,
            1
        );
        log_pair(oneday, twodays);
        expect(validate_rewards(oneday)).to.eq(true);
        expect(validate_rewards(twodays)).to.eq(true);
        expect(compare_rewards(oneday, twodays)).to.eq(true);
    });
});
