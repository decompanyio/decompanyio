const Deck = artifacts.require("./Deck.sol");
const Utility = artifacts.require("./Utility.sol");
const CuratorPool = artifacts.require("./CuratorPool.sol");

contract("CuratorPool", accounts => {

  it("determine reward of a document with a vote", async () => {
    // prepare
    const docId = "1234567890abcdefghijklmnopqrstuv";
    const pv = 123;
    const pvts = 123 ** 2;

    const deck = await Deck.deployed();
    const utility = await Utility.deployed();
    const curatorPool = await CuratorPool.deployed();

    var _token = deck.address;
    var _utility = utility.address;

    await curatorPool.init(_token, _utility, { from: accounts[0] });

    // logic
    const c1 = await curatorPool.getVoteCountByAddr(accounts[1]);
    assert.equal(0, c1 * 1, "not empty");
    await curatorPool.addVote(accounts[1], docId, 10);
    const c2 = await curatorPool.getVoteCountByAddr(accounts[1]);
    assert.equal(c1 * 1 + 1, c2 * 1, "failed to add a vote");

    const timestamp = await utility.getDateMillis();
    var reward = await curatorPool.determineReward(accounts[1], 0, timestamp, pv, pvts);
    reward = web3.fromWei(reward.toNumber(), "ether");

    // assert
    var sample = web3.fromWei(await utility.getDailyRewardPool(30, timestamp), "ether");
    assert.equal(sample * 1, (reward * 1), "wrong reward token");

    //var curators = await curatorPool.getCurators();
    //assert.equal(1, curators.length, "curator not exist");
  });

  it("determine reward of a document with multi vote", async () => {

    // prepare
    const docId = "1234567890abcdefghijklmnopqrst11";
    const pv1 = 123;
    const pv2 = 234;
    const pvts = 234 ** 2 + 123 ** 2;;

    const deck = await Deck.deployed();
    const utility = await Utility.deployed();
    const curatorPool = await CuratorPool.deployed();

    //var curators = await curatorPool.getCurators();
    //assert.equal(1, curators.length, "curator not exist");
    //console.log('curators : ' + curators.length);

    // logic
    var c1 = await curatorPool.getVoteCountByAddr(accounts[1]);
    assert.equal(1, c1 *= 1, "vote not exist");
    //console.log('vote counts 1 : ' + (c1 * 1));

    await curatorPool.addVote(accounts[1], docId, 20);
    var c2 = await curatorPool.getVoteCountByAddr(accounts[1]);
    assert.equal(2, c2 *= 1, "failed to add a vote 2");
    //console.log('vote counts 2 : ' + (c2 * 1));

    await curatorPool.addVote(accounts[1], docId, 30);
    var c3 = await curatorPool.getVoteCountByAddr(accounts[1]);
    assert.equal(3, c3 *= 1, "failed to add a vote 3");
    //console.log('vote counts 3 : ' + (c3 * 1));

    const timestamp = await utility.getDateMillis();
    var reward1 = await curatorPool.determineReward(accounts[1], 0, timestamp, pv1, pvts);
    //console.log('reward 1 : ' + (reward1 * 1));
    var reward2 = await curatorPool.determineReward(accounts[1], 1, timestamp, pv2, pvts);
    //console.log('reward 2 : ' + (reward2 * 1));
    var reward3 = await curatorPool.determineReward(accounts[1], 2, timestamp, pv2, pvts);
    //console.log('reward 3 : ' + (reward3 * 1));

    reward1 = web3.fromWei(reward1, "ether");
    reward2 = web3.fromWei(reward2, "ether");
    reward3 = web3.fromWei(reward3, "ether");

    // assert
    var s = web3.fromWei(await utility.getDailyRewardPool(30, timestamp), "ether");
    var reference = s * (((pv1 ** 2)/pvts) * 10/10 + ((pv2 ** 2)/pvts) * 20/50 + ((pv2 ** 2)/pvts) * 30/50);
    var sample = (reward1 * 1) + (reward2 * 1) + (reward3 * 1);

    assert.equal(Math.floor(reference * 1), Math.floor(sample * 1), "wrong reward token");
  });

});
