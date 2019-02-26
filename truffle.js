/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var HDWalletProvider = require("truffle-hdwallet-provider");
const NonceSubprovider = require("web3-provider-engine/subproviders/nonce-tracker");
const createInfuraProvider = (secret, infuraUrl) => {
  const provider = new HDWalletProvider(secret, infuraUrl);
  provider.engine.addProvider(new NonceSubprovider());
  return provider;
}

module.exports = {
  networks: {
    development: {
        host: "localhost",
        port: 8545, // Using ganache as development network
        network_id: "*",
        gas: 4698712,
        gasPrice: 25000000000
    },
    rinkeby: {
      provider: createInfuraProvider(
        "...",
        "https://rinkeby.infura.io/v3/..."),
      network_id: 4,
      websockets: true,
      //gas: 4698712,
      gas: 6994701,
      //gas: 4612388 // Gas limit used for deploys
    }
  },
  solc: {
      optimizer: {
          enabled: true,
          runs: 200
      }
  },
  compilers: {
    solc: {
      version: "0.5.0" // ex:  "0.4.20". (Default: Truffle's installed solc)
    }
  }
};
