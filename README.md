# Stakehound Rewards Distribution

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

````bash
{
    "startBlock": "0x12",
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
    "rate": 300000
}```
- `startBlock` is the hash for the block from which to start fetching events
- `multiplexer` is the deployed address for multiplexer contract
- `geysers` is an array of addresses for geysers to listen to
- `credentials` is the credentials for an amazon s3 store
- `epoch` is the period to wait to publish hashes (in reality, will be about 30 blocks worth of time more for confirmations)
- `providerUrl` is a URL for the JSON-RPC of an ethereum archive node
- `rate` is how frequently the proposer checks to see if the chain is in a state for each role to act

# To run an approver node

```bash
node dist/index.js approve --logfile ./approve.log config/config_approver.json
````

# To run a proposer node

```bash
node dist/index.js propose --logfile ./propose.log config/config_proposer.json
```

# initDistribution

```json
{
    "cycle": 0,
    "rewards": {},
    "rewardsDistributed": {},
    "rewardsDistributedInRange": {},
    "rewardsInRange": {},
    "users": {}
}
```

This is used to provide the initial distribution of tokens, if an airdrop is being done.

This is somewhat poor in design, it currently needs to be fit in with the structure of objects used to provide various sanity checks, and so contains redundant information. This will be changed to remove the redundant information Leaving it empty works for testing purposes.
Will be fixed and corrected soon, and documented in more detail when it is.
