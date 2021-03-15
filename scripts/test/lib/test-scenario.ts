import _ from "lodash";
import HRE, { ethers } from "hardhat";
import {
    deploy_staked_tokens,
    add_lp_and_stake,
    mint_and_signal,
    mint_to_stakers,
} from "../lib/staked-token";
import { deploy_geysers, deploy_multiplexer } from "../../lib/deploy";
import { Awaited } from "ts-essentials";
import { StakehoundContext } from "../../../src/system";
import { get_signers, add_distribution_tokens } from "../../lib/utils";
import { fetchConfig, get_pair } from "../../../src/utils";
import { writeFileSync } from "fs";
import { confSchema } from "../../../src/validations";
import logger from "../../../src/logger";
import {
    IERC20Detailed__factory,
    SampleToken,
    SampleToken__factory,
} from "../../../typechain";
import { TokensMap } from "../../../src/types";
import {
    IUniswapV2Factory__factory,
    IUniswapV2Pair__factory,
    IUniswapV2Router02__factory,
} from "../../../src/contract-types";
import { BigNumber } from "ethers";

const uniRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const uniRouter = IUniswapV2Router02__factory.connect(
    uniRouterAddress,
    ethers.provider
);

const uniFactory = IUniswapV2Factory__factory.connect(
    uniFactoryAddress,
    ethers.provider
);

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEYID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

const deploy_test_scenario = async (write_config: boolean = false) => {
    const provider = ethers.provider;
    const signers = await get_signers(process.env.MNEMONIC!, provider);
    console.log("all signers", await Promise.all(signers.map((x) => x.getAddress())));
    const stakers = signers.slice(4);
    const deployer = signers[0];
    const locker = signers[1];
    const proposer = signers[2];
    const approver = signers[3];
    console.log(
        "deployer",
        await deployer.getAddress(),
        "locker",
        await locker.getAddress(),
        "proposer",
        await proposer.getAddress(),
        "approver",
        await approver.getAddress(),
        "stakers",
        await Promise.all(stakers.map((x) => x.getAddress()))
    );
    const stf = (await ethers.getContractFactory(
        "SampleToken"
    )) as SampleToken__factory;
    const sampleToken = await stf.deploy();
    await sampleToken.deployed();
    const block = await ethers.provider.getBlock("latest");
    const WETH = await uniRouter.WETH();
    logger.info(`Global start block ${block.number} ${block.hash}`);
    const tokens = await deploy_staked_tokens();
    const pairs = _.map(tokens, (x): [string, string] => [x.address, WETH]);
    console.log("pairs", pairs);
    const _nonce = await deployer.getTransactionCount();
    await Promise.all(
        pairs.map(([t0, t1], i) =>
            uniFactory.getPair(t0, t1).then((lp) =>
                BigNumber.from(lp).isZero()
                    ? uniFactory
                          .connect(deployer)
                          .createPair(t0, t1, { nonce: _nonce + i })
                          .then((tx) => tx.wait(1))
                    : undefined
            )
        )
    );
    const lpTokens = _.transform(
        pairs,
        (acc: TokensMap, [t0, t1]) => {
            const addr = get_pair(t0, t1);
            acc[addr] = IERC20Detailed__factory.connect(addr, ethers.provider);
        },
        {}
    );
    console.log(
        "reserve tokens",
        await Promise.all(
            _.map(lpTokens, (x) => {
                const y = IUniswapV2Pair__factory.connect(x.address, ethers.provider);
                return Promise.all([y.token0(), y.token1()]);
            })
        )
    );
    console.log(
        "lp tokens",
        _.map(lpTokens, (x) => x.address)
    );
    logger.info(`tokens deployed`);
    const geysers = await deploy_geysers(
        _.values(lpTokens).map((x) => x.address),
        block.timestamp,
        await deployer.getAddress(),
        await locker.getAddress()
    );
    logger.info(`geysers deployed`);
    await add_distribution_tokens(
        deployer,
        geysers,
        [sampleToken.address].concat(_.values(tokens).map((t) => t.address))
    );
    logger.info(`add distribution tokens`);
    const multiplexer = await deploy_multiplexer(
        await deployer.getAddress(),
        await proposer.getAddress(),
        await approver.getAddress()
    );
    await multiplexer.deployed();
    logger.info(`multiplexer deployed`);
    if (write_config) {
        const { conf } = await fetchConfig("./config/example.json");
        conf.geysers = _.keys(geysers);
        conf.multiplexer = multiplexer.address;
        conf.credentials = credentials;
        conf.providerUrl = process.env.CLI_RPC_URL!;
        conf.startBlock = block.hash;
        conf.stTokens = _.keys(tokens);

        writeFileSync(
            "./config/config_proposer.json",
            JSON.stringify(
                confSchema.parse({ ...conf, signer: proposer.privateKey }),
                null,
                2
            )
        );
        writeFileSync(
            "./config/config_approver.json",
            JSON.stringify(
                confSchema.parse({ ...conf, signer: approver.privateKey }),
                null,
                2
            )
        );
        writeFileSync(
            "./config/config_locker.json",
            JSON.stringify(
                confSchema.parse({ ...conf, signer: locker.privateKey }),
                null,
                2
            )
        );
    }

    const newblock = await ethers.provider.getBlock("latest");
    logger.info("Minting and signaling token locks");
    await mint_and_signal(
        locker,
        deployer,
        tokens,
        sampleToken,
        multiplexer,
        geysers,
        newblock.timestamp,
        60 * 60 * 24 * 28
    ); // four weeks
    logger.info("Minting to stakers");
    await mint_to_stakers(deployer, tokens, stakers);
    logger.info("Adding liquidity and staking it in geysers");
    await add_lp_and_stake(stakers, geysers);
    return {
        sampleToken,
        locker,
        deployer,
        multiplexer,
        geysers,
        tokens,
        stakers,
        provider,
        startBlock: block,
        proposer,
        approver,
    };
};

type DeployTestContext = Awaited<ReturnType<typeof deploy_test_scenario>>;

export { deploy_test_scenario, DeployTestContext };
