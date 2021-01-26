import _ from "lodash";
import HRE, { ethers } from "hardhat";
import {
    deploy_staked_tokens,
    mint_and_stake,
    mint_and_signal,
} from "../lib/staked-token";
import { deploy_geysers, deploy_multiplexer } from "../../lib/deploy";
import { Awaited } from "ts-essentials";
import { StakehoundContext } from "../../../src/system";
import { get_signers, add_distribution_tokens } from "../../lib/utils";
import { fetchConfig } from "../../../src/utils";
import { writeFileSync } from "fs";
import { confSchema } from "../../../src/validations";
import { logger } from "ethers";

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEYID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

const deploy_test_scenario = async (write_config: boolean = false) => {
    const provider = ethers.provider;
    const signers = await get_signers(process.env.MNEMONIC!, provider);
    const stakers = signers.slice(4);
    const deployer = signers[0];
    const locker = signers[1];
    const proposer = signers[2];
    const approver = signers[3];
    const block = await ethers.provider.getBlock("latest");

    logger.info(`Global start block ${block.number} ${block.hash}`);
    const tokens = await deploy_staked_tokens();
    const geysers = await deploy_geysers(
        tokens,
        block.timestamp,
        await deployer.getAddress(),
        await locker.getAddress()
    );
    await add_distribution_tokens(deployer, geysers, tokens);
    const multiplexer = await deploy_multiplexer(
        await deployer.getAddress(),
        await proposer.getAddress(),
        await approver.getAddress()
    );
    await multiplexer.deployed();
    if (write_config) {
        const { conf } = await fetchConfig("./config/example.json");
        conf.geysers = _.keys(geysers);
        conf.multiplexer = multiplexer.address;
        conf.credentials = credentials;
        conf.providerUrl = process.env.CLI_RPC_URL!;
        conf.startBlock = block.hash;

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
        multiplexer,
        geysers,
        newblock.timestamp,
        60 * 60 * 24 * 28
    ); // four weeks
    logger.info("Minting to accounts and staking");
    await mint_and_stake(deployer, tokens, geysers, stakers);
    return {
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
