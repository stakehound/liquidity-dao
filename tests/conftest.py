from helpers.token_utils import distribute_test_ether
from scripts.systems.stakehound_system import connect_stakehound
import pytest
from brownie import *
from config.stakehound_config import stakehound_config
from scripts.deploy.stakehound import deploy_flow

from helpers.constants import *
from helpers.registry import registry
from tests.helpers import create_uniswap_pair, distribute_from_whales

@pytest.fixture()
def stakehound(accounts):
    stakehound_system = deploy_flow(accounts, test=True, outputToFile=False)

    # Distribute Test Assets
    return stakehound_system

