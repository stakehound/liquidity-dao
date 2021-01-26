// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

/*
    Cumulative Merkle distributor
*/
interface ICumulativeMultiTokenMerkleDistributor {
    /// @notice Emit when insufficient funds to handle incoming root totals
    event InsufficientFundsForRoot(bytes32 indexed root);

    event RootProposed(uint256 cycle, bytes32 root, bytes32 contentHash, uint256 endBlock);
    event RootValidated(uint256 cycle, bytes32 root, bytes32 contentHash, uint256 endBlock);
    event Claimed(address indexed user, address indexed token, uint256 amount, uint256 indexed cycle, uint256 timestamp, uint256 blockNumber);
}
