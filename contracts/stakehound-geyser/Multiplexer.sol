// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "deps/@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "deps/@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "deps/@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "deps/@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "deps/@openzeppelin/contracts-upgradeable/cryptography/MerkleProofUpgradeable.sol";
import "interfaces/stakehound/ICumulativeMultiTokenMerkleDistributor.sol";

contract Multiplexer is Initializable, AccessControlUpgradeable, ICumulativeMultiTokenMerkleDistributor, PausableUpgradeable {
    using SafeMathUpgradeable for uint256;

    event RootProposed(uint256 cycle, bytes32 root, bytes32 contentHash, uint256 timestamp, uint256 blockNumber);
    event RootValidated(uint256 cycle, bytes32 root, bytes32 contentHash, uint256 timestamp, uint256 blockNumber);

    struct MerkleData {
        bytes32 root;
        bytes32 contentHash;
        uint256 cycle;
        uint256 startBlock;
        uint256 endBlock;
        uint256 uploadBlock;
    }

    bytes32 public constant ROOT_PROPOSER_ROLE = keccak256("ROOT_PROPOSER_ROLE");
    bytes32 public constant ROOT_VALIDATOR_ROLE = keccak256("ROOT_VALIDATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UNPAUSER_ROLE = keccak256("UNPAUSER_ROLE");

    MerkleData public lastProposedMerkleData;
    MerkleData public lastPublishedMerkleData;

    mapping(address => mapping(address => uint256)) public claimed;
    mapping(address => uint256) public totalClaimed;

    function initialize(
        address admin,
        address initialProposer,
        address initialValidator
    ) public initializer {
        __AccessControl_init();
        __Pausable_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, admin); // The admin can edit all role permissions
        _setupRole(ROOT_PROPOSER_ROLE, initialProposer);
        _setupRole(ROOT_VALIDATOR_ROLE, initialValidator);
    }

    /// ===== Modifiers =====

    /// @notice Admins can approve new root updaters or admins
    function _onlyAdmin() internal view {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "onlyAdmin");
    }

    /// @notice Root updaters can update the root
    function _onlyRootProposer() internal view {
        require(hasRole(ROOT_PROPOSER_ROLE, msg.sender), "onlyRootUpdater");
    }

    function _onlyRootValidator() internal view {
        require(hasRole(ROOT_PROPOSER_ROLE, msg.sender), "onlyRootUpdater");
    }

    function _onlyPauser() internal view {
        require(hasRole(PAUSER_ROLE, msg.sender), "onlyGuardian");
    }

    function _onlyUnpauser() internal view {
        require(hasRole(UNPAUSER_ROLE, msg.sender), "onlyGuardian");
    }

    function getCurrentMerkleData() external view returns (MerkleData memory) {
        return lastPublishedMerkleData;
    }

    function getPendingMerkleData() external view returns (MerkleData memory) {
        return lastProposedMerkleData;
    }

    function hasPendingRoot() external view returns (bool) {
        return lastProposedMerkleData.cycle == lastPublishedMerkleData.cycle.add(1);
    }

    function getClaimedFor(address user, address[] memory tokens) public view returns (address[] memory, uint256[] memory) {
        uint256[] memory userClaimed = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            userClaimed[i] = claimed[user][tokens[i]];
        }
        return (tokens, userClaimed);
    }

    function encodeClaim(
        address[] calldata tokens,
        uint256[] calldata cumulativeAmounts,
        address account,
        uint256 index,
        uint256 cycle
    ) public view returns (bytes memory encoded, bytes32 hash) {
        encoded = abi.encodePacked(index, account, cycle, tokens, cumulativeAmounts);
        hash = keccak256(encoded);
    }

    /// @notice Claim accumulated rewards for a set of tokens at a given cycle number
    function claim(
        address[] calldata tokens,
        uint256[] calldata cumulativeAmounts,
        uint256 index,
        uint256 cycle,
        bytes32[] calldata merkleProof
    ) external whenNotPaused {
        require(cycle == lastPublishedMerkleData.cycle, "Invalid cycle");

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, msg.sender, cycle, tokens, cumulativeAmounts));
        require(MerkleProofUpgradeable.verify(merkleProof, lastPublishedMerkleData.root, node), "Invalid proof");

        // Claim each token
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 claimable = cumulativeAmounts[i].sub(claimed[msg.sender][tokens[i]]);

            require(claimable > 0, "Excessive claim");

            claimed[msg.sender][tokens[i]] = claimed[msg.sender][tokens[i]].add(claimable);

            require(claimed[msg.sender][tokens[i]] == cumulativeAmounts[i], "Claimed amount mismatch");
            require(IERC20Upgradeable(tokens[i]).transfer(msg.sender, claimable), "Transfer failed");

            emit Claimed(msg.sender, tokens[i], claimable, cycle, now, block.number);
        }
    }

    // ===== Root Updater Restricted =====

    /// @notice Propose a new root and content hash, which will be stored as pending until approved
    function proposeRoot(
        bytes32 root,
        bytes32 contentHash,
        uint256 cycle,
        uint256 startBlock,
        uint256 endBlock
    ) external whenNotPaused {
        _onlyRootProposer();
        require(cycle == lastPublishedMerkleData.cycle.add(1), "Incorrect cycle");

        lastProposedMerkleData = MerkleData(root, contentHash, cycle, startBlock, endBlock, block.number);

        emit RootProposed(cycle, root, contentHash, now, block.number);
    }

    /// ===== Root Validator Restricted =====

    /// @notice Approve the current pending root and content hash
    function approveRoot(
        bytes32 root,
        bytes32 contentHash,
        uint256 cycle,
        uint256 startBlock,
        uint256 endBlock
    ) external whenNotPaused {
        _onlyRootValidator();
        
        require(root == lastProposedMerkleData.root, "Incorrect root");
        require(contentHash == lastProposedMerkleData.contentHash, "Incorrect content hash");
        require(cycle == lastProposedMerkleData.cycle, "Incorrect cycle");
        require(startBlock == lastProposedMerkleData.startBlock, "Incorrect cycle start block");
        require(endBlock == lastProposedMerkleData.endBlock, "Incorrect cycle end block");

        lastPublishedMerkleData = MerkleData(root, contentHash, cycle, startBlock, endBlock, block.number);

        emit RootValidated(cycle, root, contentHash, now, block.number);
    }

    /// ===== Guardian Restricted =====

    /// @notice Pause publishing of new roots
    function pause() external {
        _onlyPauser();
        _pause();
    }

    /// @notice Unpause publishing of new roots
    function unpause() external {
        _onlyUnpauser();
        _unpause();
    }
}
