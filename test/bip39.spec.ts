import { expect, use } from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { get_signers } from "../scripts/lib/utils";
use(solidity);

describe("Signers", function () {
    it("get sigers", async function () {
        const signers = await get_signers(process.env.MNEMONIC!, ethers.provider);
        await Promise.all(signers.map(async (x) => console.log(await x.getAddress())));
        await Promise.all(signers.map(async (x) => console.log(await x.privateKey)));
    });
});
