/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { DownstreamCaller } from "../DownstreamCaller";

export class DownstreamCaller__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<DownstreamCaller> {
    return super.deploy(overrides || {}) as Promise<DownstreamCaller>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): DownstreamCaller {
    return super.attach(address) as DownstreamCaller;
  }
  connect(signer: Signer): DownstreamCaller__factory {
    return super.connect(signer) as DownstreamCaller__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DownstreamCaller {
    return new Contract(address, _abi, signerOrProvider) as DownstreamCaller;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "destination",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "TransactionFailed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destination",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "addTransaction",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "executeTransactions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "removeTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "setTransactionEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "transactions",
    outputs: [
      {
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
      {
        internalType: "address",
        name: "destination",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "transactionsSize",
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
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060006100216100c460201b60201c565b9050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3506100cc565b600033905090565b6113d3806100db6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063715018a611610066578063715018a6146101f95780638da5cb5b1461020357806391d4ec18146102375780639ace38c214610255578063f2fde38b1461032257610093565b8063069549bc14610098578063126e19be146100a257806346c3bd1f146101915780636e9dde99146101bf575b600080fd5b6100a0610366565b005b61017b600480360360408110156100b857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001906401000000008111156100f557600080fd5b82018360208201111561010757600080fd5b8035906020019184600183028401116401000000008311171561012957600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506106c7565b6040518082815260200191505060405180910390f35b6101bd600480360360208110156101a757600080fd5b81019080803590602001909291905050506108d3565b005b6101f7600480360360408110156101d557600080fd5b8101908080359060200190929190803515159060200190929190505050610b92565b005b610201610cf1565b005b61020b610e77565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61023f610ea0565b6040518082815260200191505060405180910390f35b6102816004803603602081101561026b57600080fd5b8101908080359060200190929190505050610ead565b6040518084151581526020018373ffffffffffffffffffffffffffffffffffffffff16815260200180602001828103825283818151815260200191508051906020019080838360005b838110156102e55780820151818401526020810190506102ca565b50505050905090810190601f1680156103125780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b6103646004803603602081101561033857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610fa9565b005b61036e6111b4565b73ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461042e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b60005b6001805490508110156106c45760006001828154811061044d57fe5b906000526020600020906002020190508060000160009054906101000a900460ff16156106b65760006105408260000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16836001018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105365780601f1061050b57610100808354040283529160200191610536565b820191906000526020600020905b81548152906001019060200180831161051957829003601f168201915b50505050506111bc565b9050806106b4578160000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8091ecaaa54ebb82e02d36c2c336528e0fcb9b3430fc1291ac88295032b9c263848460010160405180838152602001806020018281038252838181546001816001161561010002031660029004815260200191508054600181600116156101000203166002900480156106375780601f1061060c57610100808354040283529160200191610637565b820191906000526020600020905b81548152906001019060200180831161061a57829003601f168201915b5050935050505060405180910390a26040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f5472616e73616374696f6e204661696c6564000000000000000000000000000081525060200191505060405180910390fd5b505b508080600101915050610431565b50565b60006106d16111b4565b73ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610791576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156107cb57600080fd5b6000825114156107da57600080fd5b60006001805490509050600160405180606001604052806001151581526020018673ffffffffffffffffffffffffffffffffffffffff16815260200185815250908060018154018082558091505060019003906000526020600020906002020160009091909190915060008201518160000160006101000a81548160ff02191690831515021790555060208201518160000160016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060408201518160010190805190602001906108c69291906111e3565b5050508091505092915050565b6108db6111b4565b73ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461099b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b6001805490508110610a15576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260138152602001807f696e646578206f7574206f6620626f756e64730000000000000000000000000081525060200191505060405180910390fd5b6001808054905003811015610b205760018080805490500381548110610a3757fe5b906000526020600020906002020160018281548110610a5257fe5b90600052602060002090600202016000820160009054906101000a900460ff168160000160006101000a81548160ff0219169083151502179055506000820160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff168160000160016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060018201816001019080546001816001161561010002031660029004610b1b929190611263565b509050505b6001805480610b2b57fe5b6001900381819060005260206000209060020201600080820160006101000a81549060ff02191690556000820160016101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055600182016000610b8b91906112ea565b5050905550565b610b9a6111b4565b73ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610c5a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b6001805490508210610cb7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806113766028913960400191505060405180910390fd5b8060018381548110610cc557fe5b906000526020600020906002020160000160006101000a81548160ff0219169083151502179055505050565b610cf96111b4565b73ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610db9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a360008060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600180549050905090565b60018181548110610eba57fe5b90600052602060002090600202016000915090508060000160009054906101000a900460ff16908060000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806001018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610f9f5780601f10610f7457610100808354040283529160200191610f9f565b820191906000526020600020905b815481529060010190602001808311610f8257829003601f168201915b5050505050905083565b610fb16111b4565b73ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614611071576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657281525060200191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156110f7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260268152602001806113506026913960400191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600033905090565b6000806040516020840160008286518360008a6187965a03f1925050508091505092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061122457805160ff1916838001178555611252565b82800160010185558215611252579182015b82811115611251578251825591602001919060010190611236565b5b50905061125f9190611332565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061129c57805485556112d9565b828001600101855582156112d957600052602060002091601f016020900482015b828111156112d85782548255916001019190600101906112bd565b5b5090506112e69190611332565b5090565b50805460018160011615610100020316600290046000825580601f10611310575061132f565b601f01602090049060005260206000209081019061132e9190611332565b5b50565b5b8082111561134b576000816000905550600101611333565b509056fe4f776e61626c653a206e6577206f776e657220697320746865207a65726f2061646472657373696e646578206d75737420626520696e2072616e6765206f662073746f726564207478206c697374a264697066735822122007bcef1cfe09bccfbe72143aac4d3a093700faf69413fd8bec6d83a23468ace964736f6c634300060c0033";