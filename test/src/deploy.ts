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

const deploy_test = async () => {
    const mpf = (await ethers.getContractFactory(
        "Multiplexer"
    )) as Multiplexer__factory;
    const gf = (await ethers.getContractFactory(
        "StakehoundGeyser"
    )) as StakehoundGeyser__factory;
    const { accounts, signers } = await getAccounts();
    const sfiroGeyser = await gf.deploy();
    const sethGeyser = await gf.deploy();
    const sxemGeyser = await gf.deploy();

    const multiplexer = await mpf.deploy();

    await Promise.all([sfiroGeyser.deployed(), multiplexer.deployed()]);
    let sfiro = StakedToken__factory.connect(
        mainnet_addresses.stakedFiro,
        ethers.provider
    );

    const spc = await sfiro.supplyController();
    await HRE.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [spc],
    });
    const spcSigner = await ethers.provider.getSigner(spc);
    sfiro = sfiro.connect(spcSigner);
    const seth = StakedToken__factory.connect(mainnet_addresses.stakedETH, spcSigner);
    const sxem = StakedToken__factory.connect(mainnet_addresses.stakedXEM, spcSigner);
    const bnum = await ethers.provider.getBlockNumber();
    await sfiroGeyser.initialize(sfiro.address, bnum + 4, accounts[0], accounts[0]);
    await sethGeyser.initialize(seth.address, bnum + 4, accounts[0], accounts[0]);
    await sxemGeyser.initialize(sxem.address, bnum + 4, accounts[0], accounts[0]);
    await multiplexer.initialize(accounts[0], accounts[0], accounts[0]);

    return {
        deployer: <SignerWithAddress>signers[0],
        sfiro,
        sfiroGeyser,
        sxemGeyser,
        sethGeyser,
        multiplexer,
        seth,
        sxem,
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
        geyser.addDistributionToken(con.sfiro.address),
        geyser.addDistributionToken(con.seth.address),
        geyser.addDistributionToken(con.sxem.address),
    ]).then((all) => all.map((x) => x.wait(1)));

    await Promise.all([
        geyser.signalTokenLock(
            con.sfiro.address,
            e10.mul(5000),
            60 * 60 * 24 * 30,
            startTime
        ),
        geyser.signalTokenLock(
            con.seth.address,
            e14.mul(5000),
            60 * 60 * 24 * 30,
            startTime
        ),
        geyser.signalTokenLock(
            con.sxem.address,
            e10.mul(5000),
            60 * 60 * 24 * 30,
            startTime
        ),
        con.sfiro.mint(con.multiplexer.address, e10.mul(5000)),
        con.seth.mint(con.multiplexer.address, e14.mul(5000)),
        con.sxem.mint(con.multiplexer.address, e10.mul(5000)),
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

const init_test = async (con: DeployTestContext) => {
    const signers = await ethers.getSigners();
    const deployer = signers.splice(0, 1);
    const block = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
    );

    await init_geyser(con.sfiroGeyser, con, block.timestamp);
    await init_geyser(con.sethGeyser, con, block.timestamp);
    await init_geyser(con.sxemGeyser, con, block.timestamp);
    await mintAndStake(signers, con.sethGeyser, con.seth);
    await mintAndStake(signers, con.sfiroGeyser, con.sfiro);
    await mintAndStake(signers, con.sxemGeyser, con.sxem);
};

export { deploy_test, init_test, DeployTestContext };
