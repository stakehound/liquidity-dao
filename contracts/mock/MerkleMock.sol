pragma solidity ^0.6.12;

import "@openzeppelin/contracts-upgradeable/cryptography/MerkleProofUpgradeable.sol";

contract MerkleMock {
    function verify(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) external pure returns (bool) {
        return MerkleProofUpgradeable.verify(proof, root, leaf);
    }

    function computeHash(bytes32[] memory proof, bytes32 leaf) external pure returns (bytes32[] memory) {
        bytes32 computedHash = leaf;
        bytes32[] memory dbughashes = new bytes32[](10);
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
            dbughashes[i] = computedHash;
        }

        // Check if the computed hash (root) is equal to the provided root
        return dbughashes;
    }
}
