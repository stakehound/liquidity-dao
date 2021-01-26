import _ from "lodash";
import { getAddress } from "ethers/lib/utils";
import { ethers, upgrades } from "hardhat";
import {
    StakedToken,
    StakehoundGeyser__factory,
    StakehoundGeyser,
    Multiplexer,
    Multiplexer__factory,
} from "../../typechain";
import { TokensMap, GeysersMap } from "../../src/types";
import { delay_parallel_effects } from "./utils";
import { logger } from "ethers";

const deploy_geysers = async (
    tokens: TokensMap,
    startTime: number,
    admin: string,
    locker: string
) => {
    let map: GeysersMap = {} as any;
    await delay_parallel_effects(
        _.map(tokens, (contract) => () =>
            deploy_geyser(contract, startTime, admin, locker).then((g) => {
                map[getAddress(g.address)] = g;
            })
        )
    );
    return map;
};

const deploy_geyser = async (
    token: StakedToken,
    startTime: number,
    admin: string,
    locker: string
) => {
    const Geyser = (await ethers.getContractFactory(
        "StakehoundGeyser"
    )) as StakehoundGeyser__factory;
    const geyser = (await upgrades.deployProxy(
        Geyser,
        [token.address, startTime, admin, locker],
        { unsafeAllowCustomTypes: true }
    )) as StakehoundGeyser;
    await geyser.deployed();
    logger.info(`${await token.name()}Geyser deployed to: ${geyser.address}`);
    return geyser;
};

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
