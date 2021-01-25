import _ from "lodash";
import { ethers, upgrades } from "hardhat";
import { StakedToken, StakedToken__factory } from "../../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "ethers";
import { TokenReward } from "../../../src/calc_stakes";
import { signal_token_locks } from "../../../src/geyser-utils";
import { TokensMap, GeysersMap } from "../../lib/types";

export const tokenSymbols = ["SFIRO", "SETH", "SXEM"] as const;

const stakedDecimals: { [t: string]: number } = {
    SFIRO: 8,
    SETH: 18,
    SXEM: 8,
};

const stakedNames: { [t: string]: string } = {
    SFIRO: "StakedFiro",
    SETH: "StakedETH",
    SXEM: "StakedXEM",
};

const deploy_staked_tokens = async (): Promise<TokensMap> => {
    const tokens = await Promise.all(
        tokenSymbols.map((symbol) =>
            deploy_staked_token(stakedNames[symbol], symbol, stakedDecimals[symbol])
        )
    );
    return _.transform(tokens, (acc: TokensMap, val) => (acc[val.address] = val), {});
};

const deploy_staked_token = async (
    tokenName: string,
    tokenSymbol: string,
    tokenDecimals: number
) => {
    const tokenMaxSupply = ethers.BigNumber.from(10).pow(10 + tokenDecimals + 8);
    const tokenInitialSupply = ethers.BigNumber.from("0");

    // We get the contract to deploy
    const StakedToken = (await ethers.getContractFactory(
        "StakedToken"
    )) as StakedToken__factory;
    const stakedToken = (await upgrades.deployProxy(StakedToken, [
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenMaxSupply,
        tokenInitialSupply,
    ])) as StakedToken;
    await stakedToken.deployed();

    console.log(`${tokenName} deployed to: `, stakedToken.address);
    return stakedToken;
};

const mint_and_stake = async (
    tokens: TokensMap,
    geysers: GeysersMap,
    signers: SignerWithAddress[]
) => {
    await Promise.all(
        signers.map(async (x) =>
            Promise.all(
                _.map(tokens, async (stakedToken, tokenName) => {
                    const geyser = geysers[tokenName];
                    const amt = BigNumber.from(10)
                        .pow(await stakedToken.decimals())
                        .mul(300);
                    await stakedToken.mint(x.address, amt);
                    const _token = stakedToken.connect(x);
                    await _token.approve(geyser.address, amt);
                    const _geyser = geyser.connect(x);
                    await (await _geyser.stake(amt, "0x")).wait(1);
                })
            )
        )
    );
};

const mint_and_signal = async (
    tokens: TokensMap,
    geysers: GeysersMap,
    startTime: number,
    durationSec: number
) => {
    // await signal_token_locks(tokens, geysers, )))
    const toDistribute = BigNumber.from(100000);
    const toDistributePerGeyser = toDistribute.div(_.keys(geysers).length);
    await Promise.all(
        _.map(tokens, async (token, address) => {
            const amt = BigNumber.from(10)
                .pow(await token.decimals())
                .mul(toDistributePerGeyser);
            _.map(geysers, async (geyser, geyserAddress) => {
                await geyser.signalTokenLock(token.address, amt, durationSec, startTime);
                await token.mint(geyser.address, amt);
            });
        })
    );
};

export { mint_and_stake, deploy_staked_token, deploy_staked_tokens, mint_and_signal };
