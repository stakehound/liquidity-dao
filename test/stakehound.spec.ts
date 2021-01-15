import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import { getAccounts } from "./utils";
import _ from "lodash";
import { StakehoundGeyser, Multiplexer, MerkleMock__factory } from "../typechain";
import { deploy_test, init_test, DeployTestContext } from "./src/deploy";
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
    play_validate_system_rewards,
    validate_rewards,
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
    let signers: SignerWithAddress[];
    let sfiroGeyser: StakehoundGeyser;
    let multiplexer: Multiplexer;
    let sfiro: StakedToken;
    let seth: StakedToken;
    let sxem: StakedToken;
    let spcSigner: JsonRpcSigner;
    let context: DeployTestContext;
    this.beforeAll(async function () {
        this.timeout(100000);
        signers = await ethers.getSigners();
        context = await deploy_test();
        ({ multiplexer, sfiroGeyser, sfiro, seth, sxem, spcSigner } = context);
    });
    it("rewards type", async function () {
        const startBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        await init_test(context);
        const endBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const geysers = [
            context.sethGeyser.address,
            context.sfiroGeyser.address,
            context.sethGeyser.address,
        ];
        const r = await fetch_system_rewards(
            ethers.provider,
            geysers,
            startBlock.number,
            endBlock.number,
            startBlock.timestamp + 60 * 60 * 24,
            1
        );
        expect(validate_rewards(r)).to.eq(true);
        const w = await play_validate_system_rewards(
            r,
            ethers.provider,
            geysers,
            startBlock.number,
            endBlock.number,
            startBlock.timestamp + 60 * 60 * 24,
            startBlock.timestamp + 60 * 60 * 24 * 2
        );
        w.cycle = 1; // hack for tests
        const m = new MultiMerkle(rewards_to_claims(w));
        await multiplexer.proposeRoot(
            m.getHexRoot(),
            m.getHexRoot(),
            w.cycle,
            0,
            endBlock.number * 2
        );
        await multiplexer.approveRoot(
            m.getHexRoot(),
            m.getHexRoot(),
            w.cycle,
            0,
            endBlock.number * 2
        );
        const _s = signers[3];
        const ci = m.claims.findIndex((c) => c.account === _s.address);
        const c = m.claims[ci];
        const balances = await Promise.all(
            c.tokens.map((x) =>
                StakedToken__factory.connect(x, ethers.provider).balanceOf(_s.address)
            )
        );
        const tx = await multiplexer
            .connect(_s)
            .claim(c!.tokens, c!.amounts, c!.cycle, m.getHexProof(c!));
        const newBalances = await Promise.all(
            c.tokens.map((x) =>
                StakedToken__factory.connect(x, ethers.provider).balanceOf(_s.address)
            )
        ).then((all) => all.map((x) => x.toString()));
        const expected = _.zip(balances, c.amounts).map(([b, c]) =>
            b!.add(c!).toString()
        );
        expect(_.isEqual(newBalances, expected)).to.eq(true);
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
