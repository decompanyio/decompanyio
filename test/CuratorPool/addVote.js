const Deck = artifacts.require("./Deck.sol");
const Utility = artifacts.require("./Utility.sol");
const CuratorPool = artifacts.require("./CuratorPool.sol");
const VoteMap = artifacts.require("./VoteMap.sol");

contract("CuratorPool", accounts => {

  it("adding a vote", async () => {
    // prepare
    const docId = "1234567890abcdefghijklmnopqrstuv";

    const deck = await Deck.deployed();
    const utility = await Utility.deployed();
    const curatorPool = await CuratorPool.deployed();
    const voteMap = await VoteMap.deployed();

    var _token = deck.address;
    var _utility = utility.address;
    var _voteMap = voteMap.address;

    await voteMap.init(_utility, { from: accounts[0] });
    await curatorPool.init(_token, _utility, _voteMap, { from: accounts[0] });
    await voteMap.transferOwnership(curatorPool.address, { from: accounts[0] });

    // logic
    var reference = await curatorPool.getVoteCountByAddr(accounts[5]);
    //console.log("reference : " + reference);
    await curatorPool.addVote(accounts[5], docId, 10);

    // assert
    var sample = await curatorPool.getVoteCountByAddr(accounts[5]);
    assert.equal((reference *= 1) + 1, (sample *= 1), "failed to add a vote");
  });

});
