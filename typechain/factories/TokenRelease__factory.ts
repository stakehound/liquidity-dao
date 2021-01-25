/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { TokenRelease } from "../TokenRelease";

export class TokenRelease__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<TokenRelease> {
    return super.deploy(overrides || {}) as Promise<TokenRelease>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): TokenRelease {
    return super.attach(address) as TokenRelease;
  }
  connect(signer: Signer): TokenRelease__factory {
    return super.connect(signer) as TokenRelease__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TokenRelease {
    return new Contract(address, _abi, signerOrProvider) as TokenRelease;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IERC20Upgradeable",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "giveTokensTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061011d806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063be52507c14602d575b600080fd5b606060048036036060811015604157600080fd5b506001600160a01b038135811691602081013590911690604001356062565b005b826001600160a01b031663a9059cbb83836040518363ffffffff1660e01b815260040180836001600160a01b0316815260200182815260200192505050602060405180830381600087803b15801560b857600080fd5b505af115801560cb573d6000803e3d6000fd5b505050506040513d602081101560e057600080fd5b505050505056fea2646970667358221220a5e26a66a86faec44223b199b854686896ab4b5c79caa9184f0974dbdbb82c4f64736f6c634300060c0033";
