import _ from "lodash";
import { ethers, upgrades } from "hardhat";
import { StakedToken, StakedToken__factory, Multiplexer } from "../../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Signer, PopulatedTransaction } from "ethers";
import { TokenReward } from "../../../src/calc_stakes";
import { sharesToValue, valueToShares } from "../../../src/utils";
import { TokensMap, GeysersMap } from "../../../src/types";
import {
    delay_parallel_effects,
    sign_transactions,
    send_transactions,
    wait_for_confirmed,
} from "../../lib/utils";
import { getAddress } from "ethers/lib/utils";
import { Provider } from "@ethersproject/providers";
import logger from "../../../src/logger";

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
    const tokens = await delay_parallel_effects(
        tokenSymbols.map((symbol) => () =>
            deploy_staked_token(stakedNames[symbol], symbol, stakedDecimals[symbol])
        )
    );
    return _.transform(
        tokens,
        (acc: TokensMap, val) => (acc[getAddress(val.address)] = val),
        {}
    );
};

const deploy_staked_token = async (
    tokenName: string,
    tokenSymbol: string,
    tokenDecimals: number
) => {
    const tokenMaxSupply = ethers.BigNumber.from(10).pow(10 + tokenDecimals + 8);
    const tokenInitialSupply = ethers.BigNumber.from(10).pow(tokenDecimals);

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

    logger.info(`${tokenName} deployed to: ${stakedToken.address}`);
    return stakedToken;
};

const mint_and_stake = async (
    minter: Signer,
    tokens: TokensMap,
    geysers: GeysersMap,
    stakers: Signer[]
) => {
    const minterTxs: PopulatedTransaction[] = [];
    const signedStakerTxs: string[] = [];
    await Promise.all(
        stakers.map(async (signer) => {
            const stakerTxs: PopulatedTransaction[] = [];
            await Promise.all(
                _.map(geysers, async (geyser) => {
                    const stakedToken = tokens[await geyser.getStakingToken()];
                    const amt = BigNumber.from(10)
                        .pow(await stakedToken.decimals())
                        .mul(300);
                    await stakedToken.populateTransaction
                        .mint(await signer.getAddress(), amt)
                        .then((tx) => minterTxs.push(tx));
                    await Promise.all([
                        stakedToken.populateTransaction.approve(geyser.address, amt),
                        geyser.populateTransaction.stake(amt, "0x", {
                            gasLimit: 200000,
                        }),
                    ]).then((txs) => stakerTxs.push(...txs));
                })
            );
            await sign_transactions(signer, stakerTxs).then((stxs) =>
                signedStakerTxs.push(...stxs)
            );
        })
    );
    logger.info('signed minter')
    const signedMinter = await sign_transactions(minter, minterTxs);
    logger.info('send minter')
    const txrsMinter = await send_transactions(minter.provider!, signedMinter);
    logger.info('wait minter confirm')
    await wait_for_confirmed(txrsMinter, 1);
    logger.info('minter confirmed, send signers')
    const txrsSigners = await send_transactions(minter.provider!, signedStakerTxs);
    logger.info('send signers')
    await wait_for_confirmed(txrsSigners, 1);
    logger.info('signers done')
};

const mint_and_signal = async (
    locker: Signer,
    minter: Signer,
    tokens: TokensMap,
    multiplexer: Multiplexer,
    geysers: GeysersMap,
    startTime: number,
    durationSec: number
) => {
    const toDistribute = BigNumber.from(100000);
    const toDistributePerGeyser = toDistribute.div(_.keys(geysers).length);
    const lockerTxns: PopulatedTransaction[] = [];
    const minterTxns: PopulatedTransaction[] = [];
    await Promise.all(
        _.map(tokens, async (token) => {
            const mintAmt = BigNumber.from(10)
                .pow(await token.decimals())
                .mul(toDistribute);
            await token.populateTransaction
                .mint(multiplexer.address, mintAmt)
                .then((tx) => minterTxns.push(tx));

            const stakeAmt = BigNumber.from(10)
                .pow(await token.decimals())
                .mul(toDistributePerGeyser);
            await Promise.all(
                _.map(geysers, async (geyser) => {
                    await geyser.populateTransaction
                        .signalTokenLock(
                            token.address,
                            await valueToShares(token, stakeAmt),
                            durationSec,
                            startTime
                        )
                        .then((tx) => lockerTxns.push(tx));
                })
            );
        })
    ).then((all) => _.flatten(all));
    const lockerSigned = sign_transactions(locker, lockerTxns);
    const minterSigned = sign_transactions(minter, minterTxns);
    const txrsLocker = await send_transactions(minter.provider!, lockerSigned);
    await wait_for_confirmed(txrsLocker);
    const txrsminter = await send_transactions(minter.provider!, minterSigned);
    await wait_for_confirmed(txrsminter);
};

export { mint_and_stake, deploy_staked_token, deploy_staked_tokens, mint_and_signal };
