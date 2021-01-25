import _ from "lodash";
import { BigNumber } from "ethers";
import { TokensMap, GeysersMap } from "../scripts/lib/types";
import { StakedToken } from "../typechain";

const signal_token_locks = async (
    tokens: TokensMap,
    geysers: GeysersMap,
    distr: { [geyser: string]: { [tokenAddress: string]: BigNumber } },
    startTime: number,
    durationSec: number
) => {
    await _.map(geysers, (geyser, geyserName) =>
        Promise.all(
            _.values(tokens).map((token, tokenName) =>
                geyser.signalTokenLock(
                    token.address,
                    distr[geyserName][tokenName],
                    durationSec,
                    startTime
                )
            )
        )
    );
};

const add_distribution_tokens = async (geysers: GeysersMap, tokens: TokensMap) => {
    await Promise.all(
        _.map(geysers, (geyser) =>
            Promise.all(
                _.values(tokens).map((token) =>
                    geyser.addDistributionToken(token.address)
                )
            )
        )
    );
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

export { signal_token_locks, add_distribution_tokens, valueToShares, sharesToValue };
