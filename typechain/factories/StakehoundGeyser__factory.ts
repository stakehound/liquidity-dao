/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { StakehoundGeyser } from "../StakehoundGeyser";

export class StakehoundGeyser__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<StakehoundGeyser> {
    return super.deploy(overrides || {}) as Promise<StakehoundGeyser>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): StakehoundGeyser {
    return super.attach(address) as StakehoundGeyser;
  }
  connect(signer: Signer): StakehoundGeyser__factory {
    return super.connect(signer) as StakehoundGeyser__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StakehoundGeyser {
    return new Contract(address, _abi, signerOrProvider) as StakehoundGeyser;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ClearSchedules",
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
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "Staked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sharesLocked",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "durationSec",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "UnlockScheduleSet",
    type: "event",
  },
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
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "Unstaked",
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
    name: "MAX_PERCENTAGE",
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
    name: "TOKEN_LOCKER_ROLE",
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
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "addDistributionToken",
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
    ],
    name: "clearSchedules",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getDistributionTokens",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNumDistributionTokens",
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
    inputs: [],
    name: "getStakingToken",
    outputs: [
      {
        internalType: "contract IStakedToken",
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
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getUnlockSchedulesFor",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "sharesLocked",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endAtSec",
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
        internalType: "struct StakehoundGeyser.UnlockSchedule[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "globalStartTime",
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
        internalType: "contract IStakedToken",
        name: "stakingToken_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "globalStartTime_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "initialAdmin_",
        type: "address",
      },
      {
        internalType: "address",
        name: "initialTokenLocker_",
        type: "address",
      },
    ],
    name: "initialize",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "stakeFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "supportsHistory",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStaked",
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
        name: "addr",
        type: "address",
      },
    ],
    name: "totalStakedFor",
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
        name: "token",
        type: "address",
      },
    ],
    name: "unlockScheduleCount",
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
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "unlockSchedules",
    outputs: [
      {
        internalType: "uint256",
        name: "sharesLocked",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endAtSec",
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
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611df5806100206000396000f3fe608060405234801561001057600080fd5b50600436106101a95760003560e01c80637033e4a6116100f95780639f9106d111610097578063ca15c87311610071578063ca15c87314610367578063cd616ea31461037a578063d547741f14610382578063ed061e0414610395576101a9565b80639f9106d114610344578063a217fddf1461034c578063c8fd6ed014610354576101a9565b80639010d07c116100d35780639010d07c1461030157806391d14854146103215780639292ab5f146103345780639d81ff151461033c576101a9565b80637033e4a6146102d1578063817b1cd2146102e65780638dab7191146102ee576101a9565b8063328b10d8116101665780634b341aed116101405780634b341aed1461027e5780634c255c97146102915780635099a9dc1461029957806351f6cf2f146102ae576101a9565b8063328b10d814610238578063358394d81461025857806336568abe1461026b576101a9565b80630968c3d8146101ae5780630e89439b146101c35780630ef96356146101d6578063248a9ca3146101e9578063256fdcd6146102125780632f2ff15d14610225575b600080fd5b6101c16101bc36600461154c565b6103a8565b005b6101c16101d1366004611678565b610414565b6101c16101e43660046114f2565b61042c565b6101fc6101f73660046115a6565b61043f565b6040516102099190611819565b60405180910390f35b6101fc6102203660046114ab565b610454565b6101c16102333660046115be565b61046f565b61024b6102463660046114ab565b6104b7565b60405161020991906117aa565b6101c161026636600461160e565b610554565b6101c16102793660046115be565b610638565b6101fc61028c3660046114ab565b61067a565b6101fc610695565b6102a161069a565b604051610209919061175d565b6102c16102bc3660046114c7565b610739565b6040516102099493929190611d63565b6102d961077c565b604051610209919061180e565b6101fc610781565b6101c16102fc3660046114ab565b610787565b61031461030f3660046115ed565b61079a565b60405161020991906116de565b6102d961032f3660046115be565b6107bb565b6101fc6107d3565b6101fc6107e4565b6103146107ea565b6101fc6107f9565b6101c1610362366004611678565b6107fe565b6101fc6103753660046115a6565b610810565b6101fc610827565b6101c16103903660046115be565b61084b565b6101c16103a33660046114ab565b610885565b6103b06108f0565b6065548110156103db5760405162461bcd60e51b81526004016103d290611978565b60405180910390fd5b6103e6606885610938565b6104025760405162461bcd60e51b81526004016103d290611a55565b61040e8484848461094d565b50505050565b61041c61099c565b6104273333856109be565b505050565b61043461099c565b61040e3385856109be565b60009081526033602052604090206002015490565b6001600160a01b03166000908152606b602052604090205490565b60008281526033602052604090206002015461048d9061032f610bd2565b6104a95760405162461bcd60e51b81526004016103d290611929565b6104b38282610bd6565b5050565b6001600160a01b0381166000908152606b60209081526040808320805482518185028101850190935280835260609492939192909184015b828210156105495783829060005260206000209060040201604051806080016040529081600082015481526020016001820154815260200160028201548152602001600382015481525050815260200190600101906104ef565b505050509050919050565b600054610100900460ff168061056d575061056d610c3f565b8061057b575060005460ff16155b6105975760405162461bcd60e51b81526004016103d290611b82565b600054610100900460ff161580156105c2576000805460ff1961ff0019909116610100171660011790555b6105ca610c45565b6105d56000846104a9565b6105ff7f4bf6f2cdcc8ad6c087a7a4fbecf46150b3686b71387234cac2b3e2e6dc70e345836104a9565b606780546001600160a01b0319166001600160a01b03871617905560658490558015610631576000805461ff00191690555b5050505050565b610640610bd2565b6001600160a01b0316816001600160a01b0316146106705760405162461bcd60e51b81526004016103d290611d06565b6104b38282610cd8565b6001600160a01b03166000908152606a602052604090205490565b606481565b606060006106a86068610d41565b905060608167ffffffffffffffff811180156106c357600080fd5b506040519080825280602002602001820160405280156106ed578160200160208202803683370190505b50905060005b8281101561073257610706606882610d4c565b82828151811061071257fe5b6001600160a01b03909216602092830291909101909101526001016106f3565b5091505090565b606b602052816000526040600020818154811061075257fe5b60009182526020909120600490910201805460018201546002830154600390930154919450925084565b600090565b60665481565b61078f610d58565b6104b3606882610d7f565b60008281526033602052604081206107b29083610d4c565b90505b92915050565b60008281526033602052604081206107b29083610938565b60006107df6068610d41565b905090565b60655481565b6067546001600160a01b031690565b600081565b61080661099c565b6104273384610d94565b60008181526033602052604081206107b590610d41565b7f4bf6f2cdcc8ad6c087a7a4fbecf46150b3686b71387234cac2b3e2e6dc70e34581565b6000828152603360205260409020600201546108699061032f610bd2565b6106705760405162461bcd60e51b81526004016103d290611ae8565b61088d6108f0565b610898606882610938565b6108b45760405162461bcd60e51b81526004016103d290611a55565b7fb3cddde98c004ae0f91ee2e8435b94bd13db482dd1580da8c571264fde7c8a2081426040516108e5929190611716565b60405180910390a150565b61091a7f4bf6f2cdcc8ad6c087a7a4fbecf46150b3686b71387234cac2b3e2e6dc70e345336107bb565b6109365760405162461bcd60e51b81526004016103d2906118ba565b565b60006107b2836001600160a01b038416610fa8565b427feee17d644a64d4966b347af6130e045d906dcb25a1abe1694de87b981b1ff2068585858561097d8183610fc0565b60405161098e95949392919061172f565b60405180910390a250505050565b6065544210156109365760405162461bcd60e51b81526004016103d290611b38565b600081116109de5760405162461bcd60e51b81526004016103d2906118e3565b6001600160a01b038216610a045760405162461bcd60e51b81526004016103d290611c6f565b606754604051633d7ad0b760e21b81526000916001600160a01b03169063f5eb42dc90610a359030906004016116de565b60206040518083038186803b158015610a4d57600080fd5b505afa158015610a61573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a859190611660565b606754909150610aa0906001600160a01b0316853085610fe5565b606754604051633d7ad0b760e21b81526000916001600160a01b03169063f5eb42dc90610ad19030906004016116de565b60206040518083038186803b158015610ae957600080fd5b505afa158015610afd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b219190611660565b90506000610b2f828461103d565b6001600160a01b0386166000908152606a6020526040902054909150610b559082610fc0565b6001600160a01b0386166000908152606a6020526040902055606654610b7b9082610fc0565b606655426001600160a01b0386167fb4caaf29adda3eefee3ad552a8e85058589bf834c7466cae4ee58787f70589ed83610bb48961067a565b604051610bc2929190611d55565b60405180910390a3505050505050565b3390565b6000828152603360205260409020610bee9082610d7f565b156104b357610bfb610bd2565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b303b1590565b600054610100900460ff1680610c5e5750610c5e610c3f565b80610c6c575060005460ff16155b610c885760405162461bcd60e51b81526004016103d290611b82565b600054610100900460ff16158015610cb3576000805460ff1961ff0019909116610100171660011790555b610cbb61107f565b610cc361107f565b8015610cd5576000805461ff00191690555b50565b6000828152603360205260409020610cf09082611100565b156104b357610cfd610bd2565b6001600160a01b0316816001600160a01b0316837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45050565b60006107b582611115565b60006107b28383611119565b610d636000336107bb565b6109365760405162461bcd60e51b81526004016103d290611855565b60006107b2836001600160a01b03841661115e565b60008111610db45760405162461bcd60e51b81526004016103d290611a0d565b80610dbe8361067a565b1015610ddc5760405162461bcd60e51b81526004016103d290611bd0565b606754604051633d7ad0b760e21b81526000916001600160a01b03169063f5eb42dc90610e0d9030906004016116de565b60206040518083038186803b158015610e2557600080fd5b505afa158015610e39573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e5d9190611660565b606754909150610e77906001600160a01b031684846111a8565b606754604051633d7ad0b760e21b81526000916001600160a01b03169063f5eb42dc90610ea89030906004016116de565b60206040518083038186803b158015610ec057600080fd5b505afa158015610ed4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ef89190611660565b90506000610f06838361103d565b6001600160a01b0386166000908152606a6020526040902054909150610f2c908261103d565b6001600160a01b0386166000908152606a6020526040902055606654610f52908261103d565b606655426001600160a01b0386167f204fccf0d92ed8d48f204adb39b2e81e92bad0dedb93f5716ca9478cfb57de0083610f8b8961067a565b604051610f99929190611d55565b60405180910390a35050505050565b60009081526001919091016020526040902054151590565b6000828201838110156107b25760405162461bcd60e51b81526004016103d2906119d6565b61040e846323b872dd60e01b858585604051602401611006939291906116f2565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b0319909316929092179091526111c7565b60006107b283836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250611256565b600054610100900460ff16806110985750611098610c3f565b806110a6575060005460ff16155b6110c25760405162461bcd60e51b81526004016103d290611b82565b600054610100900460ff16158015610cc3576000805460ff1961ff0019909116610100171660011790558015610cd5576000805461ff001916905550565b60006107b2836001600160a01b038416611287565b5490565b8154600090821061113c5760405162461bcd60e51b81526004016103d290611878565b82600001828154811061114b57fe5b9060005260206000200154905092915050565b600061116a8383610fa8565b6111a0575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556107b5565b5060006107b5565b6104278363a9059cbb60e01b8484604051602401611006929190611716565b606061121c826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661134d9092919063ffffffff16565b805190915015610427578080602001905181019061123a9190611586565b6104275760405162461bcd60e51b81526004016103d290611cbc565b6000818484111561127a5760405162461bcd60e51b81526004016103d29190611822565b50508183035b9392505050565b6000818152600183016020526040812054801561134357835460001980830191908101906000908790839081106112ba57fe5b90600052602060002001549050808760000184815481106112d757fe5b60009182526020808320909101929092558281526001898101909252604090209084019055865487908061130757fe5b600190038181906000526020600020016000905590558660010160008781526020019081526020016000206000905560019450505050506107b5565b60009150506107b5565b606061135c8484600085611364565b949350505050565b6060824710156113865760405162461bcd60e51b81526004016103d290611aa2565b61138f85611425565b6113ab5760405162461bcd60e51b81526004016103d290611c38565b60006060866001600160a01b031685876040516113c891906116c2565b60006040518083038185875af1925050503d8060008114611405576040519150601f19603f3d011682016040523d82523d6000602084013e61140a565b606091505b509150915061141a82828661142b565b979650505050505050565b3b151590565b6060831561143a575081611280565b82511561144a5782518084602001fd5b8160405162461bcd60e51b81526004016103d29190611822565b60008083601f840112611475578182fd5b50813567ffffffffffffffff81111561148c578182fd5b6020830191508360208285010111156114a457600080fd5b9250929050565b6000602082840312156114bc578081fd5b81356107b281611daa565b600080604083850312156114d9578081fd5b82356114e481611daa565b946020939093013593505050565b60008060008060608587031215611507578182fd5b843561151281611daa565b935060208501359250604085013567ffffffffffffffff811115611534578283fd5b61154087828801611464565b95989497509550505050565b60008060008060808587031215611561578384fd5b843561156c81611daa565b966020860135965060408601359560600135945092505050565b600060208284031215611597578081fd5b815180151581146107b2578182fd5b6000602082840312156115b7578081fd5b5035919050565b600080604083850312156115d0578182fd5b8235915060208301356115e281611daa565b809150509250929050565b600080604083850312156115ff578182fd5b50508035926020909101359150565b60008060008060808587031215611623578384fd5b843561162e81611daa565b935060208501359250604085013561164581611daa565b9150606085013561165581611daa565b939692955090935050565b600060208284031215611671578081fd5b5051919050565b60008060006040848603121561168c578283fd5b83359250602084013567ffffffffffffffff8111156116a9578283fd5b6116b586828701611464565b9497909650939450505050565b600082516116d4818460208701611d7e565b9190910192915050565b6001600160a01b0391909116815260200190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b03929092168252602082015260400190565b6001600160a01b03959095168552602085019390935260408401919091526060830152608082015260a00190565b6020808252825182820181905260009190848201906040850190845b8181101561179e5783516001600160a01b031683529284019291840191600101611779565b50909695505050505050565b602080825282518282018190526000919060409081850190868401855b82811015611801578151805185528681015187860152858101518686015260609081015190850152608090930192908501906001016117c7565b5091979650505050505050565b901515815260200190565b90815260200190565b6000602082528251806020840152611841816040850160208701611d7e565b601f01601f19169190910160400192915050565b60208082526009908201526837b7363ca0b236b4b760b91b604082015260600190565b60208082526022908201527f456e756d657261626c655365743a20696e646578206f7574206f6620626f756e604082015261647360f01b606082015260800190565b6020808252600f908201526e37b7363caa37b5b2b72637b1b5b2b960891b604082015260600190565b60208082526026908201527f5374616b65686f756e644765797365723a207374616b6520616d6f756e74206960408201526573207a65726f60d01b606082015260800190565b6020808252602f908201527f416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e60408201526e0818591b5a5b881d1bc819dc985b9d608a1b606082015260800190565b602080825260409082018190527f5374616b65686f756e644765797365723a205363686564756c652063616e6e6f908201527f74207374617274206265666f726520676c6f62616c2073746172742074696d65606082015260800190565b6020808252601b908201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604082015260600190565b60208082526028908201527f5374616b65686f756e644765797365723a20756e7374616b6520616d6f756e74604082015267206973207a65726f60c01b606082015260800190565b6020808252602d908201527f5374616b65686f756e644765797365723a20546f6b656e206e6f74206170707260408201526c37bb32b210313c9030b236b4b760991b606082015260800190565b60208082526026908201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6040820152651c8818d85b1b60d21b606082015260800190565b60208082526030908201527f416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e60408201526f2061646d696e20746f207265766f6b6560801b606082015260800190565b6020808252602a908201527f5374616b65686f756e644765797365723a20446973747269627574696f6e206e6040820152691bdd081cdd185c9d195960b21b606082015260800190565b6020808252602e908201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160408201526d191e481a5b9a5d1a585b1a5e995960921b606082015260800190565b60208082526042908201527f5374616b65686f756e644765797365723a20756e7374616b6520616d6f756e7460408201527f2069732067726561746572207468616e20746f74616c2075736572207374616b606082015261657360f01b608082015260a00190565b6020808252601d908201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604082015260600190565b6020808252602d908201527f5374616b65686f756e644765797365723a2062656e656669636961727920697360408201526c207a65726f206164647265737360981b606082015260800190565b6020808252602a908201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6040820152691bdd081cdd58d8d9595960b21b606082015260800190565b6020808252602f908201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560408201526e103937b632b9903337b91039b2b63360891b606082015260800190565b918252602082015260400190565b93845260208401929092526040830152606082015260800190565b60005b83811015611d99578181015183820152602001611d81565b8381111561040e5750506000910152565b6001600160a01b0381168114610cd557600080fdfea264697066735822122044e1fdccb027daf117ed7cabab13f7009283426730a9e2e49d0b83e8f6afc99e64736f6c634300060c0033";
