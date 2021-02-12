import { StakehoundGeyser, StakedToken, IERC20, IERC20Detailed } from "../typechain";

type StakedTokensMap = { [name: string]: StakedToken };

type TokensMap = { [name: string]: IERC20Detailed };

type GeysersMap = { [name: string]: StakehoundGeyser };

type TokenPair = [string, string];

type TokenPairs = TokenPair[];

export { StakedTokensMap, GeysersMap, TokensMap, TokenPair, TokenPairs };
