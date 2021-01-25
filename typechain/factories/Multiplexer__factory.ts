/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { Multiplexer } from "../Multiplexer";

export class Multiplexer__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<Multiplexer> {
    return super.deploy(overrides || {}) as Promise<Multiplexer>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Multiplexer {
    return super.attach(address) as Multiplexer;
  }
  connect(signer: Signer): Multiplexer__factory {
    return super.connect(signer) as Multiplexer__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Multiplexer {
    return new Contract(address, _abi, signerOrProvider) as Multiplexer;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
    ],
    name: "InsufficientFundsForRoot",
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
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "RootProposed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "RootUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "RootValidated",
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
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PAUSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROOT_PROPOSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROOT_VALIDATOR_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "UNPAUSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endBlock",
        type: "uint256",
      },
    ],
    name: "approveRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "cumulativeAmounts",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        internalType: "bytes32[]",
        name: "merkleProof",
        type: "bytes32[]",
      },
    ],
    name: "claim",
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
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "claimed",
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
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "cumulativeAmounts",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
    ],
    name: "encodeClaim",
    outputs: [
      {
        internalType: "bytes",
        name: "encoded",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
    ],
    name: "getClaimedFor",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentMerkleData",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "root",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "contentHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "cycle",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endBlock",
            type: "uint256",
          },
        ],
        internalType: "struct Multiplexer.MerkleData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPendingMerkleData",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "root",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "contentHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "cycle",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endBlock",
            type: "uint256",
          },
        ],
        internalType: "struct Multiplexer.MerkleData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
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
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
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
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "hasPendingRoot",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
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
    inputs: [
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
      {
        internalType: "address",
        name: "initialProposer",
        type: "address",
      },
      {
        internalType: "address",
        name: "initialValidator",
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
    name: "lastProposedMerkleData",
    outputs: [
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endBlock",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastPublishedMerkleData",
    outputs: [
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endBlock",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
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
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endBlock",
        type: "uint256",
      },
    ],
    name: "proposeRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
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
    name: "totalClaimed",
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
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061225e806100206000396000f3fe608060405234801561001057600080fd5b50600436106101c45760003560e01c806391d14854116100f9578063ca15c87311610097578063dd5b769e11610071578063dd5b769e14610384578063e63ab1e914610397578063ef5d9ae81461039f578063fb1bb9de146103b2576101c4565b8063ca15c87314610356578063d12ed89714610369578063d547741f14610371576101c4565b8063b20cd555116100d3578063b20cd55514610312578063b52086ee1461031a578063c0c53b8b14610322578063c63463b414610335576101c4565b806391d14854146102d6578063a217fddf146102e9578063a2fcfd68146102f1576101c4565b80633f4ba83a116101665780636ed789f4116101405780636ed789f4146102935780638456cb59146102a6578063897347bb146102ae5780639010d07c146102b6576101c4565b80633f4ba83a1461026a57806342a9b9c6146102725780635c975abb1461028b576101c4565b806329941edd116101a257806329941edd1461021a5780632f2ff15d1461022f5780632f37a7741461024257806336568abe14610257576101c4565b80630c9cbf0e146101c95780630d4202ce146101f2578063248a9ca314610207575b600080fd5b6101dc6101d73660046117a8565b6103ba565b6040516101e99190611ccd565b60405180910390f35b6101fa6103d7565b6040516101e9919061217c565b6101dc610215366004611a1b565b610414565b61022d610228366004611a62565b610429565b005b61022d61023d366004611a33565b61050e565b61024a610556565b6040516101e99190611cc2565b61022d610265366004611a33565b610570565b61022d6105b2565b61027a6105c4565b6040516101e9959493929190611cd6565b61024a6105d6565b61022d6102a136600461195b565b6105df565b61022d6109eb565b61027a6109fb565b6102c96102c4366004611a9c565b610a0d565b6040516101e99190611bbf565b61024a6102e4366004611a33565b610a2e565b6101dc610a46565b6103046102ff366004611821565b610a4b565b6040516101e9929190611c34565b6101fa610b20565b6101dc610b5d565b61022d6103303660046117dc565b610b81565b6103486103433660046118d2565b610c76565b6040516101e9929190611cf9565b6101dc610364366004611a1b565b610cbb565b6101dc610cd2565b61022d61037f366004611a33565b610cf6565b61022d610392366004611a62565b610d30565b6101dc610e77565b6101dc6103ad36600461178d565b610e9b565b6101dc610ead565b60a160209081526000928352604080842090915290825290205481565b6103df611706565b506040805160a0810182526097548152609854602082015260995491810191909152609a546060820152609b54608082015290565b60009081526033602052604090206002015490565b60655460ff16156104555760405162461bcd60e51b815260040161044c90611f27565b60405180910390fd5b61045d610ed1565b609e5461046b906001610f17565b83146104895760405162461bcd60e51b815260040161044c90612104565b6040805160a0810182528681526020810186905280820185905260608101849052608001829052609786905560988590556099849055609a839055609b829055517fdb07d3ace4eb8cb6d13437eec22aee8fceb4200c6b31945a3fcd75758d9bd34b906104ff9085908890889042904390611cd6565b60405180910390a15050505050565b60008281526033602052604090206002015461052c906102e4610f3c565b6105485760405162461bcd60e51b815260040161044c90611d70565b6105528282610f40565b5050565b609e54600090610567906001610f17565b60995414905090565b610578610f3c565b6001600160a01b0316816001600160a01b0316146105a85760405162461bcd60e51b815260040161044c9061212d565b6105528282610fa9565b6105ba611012565b6105c2611058565b565b609754609854609954609a54609b5485565b60655460ff1690565b60655460ff16156106025760405162461bcd60e51b815260040161044c90611f27565b609e5483146106235760405162461bcd60e51b815260040161044c90612030565b600033848989898960405160200161064096959493929190611bec565b60405160208183030381529060405280519060200120905061069983838080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525050609c5491508490506110c4565b6106b55760405162461bcd60e51b815260040161044c906120dd565b60005b878110156109e05733600090815260a16020526040812061073790828c8c868181106106e057fe5b90506020020160208101906106f5919061178d565b6001600160a01b03166001600160a01b031681526020019081526020016000205489898581811061072257fe5b9050602002013561116190919063ffffffff16565b9050600081116107595760405162461bcd60e51b815260040161044c9061208e565b33600090815260a1602052604081206107b0918391908d8d8781811061077b57fe5b9050602002016020810190610790919061178d565b6001600160a01b0316815260208101919091526040016000205490610f17565b33600090815260a160205260408120908c8c868181106107cc57fe5b90506020020160208101906107e1919061178d565b6001600160a01b0316815260208101919091526040016000205587878381811061080757fe5b33600090815260a160209081526040822092029390930135929091508c8c8681811061082f57fe5b9050602002016020810190610844919061178d565b6001600160a01b03166001600160a01b0316815260200190815260200160002054146108825760405162461bcd60e51b815260040161044c90612057565b89898381811061088e57fe5b90506020020160208101906108a3919061178d565b6001600160a01b031663a9059cbb336108dc8d8d878181106108c157fe5b90506020020160208101906108d6919061178d565b856111a3565b6040518363ffffffff1660e01b81526004016108f9929190611bd3565b602060405180830381600087803b15801561091357600080fd5b505af1158015610927573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061094b91906119fb565b6109675760405162461bcd60e51b815260040161044c90611ded565b858a8a8481811061097457fe5b9050602002016020810190610989919061178d565b6001600160a01b0316336001600160a01b03167f6f9c9826be5976f3f82a3490c52a83328ce2ec7be9e62dcb39c26da5148d7c768442436040516109cf939291906121b6565b60405180910390a4506001016106b8565b505050505050505050565b6109f36112a4565b6105c26112ce565b609c54609d54609e54609f5460a05485565b6000828152603360205260408120610a259083611327565b90505b92915050565b6000828152603360205260408120610a259083611333565b600081565b6060806060835167ffffffffffffffff81118015610a6857600080fd5b50604051908082528060200260200182016040528015610a92578160200160208202803683370190505b50905060005b8451811015610b12576001600160a01b038616600090815260a1602052604081208651909190879084908110610aca57fe5b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002054828281518110610aff57fe5b6020908102919091010152600101610a98565b5083925090505b9250929050565b610b28611706565b506040805160a08082018352609c548252609d546020830152609e5492820192909252609f5460608201529054608082015290565b7f64ba955c8b5b448b2248fa0532807b98b1b75941bbd2184ca97df4881a13b44881565b600054610100900460ff1680610b9a5750610b9a611348565b80610ba8575060005460ff16155b610bc45760405162461bcd60e51b815260040161044c90611f81565b600054610100900460ff16158015610bef576000805460ff1961ff0019909116610100171660011790555b610bf761134e565b610bff6113e1565b610c0a600085610548565b610c347f64ba955c8b5b448b2248fa0532807b98b1b75941bbd2184ca97df4881a13b44884610548565b610c5e7f2650881bae229064abd4495ca56feba9ce572f8653a1aad517d81f9e3cf174c083610548565b8015610c70576000805461ff00191690555b50505050565b60606000838389898989604051602001610c9596959493929190611bec565b604051602081830303815290604052915081805190602001209050965096945050505050565b6000818152603360205260408120610a289061146d565b7f2650881bae229064abd4495ca56feba9ce572f8653a1aad517d81f9e3cf174c081565b600082815260336020526040902060020154610d14906102e4610f3c565b6105a85760405162461bcd60e51b815260040161044c90611ed7565b60655460ff1615610d535760405162461bcd60e51b815260040161044c90611f27565b610d5b611478565b6097548514610d7c5760405162461bcd60e51b815260040161044c90611e78565b6098548414610d9d5760405162461bcd60e51b815260040161044c90611f51565b6099548314610dbe5760405162461bcd60e51b815260040161044c90612104565b609a548214610ddf5760405162461bcd60e51b815260040161044c90611ea0565b609b548114610e005760405162461bcd60e51b815260040161044c90611ff9565b6040805160a0808201835287825260208201879052818301869052606082018590526080909101839052609c879055609d869055609e859055609f849055829055517f78c1cf8203c381d0baf6f6806522b745ca9aa5b4b907db897cd49c2c06d87f54906104ff9085908890889042904390611cd6565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a81565b60a26020526000908152604090205481565b7f427da25fe773164f88948d3e215c94b6554e2ed5e5f203a821c9f2f6131cf75a81565b610efb7f64ba955c8b5b448b2248fa0532807b98b1b75941bbd2184ca97df4881a13b44833610a2e565b6105c25760405162461bcd60e51b815260040161044c90611fcf565b600082820183811015610a255760405162461bcd60e51b815260040161044c90611e41565b3390565b6000828152603360205260409020610f5890826114be565b1561055257610f65610f3c565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6000828152603360205260409020610fc190826114d3565b1561055257610fce610f3c565b6001600160a01b0316816001600160a01b0316837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45050565b61103c7f427da25fe773164f88948d3e215c94b6554e2ed5e5f203a821c9f2f6131cf75a33610a2e565b6105c25760405162461bcd60e51b815260040161044c906120b7565b60655460ff1661107a5760405162461bcd60e51b815260040161044c90611dbf565b6065805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6110ad610f3c565b6040516110ba9190611bbf565b60405180910390a1565b600081815b85518110156111565760008682815181106110e057fe5b60200260200101519050808311611121578281604051602001611104929190611bb1565b60405160208183030381529060405280519060200120925061114d565b8083604051602001611134929190611bb1565b6040516020818303038152906040528051906020012092505b506001016110c9565b509092149392505050565b6000610a2583836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f7700008152506114e8565b600080836001600160a01b03166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b1580156111df57600080fd5b505afa1580156111f3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112179190611abd565b846001600160a01b0316633a98ef396040518163ffffffff1660e01b815260040160206040518083038186803b15801561125057600080fd5b505afa158015611264573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112889190611abd565b8161128f57fe5b04905080838161129b57fe5b04949350505050565b61103c7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a33610a2e565b60655460ff16156112f15760405162461bcd60e51b815260040161044c90611f27565b6065805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586110ad610f3c565b6000610a258383611514565b6000610a25836001600160a01b038416611559565b303b1590565b600054610100900460ff16806113675750611367611348565b80611375575060005460ff16155b6113915760405162461bcd60e51b815260040161044c90611f81565b600054610100900460ff161580156113bc576000805460ff1961ff0019909116610100171660011790555b6113c4611571565b6113cc611571565b80156113de576000805461ff00191690555b50565b600054610100900460ff16806113fa57506113fa611348565b80611408575060005460ff16155b6114245760405162461bcd60e51b815260040161044c90611f81565b600054610100900460ff1615801561144f576000805460ff1961ff0019909116610100171660011790555b6065805460ff1916905580156113de576000805461ff001916905550565b6000610a28826115f2565b6114a27f2650881bae229064abd4495ca56feba9ce572f8653a1aad517d81f9e3cf174c033610a2e565b6105c25760405162461bcd60e51b815260040161044c90611e16565b6000610a25836001600160a01b0384166115f6565b6000610a25836001600160a01b038416611640565b6000818484111561150c5760405162461bcd60e51b815260040161044c9190611d1b565b505050900390565b815460009082106115375760405162461bcd60e51b815260040161044c90611d2e565b82600001828154811061154657fe5b9060005260206000200154905092915050565b60009081526001919091016020526040902054151590565b600054610100900460ff168061158a575061158a611348565b80611598575060005460ff16155b6115b45760405162461bcd60e51b815260040161044c90611f81565b600054610100900460ff161580156113cc576000805460ff1961ff00199091166101001716600117905580156113de576000805461ff001916905550565b5490565b60006116028383611559565b61163857508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610a28565b506000610a28565b600081815260018301602052604081205480156116fc578354600019808301919081019060009087908390811061167357fe5b906000526020600020015490508087600001848154811061169057fe5b6000918252602080832090910192909255828152600189810190925260409020908401905586548790806116c057fe5b60019003818190600052602060002001600090559055866001016000878152602001908152602001600020600090556001945050505050610a28565b6000915050610a28565b6040805160a08101825260008082526020820181905291810182905260608101829052608081019190915290565b80356001600160a01b0381168114610a2857600080fd5b60008083601f84011261175c578182fd5b50813567ffffffffffffffff811115611773578182fd5b6020830191508360208083028501011115610b1957600080fd5b60006020828403121561179e578081fd5b610a258383611734565b600080604083850312156117ba578081fd5b6117c48484611734565b91506117d38460208501611734565b90509250929050565b6000806000606084860312156117f0578081fd5b6117fa8585611734565b92506118098560208601611734565b91506118188560408601611734565b90509250925092565b60008060408385031215611833578182fd5b61183d8484611734565b915060208084013567ffffffffffffffff811115611859578283fd5b8401601f81018613611869578283fd5b803561187c611877826121f3565b6121cc565b81815283810190838501858402850186018a1015611898578687fd5b8694505b838510156118c2576118ae8a82611734565b83526001949094019391850191850161189c565b5080955050505050509250929050565b600080600080600080608087890312156118ea578182fd5b863567ffffffffffffffff80821115611901578384fd5b61190d8a838b0161174b565b90985096506020890135915080821115611925578384fd5b5061193289828a0161174b565b909550935050604087013561194681612213565b80925050606087013590509295509295509295565b60008060008060008060006080888a031215611975578081fd5b873567ffffffffffffffff8082111561198c578283fd5b6119988b838c0161174b565b909950975060208a01359150808211156119b0578283fd5b6119bc8b838c0161174b565b909750955060408a0135945060608a01359150808211156119db578283fd5b506119e88a828b0161174b565b989b979a50959850939692959293505050565b600060208284031215611a0c578081fd5b81518015158114610a25578182fd5b600060208284031215611a2c578081fd5b5035919050565b60008060408385031215611a45578182fd5b823591506020830135611a5781612213565b809150509250929050565b600080600080600060a08688031215611a79578081fd5b505083359560208501359550604085013594606081013594506080013592509050565b60008060408385031215611aae578182fd5b50508035926020909101359150565b600060208284031215611ace578081fd5b5051919050565b815260200190565b6001600160a01b03169052565b60008284526020808501945082825b85811015611b27578183016001600160a01b03611b168285611734565b168852968301969150600101611af9565b509495945050505050565b81835260006001600160fb1b03831115611b4a578081fd5b6020830280836020870137939093016020019283525090919050565b60008151808452815b81811015611b8b57602081850181015186830182015201611b6f565b81811115611b9c5782602083870101525b50601f01601f19169290920160200192915050565b918252602082015260400190565b6001600160a01b0391909116815260200190565b6001600160a01b03929092168252602082015260400190565b600060018060a01b038816825286602083015260806040830152611c14608083018688611aea565b8281036060840152611c27818587611b32565b9998505050505050505050565b604080825283519082018190526000906020906060840190828701845b82811015611c7457611c64848351611add565b9284019290840190600101611c51565b50505083810382850152808551611c8b8184611ccd565b91508387019250845b81811015611cb557611ca7838551611ad5565b938501939250600101611c94565b5090979650505050505050565b901515815260200190565b90815260200190565b948552602085019390935260408401919091526060830152608082015260a00190565b600060408252611d0c6040830185611b66565b90508260208301529392505050565b600060208252610a256020830184611b66565b60208082526022908201527f456e756d657261626c655365743a20696e646578206f7574206f6620626f756e604082015261647360f01b606082015260800190565b6020808252602f908201527f416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e60408201526e0818591b5a5b881d1bc819dc985b9d608a1b606082015260800190565b60208082526014908201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b604082015260600190565b6020808252600f908201526e151c985b9cd9995c8819985a5b1959608a1b604082015260600190565b60208082526011908201527037b7363ca937b7ba2b30b634b230ba37b960791b604082015260600190565b6020808252601b908201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604082015260600190565b6020808252600e908201526d125b98dbdc9c9958dd081c9bdbdd60921b604082015260600190565b6020808252601b908201527f496e636f7272656374206379636c6520737461727420626c6f636b0000000000604082015260600190565b60208082526030908201527f416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e60408201526f2061646d696e20746f207265766f6b6560801b606082015260800190565b60208082526010908201526f14185d5cd8589b194e881c185d5cd95960821b604082015260600190565b602080825260169082015275092dcc6dee4e4cac6e840c6dedce8cadce840d0c2e6d60531b604082015260600190565b6020808252602e908201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160408201526d191e481a5b9a5d1a585b1a5e995960921b606082015260800190565b60208082526010908201526f37b7363ca937b7ba283937b837b9b2b960811b604082015260600190565b60208082526019908201527f496e636f7272656374206379636c6520656e6420626c6f636b00000000000000604082015260600190565b6020808252600d908201526c496e76616c6964206379636c6560981b604082015260600190565b60208082526017908201527f436c61696d656420616d6f756e74206d69736d61746368000000000000000000604082015260600190565b6020808252600f908201526e45786365737369766520636c61696d60881b604082015260600190565b6020808252600c908201526b37b7363ca3bab0b93234b0b760a11b604082015260600190565b6020808252600d908201526c24b73b30b634b210383937b7b360991b604082015260600190565b6020808252600f908201526e496e636f7272656374206379636c6560881b604082015260600190565b6020808252602f908201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560408201526e103937b632b9903337b91039b2b63360891b606082015260800190565b600060a082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015292915050565b9283526020830191909152604082015260600190565b60405181810167ffffffffffffffff811182821017156121eb57600080fd5b604052919050565b600067ffffffffffffffff821115612209578081fd5b5060209081020190565b6001600160a01b03811681146113de57600080fdfea2646970667358221220086ae917e8045c9e35a0e6d564ecacc88b3695f86925cce18bf41e8faede099364736f6c634300060c0033";
