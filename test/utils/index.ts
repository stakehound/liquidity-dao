import { ethers } from "hardhat";
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Rewards } from "../src/calc_stakes";

const getAccounts = async (): Promise<{ signers: SignerWithAddress[]; accounts: string[] }> => {
    const signers = await ethers.getSigners();
    const accounts = [];
    for (const signer of signers) {
        accounts.push(await signer.getAddress());
    }
    return { signers, accounts };
};

const rewards_to_json = (r: Rewards) => {
    

}

export { getAccounts };
