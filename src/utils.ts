import _ from "lodash";
import path from "path";
import { BigNumber, Signer, Wallet } from "ethers";
import { TokensMap, GeysersMap } from "./types";
import { StakedToken, Multiplexer__factory } from "../typechain";
import { StakehoundContext } from "./system";
import {
    confSchema,
    distributionSchema,
    DistrSchemaType,
    ConfSchemaType,
} from "./validations";
import { readFileSync } from "fs";
import { JsonRpcProvider } from "@ethersproject/providers";
import S3 from "aws-sdk/clients/s3";

const fetchConfig = (
    configPath: string
): { initDistribution: DistrSchemaType; conf: ConfSchemaType } => {
    const conf = confSchema.parse(
        JSON.parse(readFileSync(configPath).toString("utf8"))
    );
    const initDistribution = distributionSchema.parse(
        JSON.parse(
            readFileSync(
                path.join(path.dirname(configPath), conf.initDistributionPath)
            ).toString()
        )
    );
    return { conf, initDistribution };
};

const fetchContext = async (configPath: string): Promise<StakehoundContext> => {
    const { conf, initDistribution } = fetchConfig(configPath);
    const provider = new JsonRpcProvider(conf.providerUrl);
    const s3 = new S3({ credentials: conf.credentials });
    const signer = new Wallet(conf.signer).connect(provider);
    const multiplexer = Multiplexer__factory.connect(conf.multiplexer, signer);
    return {
        epoch: conf.epoch,
        geysers: conf.geysers.sort(),
        startBlock: await provider.getBlock(conf.startBlock),
        initDistribution,
        rate: conf.rate,
        credentials: conf.credentials,
        signer,
        provider,
        s3,
        multiplexer,
    };
};

const valueToShares = async (st: StakedToken, val: BigNumber) => {
    const shares = await st.totalShares();
    const supply = await st.totalSupply();
    const sharesPerToken = await shares.div(supply);
    return val.mul(sharesPerToken);
};

const sharesToValue = async (st: StakedToken, shares: BigNumber) => {
    const tshares = await st.totalShares();
    const tsupply = await st.totalSupply();
    const sharesPerToken = tshares.div(tsupply);
    return shares.div(sharesPerToken);
};

export { valueToShares, sharesToValue, fetchContext, fetchConfig };
