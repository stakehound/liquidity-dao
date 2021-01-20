import _ from "lodash";
import { ethers } from "hardhat";
import { StakedToken, StakedToken__factory } from "../../typechain";
import { BigNumber } from "ethers";

const decimals: { [t: string]: number } = {
    SFIRO: 8,
    SETH: 18,
    SXEM: 8,
};

const deploy_staked_tokens = async () => {
    const f: StakedToken__factory = (await ethers.getContractFactory(
        "StakedToken"
    )) as any;
    const tokens = await Promise.all([f.deploy(), f.deploy(), f.deploy()]);
    const [sfiro, sxem, seth] = tokens;
    await _.zip(tokens, ["SETH", "SXEM", "SFIRO"]).map(([c, s]) =>
        c!.initialize(
            s!,
            s!,
            decimals[s!],
            BigNumber.from(10).pow(decimals[s!]).mul(1000000000),
            BigNumber.from(10).pow(decimals[s!]).mul(10000000)
        )
    );
};
