pragma solidity ^0.6.12;

import "deps/@openzeppelin/contracts-upgradeable/cryptography/MerkleProofUpgradeable.sol";

contract MerkleMock {
    function verify(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) external pure returns (bool) {
        return MerkleProofUpgradeable.verify(proof, root, leaf);
    }
}
