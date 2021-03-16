import _ from "lodash";
import { getAddress } from "ethers/lib/utils";
import { ethers, upgrades } from "hardhat";
import {
    StakedToken,
    StakehoundGeyser__factory,
    StakehoundGeyser,
    Multiplexer,
    Multiplexer__factory,
    IERC20Detailed,
} from "../../typechain";
import { TokensMap, GeysersMap } from "../../src/types";
import { delay_parallel_effects } from "./utils";
import logger from "../../src/logger";

const deploy_geysers = async (
    tokens: string[],
    startTime: number,
    admin: string,
    locker: string
) => {
    let map: GeysersMap = {} as any;
    for (const t of _.values(tokens)) {
        await deploy_geyser(t, startTime, admin, locker).then(
            (g) => (map[getAddress(g.address)] = g)
        );
    }
    return map;
};

/**
 * Deploy geyser via openzeppelin upgrades
 * @param {string} token address of (LP) token being staked
 * @param {number} startTime time at which deposits are allowed
 * @param {string} admin address of admin of contract (can set locker address)
 * @param {string} locker address which can signal and clear token locks
 */
const deploy_geyser = async (
    token: string,
    startTime: number,
    admin: string,
    locker: string
) => {
    const Geyser = (await ethers.getContractFactory(
        "StakehoundGeyser"
    )) as StakehoundGeyser__factory;
    const geyser = (await upgrades.deployProxy(
        Geyser,
        [token, startTime, admin, locker],
        { unsafeAllowCustomTypes: true }
    )) as StakehoundGeyser;
    await geyser.deployed();
    logger.info(`Geyser deployed to: ${geyser.address}`);
    return geyser;
};


/**
 * Deploys multiplexer for merkle root rewards
 * @param {string} admin Sets proposer and approver (and pauser) roles
 * @param {string} proposer Address that proposes the next merkle root
 * @param {string} approver Address that approves the merkle root of proposer
 */
const deploy_multiplexer = async (
    admin: string,
    proposer: string,
    approver: string
) => {
    const Multiplexer = (await ethers.getContractFactory(
        "Multiplexer"
    )) as Multiplexer__factory;
    const multiplexer = (await upgrades.deployProxy(
        Multiplexer,
        [admin, proposer, approver],
        { unsafeAllowCustomTypes: true }
    )) as Multiplexer;
    await multiplexer.deployed();
    logger.info(`Multiplexer deployed to: ${multiplexer.address}`);
    return multiplexer;
};

export { deploy_geysers, deploy_geyser, deploy_multiplexer };
