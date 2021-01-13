import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import { getAccounts } from "./utils";
import _ from "lodash";
import { StakehoundGeyser, Multiplexer } from "../typechain";
import { deploy_test, init_test, DeployTestContext } from "./src/deploy";
import { JsonRpcSigner, Log } from "@ethersproject/providers";
import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import stakedTokenAbi from "./src/abi/StakedToken.json";
import { StakedToken } from "./src/types";
import { Interface, LogDescription } from "ethers/lib/utils";
import { fetchEvents, collectActions } from "./src/events";
import {
    create_calc_geyser_stakes,
    get_rewards,
    combine_rewards,
    compare_rewards,
} from "./src/calc_stakes";

const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];
const siface = new ethers.utils.Interface(stakedTokenAbi) as StakedToken["interface"];

use(solidity);

const MAX_NUMBER = BigNumber.from(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

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

describe("Stakehound", function () {
    let signers: Signer[];
    let accounts: string[];
    let geyser: StakehoundGeyser;
    let multiplexer: Multiplexer;
    let sfiro: StakedToken;
    let seth: StakedToken;
    let sxem: StakedToken;
    let spcSigner: JsonRpcSigner;
    let context: DeployTestContext;
    this.beforeAll(async function () {
        ({ signers, accounts } = await getAccounts());
        context = await deploy_test();
        ({ geyser, multiplexer, sfiro, seth, sxem, spcSigner } = context);
    });
    it("rewards type", async function () {
        const startBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        await init_test(context);
        const endBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const logs = await fetchEvents(
            geyser.address,
            startBlock.number,
            endBlock.number,
            ethers.provider
        );
        const amap = await collectActions(logs);
        const calc_geyser_stakes = create_calc_geyser_stakes({
            globalStartTime: startBlock.timestamp,
        });
        const end = (await ethers.provider.getBlock(_.last(logs)!.blockNumber!))
            .timestamp;

        const fr = calc_geyser_stakes(
            amap,
            startBlock.timestamp,
            startBlock.timestamp,
            startBlock.timestamp + 60 * 60 * 6
        );
        const first = get_rewards(fr, 1);

        const sr = calc_geyser_stakes(
            amap,
            startBlock.timestamp,
            startBlock.timestamp + 60 * 60 * 6 + 1,
            startBlock.timestamp + 60 * 60 * 12
        );
        const second = get_rewards(sr, 2);

        const wr = calc_geyser_stakes(
            amap,
            startBlock.timestamp,
            startBlock.timestamp,
            startBlock.timestamp + 60 * 60 * 12
        );
        const whole = get_rewards(wr, 2);

        const comb = combine_rewards(2, [first, second]);

        expect(compare_rewards(whole, comb)).to.eq(true);
    });
    // it("test things", async function () {
    //     const signers = await get_fake_accounts();
    //     console.log(await Promise.all(signers.map((x) => x.getBalance())));
    // });
    // it("Mint some stakedFiro", async function () {
    //     let _sfiro = sfiro.connect(spcSigner);
    //     let balance = await _sfiro.balanceOf(accounts[0]);
    //     expect(balance).to.eq(0);
    //     await _sfiro.mint(accounts[1], BigNumber.from(10).pow(18));
    //     balance = await _sfiro.balanceOf(accounts[1]);
    //     expect(balance).to.eq(BigNumber.from(10).pow(18));
    // });
    // it("Change supply", async function () {
    //     console.log(`shares: ${(await sfiro.sharesOf(accounts[1])).toString()}`);
    //     let _sfiro = sfiro.connect(spcSigner);
    //     console.log(`balance: ${(await sfiro.balanceOf(accounts[1])).toString()}`);
    //     await _sfiro.distributeTokens(BigNumber.from(10).pow(18).mul(50000), true);
    //     console.log(`balance: ${(await sfiro.balanceOf(accounts[1])).toString()}`);
    //     await _sfiro.distributeTokens(BigNumber.from(10).pow(18).mul(50000), false);
    //     await _sfiro.distributeTokens(BigNumber.from(10).pow(18), false);
    //     console.log(`balance: ${(await sfiro.balanceOf(accounts[1])).toString()}`);
    //     await _sfiro.distributeTokens(
    //         BigNumber.from(10).pow(18).mul(50000).add(BigNumber.from(10).pow(18)),
    //         true
    //     );
    //     console.log(`balance: ${(await sfiro.balanceOf(accounts[1])).toString()}`);
    // });
    // it("Deposit some stakedFiro", async function () {
    //     await sfiro.approve(geyser.address, MAX_NUMBER);
    //     const sharesBefore = await sfiro.sharesOf(accounts[1]);
    //     const txres = await geyser.stake(BigNumber.from(10).pow(18), "0x");
    //     const txrec = await txres.wait(1);
    //     const sharesAfter = await sfiro.sharesOf(accounts[1]);
    //     const stakedC = sharesBefore.sub(sharesAfter);
    //     const _logs = await ethers.provider.getLogs({
    //         fromBlock: txrec.blockNumber,
    //         toBlock: txrec.blockNumber,
    //     });
    //     const logs = tryParseLogs(_logs, [siface, giface]);
    //     const stakedE = logs.find((x) => x.name === "Staked")!.args.shares;
    //     expect(stakedE).to.eq(stakedC);
    // });
});
