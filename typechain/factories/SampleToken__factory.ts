/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { SampleToken } from "../SampleToken";

export class SampleToken__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<SampleToken> {
    return super.deploy(overrides || {}) as Promise<SampleToken>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SampleToken {
    return super.attach(address) as SampleToken;
  }
  connect(signer: Signer): SampleToken__factory {
    return super.connect(signer) as SampleToken__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SampleToken {
    return new Contract(address, _abi, signerOrProvider) as SampleToken;
  }
}

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
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
  "0x60806040523480156200001157600080fd5b50620000616040518060400160405280600b81526020016a29b0b6b83632aa37b5b2b760a91b8152506040518060400160405280600281526020016114d560f21b8152506200007160201b60201c565b6200006b62000133565b62000526565b600054610100900460ff16806200008d57506200008d620001f1565b806200009c575060005460ff16155b620000d95760405162461bcd60e51b815260040180806020018281038252602e81526020018062001354602e913960400191505060405180910390fd5b600054610100900460ff1615801562000105576000805460ff1961ff0019909116610100171660011790555b6200010f620001f7565b6200011b83836200029f565b80156200012e576000805461ff00191690555b505050565b600054610100900460ff16806200014f57506200014f620001f1565b806200015e575060005460ff16155b6200019b5760405162461bcd60e51b815260040180806020018281038252602e81526020018062001354602e913960400191505060405180910390fd5b600054610100900460ff16158015620001c7576000805460ff1961ff0019909116610100171660011790555b620001d1620001f7565b620001db62000383565b8015620001ee576000805461ff00191690555b50565b303b1590565b600054610100900460ff168062000213575062000213620001f1565b8062000222575060005460ff16155b6200025f5760405162461bcd60e51b815260040180806020018281038252602e81526020018062001354602e913960400191505060405180910390fd5b600054610100900460ff16158015620001db576000805460ff1961ff0019909116610100171660011790558015620001ee576000805461ff001916905550565b600054610100900460ff1680620002bb5750620002bb620001f1565b80620002ca575060005460ff16155b620003075760405162461bcd60e51b815260040180806020018281038252602e81526020018062001354602e913960400191505060405180910390fd5b600054610100900460ff1615801562000333576000805460ff1961ff0019909116610100171660011790555b8251620003489060689060208601906200048a565b5081516200035e9060699060208501906200048a565b50606a805460ff1916601217905580156200012e576000805461ff0019169055505050565b600054610100900460ff16806200039f57506200039f620001f1565b80620003ae575060005460ff16155b620003eb5760405162461bcd60e51b815260040180806020018281038252602e81526020018062001354602e913960400191505060405180910390fd5b600054610100900460ff1615801562000417576000805460ff1961ff0019909116610100171660011790555b60006200042362000486565b609780546001600160a01b0319166001600160a01b038316908117909155604051919250906000907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3508015620001ee576000805461ff001916905550565b3390565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620004cd57805160ff1916838001178555620004fd565b82800160010185558215620004fd579182015b82811115620004fd578251825591602001919060010190620004e0565b506200050b9291506200050f565b5090565b5b808211156200050b576000815560010162000510565b610e1e80620005366000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806370a0823111610097578063a457c2d711610066578063a457c2d7146102d9578063a9059cbb14610305578063dd62ed3e14610331578063f2fde38b1461035f576100f5565b806370a082311461027f578063715018a6146102a55780638da5cb5b146102ad57806395d89b41146102d1576100f5565b806323b872dd116100d357806323b872dd146101d1578063313ce56714610207578063395093511461022557806340c10f1914610251576100f5565b806306fdde03146100fa578063095ea7b31461017757806318160ddd146101b7575b600080fd5b610102610385565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561013c578181015183820152602001610124565b50505050905090810190601f1680156101695780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101a36004803603604081101561018d57600080fd5b506001600160a01b03813516906020013561041b565b604080519115158252519081900360200190f35b6101bf610438565b60408051918252519081900360200190f35b6101a3600480360360608110156101e757600080fd5b506001600160a01b0381358116916020810135909116906040013561043e565b61020f6104c5565b6040805160ff9092168252519081900360200190f35b6101a36004803603604081101561023b57600080fd5b506001600160a01b0381351690602001356104ce565b61027d6004803603604081101561026757600080fd5b506001600160a01b03813516906020013561051c565b005b6101bf6004803603602081101561029557600080fd5b50356001600160a01b0316610594565b61027d6105af565b6102b5610663565b604080516001600160a01b039092168252519081900360200190f35b610102610672565b6101a3600480360360408110156102ef57600080fd5b506001600160a01b0381351690602001356106d3565b6101a36004803603604081101561031b57600080fd5b506001600160a01b03813516906020013561073b565b6101bf6004803603604081101561034757600080fd5b506001600160a01b038135811691602001351661074f565b61027d6004803603602081101561037557600080fd5b50356001600160a01b031661077a565b60688054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156104115780601f106103e657610100808354040283529160200191610411565b820191906000526020600020905b8154815290600101906020018083116103f457829003601f168201915b5050505050905090565b600061042f610428610885565b8484610889565b50600192915050565b60675490565b600061044b848484610975565b6104bb84610457610885565b6104b685604051806060016040528060288152602001610d53602891396001600160a01b038a16600090815260666020526040812090610495610885565b6001600160a01b031681526020810191909152604001600020549190610ad2565b610889565b5060019392505050565b606a5460ff1690565b600061042f6104db610885565b846104b685606660006104ec610885565b6001600160a01b03908116825260208083019390935260409182016000908120918c168152925290205490610b69565b610524610885565b6097546001600160a01b03908116911614610586576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6105908282610bca565b5050565b6001600160a01b031660009081526065602052604090205490565b6105b7610885565b6097546001600160a01b03908116911614610619576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6097546040516000916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3609780546001600160a01b0319169055565b6097546001600160a01b031690565b60698054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156104115780601f106103e657610100808354040283529160200191610411565b600061042f6106e0610885565b846104b685604051806060016040528060258152602001610dc4602591396066600061070a610885565b6001600160a01b03908116825260208083019390935260409182016000908120918d16815292529020549190610ad2565b600061042f610748610885565b8484610975565b6001600160a01b03918216600090815260666020908152604080832093909416825291909152205490565b610782610885565b6097546001600160a01b039081169116146107e4576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b0381166108295760405162461bcd60e51b8152600401808060200182810382526026815260200180610ce56026913960400191505060405180910390fd5b6097546040516001600160a01b038084169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a3609780546001600160a01b0319166001600160a01b0392909216919091179055565b3390565b6001600160a01b0383166108ce5760405162461bcd60e51b8152600401808060200182810382526024815260200180610da06024913960400191505060405180910390fd5b6001600160a01b0382166109135760405162461bcd60e51b8152600401808060200182810382526022815260200180610d0b6022913960400191505060405180910390fd5b6001600160a01b03808416600081815260666020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b0383166109ba5760405162461bcd60e51b8152600401808060200182810382526025815260200180610d7b6025913960400191505060405180910390fd5b6001600160a01b0382166109ff5760405162461bcd60e51b8152600401808060200182810382526023815260200180610cc26023913960400191505060405180910390fd5b610a0a838383610cbc565b610a4781604051806060016040528060268152602001610d2d602691396001600160a01b0386166000908152606560205260409020549190610ad2565b6001600160a01b038085166000908152606560205260408082209390935590841681522054610a769082610b69565b6001600160a01b0380841660008181526065602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b60008184841115610b615760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610b26578181015183820152602001610b0e565b50505050905090810190601f168015610b535780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b600082820183811015610bc3576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b9392505050565b6001600160a01b038216610c25576040805162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b610c3160008383610cbc565b606754610c3e9082610b69565b6067556001600160a01b038216600090815260656020526040902054610c649082610b69565b6001600160a01b03831660008181526065602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b50505056fe45524332303a207472616e7366657220746f20746865207a65726f20616464726573734f776e61626c653a206e6577206f776e657220697320746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa2646970667358221220efeb0d7a91a21436575e761c28321a240d4f47ccdf240abaa8b9c1feb18da33364736f6c634300060c0033436f6e747261637420696e7374616e63652068617320616c7265616479206265656e20696e697469616c697a6564";