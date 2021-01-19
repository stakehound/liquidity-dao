import { expect, use } from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer } from "ethers";
import { MerkleMock__factory, MerkleMock } from "../typechain";
import Merkle from "../src/merkle";
import { keccak256 } from "ethereumjs-util";
import data from "../data.json";
import MultiMerkle from "../src/MultiMerkle";
use(solidity);

// describe("MerkleMock", function () {
//     let signers: Signer[];
//     let accounts: string[];
//     let mm: MerkleMock;
//     const hexLeaves = ["0xdeadbeef", "0xabcdef12"];
//     // const merkle = MultiMerkle.fromRewards(data);
//     this.beforeAll(async function () {
//         let mmf = (await ethers.getContractFactory(
//             "MerkleMock"
//         )) as MerkleMock__factory;
//         mm = await mmf.deploy();
//         await mm.deployed();
//     });
//     it("verify works", async function () {
//         const proof = merkle.getHexProof(merkle.claims[0]);
//         const root = merkle.getHexRoot();
//         const suc = await mm.verify(proof, root, keccak256(merkle.encoded[0]));
//         expect(suc).to.eq(true);
//     });
// });
