# decompany.io
- The decentralized and incentivized knowledge trading system

# Considerations
- A mintable, burnable ERC20 token
- A refundable crowdsale with a goal and hard cap
- Pre-sale support (with discount?)



# Smart Contracts
- Deck.sol: EIP20 Token. mintable
- DocumentReg.sol: the document registry. reward pool. stores daily page view for each document
- AuthorPool.sol: the reward engine for authors. stores user to document mappings
- CuratorPool.sol: the reward engine for curators. stores voting data
- Utility.sol: a library contract with useful functions

# Developer Guide
## Install Truffle
- npm install -g truffle

## Install Ganache-CLI
- npm install -g ganache-cli

## Running Ganache
- ganache-cli -b 3

## Bootstrapping oraclize api dev

### terminal 1
- cd .../decompanyio
- truffle networks --clean
- ganache-cli -b 1

### terminal 2
- cd .../ethereum-bridge
- node bridge -a 1 -H 127.0.0.1 -p 8545 --dev
- **Copy & Paste** *OAR = OraclizeAddrResolverI(0x....);*

### terminal 3
- cd .../decompanyio
- truffle compile
- truffle migration
- truffle test

## Build Environment Set up
- npm init
- npm install
- npm install truffle
- npm install truffle-hdwallet-provider
- npm install -E openzeppelin-solidity@1.12.0
- truffle compile

## Migrate contracts to local dev network
- truffle migrate

## Migrate contracts to Rinkeby Network
- truffle migrate --network rinkeby
