// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/cryptography/MerkleProofUpgradeable.sol";
import "interfaces/stakehound/ICumulativeMultiTokenMerkleDistributor.sol";
import "interfaces/stakehound/IStakedToken.sol";

contract Multiplexer is Initializable, AccessControlUpgradeable, ICumulativeMultiTokenMerkleDistributor, PausableUpgradeable {
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    event RootProposed(uint256 cycle, bytes32 root, bytes32 contentHash, uint256 endBlock);
    event RootValidated(uint256 cycle, bytes32 root, bytes32 contentHash, uint256 endBlock);

    struct MerkleData {
        bytes32 root;
        bytes32 contentHash;
        uint256 cycle;
        uint256 endBlock;
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
        require(hasRole(ROOT_PROPOSER_ROLE, msg.sender), "onlyRootProposer");
    }

    function _onlyRootValidator() internal view {
        require(hasRole(ROOT_VALIDATOR_ROLE, msg.sender), "onlyRootValidator");
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

    function valueFromShares(address _stakedToken, uint256 shares) internal view returns (uint256) {
        uint256 sharesPerToken = IStakedToken(_stakedToken).totalShares() / IStakedToken(_stakedToken).totalSupply();
        return shares / sharesPerToken;
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
        uint256[] calldata cumulativeStAmounts,
        address account,
        uint256 cycle
    ) public view returns (bytes memory encoded, bytes32 hash) {
        encoded = abi.encode(account, cycle, tokens, cumulativeAmounts, cumulativeStAmounts);
        hash = keccak256(encoded);
    }

    /// @notice Claim accumulated rewards for a set of tokens at a given cycle number
    /// @notice First part of tokens are normal ERC20, second part of tokens are stTokens
    function claim(
        address[] calldata tokens,
        uint256[] calldata cumulativeAmounts,
        uint256[] calldata cumulativeStAmounts,
        uint256 cycle,
        bytes32[] calldata merkleProof
    ) external whenNotPaused {
        require(cycle == lastPublishedMerkleData.cycle, "Invalid cycle");
        {
            // Fix stack too deep
            // Verify the merkle proof.
            bytes32 node = keccak256(abi.encode(msg.sender, cycle, tokens, cumulativeAmounts, cumulativeStAmounts));
            require(MerkleProofUpgradeable.verify(merkleProof, lastPublishedMerkleData.root, node), "Invalid proof");
        }
        // Claim each token
        uint256 cumALen = cumulativeAmounts.length;
        // First we claim the normal ERC20 tokens
        for (uint256 i; i < cumALen; i++) {
            address token = tokens[i];
            uint256 cumAmt = cumulativeAmounts[i];
            uint256 claimable = cumAmt.sub(claimed[msg.sender][token]);

            require(claimable > 0, "Excessive claim");

            claimed[msg.sender][token] = claimed[msg.sender][token].add(claimable);

            require(claimed[msg.sender][token] == cumAmt, "Claimed amount mismatch");
            IERC20Upgradeable(token).safeTransfer(msg.sender, claimable);

            emit Claimed(msg.sender, tokens[i], claimable, cycle, now, block.number);
        }
        uint256 cumStALen = cumulativeStAmounts.length;
        for (uint256 i = 0; i < cumStALen; i++) {
            address token = tokens[cumALen + i];
            uint256 cumStAmt = cumulativeStAmounts[i];
            uint256 claimable = cumStAmt.sub(claimed[msg.sender][token]);

            require(claimable > 0, "Excessive claim");

            claimed[msg.sender][token] = claimed[msg.sender][token].add(claimable);

            require(claimed[msg.sender][token] == cumStAmt, "Claimed amount mismatch");
            IERC20Upgradeable(token).safeTransfer(msg.sender, valueFromShares(token, claimable));

            emit Claimed(msg.sender, token, claimable, cycle, now, block.number);
        }
    }

    // ===== Root Updater Restricted =====

    /// @notice Propose a new root and content hash, which will be stored as pending until approved
    function proposeRoot(
        bytes32 root,
        bytes32 contentHash,
        uint256 cycle,
        uint256 endBlock
    ) external whenNotPaused {
        _onlyRootProposer();
        require(cycle == lastPublishedMerkleData.cycle.add(1), "Incorrect cycle");
        require(endBlock > lastProposedMerkleData.endBlock, "Cannot publish root with earlier end block");
        require(block.number.sub(endBlock) >= 30, "Endblock must be at least 30 blocks behind");
        lastProposedMerkleData = MerkleData(root, contentHash, cycle, endBlock);

        emit RootProposed(cycle, root, contentHash, endBlock);
    }

    /// ===== Root Validator Restricted =====

    /// @notice Approve the current pending root and content hash
    function approveRoot(
        bytes32 root,
        bytes32 contentHash,
        uint256 cycle,
        uint256 endBlock
    ) external whenNotPaused {
        _onlyRootValidator();

        require(root == lastProposedMerkleData.root, "Incorrect root");
        require(contentHash == lastProposedMerkleData.contentHash, "Incorrect content hash");
        require(cycle == lastProposedMerkleData.cycle, "Incorrect cycle");
        require(endBlock == lastProposedMerkleData.endBlock, "Incorrect cycle end block");

        lastPublishedMerkleData = MerkleData(root, contentHash, cycle, endBlock);

        emit RootValidated(cycle, root, contentHash, endBlock);
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
