import json
import time

from brownie import Wei, web3
from dotmap import DotMap
from helpers.constants import AddressZero
from helpers.registry import registry
from helpers.time_utils import days, hours

governance_token_total_supply = Wei("21000000 ether")

multisig_config = DotMap(
    address="0xB65cef03b9B89f99517643226d76e286ee999e77",
    owners=[
        "0xe24b6bF43d4624B2E146D3F871e19b7ECb811208",
        "0x211b82242076792A07C7554A5B968F0DE4414938",
        "0xe7bab002A39f9672a1bD0E949d3128eeBd883575",
        "0x59c68A651a1f49C26145666E9D5647B1472912A9",
        "0x15b8Fe651C268cfb5b519cC7E98bd45C162313C2",
    ],
)

dao_config = DotMap(
    initialOwner=web3.toChecksumAddress(""), token="", kernel="", agent="",
)

globalStartTime = 1607014800

stakehound_config = DotMap(
    prod_json="deploy-final.json",
    test_mode=False,
    startMultiplier=1,
    endMultiplier=3,
    multisig=multisig_config,
    dao=dao_config,
    globalStartTime=globalStartTime,
    devMultisigParams=DotMap(
        threshold=1,
        to=AddressZero,
        data="0x",
        fallbackHandler=AddressZero,
        paymentToken=AddressZero,
        payment=0,
        paymentReceiver=AddressZero,
    ),
    daoParams=DotMap(
        tokenName="StakehoundGovernance",
        tokenSymbol="GOV",
        id="stakehound",
        initialSupply=governance_token_total_supply,
        financePeriod=0,
        useAgentAsVault=True,
        supportRequired=Wei("0.5 ether"),
        minAcceptanceQuorum=Wei("0.05 ether"),
        voteDuration=days(3),
    ),
    geyserParams=DotMap(
        initialSharesPerToken=10 ** 6,
        founderRewardPercentage=0,
        distributionStart=globalStartTime,
        unlockSchedules=DotMap(
            test=[DotMap(amount=Wei("45000 ether"), duration=days(7),)],  # 1 week
        ),
    ),
)

config = DotMap(stakehound=stakehound_config)
