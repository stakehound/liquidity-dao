import time

from brownie import *
from config.stakehound_config import stakehound_config
from rich.console import Console
from scripts.systems.stakehound_system import connect_stakehound

from assistant.rewards.rewards_assistant import fetch_current_rewards_tree, run_action

console = Console()


def main():
    stakehound = connect_stakehound(stakehound_config.prod_json)

    # Get latest block rewards were updated
    currentMerkleData = stakehound.multiplexer.getCurrentMerkleData()
    console.log("currentMerkleData", currentMerkleData)

    print("Run at", int(time.time()))

    # Fetch the appropriate file
    currentRewards = fetch_current_rewards_tree(stakehound)

    lastClaimEnd = int(currentRewards["endBlock"])
    startBlock = lastClaimEnd + 1

    # Claim at current block
    claimAt = chain.height

    print("Claim Section", startBlock, claimAt)

    test = True

    print("TestMode", test)

    # If sufficient time has passed since last root proposal, propose a new root
    rootProposed = run_action(
        stakehound,
        {"action": "rootUpdater", "startBlock": startBlock, "endBlock": claimAt},
        test,
    )

    # If there is a pending root, approve after independently verifying it
    rootApproved = run_action(
        stakehound,
        {"action": "guardian", "startBlock": startBlock, "endBlock": claimAt},
        test,
    )
