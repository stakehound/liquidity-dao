from brownie.network.gas.strategies import GasNowScalingStrategy
from helpers.sett.strategy_registry import strategy_name_to_artifact
import json
import decouple

from scripts.systems.uniswap_system import UniswapSystem
from scripts.systems.gnosis_safe_system import connect_gnosis_safe
from helpers.proxy_utils import deploy_proxy, deploy_proxy_admin
from brownie import *
from helpers.registry import registry
from dotmap import DotMap
from config.stakehound_config import (
    stakehound_config,
    sett_config,
)
from scripts.systems.sett_system import (
    deploy_controller,
    deploy_strategy,
)
from helpers.sett.strategy_registry import name_to_artifact

from rich.console import Console

console = Console()


def deploy_geyser(stakehound, stakingToken):
    pool_input = DotMap(
        stakingToken=stakingToken.address,
        initialDistributionToken=stakehound.token.address,
    )

    return deploy_proxy(
        "StakehoundGeyser",
        StakehoundGeyser.abi,
        stakehound.logic.StakehoundGeyser.address,
        stakehound.devProxyAdmin.address,
        stakehound.logic.StakehoundGeyser.initialize.encode_input(
            pool_input["stakingToken"],
            pool_input["initialDistributionToken"],
            stakehound_config.geyserParams.badgerDistributionStart,
            stakehound.devMultisig.address,
            stakehound.rewardsEscrow.address,
        ),
        stakehound.deployer,
    )


def print_to_file(stakehound, path):
    system = {
        "globalStartBlock": stakehound.globalStartBlock,
        "deployer": stakehound.deployer.address,
        "guardian": stakehound.guardian.address,
        "keeper": stakehound.keeper.address,
        "devProxyAdmin": stakehound.devProxyAdmin.address,
        "daoProxyAdmin": stakehound.daoProxyAdmin.address,
        "devMultisig": stakehound.devMultisig.address,
        "token": stakehound.token.address,
        "logic": {},
        "dao": {},
        "sett_system": {},
        "multiplexer": stakehound.multiplexer.address,
    }

    # == DAO ==
    for key, value in stakehound.dao.items():
        system["dao"][key] = value.address

    # == Pools ==
    system["geysers"] = {}

    for key, value in stakehound.geysers.items():
        system["geysers"][key] = value.address

    for key, value in stakehound.logic.items():
        system["logic"][key] = value.address

    with open(path, "w") as outfile:
        json.dump(system, outfile)


def connect_stakehound(stakehound_deploy_file, load_accounts=False):
    stakehound_deploy = {}
    console.print(
        "[grey]Connecting to Existing Stakehound  System at {}...[/grey]".format(
            stakehound_deploy_file
        )
    )
    with open(stakehound_deploy_file) as f:
        stakehound_deploy = json.load(f)

    """
    Connect to existing stakehound deployment
    """

    stakehound = StakehoundSystem(
        stakehound_config,
        None,
        stakehound_deploy["deployer"],
        stakehound_deploy["keeper"],
        stakehound_deploy["guardian"],
        deploy=False,
        load_accounts=load_accounts
    )

    stakehound.globalStartBlock = stakehound_deploy["globalStartBlock"]

    stakehound.connect_proxy_admins(
        stakehound_deploy["devProxyAdmin"], stakehound_deploy["daoProxyAdmin"]
    )

    stakehound.connect_logic(stakehound_deploy["logic"])

    # stakehound.connect_dev_multisig(stakehound_deploy["devMultisig"])
    stakehound.connect_uni_badger_wbtc_lp(stakehound_deploy["uniBadgerWbtcLp"])

    # Connect Vesting / Rewards Infrastructure
    stakehound.connect_multiplexer(stakehound_deploy["multiplexer"])

    # Connect Sett
    stakehound.connect_geysers(stakehound_deploy["geysers"])

    return stakehound

default_gas_strategy = GasNowScalingStrategy()

class StakehoundSystem:
    def __init__(self, config, systems, deployer, keeper, guardian, deploy=True, load_accounts=True):
        self.config = config
        self.systems = systems
        self.contracts_static = []
        self.contracts_upgradeable = {}
        self.gas_strategy = default_gas_strategy

        # Unlock accounts in test mode
        if rpc.is_active():
            print("RPC Active")
            self.deployer = accounts.at(deployer, force=True)
            self.keeper = accounts.at(keeper, force=True)
            self.guardian = accounts.at(guardian, force=True)
        else:
            print("RPC Inactive")

            deployer_key = decouple.config("DEPLOYER_PRIVATE_KEY")
            keeper_key = decouple.config("KEEPER_PRIVATE_KEY")
            guardian_key = decouple.config("GUARDIAN_PRIVATE_KEY")

            print(deployer_key, keeper_key, guardian_key)

            self.deployer = accounts.add(deployer_key)
            self.keeper = accounts.add(keeper_key)
            self.guardian = accounts.add(guardian_key)

        if deploy:
            self.devProxyAdmin = deploy_proxy_admin(deployer)
            self.daoProxyAdmin = deploy_proxy_admin(deployer)
            self.proxyAdmin = self.devProxyAdmin
        else:
            abi = registry.open_zeppelin.artifacts["ProxyAdmin"]["abi"]
            self.devProxyAdmin = Contract.from_abi(
                "ProxyAdmin",
                web3.toChecksumAddress("0x20dce41acca85e8222d6861aa6d23b6c941777bf"),
                abi,
            )
            self.daoProxyAdmin = Contract.from_abi(
                "ProxyAdmin",
                web3.toChecksumAddress("0x11a9d034b1bbfbbdcac9cb3b86ca7d5df05140f2"),
                abi,
            )
            self.proxyAdmin = self.devProxyAdmin

        self.strategy_artifacts = DotMap()
        self.logic = DotMap()
        self.geysers = DotMap()

        self.connect_dao()
        self.connect_multisig()
        self.connect_uniswap()

        self.globalStartTime = stakehound_config.globalStartTime
        self.globalStartBlock = stakehound_config.globalStartBlock

    def track_contract_static(self, contract):
        self.contracts_static.append(contract)

    def track_contract_upgradeable(self, key, contract):
        self.contracts_upgradeable[key] = contract

    # ===== Contract Connectors =====
    def connect_proxy_admins(self, devProxyAdmin, daoProxyAdmin):
        abi = registry.open_zeppelin.artifacts["ProxyAdmin"]["abi"]

        self.devProxyAdmin = Contract.from_abi(
            "ProxyAdmin", web3.toChecksumAddress(devProxyAdmin), abi,
        )
        self.daoProxyAdmin = Contract.from_abi(
            "ProxyAdmin", web3.toChecksumAddress(daoProxyAdmin), abi,
        )

        self.proxyAdmin = self.devProxyAdmin

    def connect_dao(self):
        deployer = self.deployer
        self.dao = DotMap(
            token=Contract.from_abi(
                "MiniMeToken",
                stakehound_config.dao.token,
                registry.aragon.artifacts.MiniMeToken["abi"],
                deployer,
            ),
            kernel=Contract.from_abi(
                "Agent",
                stakehound_config.dao.kernel,
                registry.aragon.artifacts.Agent["abi"],
                deployer,
            ),
            agent=Contract.from_abi(
                "Agent",
                stakehound_config.dao.agent,
                registry.aragon.artifacts.Agent["abi"],
                deployer,
            ),
        )

        self.token = self.dao.token

    def connect_multisig(self):
        deployer = self.deployer

        multisigParams = stakehound_config["devMultisigParams"]
        multisigParams.owners = [deployer.address]

        print("Deploy Dev Multisig")
        self.devMultisig = connect_gnosis_safe(stakehound_config.multisig.address)

    def connect_uniswap(self):
        self.uniswap = UniswapSystem()

    # ===== Deployers =====

    def add_controller(self, id):
        deployer = self.deployer
        controller = deploy_controller(self, deployer)
        self.sett_system.controllers[id] = controller
        self.track_contract_upgradeable(id + ".controller", controller)
        return controller

    def deploy_core_logic(self):
        deployer = self.deployer
        self.logic = DotMap(
            StakehoundGeyser=StakehoundGeyser.deploy({"from": deployer}),
            Multiplexer=Multiplexer.deploy({"from": deployer}),
        )

    def set_gas_strategy(self, gas_strategy):
        self.gas_strategy = gas_strategy

    def deploy_multiplexer(self):
        deployer = self.deployer
        print(
            self.logic.Multiplexer.address,
            self.devProxyAdmin.address,
            self.devMultisig,
            self.keeper,
            self.guardian,
        )
        self.multiplexer = deploy_proxy(
            "Multiplexer",
            Multiplexer.abi,
            self.logic.Multiplexer.address,
            self.devProxyAdmin.address,
            self.logic.Multiplexer.initialize.encode_input(
                self.deployer, self.keeper, self.guardian
            ),
            deployer,
        )
        self.track_contract_upgradeable("multiplexer", self.multiplexer)

    def deploy_logic(self, name, BrownieArtifact):
        deployer = self.deployer
        self.logic[name] = BrownieArtifact.deploy({"from": deployer})

    def deploy_geyser(self, stakingToken, id):
        geyser = deploy_geyser(self, stakingToken)
        self.geysers[id] = geyser
        self.track_contract_upgradeable(id + ".geyser", geyser)
        return geyser

    # ===== Function Call Macros =====

    def signal_initial_geyser_rewards(self, id, params):
        deployer = self.deployer
        startTime = stakehound_config.geyserParams.badgerDistributionStart
        geyser = self.getGeyser(id)
        self.rewardsEscrow.approveRecipient(geyser, {"from": deployer})

        self.rewardsEscrow.signalTokenLock(
            self.token, params.amount, params.duration, startTime, {"from": deployer},
        )

    # ===== Connectors =====
    def connect_geyser(self, id, address):
        geyser = StakehoundGeyser.at(address)
        self.geysers[id] = geyser
        self.track_contract_upgradeable(id + ".geyser", geyser)

    def connect_multiplexer(self, address):
        self.multiplexer = Multiplexer.at(address)
        self.track_contract_upgradeable("multiplexer", self.multiplexer)

    def connect_logic(self, logic):
        for name, address in logic.items():
            Artifact = strategy_name_to_artifact(name)
            self.logic[name] = Artifact.at(address)

    def set_strategy_artifact(self, id, artifactName, artifact):
        self.strategy_artifacts[id] = {
            "artifact": artifact,
            "artifactName": artifactName,
        }

    # ===== Getters =====

    def getGeyser(self, id):
        return self.geysers[id]