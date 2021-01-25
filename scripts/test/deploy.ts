import _ from "lodash";
import { ethers } from "hardhat";
import { deploy_staked_tokens, mint_and_stake, mint_and_signal } from "./lib/staked-token";
import { deploy_geysers, deploy_multiplexer } from "../lib/deploy";
import { add_distribution_tokens } from "../../src/geyser-utils";

const deploy_test_scenario = async () => {
    const signers = await ethers.getSigners();
    const stakers = signers.slice(3);
    const deployer = signers[0];
    const proposer = signers[1];
    const approver = signers[2];

    const block = await ethers.provider.getBlock("latest");
    const tokens = await deploy_staked_tokens();
    const geysers = await deploy_geysers(
        tokens,
        block.timestamp,
        deployer.address,
        deployer.address
    );
    await add_distribution_tokens(geysers, tokens);
    const multiplexer = await deploy_multiplexer(
        deployer.address,
        proposer.address,
        approver.address
    );
    const newblock = await ethers.provider.getBlock("latest");
    await mint_and_signal(tokens, geysers, newblock.timestamp, 60 * 60 * 24 * 28); // four weeks
    await mint_and_stake(tokens, geysers, stakers);
};

deploy_test_scenario()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
