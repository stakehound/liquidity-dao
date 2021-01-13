#!/usr/bin/python3
import json

from brownie import *
from config.stakehound_config import stakehound_config
# stakehound_total_supply
from helpers.constants import APPROVED_STAKER_ROLE
from helpers.registry import registry
from rich.console import Console
from scripts.systems.stakehound_system import StakehoundSystem, print_to_file
from tests.helpers import distribute_from_whales

console = Console()


def test_deploy(test=False, uniswap=True):
    # stakehound Deployer
    deployer = ""
    keeper = ""
    guardian = ""

    accounts.at(
        web3.toChecksumAddress("0xDA25ee226E534d868f0Dd8a459536b03fEE9079b"),
        force=True,
    )
    accounts.at(
        web3.toChecksumAddress("0x872213E29C85d7e30F1C8202FC47eD1Ec124BB1D"),
        force=True,
    )
    accounts.at(
        web3.toChecksumAddress("0x29F7F8896Fb913CF7f9949C623F896a154727919"),
        force=True,
    )

    if test:
        accounts.at(
            web3.toChecksumAddress("0xDA25ee226E534d868f0Dd8a459536b03fEE9079b"),
            force=True,
        )
    else:
        # Load accounts from keystore
        deployer = accounts.load("stakehound_deployer")
        keeper = accounts.load("stakehound_keeper")
        guardian = accounts.load("stakehound_guardian")

    # Ganache Accounts
    if test:
        accounts.at("0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", force=True)
        accounts.at("0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0", force=True)
        accounts.at("0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b", force=True)
        accounts.at("0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d", force=True)
        accounts.at("0xd03ea8624C8C5987235048901fB614fDcA89b117", force=True)
        accounts.at("0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC", force=True)
        accounts.at("0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9", force=True)
        accounts.at("0x28a8746e75304c0780E011BEd21C72cD78cd535E", force=True)
        accounts.at("0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E", force=True)
        accounts.at("0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e", force=True)

    # Unlocked Accounts
    if test:
        accounts.at(
            web3.toChecksumAddress("0x193991827e291599a262e7fa7d212ff1ae31d110"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0x97ca371d59bbfefdb391aa6dcbdf4455fec361f2"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0x3d24d77bec08549d7ea86c4e9937204c11e153f1"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0xcD9e6Df80169b6a2CFfDaE613fAbC3F7C3647B14"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0xaf379f0228ad0d46bb7b4f38f9dc9bcc1ad0360c"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0xc25099792e9349c7dd09759744ea681c7de2cb66"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0xb1f2cdec61db658f091671f5f199635aef202cac"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0x2bf792ffe8803585f74e06907900c2dc2c29adcb"),
            force=True,
        )

        # Test Accounts
        accounts.at(
            web3.toChecksumAddress("0xe7bab002A39f9672a1bD0E949d3128eeBd883575"),
            force=True,
        )
        accounts.at(
            web3.toChecksumAddress("0x482c741b0711624d1f462E56EE5D8f776d5970dC"),
            force=True,
        )

        deployer = accounts.at(
            web3.toChecksumAddress(("0xDA25ee226E534d868f0Dd8a459536b03fEE9079b"))
        )

        keeper = accounts.at(
            web3.toChecksumAddress(("0xDA25ee226E534d868f0Dd8a459536b03fEE9079b"))
        )

        guardian = accounts.at(
            web3.toChecksumAddress(("0xDA25ee226E534d868f0Dd8a459536b03fEE9079b"))
        )

    print(
        "Initialize stakehound System",
        {"deployer": deployer, "keeper": keeper, "guardian": guardian},
    )

    print(deployer.balance())
    # ClaimEncoder.deploy({'from': deployer})

    # assert False

    stakehound = StakehoundSystem(stakehound_config, None, deployer, keeper, guardian, deploy=False)
    stakehound.test = test

    stakehound_deploy_file = "deploy-final.json"
    print("Connecting to deploy at " + stakehound_deploy_file)
    with open(stakehound_deploy_file) as f:
        stakehound_deploy = json.load(f)

    print("Connect Logic Contracts")
    stakehound.connect_logic(stakehound_deploy["logic"])

    print("Create / Connect stakehound<>wBTC LP Pair")
    # pair = create_uniswap_pair(stakehound.token.address, registry.tokens.wbtc, deployer)
    factory = interface.IUniswapV2Factory(
        web3.toChecksumAddress(registry.uniswap.factoryV2)
    )
    # tx = factory.createPair(stakehound.token.address, registry.tokens.wbtc, {"from": deployer})
    pairAddress = factory.getPair(stakehound.token.address, registry.tokens.wbtc)
    pair = interface.IUniswapV2Pair(pairAddress)

    stakehound.pair = pair

    if uniswap:
        print("Test: Distribute assets to deployer")
        accounts.at(stakehound_config.dao.initialOwner, force=True)
        stakehound.token.transfer(
            deployer, stakehound_total_supply, {"from": stakehound_config.dao.initialOwner}
        )
        console.log(
            "after initial token transfer",
            stakehound.token.balanceOf(deployer) / 1e18,
            stakehound_total_supply,
        )
        assert stakehound.token.balanceOf(deployer) == stakehound_total_supply
        distribute_from_whales(stakehound, deployer)

        console.log("after whale funding", stakehound.token.balanceOf(deployer) / 1e18)

        print("Test: Add stakehound<>wBTC Liquidity")
        wbtc = interface.IERC20(registry.tokens.wbtc)

        # In test mode, add liqudity to uniswap
        stakehound.uniswap.addMaxLiquidity(stakehound.token, wbtc, deployer)

    # print("Deploy core logic")
    # stakehound.deploy_core_logic()

    # print("Deploy Sett core logic")
    # stakehound.deploy_sett_core_logic()
    # stakehound.deploy_sett_strategy_logic()

    console.log("before deploys", stakehound.token.balanceOf(deployer) / 1e18)

    print("Deploy rewards & vesting infrastructure")
    # stakehound.deploy_rewards_escrow()
    # stakehound.deploy_stakehound_tree()
    # stakehound.deploy_dao_stakehound_timelock()
    # stakehound.deploy_team_vesting()
    # stakehound.deploy_stakehound_hunt()

    # print("Connect Rewards and Vesting Infrastructure")
    stakehound.connect_rewards_escrow(stakehound_deploy["rewardsEscrow"])
    stakehound.connect_stakehound_tree(stakehound_deploy["stakehoundTree"])
    stakehound.connect_dao_stakehound_timelock(stakehound_deploy["daostakehoundTimelock"])
    stakehound.connect_team_vesting(stakehound_deploy["teamVesting"])
    stakehound.connect_stakehound_hunt(stakehound_deploy["stakehoundHunt"])

    console.log("after reward infra deploys", stakehound.token.balanceOf(deployer) / 1e18)

    print("Deploy Sett controllers")
    # stakehound.add_controller("native")
    # stakehound.add_controller("harvest")

    stakehound.connect_controller(
        "native", stakehound_deploy["sett_system"]["controllers"]["native"]
    )
    stakehound.connect_controller(
        "harvest", stakehound_deploy["sett_system"]["controllers"]["harvest"]
    )

    print("Deploy native Sett vaults")
    controller = stakehound.getController("native")
    # stakehound.deploy_sett("native.stakehound", stakehound.token, controller)
    # stakehound.deploy_sett("native.renCrv", registry.curve.pools.renCrv.token, controller)
    # stakehound.deploy_sett("native.sbtcCrv", registry.curve.pools.sbtcCrv.token, controller)
    # stakehound.deploy_sett("native.tbtcCrv", registry.curve.pools.tbtcCrv.token, controller)
    # stakehound.deploy_sett("native.unistakehoundWbtc", stakehound.pair.address, controller)

    settSystem = stakehound_deploy["sett_system"]
    stakehound.connect_sett("native.stakehound", settSystem["vaults"]["native.stakehound"])
    stakehound.connect_sett("native.renCrv", settSystem["vaults"]["native.renCrv"])
    stakehound.connect_sett(
        "native.sbtcCrv", stakehound_deploy["sett_system"]["vaults"]["native.sbtcCrv"]
    )
    stakehound.connect_sett(
        "native.tbtcCrv", stakehound_deploy["sett_system"]["vaults"]["native.tbtcCrv"]
    )
    stakehound.connect_sett(
        "native.unistakehoundWbtc",
        stakehound_deploy["sett_system"]["vaults"]["native.unistakehoundWbtc"],
    )

    print("Deploy & configure native Sett strategies")
    print("Deploy vault-specific staking rewards")
    # stakehound.deploy_sett_staking_rewards("native.stakehound", stakehound.token, stakehound.token)

    # stakehound.deploy_sett_staking_rewards(
    #     "native.unistakehoundWbtc", pair.address, stakehound.token
    # )

    stakehound.connect_sett_staking_rewards(
        "native.stakehound", settSystem["rewards"]["native.stakehound"]
    )
    stakehound.connect_sett_staking_rewards(
        "native.unistakehoundWbtc", settSystem["rewards"]["native.unistakehoundWbtc"]
    )

    print("Strategy: Native stakehound")
    # stakehound.deploy_strategy_native_stakehound()
    stakehound.connect_strategy(
        "native.stakehound",
        settSystem["strategies"]["native.stakehound"],
        "StrategystakehoundRewards",
    )

    print("Strategy: Native RenCrv")
    # stakehound.deploy_strategy_native_rencrv()
    stakehound.connect_strategy(
        "native.renCrv",
        settSystem["strategies"]["native.renCrv"],
        "StrategyCurveGaugeRenBtcCrv",
    )

    print("Strategy: Native sBtcCrv")
    # stakehound.deploy_strategy_native_sbtccrv()
    stakehound.connect_strategy(
        "native.sbtcCrv",
        settSystem["strategies"]["native.sbtcCrv"],
        "StrategyCurveGaugeSbtcCrv",
    )

    print("Strategy: Native tBtcCrv")
    # stakehound.deploy_strategy_native_tbtccrv()
    stakehound.connect_strategy(
        "native.tbtCcrv",
        settSystem["strategies"]["native.tbtcCrv"],
        "StrategyCurveGaugeTbtcCrv",
    )

    print("Strategy: Native unistakehoundWbtc")
    # stakehound.deploy_strategy_native_unistakehoundWbtc()
    stakehound.connect_strategy(
        "native.unistakehoundWbtc",
        settSystem["strategies"]["native.unistakehoundWbtc"],
        "StrategystakehoundLpMetaFarm",
    )

    print("Deploy harvest Sett vaults")
    controller = stakehound.getController("harvest")
    # stakehound.deploy_sett(
    #     "harvest.renCrv",
    #     registry.curve.pools.renCrv.token,
    #     controller,
    #     namePrefixOverride=True,
    #     namePrefix="stakehound SuperSett (Harvest) ",
    #     symbolPrefix="bSuper",
    # )

    stakehound.connect_sett("harvest.renCrv", settSystem["vaults"]["harvest.renCrv"])

    print("Deploy & configure harvest Sett strategies")
    # stakehound.deploy_strategy_harvest_rencrv()

    stakehound.connect_strategy(
        "harvest.renCrv",
        settSystem["strategies"]["harvest.renCrv"],
        "StrategyHarvestMetaFarm",
    )

    # print("Deploy reward geysers")
    # stakehound.deploy_geyser(stakehound.getSett("native.stakehound"), "native.stakehound")
    # stakehound.deploy_geyser(stakehound.getSett("native.renCrv"), "native.renCrv")
    # stakehound.deploy_geyser(stakehound.getSett("native.sbtcCrv"), "native.sbtcCrv")
    # stakehound.deploy_geyser(stakehound.getSett("native.tbtcCrv"), "native.tbtcCrv")
    # stakehound.deploy_geyser(stakehound.getSett("native.unistakehoundWbtc"), "native.unistakehoundWbtc")
    # stakehound.deploy_geyser(stakehound.getSett("harvest.renCrv"), "harvest.renCrv")

    print("Connect reward geysers")
    stakehound.connect_geyser("native.stakehound", stakehound_deploy["geysers"]["native.stakehound"])
    stakehound.connect_geyser("native.renCrv", stakehound_deploy["geysers"]["native.renCrv"])
    stakehound.connect_geyser("native.sbtcCrv", stakehound_deploy["geysers"]["native.sbtcCrv"])
    stakehound.connect_geyser("native.tbtcCrv", stakehound_deploy["geysers"]["native.tbtcCrv"])
    stakehound.connect_geyser(
        "native.unistakehoundWbtc", stakehound_deploy["geysers"]["native.unistakehoundWbtc"]
    )
    stakehound.connect_geyser("harvest.renCrv", stakehound_deploy["geysers"]["harvest.renCrv"])

    # Transfer ownership of all sett Rewards contracts to multisig
    # Transfer proxyAdmin to multisig

    console.log("after deploys", stakehound.token.balanceOf(deployer) / 1e18)

    return stakehound


def post_deploy_config(stakehound: StakehoundSystem):
    deployer = stakehound.deployer

    """
    Set initial conditions on immediate post-deploy stakehound

    Transfer tokens to thier initial locations
        - Rewards Escrow (40%, minus tokens initially distributed via Sett Special StakingRewards)
        - stakehound Hunt (15%)
        - DAO Timelock (35%)
        - Founder Rewards (10%)
    """

    # Approve stakehoundTree to recieve rewards tokens
    print(deployer)
    print(stakehound.rewardsEscrow.owner())
    # stakehound.rewardsEscrow.approveRecipient(stakehound.stakehoundTree, {"from": deployer})

    # stakehound.rewardsEscrow.approveRecipient(
    #     stakehound.getGeyser("native.stakehound"), {"from": deployer}
    # )

    # stakehound.rewardsEscrow.approveRecipient(
    #     stakehound.getGeyser("native.unistakehoundWbtc"), {"from": deployer}
    # )

    # stakehound.rewardsEscrow.approveRecipient(
    #     stakehound.getGeyser("native.renCrv"), {"from": deployer}
    # )

    # stakehound.rewardsEscrow.approveRecipient(
    #     stakehound.getGeyser("native.sbtcCrv"), {"from": deployer}
    # )

    # stakehound.rewardsEscrow.approveRecipient(
    #     stakehound.getGeyser("native.tbtcCrv"), {"from": deployer}
    # )

    # stakehound.rewardsEscrow.approveRecipient(
    #     stakehound.getGeyser("harvest.renCrv"), {"from": deployer}
    # )

    # console.log("before signal locks", stakehound.token.balanceOf(deployer) / 1e18)

    # # Geyser Signals
    # """
    #     These signals are used to calculate the rewards distributions distributed via stakehoundTree. The tokens are actually held in the RewardsEscrow and sent to the stakehoundTree as needed.

    #     The escrow will only send a few days worth of rewards initially at a time to the RewardsTree as another failsafe mechanism.

    #     renbtcCRV — 76750 $stakehound
    #     sbtcCRV — 76,750 $stakehound
    #     tbtcCRV — 76,750 $stakehound
    #     stakehound — 90,000 $stakehound / 2
    #         - 45000 in Sett StakingRewards
    #         - 45000 in Geyser
    #     stakehound <>wBTC Uniswap LP — 130,000 $stakehound / 2
    #         - 65000 in Sett StakingRewards
    #         - 65000 in Geyser
    #     Super Sett
    #     Pickle renbtcCRV — 76,750 $stakehound
    #     Harvest renbtc CRV — 76,750 $stakehound
    # """

    # stakehound.signal_token_lock(
    #     "native.stakehound", stakehound_config.geyserParams.unlockSchedules.stakehound[0]
    # )

    # stakehound.signal_token_lock(
    #     "native.unistakehoundWbtc",
    #     stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[0],
    # )

    # stakehound.signal_token_lock(
    #     "native.renCrv", stakehound_config.geyserParams.unlockSchedules.bRenCrv[0]
    # )

    # stakehound.signal_token_lock(
    #     "native.sbtcCrv", stakehound_config.geyserParams.unlockSchedules.bSbtcCrv[0]
    # )

    # stakehound.signal_token_lock(
    #     "native.tbtcCrv", stakehound_config.geyserParams.unlockSchedules.bTbtcCrv[0]
    # )

    # stakehound.signal_token_lock(
    #     "harvest.renCrv",
    #     stakehound_config.geyserParams.unlockSchedules.bSuperRenCrvHarvest[0],
    # )

    # console.log(
    #     "before initial token distribution", stakehound.token.balanceOf(deployer) / 1e18
    # )

    # ===== Initial Token Distribution =====
    # == Native stakehound ==
    rewards = stakehound.getSettRewards("native.stakehound")
    strategy = stakehound.getStrategy("native.stakehound")

    stakehound.distribute_staking_rewards(
        "native.stakehound",
        stakehound_config.geyserParams.unlockSchedules.stakehound[0].amount,
        notify=False,
    )
    rewards.grantRole(APPROVED_STAKER_ROLE, strategy, {"from": deployer})

    # == Uni LP ==
    rewards = stakehound.getSettRewards("native.unistakehoundWbtc")
    strategy = stakehound.getStrategy("native.unistakehoundWbtc")

    stakehound.distribute_staking_rewards(
        "native.unistakehoundWbtc",
        stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[0].amount,
        notify=False,
    )
    rewards.grantRole(APPROVED_STAKER_ROLE, strategy, {"from": deployer})

    console.log(
        "remaining after special pool distributions",
        stakehound.token.balanceOf(deployer) / 1e18,
    )

    distributedToPools = (
        stakehound_config.geyserParams.unlockSchedules.stakehound[0].amount
        + stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[0].amount
    )

    # print(
    #     stakehound_config.geyserParams.unlockSchedules.stakehound[0],
    #     stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[0],
    #     stakehound_config.geyserParams.unlockSchedules.bRenCrv[0],
    #     stakehound_config.geyserParams.unlockSchedules.bSbtcCrv[0],
    #     stakehound_config.geyserParams.unlockSchedules.bTbtcCrv[0],
    #     stakehound_config.geyserParams.unlockSchedules.bSuperRenCrvHarvest[0]
    # )

    supplyForWeek1Rewards = (
        stakehound_config.geyserParams.unlockSchedules.stakehound[0].amount
        + stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[0].amount
        + stakehound_config.geyserParams.unlockSchedules.bRenCrv[0].amount
        + stakehound_config.geyserParams.unlockSchedules.bSbtcCrv[0].amount
        + stakehound_config.geyserParams.unlockSchedules.bTbtcCrv[0].amount
        + stakehound_config.geyserParams.unlockSchedules.bSuperRenCrvHarvest[0].amount
    )

    toEscrow = (
        stakehound_config.rewardsEscrowstakehoundAmount
        - distributedToPools
        - supplyForWeek1Rewards
    )

    stakehound.initialRewardsEscrowBalance = toEscrow
    stakehound.initialstakehoundTreeBalance = supplyForWeek1Rewards

    console.log(locals(), stakehound_config.rewardsEscrowstakehoundAmount)

    # == stakehound Hunt ==
    stakehound.token.transfer(
        stakehound.stakehoundHunt, stakehound_config.huntParams.stakehoundAmount, {"from": deployer},
    )

    # == stakehound Tree ==
    stakehound.token.transfer(
        stakehound.stakehoundTree, supplyForWeek1Rewards, {"from": deployer},
    )

    # == Rewards Escrow ==
    stakehound.token.transfer(
        stakehound.rewardsEscrow, toEscrow, {"from": deployer},
    )

    # == DAO Timelock ==
    stakehound.token.transfer(
        stakehound.daostakehoundTimelock,
        stakehound_config.tokenLockParams.stakehoundLockAmount,
        {"from": deployer},
    )

    console.log("after daostakehoundTimelock", stakehound.token.balanceOf(deployer) / 1e18)

    # == Team Vesting ==
    stakehound.token.transfer(
        stakehound.teamVesting, stakehound_config.founderRewardsAmount, {"from": deployer}
    )

    tokenDistributionTargets = {
        "deployer": 0,
        "rewardsEscrow": toEscrow,
        "native.stakehound Pool": stakehound_config.geyserParams.unlockSchedules.stakehound[
            0
        ].amount,
        "native.unistakehoundWbtc Pool": stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[
            0
        ].amount,
        "native.stakehound geyser": stakehound_config.geyserParams.unlockSchedules.stakehound[
            0
        ].amount,
        "native.unistakehoundWbtc geyser": stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[
            0
        ].amount,
        "native.renCrv geyser": stakehound_config.geyserParams.unlockSchedules.bRenCrv[
            0
        ].amount,
        "native.sbtcCrv geyser": stakehound_config.geyserParams.unlockSchedules.bSbtcCrv[
            0
        ].amount,
        "native.tbtcCrv geyser": stakehound_config.geyserParams.unlockSchedules.bTbtcCrv[
            0
        ].amount,
        "harvest.renCrv geyser": stakehound_config.geyserParams.unlockSchedules.bSuperRenCrvHarvest[
            0
        ].amount,
        "daostakehoundTimelock": stakehound_config.tokenLockParams.stakehoundLockAmount,
        "teamVesting": stakehound_config.founderRewardsAmount,
        "stakehoundHunt": stakehound_config.huntParams.stakehoundAmount,
        "stakehoundTree": 0,
    }

    tokenDistributionBalances = {
        "deployer": stakehound.token.balanceOf(deployer),
        "rewardsEscrow": stakehound.token.balanceOf(stakehound.rewardsEscrow),
        "native.stakehound Pool": stakehound.token.balanceOf(
            stakehound.getSettRewards("native.stakehound")
        ),
        "native.unistakehoundWbtc Pool": stakehound.token.balanceOf(
            stakehound.getSettRewards("native.unistakehoundWbtc")
        ),
        "native.stakehound geyser": stakehound.token.balanceOf(
            stakehound.getGeyser("native.stakehound")
        ),
        "native.unistakehoundWbtc geyser": stakehound.token.balanceOf(
            stakehound.getGeyser("native.unistakehoundWbtc")
        ),
        "native.renCrv geyser": stakehound.token.balanceOf(
            stakehound.getGeyser("native.renCrv")
        ),
        "native.sbtcCrv geyser": stakehound.token.balanceOf(
            stakehound.getGeyser("native.sbtcCrv")
        ),
        "native.tbtcCrv geyser": stakehound.token.balanceOf(
            stakehound.getGeyser("native.tbtcCrv")
        ),
        "harvest.renCrv geyser": stakehound.token.balanceOf(
            stakehound.getGeyser("harvest.renCrv")
        ),
        "daostakehoundTimelock": stakehound.token.balanceOf(stakehound.daostakehoundTimelock),
        "teamVesting": stakehound.token.balanceOf(stakehound.teamVesting),
        "stakehoundHunt": stakehound.token.balanceOf(stakehound.stakehoundHunt),
        "stakehoundTree": stakehound.initialstakehoundTreeBalance,
    }

    if not stakehound.test:
        expectedSum = 0
        actualSum = 0
        for key, value in tokenDistributionTargets.items():
            print("expected", key, value / 1e18)
            print("actual", key, tokenDistributionBalances[key] / 1e18)
            expectedSum += value
            actualSum += tokenDistributionBalances[key]

        print("expectedSum", expectedSum / 1e18)
        print("actualSum", actualSum / 1e18)

        # assert expectedSum == stakehound_total_supply
        # assert actualSum == stakehound_total_supply

    console.log("after teamVesting", stakehound.token.balanceOf(deployer) / 1e18)

    """
    ===== Transfer Ownership =====
    - proxyAdmin should be owned by multisig
    - All contract owner / admin rights should be given to multisig
    """

    stakehound.rewardsEscrow.transferOwnership(stakehound.devMultisig, {"from": deployer})


def start_staking_rewards(stakehound: StakehoundSystem):
    """
    StakingRewards contracts start immediately when the first tokens are locked
    """
    # == stakehound ==
    deployer = stakehound.deployer
    rewards = stakehound.getSettRewards("native.stakehound")

    assert (
        stakehound.token.balanceOf(rewards)
        >= stakehound_config.geyserParams.unlockSchedules.stakehound[0].amount
    )
    assert rewards.stakingToken() == stakehound.token
    assert rewards.rewardsToken() == stakehound.token

    rewards.notifyRewardAmount(
        stakehound_config.geyserParams.unlockSchedules.stakehound[0].amount, {"from": deployer}
    )

    # == Uni LP ==
    rewards = stakehound.getSettRewards("native.unistakehoundWbtc")

    assert (
        stakehound.token.balanceOf(rewards)
        >= stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[0].amount
    )
    assert rewards.stakingToken() == stakehound.pair
    assert rewards.rewardsToken() == stakehound.token

    rewards.notifyRewardAmount(
        stakehound_config.geyserParams.unlockSchedules.unistakehoundWbtc[0].amount,
        {"from": deployer},
    )


def deploy_flow(test=False, outputToFile=True, uniswap=False):
    stakehound = test_deploy(test=test, uniswap=uniswap)
    print("Test: stakehound System Deployed")
    if outputToFile:
        fileName = "deploy-" + str(chain.id) + "final" + ".json"
        print("Printing contract addresses to ", fileName)
        print_to_file(stakehound, fileName)
    if not test:
        post_deploy_config(stakehound)
        start_staking_rewards(stakehound)
    print("Test: stakehound System Setup Complete")
    return stakehound


def main():
    return deploy_flow(test=True, outputToFile=False)