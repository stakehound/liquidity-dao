import _ from "lodash";
import HRE, { ethers } from "hardhat";
import {
    deploy_staked_tokens,
    mint_and_stake,
    mint_and_signal,
} from "../lib/staked-token";
import { deploy_geysers, deploy_multiplexer } from "../../lib/deploy";
import { add_distribution_tokens } from "../../../src/utils";
import { Awaited } from "ts-essentials";

const deploy_test_scenario = async () => {
    const signers = await ethers.getSigners();
    const stakers = signers.slice(3);
    const deployer = signers[0];
    const proposer = signers[1];
    const approver = signers[2];
    await HRE.network.provider.request({
        method: "evm_mine",
    });
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
    await mint_and_signal(tokens, multiplexer, geysers, newblock.timestamp, 60 * 60 * 24 * 28); // four weeks
    await mint_and_stake(tokens, geysers, stakers);
    return { multiplexer, geysers, tokens, stakers, startBlock: block, proposer, approver };
};

type DeployTestScenarioContext = Awaited<ReturnType<typeof deploy_test_scenario>>;

export { deploy_test_scenario, DeployTestScenarioContext };
