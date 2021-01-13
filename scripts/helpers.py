from brownie import *

name_to_artifact = {
    "RewardsEscrow": RewardsEscrow,
    "StakehoundGeyser": StakehoundGeyser,
    "Multiplexer": Multiplexer,
}
    # "StakingRewards": StakingRewards,
    # "SmartVesting": SmartVesting,
    # "SmartTimelock": SmartTimelock,
    # "BadgerHunt": BadgerHunt,
    # "SimpleTimelock": SimpleTimelock,
    # "Controller": Controller,
    # "Sett": Sett,
    # "SettV1": Sett,
    # "SettV1.1": Sett,
    # "StakingRewardsSignalOnly": StakingRewardsSignalOnly,
    # "StrategyBadgerRewards": StrategyBadgerRewards,
    # "StrategyBadgerLpMetaFarm": StrategyBadgerLpMetaFarm,
    # "StrategyHarvestMetaFarm": StrategyHarvestMetaFarm,
    # "StrategyPickleMetaFarm": StrategyPickleMetaFarm,
    # "StrategyCurveGaugeTbtcCrv": StrategyCurveGaugeTbtcCrv,
    # "StrategyCurveGaugeSbtcCrv": StrategyCurveGaugeSbtcCrv,
    # "StrategyCurveGaugeRenBtcCrv": StrategyCurveGaugeRenBtcCrv,
    # "StrategySushiBadgerWbtc": StrategySushiBadgerWbtc,
    # "StrategySushiLpOptimizer": StrategySushiLpOptimizer,
    # "HoneypotMeme": HoneypotMeme,


def strategy_name_to_artifact(name):
    return name_to_artifact[name]