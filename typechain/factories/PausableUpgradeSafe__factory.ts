/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { PausableUpgradeSafe } from "../PausableUpgradeSafe";

export class PausableUpgradeSafe__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<PausableUpgradeSafe> {
    return super.deploy(overrides || {}) as Promise<PausableUpgradeSafe>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): PausableUpgradeSafe {
    return super.attach(address) as PausableUpgradeSafe;
  }
  connect(signer: Signer): PausableUpgradeSafe__factory {
    return super.connect(signer) as PausableUpgradeSafe__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PausableUpgradeSafe {
    return new Contract(address, _abi, signerOrProvider) as PausableUpgradeSafe;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b5060868061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80635c975abb14602d575b600080fd5b60336047565b604080519115158252519081900360200190f35b60655460ff169056fea2646970667358221220de94bc685d5990d0e8f34f1357177d2e204a49798ff48a5ee3b0f6ecab1e943564736f6c634300060c0033";
