import { BigNumber } from "bignumber.js";

interface GeyserConfig {
    // startMultiplier: BigNumber;
    // endMultiplier: BigNumber;
    globalStartTime: number;
    //     prod_json="deploy-final.json",
    //     test_mode=False,
    //     startMultiplier=1,
    //     endMultiplier=3,
    //     multisig=multisig_config,
    //     # dao=dao_config,
    //     globalStartTime=globalStartTime,
    //     devMultisigParams=DotMap(
    //         threshold=1,
    //         to=AddressZero,
    //         data="0x",
    //         fallbackHandler=AddressZero,
    //         paymentToken=AddressZero,
    //         payment=0,
    //         paymentReceiver=AddressZero,
    //     ),
    //     daoParams=DotMap(
    //         tokenName="StakehoundGovernance",
    //         tokenSymbol="GOV",
    //         id="stakehound",
    //         initialSupply=governance_token_total_supply,
    //         financePeriod=0,
    //         useAgentAsVault=True,
    //         supportRequired=Wei("0.5 ether"),
    //         minAcceptanceQuorum=Wei("0.05 ether"),
    //         voteDuration=days(3),
    //     ),
    //     geyserParams=DotMap(
    //         initialSharesPerToken=10 ** 6,
    //         founderRewardPercentage=0,
    //         distributionStart=globalStartTime,
    //         unlockSchedules=DotMap(
    //             test=[DotMap(amount=Wei("45000 ether"), duration=days(7),)],  # 1 week
    //         ),
    //     ),
    // )
}

export { GeyserConfig };
