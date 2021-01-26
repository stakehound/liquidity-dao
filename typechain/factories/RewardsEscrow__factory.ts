/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { RewardsEscrow } from "../RewardsEscrow";

export class RewardsEscrow__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<RewardsEscrow> {
    return super.deploy(overrides || {}) as Promise<RewardsEscrow>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): RewardsEscrow {
    return super.attach(address) as RewardsEscrow;
  }
  connect(signer: Signer): RewardsEscrow__factory {
    return super.connect(signer) as RewardsEscrow__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RewardsEscrow {
    return new Contract(address, _abi, signerOrProvider) as RewardsEscrow;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "Approve",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
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
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "Call",
    type: "event",
  },
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
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "RevokeApproval",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "approveRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "call",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isApproved",
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "revokeRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "geyser",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "durationSec",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
    ],
    name: "signalTokenLock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
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
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
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
  "0x608060405234801561001057600080fd5b50610e41806100206000396000f3fe6080604052600436106100915760003560e01c80638129fc1c116100595780638129fc1c146101df5780638da5cb5b146101f4578063af7dbf5414610225578063beabacc814610274578063f2fde38b146102b757610091565b8063504b449c14610096578063673448dd146100cb5780636dbf2fa014610112578063715018a61461019757806376d45a09146101ac575b600080fd5b3480156100a257600080fd5b506100c9600480360360208110156100b957600080fd5b50356001600160a01b03166102ea565b005b3480156100d757600080fd5b506100fe600480360360208110156100ee57600080fd5b50356001600160a01b031661039a565b604080519115158252519081900360200190f35b6100fe6004803603606081101561012857600080fd5b6001600160a01b038235169160208101359181019060608101604082013564010000000081111561015857600080fd5b82018360208201111561016a57600080fd5b8035906020019184600183028401116401000000008311171561018c57600080fd5b5090925090506103af565b3480156101a357600080fd5b506100c9610538565b3480156101b857600080fd5b506100c9600480360360208110156101cf57600080fd5b50356001600160a01b03166105da565b3480156101eb57600080fd5b506100c961068d565b34801561020057600080fd5b5061020961073f565b604080516001600160a01b039092168252519081900360200190f35b34801561023157600080fd5b506100c9600480360360a081101561024857600080fd5b506001600160a01b0381358116916020810135909116906040810135906060810135906080013561074e565b34801561028057600080fd5b506100c96004803603606081101561029757600080fd5b506001600160a01b03813581169160208101359091169060400135610835565b3480156102c357600080fd5b506100c9600480360360208110156102da57600080fd5b50356001600160a01b031661091e565b6102f2610a17565b6033546001600160a01b03908116911614610342576040805162461bcd60e51b81526020600482018190526024820152600080516020610dec833981519152604482015290519081900360640190fd5b6001600160a01b038116600081815260976020908152604091829020805460ff19169055815192835290517fdddeac663983b1e35153215a4578fecbb5921d12e660b3c4259aa7d9dbb9709f9281900390910190a150565b60976020526000908152604090205460ff1681565b60006103b9610a17565b6033546001600160a01b03908116911614610409576040805162461bcd60e51b81526020600482018190526024820152600080516020610dec833981519152604482015290519081900360640190fd5b60026065541415610461576040805162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c00604482015290519081900360640190fd5b600260655561046f85610a1b565b6104b0858585858080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152505050505a610a86565b90507f58920bab8ebe20f458895b68243189a021c51741421c3d98eff715b8e5afe1fa8585858560405180856001600160a01b03168152602001848152602001806020018281038252848482818152602001925080828437600083820152604051601f909101601f191690920182900397509095505050505050a16001606555949350505050565b610540610a17565b6033546001600160a01b03908116911614610590576040805162461bcd60e51b81526020600482018190526024820152600080516020610dec833981519152604482015290519081900360640190fd5b6033546040516000916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3603380546001600160a01b0319169055565b6105e2610a17565b6033546001600160a01b03908116911614610632576040805162461bcd60e51b81526020600482018190526024820152600080516020610dec833981519152604482015290519081900360640190fd5b6001600160a01b038116600081815260976020908152604091829020805460ff19166001179055815192835290517f96bfcd230b7ff6b6fae05762edc541f5cb32225984541cf1a9c0b04bac427a5e9281900390910190a150565b600054610100900460ff16806106a657506106a6610a9d565b806106b4575060005460ff16155b6106ef5760405162461bcd60e51b815260040180806020018281038252602e815260200180610dbe602e913960400191505060405180910390fd5b600054610100900460ff1615801561071a576000805460ff1961ff0019909116610100171660011790555b610722610aa3565b61072a610b40565b801561073c576000805461ff00191690555b50565b6033546001600160a01b031690565b610756610a17565b6033546001600160a01b039081169116146107a6576040805162461bcd60e51b81526020600482018190526024820152600080516020610dec833981519152604482015290519081900360640190fd5b6107af85610a1b565b846001600160a01b0316630968c3d8858585856040518563ffffffff1660e01b815260040180856001600160a01b03168152602001848152602001838152602001828152602001945050505050600060405180830381600087803b15801561081657600080fd5b505af115801561082a573d6000803e3d6000fd5b505050505050505050565b61083d610a17565b6033546001600160a01b0390811691161461088d576040805162461bcd60e51b81526020600482018190526024820152600080516020610dec833981519152604482015290519081900360640190fd5b61089682610a1b565b826001600160a01b031663a9059cbb83836040518363ffffffff1660e01b815260040180836001600160a01b0316815260200182815260200192505050602060405180830381600087803b1580156108ed57600080fd5b505af1158015610901573d6000803e3d6000fd5b505050506040513d602081101561091757600080fd5b5050505050565b610926610a17565b6033546001600160a01b03908116911614610976576040805162461bcd60e51b81526020600482018190526024820152600080516020610dec833981519152604482015290519081900360640190fd5b6001600160a01b0381166109bb5760405162461bcd60e51b8152600401808060200182810382526026815260200180610d986026913960400191505060405180910390fd5b6033546040516001600160a01b038084169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a3603380546001600160a01b0319166001600160a01b0392909216919091179055565b3390565b6001600160a01b03811660009081526097602052604090205460ff16151560011461073c576040805162461bcd60e51b8152602060048201526016602482015275149958da5c1a595b9d081b9bdd08185c1c1c9bdd995960521b604482015290519081900360640190fd5b6000610a9485858585610be6565b95945050505050565b303b1590565b600054610100900460ff1680610abc5750610abc610a9d565b80610aca575060005460ff16155b610b055760405162461bcd60e51b815260040180806020018281038252602e815260200180610dbe602e913960400191505060405180910390fd5b600054610100900460ff16158015610b30576000805460ff1961ff0019909116610100171660011790555b610b38610bfe565b61072a610c9e565b600054610100900460ff1680610b595750610b59610a9d565b80610b67575060005460ff16155b610ba25760405162461bcd60e51b815260040180806020018281038252602e815260200180610dbe602e913960400191505060405180910390fd5b600054610100900460ff16158015610bcd576000805460ff1961ff0019909116610100171660011790555b6001606555801561073c576000805461ff001916905550565b6000806000845160208601878987f195945050505050565b600054610100900460ff1680610c175750610c17610a9d565b80610c25575060005460ff16155b610c605760405162461bcd60e51b815260040180806020018281038252602e815260200180610dbe602e913960400191505060405180910390fd5b600054610100900460ff1615801561072a576000805460ff1961ff001990911661010017166001179055801561073c576000805461ff001916905550565b600054610100900460ff1680610cb75750610cb7610a9d565b80610cc5575060005460ff16155b610d005760405162461bcd60e51b815260040180806020018281038252602e815260200180610dbe602e913960400191505060405180910390fd5b600054610100900460ff16158015610d2b576000805460ff1961ff0019909116610100171660011790555b6000610d35610a17565b603380546001600160a01b0319166001600160a01b038316908117909155604051919250906000907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a350801561073c576000805461ff00191690555056fe4f776e61626c653a206e6577206f776e657220697320746865207a65726f2061646472657373496e697469616c697a61626c653a20636f6e747261637420697320616c726561647920696e697469616c697a65644f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572a26469706673582212203cb919f1b7381a86eeba8cf6b56874fc0bb80bf7100e7e194e662b6a3fd2642664736f6c634300060c0033";
