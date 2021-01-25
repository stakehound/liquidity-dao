import _ from "lodash";
import { ethers, upgrades } from "hardhat";
import {
    StakedToken,
    StakehoundGeyser__factory,
    StakehoundGeyser,
    Multiplexer,
    Multiplexer__factory,
} from "../../typechain";
import { TokensMap, GeysersMap } from "./types";




const deploy_geysers = async (
    tokens: TokensMap,
    startTime: number,
    admin: string,
    locker: string
) => {
    let map: GeysersMap = {} as any;
    await Promise.all(
        _.map(tokens, (contract, address) =>
            deploy_geyser(contract, startTime, admin, locker).then(
                (g) => (map[address] = g)
            )
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
    const geyser = (await upgrades.deployProxy(Geyser, [
        token.address,
        startTime,
        locker,
        admin,
    ])) as StakehoundGeyser;
    await geyser.deployed();
    console.log(`${await token.name()}Geyser deployed to: `, geyser.address);
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
    const multiplexer = (await upgrades.deployProxy(Multiplexer, [
        proposer,
        approver,
        admin,
    ])) as Multiplexer;
    await multiplexer.deployed();
    console.log(`Multiplexer deployed to: `, multiplexer.address);
    return multiplexer;
};

export { deploy_geysers, deploy_geyser, deploy_multiplexer };
