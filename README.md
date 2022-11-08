# Equalizer Exchange

This repo contains the contracts for Equalizer Exchange, an AMM on Fantom Opera inspired by Solidly.

## Testing

This repo uses Hardhat framework for compilation, testing and deployment.

- Create an enviroment file named `.env` (copy .env.example) and fill the next enviroment variables

```
# The private key of a wallet address that will be used for deployment into the testnet or mainnet
PRIVATE_KEY=

# Env variable for gas report
REPORT_GAS=

```

- Hardhat Setup

```ml
npm i
npm run compile
npm run test
```

## Contracts

### Mainnet
| Name               | Address                                                                                                                               |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| Equal              | [0x3Fd3A0c85B70754eFc07aC9Ac0cbBDCe664865A6](https://ftmscan.com/address/0x3fd3a0c85b70754efc07ac9ac0cbbdce664865a6#code) |
| PairFactory        | [0xc6366EFD0AF1d09171fe0EBF32c7943BB310832a](https://ftmscan.com/address/0xc6366efd0af1d09171fe0ebf32c7943bb310832a#code) |
| BribeFactory       | [0x5D4589BbA42dF0c53BBcB7EC59160dE64B9d4308](https://ftmscan.com/address/0x5d4589bba42df0c53bbcb7ec59160de64b9d4308#code) |
| GaugeFactory       | [0xc8be3d680e31187a94b47119c5b2b095ce2be578](https://ftmscan.com/address/0xc8be3d680e31187a94b47119c5b2b095ce2be578#code) |
| Voter              | [0x4bebEB8188aEF8287f9a7d1E4f01d76cBE060d5b](https://ftmscan.com/address/0x4bebEB8188aEF8287f9a7d1E4f01d76cBE060d5b#code) |
| VotingEscrow       | [0x8313f3551c4d3984ffbadfb42f780d0c8763ce94](https://ftmscan.com/address/0x8313f3551c4d3984ffbadfb42f780d0c8763ce94#code) |
| VeArtProxy         | [0x777928f0b5f9066a14f7317d57e660f1d754cad8](https://ftmscan.com/address/0x777928f0b5f9066a14f7317d57e660f1d754cad8#code) |
| RewardsDistributor | [0x4325d07222186F438c83Ac1Ed579ecAC2a7d1426](https://ftmscan.com/address/0x4325d07222186F438c83Ac1Ed579ecAC2a7d1426#code) |
| Minter             | [0x85e7f59248d1c52bd635f27518333f75fb80c72d](https://ftmscan.com/address/0x85e7f59248d1c52bd635f27518333f75fb80c72d#code) |
| Router             | [0xbae81ebb5e897c7143c82725e1c2039c2d7e2a78](https://ftmscan.com/address/0xbae81ebb5e897c7143c82725e1c2039c2d7e2a78#code) |
| EqualizerLibrary   | [0xaec6d3e4d319cdc6553f0379e4ff9001d022bea9](https://ftmscan.com/address/0xaec6d3e4d319cdc6553f0379e4ff9001d022bea9#code) |
| MerkleClaim        | [0x6ef2fa893319db4a06e864d1dee17a90fcc34130](https://ftmscan.com/address/0x6ef2fa893319db4a06e864d1dee17a90fcc34130#code) |
| MasterChef         | [0x93b97347722b8a0d21b0dddf79ae1c85c05041f8](https://ftmscan.com/address/0x93b97347722b8a0d21b0dddf79ae1c85c05041f8#code) |
