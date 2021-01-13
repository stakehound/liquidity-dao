import { expect, use } from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer } from "ethers";
import { getAccounts } from "./utils";
import { MerkleMock__factory, MerkleMock } from "../typechain";
import MerkleTree from "./src/merkle";
import { keccak256 } from "ethereumjs-util";
use(solidity);

describe("MerkleMock", function () {
    let signers: Signer[];
    let accounts: string[];
    let mm: MerkleMock;
    const hexLeaves = ["0xdeadbeef", "0xabcdef12"];
    const leaves = hexLeaves.map((x) => Buffer.from(x.slice(2), "hex"));
    const merkleTree = new MerkleTree(leaves, keccak256, {
        sort: true,
        // prefix: true,
        hashLeaves: true,
    });
    this.beforeAll(async function () {
        ({ signers, accounts } = await getAccounts());
        let mmf = (await ethers.getContractFactory(
            "MerkleMock"
        )) as MerkleMock__factory;
        mm = await mmf.deploy();
        await mm.deployed();
        const foo = await ethers.provider.getSigner('0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d')
    });
    it("verify works", async function () {
        const proof = merkleTree.getHexProof(leaves[0]);
        const root = merkleTree.getHexRoot();
        const res = await mm.verify(
            proof,
            root,
            "0x" + keccak256(leaves[0]).toString("hex")
        );
        expect(res).to.eq(true);
    });
});
