const Utility = artifacts.require("./Utility.sol");
const CuratorPool = artifacts.require("./CuratorPool.sol");
const Ballot = artifacts.require("./Ballot.sol");

contract("CuratorPool", accounts => {

  it("adding a vote", async () => {
    // prepare
    const docId = "1234567890abcdefghijklmnopqrstuv";

    const utility = await Utility.deployed();
    const curatorPool = await CuratorPool.deployed();
    const ballot = await Ballot.deployed();

    var _utility = utility.address;
    var _ballot = ballot.address;

    await ballot.init(_utility, { from: accounts[0] });
    await curatorPool.init(_utility, _ballot, { from: accounts[0] });
    await ballot.transferOwnership(curatorPool.address, { from: accounts[0] });

    // logic
    var reference = await curatorPool.getVoteCountByAddr(accounts[5]);
    //console.log("reference : " + reference);
    await curatorPool.addVote(accounts[5], docId, 10);

    // assert
    var sample = await curatorPool.getVoteCountByAddr(accounts[5]);
    assert.equal((reference *= 1) + 1, (sample *= 1), "failed to add a vote");
  });

});
