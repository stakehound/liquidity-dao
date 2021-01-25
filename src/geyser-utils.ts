import _ from 'lodash'
import { BigNumber } from "ethers";
import { TokensMap, GeysersMap } from "../scripts/lib/types";

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

export { signal_token_locks, add_distribution_tokens}
