import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import _ from "lodash";
import {
    StakehoundGeyser,
    Multiplexer,
    StakedToken__factory,
    StakedToken,
} from "../typechain";
import { Log } from "@ethersproject/providers";
import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import stakedTokenAbi from "../src/abi/StakedToken.json";
import { Interface, LogDescription } from "ethers/lib/utils";
import {
    fetch_system_rewards,
    compare_rewards,
    compare_users,
    validate_rewards,
    compare_distributed,
    validate_distributed,
} from "../src/calc_stakes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { deploy_test_scenario, DeployTestScenarioContext } from "../scripts/test/lib/test-scenario";
import { unstake_all } from "./utils/deploy-test";

const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];
const siface = new ethers.utils.Interface(stakedTokenAbi) as StakedToken["interface"];

use(solidity);

describe("Action tests", function () {
    let signers: SignerWithAddress[];
    let con: DeployTestScenarioContext;
    this.beforeAll(async function () {
        this.timeout(100000);
        signers = await ethers.getSigners();
    });
    this.beforeEach(async function () {
        this.timeout(100000);
        con = await deploy_test_scenario();
    });
    it("clear schedules stops rewards from accumulating", async function () {
        this.timeout(100000);
        const endBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const geysers = _.keys(con.geysers)
        const oneday = await fetch_system_rewards(
            ethers.provider,
            geysers,
            con.startBlock.number,
            endBlock.number,
            con.startBlock.timestamp + 60 * 60 * 24,
            1
        );

        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [con.startBlock.timestamp + 60 * 60 * 24],
        });

        await Promise.all(
            _.values(con.geysers).map((g) =>
                Promise.all(
                    _.values(con.tokens).map((t) => g.clearSchedules(t.address))
                )
            )
        );
        const newEnd = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );

        const twodays = await fetch_system_rewards(
            ethers.provider,
            geysers,
            con.startBlock.number,
            newEnd.number,
            con.startBlock.timestamp + 60 * 60 * 24 * 2,
            1
        );

        expect(validate_rewards(oneday)).to.eq(true);
        expect(validate_rewards(twodays)).to.eq(true);
        expect(compare_rewards(oneday, twodays)).to.eq(true);
    });
    it("unstaking stops rewards from accumulating", async function () {
        this.timeout(100000);
        const endBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const geysers = _.keys(con.geysers)
        const onedayP = fetch_system_rewards(
            ethers.provider,
            geysers,
            con.startBlock.number,
            endBlock.number,
            con.startBlock.timestamp + 60 * 60 * 24,
            1,
            false
        );

        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [con.startBlock.timestamp + 60 * 60 * 24],
        });

        await unstake_all(con);

        const newEnd = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );

        const [oneday, twodays] = await onedayP.then(async (oneday) => [
            oneday,
            await fetch_system_rewards(
                ethers.provider,
                geysers,
                con.startBlock.number,
                newEnd.number,
                con.startBlock.timestamp + 60 * 60 * 24 * 2,
                1,
                false
            ),
        ]);

        expect(validate_rewards(oneday)).to.eq(true);
        expect(validate_rewards(twodays)).to.eq(false);
        expect(validate_distributed(twodays)).to.eq(true);
        expect(compare_distributed(oneday, twodays)).to.eq(true);
        expect(compare_users(oneday, twodays)).to.eq(true);
        expect(compare_rewards(oneday, twodays)).to.eq(false);
    });
});
