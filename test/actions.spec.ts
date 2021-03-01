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
    fetch_system_actions,
    reduce_system_actions,
    compare_rewards,
    compare_users,
    validate_rewards,
    compare_distributed,
    validate_distributed,
    parse_rewards_fixed,
    rewards_to_fixed,
    Rewards,
    get_distributed,
} from "../src/calc_stakes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import {
    deploy_test_scenario,
    DeployTestContext,
} from "../scripts/test/lib/test-scenario";
import { unstake_all, clear_all } from "./utils/deploy-test";

const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];
const siface = new ethers.utils.Interface(stakedTokenAbi) as StakedToken["interface"];

use(solidity);

const strip_zero_account = (r: Rewards) => {
    delete r.users["0x0000000000000000000000000000000000000000"];
    const { rewards, rewardsInRange } = get_distributed(r);
    r.rewardsDistributed = rewards;
    r.rewardsDistributedInRange = rewardsInRange;
    return parse_rewards_fixed(rewards_to_fixed(r));
};

describe("Action tests", function () {
    let signers: SignerWithAddress[];
    let con: DeployTestContext;
    this.beforeAll(async function () {
        this.timeout(100000);
        signers = await ethers.getSigners();
    });
    this.beforeEach(async function () {
        this.timeout(100000);
        await HRE.network.provider.request({
            method: "evm_mine",
        });
        con = await deploy_test_scenario();
    });
    it("clear schedules stops rewards from accumulating", async function () {
        this.timeout(100000);
        const endBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const geysers = _.keys(con.geysers);
        const oneacts = await fetch_system_actions(
            ethers.provider,
            geysers,
            con.startBlock.number,
            endBlock.number
        );
        const oneday = await reduce_system_actions(
            ethers.provider,
            geysers,
            con.startBlock.number,
            con.startBlock.timestamp + 60 * 60 * 24,
            1,
            oneacts
        );

        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [con.startBlock.timestamp + 60 * 60 * 24],
        });

        await clear_all(con);
        const newEnd = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );

        const twoacts = await fetch_system_actions(
            ethers.provider,
            geysers,
            con.startBlock.number,
            newEnd.number
        );

        const twodays = await reduce_system_actions(
            ethers.provider,
            geysers,
            con.startBlock.number,
            con.startBlock.timestamp + 60 * 60 * 24 * 2,
            1,
            twoacts
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
        const geysers = _.keys(con.geysers);
        const oneacts = await fetch_system_actions(
            ethers.provider,
            geysers,
            con.startBlock.number,
            endBlock.number
        );
        const onedayP = reduce_system_actions(
            ethers.provider,
            geysers,
            con.startBlock.number,
            con.startBlock.timestamp + 60 * 60 * 24,
            1,
            oneacts,
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
        const twoacts = await fetch_system_actions(
            ethers.provider,
            geysers,
            con.startBlock.number,
            newEnd.number
        );
        const [oneday, twodays] = await onedayP.then(async (oneday) => [
            oneday,
            await reduce_system_actions(
                ethers.provider,
                geysers,
                con.startBlock.number,
                con.startBlock.timestamp + 60 * 60 * 24 * 2,
                1,
                twoacts,
                false
            ),
        ]);
        expect(validate_rewards(oneday)).to.eq(true);
        expect(validate_rewards(twodays)).to.eq(true);
        expect(validate_distributed(twodays)).to.eq(true);
        expect(compare_distributed(oneday, twodays)).to.eq(false);
        expect(compare_users(oneday, twodays)).to.eq(false);
        expect(compare_rewards(oneday, twodays)).to.eq(false);
        expect(
            compare_distributed(strip_zero_account(oneday), strip_zero_account(twodays))
        ).to.eq(true);
        expect(
            compare_users(strip_zero_account(oneday), strip_zero_account(twodays))
        ).to.eq(true);
        expect(
            compare_rewards(strip_zero_account(oneday), strip_zero_account(twodays))
        ).to.eq(true);
    });
});
