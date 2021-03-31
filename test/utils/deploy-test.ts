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
import { DeployTestContext } from "../../scripts/test/lib/test-scenario";
import {
    sign_transactions,
    send_transactions,
    wait_for_confirmed,
} from "../../scripts/lib/utils";
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

const unstake_all = async (con: DeployTestContext) => {
    const { stakers, geysers } = con;
    const stakerTxs: string[] = [];
    await Promise.all(
        stakers.map(async (signer) =>
            Promise.all(
                _.map(geysers, async (geyser) => {
                    const stakedToken = con.tokens[await geyser.getStakingToken()];
                    const val = await geyser.totalStakedFor(await signer.getAddress());
                    //const val = await sharesToValue(stakedToken, shares)
                    return geyser.populateTransaction.unstake(val, "0x");
                })
            ).then((all) => {
                const txs = _.flatten(all);
                return sign_transactions(signer, txs).then((signed) =>
                    stakerTxs.push(...signed)
                );
            })
        )
    );
    const sent = await send_transactions(con.provider, stakerTxs);
    await wait_for_confirmed(sent);
};

const clear_all = async (con: DeployTestContext) => {
    const { locker, tokens, geysers, sampleToken } = con;
    const txs = await Promise.all(
        _.map(geysers, (geyser) =>
            Promise.all(
                _.map(_.keys(tokens).concat([sampleToken.address]), (address) =>
                    geyser.populateTransaction.clearSchedules(address)
                )
            )
        )
    ).then((all) => sign_transactions(locker, _.flatten(all)));
    const sent = await send_transactions(con.provider, txs);
    await wait_for_confirmed(sent);
};

export { unstake_all, clear_all };
