import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const distribute_eth = async () => {
    const signers = await ethers.getSigners();
    const value = BigNumber.from(10).pow(16);
    const nonce = await signers[0].getTransactionCount()
    await Promise.all(
        signers.slice(1).map((signer, i) =>
            signers[0].sendTransaction({
                to: signer.address,
                value,
                nonce: nonce + i
            })
        )
    );
    console.log("Done!");
};

distribute_eth()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
