from brownie import *
from dotmap import DotMap
from tabulate import tabulate

from helpers.registry import WhaleRegistryAction, whale_registry
from rich.console import Console
from scripts.systems.uniswap_system import UniswapSystem

console = Console()


def get_token_balances(accounts, tokens):
    balances = DotMap()
    for token in tokens:
        for account in accounts:
            balances.token.account = token.balanceOf(account)
    return balances


def distribute_from_whales(stakehound, recipient):

    console.print(
        "[green] 🐋 Transferring assets from whales for {} assets... 🐋 [/green]".format(
            len(whale_registry.items())
        )
    )

    # Normal Transfers
    for key, whale_config in whale_registry.items():
        # Handle special cases after all standard distributions
        if whale_config.special:
            continue
        if key != "_pytestfixturefunction":
            console.print(" -> {}".format(key))

            if whale_config.action == WhaleRegistryAction.DISTRIBUTE_FROM_CONTRACT:
                forceEther = ForceEther.deploy({"from": recipient})
                recipient.transfer(forceEther, Wei("1 ether"))
                forceEther.forceSend(whale_config.whale, {"from": recipient})

            token = interface.IERC20(whale_config.token)
            token.transfer(
                recipient,
                token.balanceOf(whale_config.whale) // 5,
                {"from": whale_config.whale},
            )

def distribute_test_ether(recipient, amount):
    """
    On test environments, transfer ETH from default ganache account to specified account
    """
    assert accounts[0].balance() >= amount
    accounts[0].transfer(recipient, amount)


def getTokenMetadata(address):
    token = interface.IERC20(address)
    name = token.name()
    symbol = token.symbol()
    return (name, symbol, address)

def balances(contracts, tokens):
    # Headers
    headers = []
    headers.append("contract")

    for token in tokens:
        headers.append(token.symbol())

    # Balances
    data = []
    for name, c in contracts.items():
        cData = []
        cData.append(name)
        for token in tokens:
            cData.append(token.balanceOf(c) / 1e18)
        data.append(cData)
    print(tabulate(data, headers=headers))
