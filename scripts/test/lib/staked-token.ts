import _ from "lodash";
import assert from "assert";
import { ethers, upgrades } from "hardhat";
import {
    StakedToken,
    StakedToken__factory,
    Multiplexer,
    IERC20__factory,
    IERC20Detailed__factory,
    StakehoundGeyser,
} from "../../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Signer, PopulatedTransaction, BigNumberish } from "ethers";
import { TokenReward } from "../../../src/calc_stakes";
import { sharesToValue, valueToShares, get_pair } from "../../../src/utils";
import { StakedTokensMap, GeysersMap, TokensMap, TokenPairs } from "../../../src/types";
import {
    delay_parallel_effects,
    sign_transactions,
    send_transactions,
    wait_for_confirmed,
} from "../../lib/utils";
import { getAddress } from "ethers/lib/utils";
import { Provider } from "@ethersproject/providers";
import logger from "../../../src/logger";
import {
    IUniswapV2Router02__factory,
    IUniswapV2Pair__factory,
} from "../../../src/contract-types";

const uniRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export const tokenSymbols = ["stFIRO", "stETH", "stXEM"] as const;

const MAX_NUMBER = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const uniRouter = IUniswapV2Router02__factory.connect(
    uniRouterAddress,
    ethers.provider
);

const stakedDecimals: { [t: string]: number } = {
    stFIRO: 8,
    stETH: 18,
    stXEM: 8,
};

const stakedNames: { [t: string]: string } = {
    stFIRO: "StakedFiro",
    stETH: "StakedETH",
    stXEM: "StakedXEM",
};

const MINIMUM_LIQUIDITY = BigNumber.from(10 ** 3);

const deploy_staked_tokens = async (): Promise<StakedTokensMap> => {
    const tokens: StakedTokensMap = {};
    for (const sym of tokenSymbols) {
        await deploy_staked_token(stakedNames[sym], sym, stakedDecimals[sym]).then(
            (t) => (tokens[getAddress(t.address)] = t)
        );
    }
    return tokens;
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

const build_add_liquidity = async (
    signer: Signer,
    tokenA: string,
    tokenB: string,
    amtA: BigNumberish,
    amtB: BigNumberish
): Promise<PopulatedTransaction[]> => {
    tokenA = tokenA.toLowerCase();
    tokenB = tokenB.toLowerCase();
    assert(tokenA !== tokenB, "add_liquidity: tokens are the same");
    let token0: string;
    let token1: string;
    let amt0: BigNumber;
    let amt1: BigNumber;
    if (tokenA < tokenB) {
        token0 = tokenA;
        token1 = tokenB;
        amt0 = BigNumber.from(amtA);
        amt1 = BigNumber.from(amtB);
    } else {
        token0 = tokenB;
        token1 = tokenA;
        amt0 = BigNumber.from(amtB);
        amt1 = BigNumber.from(amtA);
    }
    let txs: PopulatedTransaction[] = [];
    const useEth = token0 === ETH_ADDRESS ? 0 : token1 === ETH_ADDRESS ? 1 : -1;
    const minAmt0 = amt0.sub(BigNumber.from(10).pow(amt0.toString().length - 2));
    const minAmt1 = amt1.sub(BigNumber.from(10).pow(amt1.toString().length - 2));
    const deadline = await signer
        .provider!.getBlock("latest")
        .then((block) => block.timestamp + 1000);
    if (-1 < useEth) {
        const token = useEth === 0 ? token1 : token0;
        const tokenAmt = useEth === 0 ? amt1 : amt0;
        const minTokenAmt = useEth === 0 ? minAmt1 : minAmt0;
        const ethAmt = useEth === 0 ? amt0 : amt1;
        const minEthAmt = useEth === 0 ? minAmt0 : minAmt1;

        return Promise.all([
            IERC20__factory.connect(
                token,
                signer.provider!
            ).populateTransaction.approve(uniRouter.address, MAX_NUMBER),
            uniRouter.populateTransaction.addLiquidityETH(
                token,
                tokenAmt,
                minTokenAmt,
                minEthAmt,
                await signer.getAddress(),
                deadline,
                { value: ethAmt, gasLimit: 500000 }
            ),
        ]);
    } else {
        return Promise.all([
            IERC20__factory.connect(
                token0,
                signer.provider!
            ).populateTransaction.approve(uniRouter.address, amt0),
            IERC20__factory.connect(
                token1,
                signer.provider!
            ).populateTransaction.approve(uniRouter.address, amt1),
            uniRouter.populateTransaction.addLiquidity(
                token0,
                token1,
                amt0,
                amt1,
                minAmt0,
                minAmt1,
                await signer.getAddress(),
                deadline
            ),
        ]);
    }
};

const build_stake = async (
    staker: Signer,
    geyser: StakehoundGeyser
): Promise<PopulatedTransaction[]> => {
    const token = IERC20__factory.connect(
        await geyser.getStakingToken(),
        staker.provider!
    );

    const amt = await token.balanceOf(await staker.getAddress());
    return Promise.all([
        token.populateTransaction.approve(geyser.address, amt),
        geyser.populateTransaction.stake(amt, "0x", {
            gasLimit: 200000,
        }),
    ]);
};

const mint_to_stakers = async (
    minter: Signer,
    tokens: StakedTokensMap,
    stakers: Signer[]
) => {
    const txs: PopulatedTransaction[] = [];
    await Promise.all(
        stakers.map((staker) =>
            Promise.all(
                _.map(tokens, async (token) =>
                    token.populateTransaction.mint(
                        await staker.getAddress(),
                        BigNumber.from(10)
                            .pow(await token.decimals())
                            .mul(1000)
                    )
                )
            ).then((_txs) => txs.push(..._txs))
        )
    );
    const signed = await sign_transactions(minter, txs);
    const txrs = await send_transactions(minter.provider!, signed);
    await wait_for_confirmed(txrs, 1);
};

const add_lp_and_stake = async (stakers: Signer[], geysers: GeysersMap) => {
    const weth = await uniRouter.WETH().then((w) => w.toLowerCase());
    logger.info("adding lp");
    await Promise.all(
        stakers.map(async (staker) =>
            Promise.all(
                _.map(geysers, async (geyser) => {
                    const lpToken = await geyser
                        .getStakingToken()
                        .then((t) =>
                            IUniswapV2Pair__factory.connect(t, staker.provider!)
                        );
                    const [t0, t1] = await Promise.all([
                        lpToken.token0(),
                        lpToken.token1(),
                    ]).then((ts) =>
                        ts.map((t) =>
                            t.toLowerCase() === weth ? ETH_ADDRESS : t.toLowerCase()
                        )
                    );
                    const amt0 =
                        t0 === ETH_ADDRESS
                            ? BigNumber.from(10).pow(10)
                            : BigNumber.from(10).mul(
                                  await IERC20Detailed__factory.connect(
                                      t0,
                                      stakers[0].provider!
                                  ).decimals()
                              );
                    const amt1 =
                        t1 === ETH_ADDRESS
                            ? BigNumber.from(10).pow(10)
                            : BigNumber.from(10).mul(
                                  await IERC20Detailed__factory.connect(
                                      t1,
                                      stakers[0].provider!
                                  ).decimals()
                              );
                    return build_add_liquidity(staker, t0, t1, amt0, amt1);
                })
            ).then((txs) =>
                sign_transactions(staker, _.flatten(txs)).then((signed) =>
                    send_transactions(staker.provider!, signed)
                )
            )
        )
    );
    await Promise.all(
        stakers.map((staker) =>
            Promise.all(
                _.map(geysers, (geyser) => build_stake(staker, geyser))
            ).then((txs) =>
                sign_transactions(staker, _.flatten(txs)).then((signed) =>
                    send_transactions(staker.provider!, signed)
                )
            )
        )
    );
};

const mint_and_signal = async (
    locker: Signer,
    minter: Signer,
    tokens: StakedTokensMap,
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
            await token
                .connect(minter)
                .populateTransaction.mint(multiplexer.address, mintAmt)
                .then((tx) => minterTxns.push(tx));

            const stakeAmt = BigNumber.from(10)
                .pow(await token.decimals())
                .mul(toDistributePerGeyser);
            await Promise.all(
                _.map(geysers, async (geyser) => {
                    await geyser
                        .connect(locker)
                        .populateTransaction.signalTokenLock(
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
    const txrsLocker = await send_transactions(locker.provider!, lockerSigned);
    await wait_for_confirmed(txrsLocker);
    const txrsminter = await send_transactions(minter.provider!, minterSigned);
    await wait_for_confirmed(txrsminter);
};

export {
    mint_to_stakers,
    add_lp_and_stake,
    deploy_staked_token,
    deploy_staked_tokens,
    mint_and_signal,
};
