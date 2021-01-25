import HRE, { ethers } from "hardhat";
import { BigNumber } from "ethers";
import {
    Multiplexer__factory,
    StakehoundGeyser,
    StakehoundGeyser__factory,
    StakedToken__factory,
    StakedToken,
    // IStakedToken__factory,
} from "../../typechain";
import { Awaited } from "ts-essentials";
import { GeyserAction } from "../../src/calc_stakes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import _ from "lodash";
import { sharesToValue } from "../../src/utils";
import { DeployTestScenarioContext } from "../../scripts/test/lib/test-scenario";
/*


Ropsten:
stakedXZC (Old version of contract, might not work the same) 0x30183D8025Aa735ea96341b1A17bB1a175AF3608 
stakedXEM 0x0957C4D096dcb6DaF9C7B1A865b3ec9df0d12883
stakedDASH 0x7E7A46FECeDAC72Eca55f762eD557c3756432489
stakedETH 0x09A33bE88094268360b9e340efD3657bBf351AA6
*/


// const mainnet_addresses = {
//     stakedETH: "0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d", // 12
//     stakedFiro: "0x160B1E5aaBFD70B2FC40Af815014925D71CEEd7E", // 8
//     stakedXEM: "0x0c63cae5fcc2ca3dde60a35e50362220651ebec8", // 8
// };

const unstake_all = async (con: DeployTestScenarioContext) => {
    const { stakers ,geysers} = con
    await Promise.all(
        stakers.map(async (signer) =>
            Promise.all(
                _.map(geysers, async (geyser) => {
                    const stakedToken = con.tokens[await geyser.getStakingToken()];
                    const _geyser = geyser.connect(signer);
                    const shares = await _geyser.totalStakedFor(signer.address);
                    const val = await sharesToValue(stakedToken, shares);
                    await _geyser.unstake(val, "0x");
                })
            )
        )
    );
    
}
export { unstake_all };
