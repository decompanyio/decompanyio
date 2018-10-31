const Deck = artifacts.require("Deck");
const Utility = artifacts.require("Utility");
const AuthorPool = artifacts.require("AuthorPool");
const CuratorPool = artifacts.require("CuratorPool");
const DocumentReg = artifacts.require("DocumentReg");

module.exports = function(deployer) {
  deployer.deploy(Deck);
  deployer.deploy(Utility);
  deployer.deploy(AuthorPool);
  deployer.deploy(CuratorPool);
  deployer.deploy(DocumentReg);
};
