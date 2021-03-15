# Stakehound Rewards Distribution

The script here is to be run on two different machines. The proposer aggregates events on a schedule and proposes them to a multiplexer with a transaction.
Then, the approver validates those rewards and sends a transaction to the multiplexer to approve that. The rewards for that cycle are now claimable.
This runs on a loop, and will continue to work as long as the processes are running.

### Dependencies

-   Python 3.9
-   Node.js 10.x development environment (for Ganache).
-   [Eth-Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html)
-   Ganache (v6.12.1)

### Install

```bash
git clone https://github.com/Stakehound-Finance/liquidity-dao
cd liquidity-dao
npm i
```

### Compile

```bash
npm run build
```

### Test

```bash
npx hardhat test
```

### Usage

```json
{
    "startBlock": "0x12/.....",
    "multiplexer": "0x94A2c5a08b7e3AcB71D6aB60fC61913Be0A5a1Aa",
    "initDistributionPath": "./initDistribution.json",
    "signer": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "geysers": [],
    "credentials": {
        "accessKeyId": "access",
        "secretAccessKey": "secretaccess"
    },
    "epoch": 1800,
    "providerUrl": "https://<network>.alchemyapi.io/v2/<api-key>",
    "rate": 300000,
    "stTokens": ["0x1213534"]
}
```
- `startBlock` is the hash for the block from which to start fetching events
- `multiplexer` is the deployed address for multiplexer contract
- `geysers` is an array of addresses for geysers to listen to
- `credentials` is the credentials for the amazon s3 store to which rewards are published
- `epoch` is the period to wait to publish hashes (in reality, will be about 30 blocks worth of time more for confirmations)
- `providerUrl` is a URL for the JSON-RPC of an ethereum archive node
- `rate` is how frequently the proposer checks to see if the chain is in a state for each role to act
- `stTokens` These are the stakehound rebasing tokens which are being included in the rewards distribution. It is *important* to specify these, otherwise the script will pick it up and
treat it as a normal ERC20.

# To run an approver node

```bash
node dist/index.js approve --logfile ./approve.log config/config_approver.json
```

# To run a proposer node

```bash
node dist/index.js propose --logfile ./propose.log config/config_proposer.json
```

# Force approve and force propose
This is used to propose and approve in the case of adding another merkle drop. This breaks the assertion checks for both, as a new initdistribution would cause
previous reward distributions to not validate.

# initDistribution

```json
{
    "cycle": 0,
    "rewards": {
        "0xdeadbeef....<userA>": {
            "reward": { 
                "0x1213243....<tokenA>": "143893890808080",
                "0x1213243....<tokenB>": "143893890808080"
                }
        },
        "0xdeadbeef....<userB>": {
            "reward": { 
                "0x1213243....<tokenA>": "143893890808080",
                "0x1213243....<tokenB>": "143893890808080"
                }
        }
    }
}
```

This is used to provide the initial distribution of tokens, if an airdrop is being done.

`rewards` is just a map of the users.


# adding an airdrop
One must *add* the additional values to the initdistribution array. So if a user ends up getting airdropped more than they were before,
the new airdrops should be added to the old.
Then, one should run

```bash
node dist/index.js force-propose --logfile ./propose.log config/config_proposer.json
```

and

```bash
node dist/index.js force-approve --logfile ./propose.log config/config_proposer.json
```

# Deployment:
Current deploy script is restricted towards a testing use case, however I provide some
simple helper functions to be integrated into a deploy scenario.
- scripts/lib/deploy.ts
    ```ts
    /**
    * Deploy geyser via openzeppelin upgrades
    * @param {string} token address of (LP) token being staked
    * @param {number} startTime time at which deposits are allowed
    * @param {string} admin address of admin of contract (can set locker address)
    * @param {string} locker address which can signal and clear token locks
    */
    deploy_geyser = async (
        token: string,
        startTime: number,
        admin: string,
        locker: string
    ): Promise<StakehoundGeyser>
    ```

    ```ts
    /**
    * Deploys multiplexer for merkle root rewards
    * @param {string} admin Sets proposer and approver (and (un)pauser) roles
    * @param {string} proposer Address that proposes the next merkle root
    * @param {string} approver Address that approves the merkle root of proposer
    */
    const deploy_multiplexer = async (
        admin: string,
        proposer: string,
        approver: string
    )
    ```

# Signaling and removing rewards

## StakehoundGeyser.sol

ACL roles:
DEFAULT_ADMIN_ROLE
- can add tokens to be allowed to be signaled by token locker
- can set token locker
TOKEN_LOCKER_ROLE -> can signal and remove token locks

These may or may not be added to deployment script, could be called by etherscan or some
multisig wallet.

```sol
    /**
     * @dev This funcion allows the token locker to pledge more distribution tokens, along
     *      with the associated "unlock schedule". These locked tokens immediately begin unlocking
     *      linearly over the duraction of durationSec timeframe.
     *      NB. This can produce retroactive rewards. To change, add a require(now <= block.timestamp);
     * @param token Token to lock.
     * @param amount Number of distribution tokens to lock. These are transferred from the caller.
     * @param durationSec Length of time to linear unlock the tokens.
     * @param startTime Time to start distribution.
     */
    function signalTokenLock(
        address token,
        uint256 amount,
        uint256 durationSec,
        uint256 startTime
    ) external;

    /**
     * @dev This function signals that a token is permitted to be signaled via signalTokenLock
     * can only be called by geyser admin
     * @param token to distribute
     */
    function addDistributionToken(address token) external {

    /**
     * @dev This funcion allows the token locker to clear all locking schedules
     *      for a particular token
     * @param token Token to remove locking schedules for.
     */
    function clearSchedules(address token) external;
```


# Multiplexer.sol roles
ROOT_PROPOSER_ROLE - can propose new merkle roots (set in initializer)
ROOT_VALIDATOR_ROLE - can approve new merkle roots (set in initializer)
PAUSER_ROLE - can pause (not initialized)
UNPAUSER_ROLE - can unpause (not initializer)
