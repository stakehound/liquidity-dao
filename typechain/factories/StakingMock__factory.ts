/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { StakingMock } from "../StakingMock";

export class StakingMock__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<StakingMock> {
    return super.deploy(overrides || {}) as Promise<StakingMock>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): StakingMock {
    return super.attach(address) as StakingMock;
  }
  connect(signer: Signer): StakingMock__factory {
    return super.connect(signer) as StakingMock__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StakingMock {
    return new Contract(address, _abi, signerOrProvider) as StakingMock;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Upgradeable",
        name: "stakingToken_",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
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
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
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
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611c87806100206000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806370a082311161008c578063a694fc3a11610066578063a694fc3a1461046a578063a9059cbb14610498578063c4d66de8146104fc578063dd62ed3e14610540576100ea565b806370a082311461032b57806395d89b4114610383578063a457c2d714610406576100ea565b806323b872dd116100c857806323b872dd146101f45780632e17de7814610278578063313ce567146102a657806339509351146102c7576100ea565b806306fdde03146100ef578063095ea7b31461017257806318160ddd146101d6575b600080fd5b6100f76105b8565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561013757808201518184015260208101905061011c565b50505050905090810190601f1680156101645780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101be6004803603604081101561018857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061065a565b60405180821515815260200191505060405180910390f35b6101de610678565b6040518082815260200191505060405180910390f35b6102606004803603606081101561020a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610682565b60405180821515815260200191505060405180910390f35b6102a46004803603602081101561028e57600080fd5b810190808035906020019092919050505061075b565b005b6102ae6108cc565b604051808260ff16815260200191505060405180910390f35b610313600480360360408110156102dd57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506108e3565b60405180821515815260200191505060405180910390f35b61036d6004803603602081101561034157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610996565b6040518082815260200191505060405180910390f35b61038b6109df565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103cb5780820151818401526020810190506103b0565b50505050905090810190601f1680156103f85780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6104526004803603604081101561041c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a81565b60405180821515815260200191505060405180910390f35b6104966004803603602081101561048057600080fd5b8101908080359060200190929190505050610b4e565b005b6104e4600480360360408110156104ae57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610cd3565b60405180821515815260200191505060405180910390f35b61053e6004803603602081101561051257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610cf1565b005b6105a26004803603604081101561055657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610ea5565b6040518082815260200191505060405180910390f35b606060368054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106505780601f1061062557610100808354040283529160200191610650565b820191906000526020600020905b81548152906001019060200180831161063357829003601f168201915b5050505050905090565b600061066e610667610f2c565b8484610f34565b6001905092915050565b6000603554905090565b600061068f84848461112b565b6107508461069b610f2c565b61074b85604051806060016040528060288152602001611bbc60289139603460008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000610701610f2c565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546113f09092919063ffffffff16565b610f34565b600190509392505050565b6107ad81606660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546114b090919063ffffffff16565b606660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561088357600080fd5b505af1158015610897573d6000803e3d6000fd5b505050506040513d60208110156108ad57600080fd5b8101908080519060200190929190505050506108c93382611538565b50565b6000603860009054906101000a900460ff16905090565b600061098c6108f0610f2c565b846109878560346000610901610f2c565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546114b090919063ffffffff16565b610f34565b6001905092915050565b6000603360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b606060378054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a775780601f10610a4c57610100808354040283529160200191610a77565b820191906000526020600020905b815481529060010190602001808311610a5a57829003601f168201915b5050505050905090565b6000610b44610a8e610f2c565b84610b3f85604051806060016040528060258152602001611c2d6025913960346000610ab8610f2c565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546113f09092919063ffffffff16565b610f34565b6001905092915050565b610ba081606660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546114b090919063ffffffff16565b606660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330846040518463ffffffff1660e01b8152600401808473ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019350505050602060405180830381600087803b158015610c9457600080fd5b505af1158015610ca8573d6000803e3d6000fd5b505050506040513d6020811015610cbe57600080fd5b81019080805190602001909291905050505050565b6000610ce7610ce0610f2c565b848461112b565b6001905092915050565b600060019054906101000a900460ff1680610d105750610d0f611546565b5b80610d26575060008054906101000a900460ff16155b610d7b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180611b8e602e913960400191505060405180910390fd5b60008060019054906101000a900460ff161590508015610dcb576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b610e3f6040518060400160405280600781526020017f5374616b696e67000000000000000000000000000000000000000000000000008152506040518060400160405280600381526020017f53544b000000000000000000000000000000000000000000000000000000000081525061155d565b81606560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508015610ea15760008060016101000a81548160ff0219169083151502179055505b5050565b6000603460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610fba576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526024815260200180611c096024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611040576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180611b466022913960400191505060405180910390fd5b80603460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156111b1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526025815260200180611be46025913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611237576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180611b236023913960400191505060405180910390fd5b61124283838361166f565b6112ae81604051806060016040528060268152602001611b6860269139603360008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546113f09092919063ffffffff16565b603360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061134381603360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546114b090919063ffffffff16565b603360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b600083831115829061149d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015611462578082015181840152602081019050611447565b50505050905090810190601f16801561148f5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b60008082840190508381101561152e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b6115428282611674565b5050565b6000803090506000813b9050600081149250505090565b600060019054906101000a900460ff168061157c575061157b611546565b5b80611592575060008054906101000a900460ff16155b6115e7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180611b8e602e913960400191505060405180910390fd5b60008060019054906101000a900460ff161590508015611637576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b61163f61183d565b611649838361193b565b801561166a5760008060016101000a81548160ff0219169083151502179055505b505050565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611717576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f45524332303a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b6117236000838361166f565b611738816035546114b090919063ffffffff16565b60358190555061179081603360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546114b090919063ffffffff16565b603360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600060019054906101000a900460ff168061185c575061185b611546565b5b80611872575060008054906101000a900460ff16155b6118c7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180611b8e602e913960400191505060405180910390fd5b60008060019054906101000a900460ff161590508015611917576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b80156119385760008060016101000a81548160ff0219169083151502179055505b50565b600060019054906101000a900460ff168061195a5750611959611546565b5b80611970575060008054906101000a900460ff16155b6119c5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180611b8e602e913960400191505060405180910390fd5b60008060019054906101000a900460ff161590508015611a15576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b8260369080519060200190611a2b929190611a85565b508160379080519060200190611a42929190611a85565b506012603860006101000a81548160ff021916908360ff1602179055508015611a805760008060016101000a81548160ff0219169083151502179055505b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10611ac657805160ff1916838001178555611af4565b82800160010185558215611af4579182015b82811115611af3578251825591602001919060010190611ad8565b5b509050611b019190611b05565b5090565b5b80821115611b1e576000816000905550600101611b06565b509056fe45524332303a207472616e7366657220746f20746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e6365496e697469616c697a61626c653a20636f6e747261637420697320616c726561647920696e697469616c697a656445524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa26469706673582212201f986c5e4cb57cac095316bc71943f3466653d8133dde756a17a92cfc1c8d5a064736f6c634300060c0033";
