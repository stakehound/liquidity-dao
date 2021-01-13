import json
import secrets

import brownie
import pytest
from assistant.rewards import rewards_assistant
from brownie import *
from helpers.constants import *
from helpers.registry import registry
from rich.console import Console

console = Console()


def random_32_bytes():
    return "0x" + secrets.token_hex(32)


@pytest.fixture(scope="function", autouse="True")
def setup(rewards_tree_unit):
    return rewards_tree_unit


@pytest.fixture(scope="function")
def setup_stakehound(stakehound_tree_unit):
    return stakehound_tree_unit


# @pytest.mark.skip()
def test_root_publish(setup):
    stakehoundTree = setup.stakehoundTree
    guardian = setup.guardian
    rootUpdater = setup.rootUpdater
    user = accounts[4]

    startingCycle = stakehoundTree.currentCycle()
    assert startingCycle == 0

    root = random_32_bytes()
    contentHash = random_32_bytes()

    assert rootUpdater != guardian

    # Ensure non-root updater cannot update root
    with brownie.reverts():
        stakehoundTree.proposeRoot(
            root, contentHash, stakehoundTree.currentCycle() + 1, {"from": guardian}
        )

    # Ensure root updater can propose new root, but not update
    stakehoundTree.proposeRoot(
        root, contentHash, stakehoundTree.currentCycle() + 1, {"from": rootUpdater}
    )

    assert stakehoundTree.getCurrentMerkleData()[0] == EmptyBytes32
    assert stakehoundTree.getCurrentMerkleData()[1] == EmptyBytes32
    assert stakehoundTree.currentCycle() == startingCycle

    assert stakehoundTree.pendingMerkleRoot() == root
    assert stakehoundTree.pendingMerkleContentHash() == contentHash

    # Ensure non-root approver cannot approve root
    with brownie.reverts():
        stakehoundTree.approveRoot(
            root, contentHash, stakehoundTree.currentCycle() + 1, {"from": rootUpdater}
        )

    stakehoundTree.approveRoot(
        root, contentHash, stakehoundTree.currentCycle() + 1, {"from": guardian}
    )

    assert stakehoundTree.getCurrentMerkleData()[0] == root
    assert stakehoundTree.getCurrentMerkleData()[1] == contentHash
    assert stakehoundTree.currentCycle() == startingCycle + 1

    oldRoot = root
    oldContentHash = contentHash

    root = random_32_bytes()
    contentHash = random_32_bytes()

    # Ensure root updater can update another root
    stakehoundTree.proposeRoot(
        root, contentHash, stakehoundTree.currentCycle() + 1, {"from": rootUpdater}
    )
    stakehoundTree.approveRoot(
        root, contentHash, stakehoundTree.currentCycle() + 1, {"from": guardian}
    )
    print(stakehoundTree.getCurrentMerkleData())
    assert stakehoundTree.getCurrentMerkleData()[0] == root
    assert stakehoundTree.getCurrentMerkleData()[1] == contentHash

    assert stakehoundTree.currentCycle() == startingCycle + 2


# @pytest.mark.skip()
def test_guardian_pause(setup):
    stakehoundTree = setup.stakehoundTree
    guardian = setup.guardian
    rootUpdater = setup.rootUpdater
    user = accounts[4]

    # Ensure non-guardian cannot pause
    with brownie.reverts():
        stakehoundTree.pause({"from": user})

    # Ensure guardian can pause
    stakehoundTree.pause({"from": guardian})

    # Ensure root updater cannot update root while paused
    with brownie.reverts():
        stakehoundTree.proposeRoot(
            random_32_bytes(), random_32_bytes(), 1, {"from": rootUpdater}
        )

    # Ensure non-root updater cannot update root while paused
    with brownie.reverts():
        stakehoundTree.proposeRoot(random_32_bytes(), random_32_bytes(), 1, {"from": user})

    # Ensure non-guardian cannot unpause
    with brownie.reverts():
        stakehoundTree.unpause({"from": user})

    # Ensure guardian can unpause
    stakehoundTree.unpause({"from": guardian})

    # Ensure non-root updater cannot update root after unpause
    root = random_32_bytes()
    contentHash = random_32_bytes()
    with brownie.reverts():
        stakehoundTree.proposeRoot(
            root, contentHash, stakehoundTree.currentCycle() + 1, {"from": user}
        )

    # Ensure root updater can update root after unpause
    stakehoundTree.proposeRoot(
        root, contentHash, stakehoundTree.currentCycle() + 1, {"from": rootUpdater}
    )
    stakehoundTree.approveRoot(
        root, contentHash, stakehoundTree.currentCycle() + 1, {"from": guardian}
    )

    assert stakehoundTree.getCurrentMerkleData()[0] == root
    assert stakehoundTree.getCurrentMerkleData()[1] == contentHash


def get_claim_data_for(account):
    userData = exampleRewards["claims"][account]
    return {
        "cumulativeAmounts": userData["cumulativeAmounts"],
        "index": int(userData["index"], 16),
        "proof": userData["proof"],
        "node": userData["node"],
    }


# @pytest.mark.skip()
# def test_claim_single_token(setup_stakehound):
#     setup = setup_stakehound
#     stakehoundTree = setup.stakehoundTree
#     deployer = setup.deployer
#     guardian = setup.guardian
#     updater = setup.updater

#     claimers = [
#         accounts.at("0xDA25ee226E534d868f0Dd8a459536b03fEE9079b"),
#         accounts.at("0x33A4622B82D4c04a53e170c638B944ce27cffce3"),
#     ]

#     tokens = [setup.token.address, registry.harvest.farmToken]
#     singleToken = [setup.token.address]

#     contentHash = "0xff743182b232f07941d5ecf8279f0a68d80306afb8b3d48edaffb24585895901"
#     root = exampleRewards["merkleRoot"]
#     nextCycle = 1

#     # Set data
#     stakehoundTree.proposeRoot(root, contentHash, nextCycle, {"from": deployer})
#     stakehoundTree.approveRoot(root, contentHash, nextCycle, {"from": guardian})

#     for claimer in claimers:
#         claimed = stakehoundTree.getClaimedFor(claimer, singleToken)
#         print("claimed", claimed)

#         claimData = get_claim_data_for(claimer)

#         cumulativeAmount = claimData["cumulativeAmounts"][0]
#         print("cumulativeAmount", cumulativeAmount)

#         (expectedEncoded, expectedHash) = stakehoundTree.encodeClaim(
#             singleToken, [cumulativeAmount], claimData["index"], nextCycle
#         )

#         print(
#             {
#                 "expected": expectedEncoded,
#                 "expectedLen": len(expectedEncoded),
#                 "found": claimData["node"],
#                 "foundLen": len(claimData["node"]),
#             }
#         )
#         # print(expectedEncoded, expectedHash)

#         stakehoundTree.claim(
#             singleToken,
#             [cumulativeAmount],
#             claimData["index"],
#             nextCycle,
#             claimData["proof"],
#             {"from": claimer},
#         )


@pytest.mark.skip()
def test_token_claim_limits():
    # Generate root with massive claimable
    # Ensure claim is stopped by the invariant check
    # Pause root
    # Upload fixed root
    #
    assert False


@pytest.mark.skip()
def test_token_claim_e2e():
    """
    TODO: Finish all unit tests first
    """
    # Generate realistic data using staking actions
    # Ensure expected results for each user match claimed
    assert False


@pytest.mark.skip()
def test_override_cycle():
    assert False