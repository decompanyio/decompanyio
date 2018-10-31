# decompany.io
- The decentralized and incentivized knowledge trading system

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
