import HRE, { ethers } from "hardhat";
import { Signer, BigNumber } from "ethers";
import { Provider } from "@ethersproject/providers";
import {
    Multiplexer__factory,
    StakehoundGeyser,
    StakehoundGeyser__factory,
    // IStakedToken__factory,
} from "../../typechain";
import { getAccounts } from "../utils";
import { StakedToken__factory, StakedToken } from "./types";
import { Awaited } from "ts-essentials";
import { GeyserAction } from "./calc_stakes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
/*


Ropsten:
stakedXZC (Old version of contract, might not work the same) 0x30183D8025Aa735ea96341b1A17bB1a175AF3608 
stakedXEM 0x0957C4D096dcb6DaF9C7B1A865b3ec9df0d12883
stakedDASH 0x7E7A46FECeDAC72Eca55f762eD557c3756432489
stakedETH 0x09A33bE88094268360b9e340efD3657bBf351AA6
*/

const e14 = BigNumber.from(10).pow(14);
const e10 = BigNumber.from(10).pow(10);

const mainnet_addresses = {
    stakedETH: "0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d", // 12
    stakedFiro: "0x160B1E5aaBFD70B2FC40Af815014925D71CEEd7E", // 8
    stakedXEM: "0x0c63cae5fcc2ca3dde60a35e50362220651ebec8", // 8
};

const valueToShares = async (st: StakedToken, val: BigNumber) => {
    const shares = await st.totalShares();
    const supply = await st.totalSupply();
    const sharesPerToken = await shares.div(supply);
    return val.mul(sharesPerToken);
};

const sharesToValue = async (st: StakedToken, shares: BigNumber) => {
    const tshares = await st.totalShares();
    const tsupply = await st.totalSupply();
    const sharesPerToken = tshares.div(tsupply);
    return shares.div(sharesPerToken);
};

export const tokenNames = ["sfiro", "seth", "sxem"] as const;

export type Tokens = typeof tokenNames[number];

const deploy_test = async () => {
    const mpf = (await ethers.getContractFactory(
        "Multiplexer"
    )) as Multiplexer__factory;
    const gf = (await ethers.getContractFactory(
        "StakehoundGeyser"
    )) as StakehoundGeyser__factory;
    const { accounts, signers } = await getAccounts();
    const geysers: { [addr in Tokens]: StakehoundGeyser } = <any>{};
    geysers.sfiro = await gf.deploy();
    geysers.seth = await gf.deploy();
    geysers.sxem = await gf.deploy();

    const multiplexer = await mpf.deploy();
    const tokens: { [addr in Tokens]: StakedToken } = <any>{};
    await Promise.all([geysers.sfiro.deployed(), multiplexer.deployed()]);
    tokens.sfiro = StakedToken__factory.connect(
        mainnet_addresses.stakedFiro,
        ethers.provider
    );

    const spc = await tokens.sfiro.supplyController();
    await HRE.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [spc],
    });
    const spcSigner = await ethers.provider.getSigner(spc);
    tokens.sfiro = tokens.sfiro.connect(spcSigner);
    tokens.seth = StakedToken__factory.connect(mainnet_addresses.stakedETH, spcSigner);
    tokens.sxem = StakedToken__factory.connect(mainnet_addresses.stakedXEM, spcSigner);
    const bnum = await ethers.provider.getBlockNumber();
    await geysers.sfiro.initialize(
        tokens.sfiro.address,
        bnum + 4,
        accounts[0],
        accounts[0]
    );
    await geysers.seth.initialize(
        tokens.seth.address,
        bnum + 4,
        accounts[0],
        accounts[0]
    );
    await geysers.sxem.initialize(
        tokens.sxem.address,
        bnum + 4,
        accounts[0],
        accounts[0]
    );
    await multiplexer.initialize(accounts[0], accounts[0], accounts[0]);

    return {
        deployer: <SignerWithAddress>signers[0],
        tokens,
        geysers,
        multiplexer,
        spcSigner,
    };
};

type DeployTestContext = Awaited<ReturnType<typeof deploy_test>>;

const init_geyser = async (
    geyser: StakehoundGeyser,
    con: DeployTestContext,
    startTime: number
) => {
    await Promise.all([
        geyser.addDistributionToken(con.tokens.sfiro.address),
        geyser.addDistributionToken(con.tokens.seth.address),
        geyser.addDistributionToken(con.tokens.sxem.address),
    ]).then((all) => all.map((x) => x.wait(1)));

    await Promise.all([
        geyser.signalTokenLock(
            con.tokens.sfiro.address,
            e10.mul(5000),
            60 * 60 * 24 * 30,
            startTime
        ),
        geyser.signalTokenLock(
            con.tokens.seth.address,
            e14.mul(5000),
            60 * 60 * 24 * 30,
            startTime
        ),
        geyser.signalTokenLock(
            con.tokens.sxem.address,
            e10.mul(5000),
            60 * 60 * 24 * 30,
            startTime
        ),
        con.tokens.sfiro.mint(con.multiplexer.address, e10.mul(5000)),
        con.tokens.seth.mint(con.multiplexer.address, e14.mul(5000)),
        con.tokens.sxem.mint(con.multiplexer.address, e10.mul(5000)),
    ]).then((all) => all.map((x) => x.wait(1)));
};

const mintAndStake = async (
    // con: DeployTestContext,
    signers: SignerWithAddress[],
    geyser: StakehoundGeyser,
    stakedToken: StakedToken
) => {
    await Promise.all(
        signers.map(async (x) => {
            await stakedToken.mint(x.address, e10);
            const _token = stakedToken.connect(x);
            await _token.approve(geyser.address, e10);
            const _geyser = geyser.connect(x);
            await (await _geyser.stake(e10, "0x")).wait(1);
        })
    );
};

const unstake = async (
    // con: DeployTestContext,
    signers: SignerWithAddress[],
    geyser: StakehoundGeyser,
    stakedToken: StakedToken
) => {
    await Promise.all(
        signers.map(async (x) => {
            await stakedToken.mint(x.address, e10);
            const _token = stakedToken.connect(x);
            await _token.approve(geyser.address, e10);
            const _geyser = geyser.connect(x);
            const shares = await _geyser.totalStakedFor(x.address);

            const val = await sharesToValue(stakedToken, shares);
            await _geyser.unstake(val, "0x");
        })
    );
};

const unstake_all = async (con: DeployTestContext) => {
    const signers = (await ethers.getSigners()).slice(1);

    await unstake(signers, con.geysers.seth, con.tokens.seth);
    await unstake(signers, con.geysers.sfiro, con.tokens.sfiro);
    await unstake(signers, con.geysers.sxem, con.tokens.sxem);
};

const init_test = async (con: DeployTestContext) => {
    const signers = await ethers.getSigners();
    const deployer = signers.splice(0, 1);
    const block = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
    );

    await init_geyser(con.geysers.sfiro, con, block.timestamp);
    await init_geyser(con.geysers.seth, con, block.timestamp);
    await init_geyser(con.geysers.sxem, con, block.timestamp);
    await mintAndStake(signers, con.geysers.seth, con.tokens.seth);
    await mintAndStake(signers, con.geysers.sfiro, con.tokens.sfiro);
    await mintAndStake(signers, con.geysers.sxem, con.tokens.sxem);
};

export { deploy_test, init_test, DeployTestContext, unstake_all };
