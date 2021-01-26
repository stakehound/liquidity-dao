import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { get_signers } from "../lib/utils";

const distribute_eth = async () => {
    const signers = await get_signers(process.env.MNEMONIC!, ethers.provider);
    const value = BigNumber.from(10).pow(16);
    const nonce = await signers[0].getTransactionCount();
    await Promise.all(
        signers.slice(1).map((signer, i) =>
            signers[0].sendTransaction({
                to: signer.address,
                value,
                nonce: nonce + i,
            })
        )
    );
};

distribute_eth()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
