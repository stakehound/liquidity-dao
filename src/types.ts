import { StakehoundGeyser, StakedToken } from "../typechain";

type TokensMap = { [name: string]: StakedToken };

type GeysersMap = { [name: string]: StakehoundGeyser };

export { TokensMap, GeysersMap };
