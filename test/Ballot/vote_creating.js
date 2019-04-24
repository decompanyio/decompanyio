const { getWeb3, getContractInstance } = require("../helpers");
const web3 = getWeb3();
const getInstance = getContractInstance(web3);

const RewardPool = artifacts.require("./RewardPool.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
const Ballot = artifacts.require("./Ballot.sol");
//var moment = require('moment');

contract("Ballot - creating votes", accounts => {

/*
  it("Get view count through the oraclize api", async () => {

    // prepare
    const viewCount = await ViewCount.deployed();

    // send query to oraclize api
    await viewCount.init();

    var vc = 0;
    for(var i=0; i<30 && vc*1 == 0; i++) {
      // wait for 1 second
      await new Promise(r => {setTimeout(function () {r();}, 1000)});
      vc = await viewCount.count.call();
    }
    //console.log("view count : " + vc);

    // assert
    assert.isAbove(vc*1, 0, "view count is 0");
  });
*/

  let _pool = undefined;
  let _ballot = undefined;
  let _startTime = undefined;
  let _endTime = undefined;

  it("Setting up...", async () => {

    _registry = await DocumentRegistry.deployed();
    await _registry.setDateMillis("1556064000000", { from: accounts[0] });

    _ballot = await Ballot.deployed();

    _pool = await RewardPool.deployed();
    await _pool.init(_registry.address, _registry.address, _registry.address);

    await _ballot.setRewardPool(_pool.address);
    await _ballot.setCurator(accounts[0]);
    await _ballot.setFoundation(accounts[0]);
    await _ballot.init(_registry.address);

    // assert
    assert.equal(1, 1, "failed to set up");
  });

  it("Create a Vote", async () => {

    const ADDR = accounts[5];
    const DOC = web3.utils.fromAscii("10000000000000000000000000000001");
    const DEPOSIT = '100000000000000000000';

    const voteId = await _ballot.next();
    //console.log("voteId : " + voteId);

    _startTime = "1556064000000";
    await _ballot.create(voteId, ADDR, DOC, DEPOSIT);
    _endTime = "1556064000000";
    //console.log("created");

    const vote = await _ballot.getVote(voteId);
    const deposit_D1_S1 = web3.utils.fromWei(DEPOSIT, "ether") * 1;
    const deposit_D1_S2 = web3.utils.fromWei(vote[3], "ether") * 1;
    // assert
    assert.equal(deposit_D1_S1, deposit_D1_S2, "wrong deposit");
  });

  it("Read a Vote", async () => {

    const ADDR = accounts[5];
    const DOC = web3.utils.fromAscii("10000000000000000000000000000001");
    const DEPOSIT = '100000000000000000000';

    let voteId = await _ballot.count();
    const vote = await _ballot.getVote(voteId);
    //console.log("voteId : " + voteId);

    const address_D1_S1 = ADDR;
    const address_D1_S2 = vote[0];
    //console.log("address_D1_S2 : " + address_D1_S2);
    assert.equal(address_D1_S1, address_D1_S2, "wrong address");

    const date_D1_S0 = _startTime;
    //console.log("date_D1_S0 : " + date_D1_S0*1);
    const date_D1_S1 = vote[2];
    //console.log("date_D1_S1 : " + date_D1_S1*1);
    const date_D1_S2 = _endTime;
    //console.log("date_D1_S2 : " + date_D1_S2*1);
    assert.equal(date_D1_S0*1, date_D1_S2*1, "wrong start date - #1");
    assert.equal(date_D1_S2*1, date_D1_S1*1, "wrong start date - #2");

    const claimed_D1_S1 = 0;
    const claimed_D1_S2 = web3.utils.fromWei(vote[4], "ether") * 1;
    assert.equal(claimed_D1_S1, claimed_D1_S2, "wrong amount of claimed");

    const deposit_D1_S1 = web3.utils.fromWei(DEPOSIT, "ether") * 1;
    const deposit_D1_S2 = web3.utils.fromWei(vote[3], "ether") * 1;
    assert.equal(deposit_D1_S1, deposit_D1_S2, "wrong deposit");
  });

});
