//const Deck = artifacts.require("Deck");
//const Utility = artifacts.require("Utility");
const AuthorPool = artifacts.require("AuthorPool");
const CuratorPool = artifacts.require("CuratorPool");
const DocumentReg = artifacts.require("DocumentReg");
//const ViewCount = artifacts.require("ViewCount");
const DocumentRegistry = artifacts.require("DocumentRegistry");
const Ballot = artifacts.require("Ballot");
const Creator = artifacts.require("Creator");
const Curator = artifacts.require("Curator");
const RewardPool = artifacts.require("RewardPool");

module.exports = async function(deployer, network, accounts) {

  //let deckObj, utilityObj, authorPoolObj, curatorPoolObj, documentRegObj;

  await Promise.all([
    // Contracts
    deployer.deploy(Ballot),
    deployer.deploy(DocumentRegistry),
    deployer.deploy(Creator),
    deployer.deploy(Curator),
    deployer.deploy(RewardPool),
    deployer.deploy(AuthorPool),
    deployer.deploy(CuratorPool),
    //deployer.deploy(ViewCount, { from: accounts[9], gas:6721975, value: 500000000000000000 }),
    deployer.deploy(DocumentReg, { from: accounts[0], gas:6721975, value: 500000000000000000 })
  ]);
/*
  objects = await Promise.all([
    Deck.deployed(),
    Utility.deployed(),
    AuthorPool.deployed(),
    CuratorPool.deployed(),
    DocumentReg.deployed()
  ]);

  deckObj = objects[0];
  utilityObj = objects[1];
  authorPoolObj = objects[2];
  curatorPoolObj = objects[3];
  documentRegObj = objects[4];

  // Initialize contracts
  results = await Promise.all([
    authorPoolObj.init(deckObj.address, utilityObj.address),
    curatorPoolObj.init(deckObj.address, utilityObj.address),
    documentRegObj.init(deckObj.address, authorPoolObj.address, curatorPoolObj.address, utilityObj.address)
  ]);
*/
};
