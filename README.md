# Stakehound Rewards Distribution

### Dependencies
- Python 3.9 
- Node.js 10.x development environment (for Ganache).
- [Eth-Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html) 
- Ganache (v6.12.1)

### Install
```bash
git clone https://github.com/Stakehound-Finance/liquidity-dao
cd liquidity-dao
yarn install --lock-file
pip install -r requirements.txt
```

### Compile

```bash
brownie compile
```

### Test

```bash
brownie test
```

### Add coverage and gas profiling

```bash
brownie test --coverage --gas
```

### Local Instance
Run a local ganache instance connected to stakehound contracts, with all related assets distributed to a test account specified in the TEST_ACCOUNT env variable. Assumes the default network is mainnet-fork in the brownie config. Ganache will continue to run until the process is closed.

```bash
brownie run scripts/local_instance.py
```