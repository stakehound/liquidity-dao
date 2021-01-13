import { ethers } from "hardhat";
import { Signer } from "ethers";

const getAccounts = async (): Promise<{ signers: Signer[]; accounts: string[] }> => {
    const signers = await ethers.getSigners();
    const accounts = [];
    for (const signer of signers) {
        accounts.push(await signer.getAddress());
    }
    return { signers, accounts };
};

export { getAccounts };
