const RewardPool = artifacts.require("./RewardPool.sol");
const Ballot = artifacts.require("./Ballot.sol");
//var moment = require('moment');

contract("Ballot - reading votes", accounts => {

  const DOC1 = web3.fromAscii("10000000000000000000000000000001");  // accounts[1]
  const DOC2 = web3.fromAscii("10000000000000000000000000000002");  // accounts[1]
  const DOC3 = web3.fromAscii("10000000000000000000000000000003");  // accounts[1]
  const DOC4 = web3.fromAscii("10000000000000000000000000000004");  // accounts[2]
  const DOC5 = web3.fromAscii("10000000000000000000000000000005");  // accounts[2]

  var DAYS_0;
  var DAYS_1;
  var DAYS_2;
  var DAYS_3;
  var DAYS_4;
  var DAYS_5;
  var DAYS_6;
  var DAYS_7;
  var DAYS_8;
  var DAYS_9;

  let _pool = undefined;
  let _ballot = undefined;
  let _startTime = undefined;
  let _endTime = undefined;

  it("Setting up...", async () => {

    _pool = await RewardPool.deployed();

    // prepare
    _ballot = await Ballot.deployed();
    await _ballot.setCurator(accounts[0]);
    await _ballot.setFoundation(accounts[0]);
    await _ballot.setRewardPool(accounts[0]);

    DAYS_0 = ((await _pool.getDateMillis()) * 1) - 0 * (await _pool.getOneDayMillis());
    DAYS_1 = ((await _pool.getDateMillis()) * 1) - 1 * (await _pool.getOneDayMillis());
    DAYS_2 = ((await _pool.getDateMillis()) * 1) - 2 * (await _pool.getOneDayMillis());
    DAYS_3 = ((await _pool.getDateMillis()) * 1) - 3 * (await _pool.getOneDayMillis());
    DAYS_4 = ((await _pool.getDateMillis()) * 1) - 4 * (await _pool.getOneDayMillis());
    DAYS_5 = ((await _pool.getDateMillis()) * 1) - 5 * (await _pool.getOneDayMillis());
    DAYS_6 = ((await _pool.getDateMillis()) * 1) - 6 * (await _pool.getOneDayMillis());
    DAYS_7 = ((await _pool.getDateMillis()) * 1) - 7 * (await _pool.getOneDayMillis());
    DAYS_8 = ((await _pool.getDateMillis()) * 1) - 8 * (await _pool.getOneDayMillis());
    DAYS_9 = ((await _pool.getDateMillis()) * 1) - 9 * (await _pool.getOneDayMillis());

    const ADDR1 = accounts[1];
    const ADDR2 = accounts[2];
    const DEPOSIT = new web3.BigNumber('100000000000000000000');

    // ---------------------------------------------------------------------------------
    //    DAYS_9, DAYS_8, DAYS_7, DAYS_6, DAYS_5, DAYS_4, DAYS_3, DAYS_2, DAYS_1, DAYS_0
    // ---------------------------------------------------------------------------------
    // A.    100,    100,    100
    // B.                    100,    100,    100
    // C.                                            100,    100,    100
    // D.                                                            100,    100,    100
    // E.                                                                    100,    100
    // ---------------------------------------------------------------------------------
    //                       100,    100,    100
    //                                       100,    100,    100
    // ---------------------------------------------------------------------------------
    // CLAIMABLE (ADDR1)                       A       A     A,B     A,B     A,B   A,B,C
    // CLAIMABLE (ADDR1, DAYS_4)               A       A       B       B       B     B,C
    // ---------------------------------------------------------------------------------
    await _ballot.insert(1, ADDR1, DOC1, DEPOSIT, DAYS_9); // A
    await _ballot.insert(2, ADDR1, DOC1, DEPOSIT, DAYS_7); // B
    await _ballot.insert(3, ADDR2, DOC1, DEPOSIT, DAYS_7);
    await _ballot.insert(4, ADDR2, DOC1, DEPOSIT, DAYS_5);
    await _ballot.insert(5, ADDR1, DOC1, DEPOSIT, DAYS_4); // C
    await _ballot.insert(6, ADDR1, DOC1, DEPOSIT, DAYS_2); // D
    await _ballot.insert(7, ADDR1, DOC1, DEPOSIT, DAYS_1); // E

    // assert
    assert.equal(1, 1, "failed to set up");
  });

  // ---------------------------------------------------------------------------------
  //    DAYS_9, DAYS_8, DAYS_7, DAYS_6, DAYS_5, DAYS_4, DAYS_3, DAYS_2, DAYS_1, DAYS_0
  // ---------------------------------------------------------------------------------
  // A.    100,    100,    100
  // B.                    100,    100,    100
  // C.                                            100,    100,    100
  // D.                                                            100,    100,    100
  // E.                                                                    100,    100
  // ---------------------------------------------------------------------------------
  //                       100,    100,    100
  //                                       100,    100,    100
  // ---------------------------------------------------------------------------------
  // CLAIMABLE (ADDR1)                       A       A     A,B     A,B     A,B   A,B,C
  // CLAIMABLE (ADDR1, DAYS_4)               A       A       B       B       B     B,C
  // ---------------------------------------------------------------------------------
  it("Get active votes", async () => {
    const vestingMillis = await _pool.getVestingMillis();
    const active_votes_day_9 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_9, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_9, "wrong active_votes_day_9");
    const active_votes_day_8 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_8, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_8, "wrong active_votes_day_8");
    const active_votes_day_7 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_7, vestingMillis), "ether") * 1;
    assert.equal(300, active_votes_day_7, "wrong active_votes_day_7");
    const active_votes_day_6 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_6, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_6, "wrong active_votes_day_6");
    const active_votes_day_5 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_5, vestingMillis), "ether") * 1;
    assert.equal(300, active_votes_day_5, "wrong active_votes_day_5");
    const active_votes_day_4 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_4, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_4, "wrong active_votes_day_4");
    const active_votes_day_3 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_3, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_3, "wrong active_votes_day_3");
    const active_votes_day_2 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_2, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_2, "wrong active_votes_day_2");
    const active_votes_day_1 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_1, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_1, "wrong active_votes_day_1");
    const active_votes_day_0 = web3.fromWei(await _ballot.getActiveVotes(DOC1, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_0, "wrong active_votes_day_0");
  });

  // ---------------------------------------------------------------------------------
  //    DAYS_9, DAYS_8, DAYS_7, DAYS_6, DAYS_5, DAYS_4, DAYS_3, DAYS_2, DAYS_1, DAYS_0
  // ---------------------------------------------------------------------------------
  // A.    100,    100,    100
  // B.                    100,    100,    100
  // C.                                            100,    100,    100
  // D.                                                            100,    100,    100
  // E.                                                                    100,    100
  // ---------------------------------------------------------------------------------
  //                       100,    100,    100
  //                                       100,    100,    100
  // ---------------------------------------------------------------------------------
  // CLAIMABLE (ADDR1)                       A       A     A,B     A,B     A,B   A,B,C
  // CLAIMABLE (ADDR1, DAYS_4)               A       A       B       B       B     B,C
  // ---------------------------------------------------------------------------------
  it("Get active user votes", async () => {
    const ADDR1 = accounts[1];
    const vestingMillis = await _pool.getVestingMillis();
    const active_votes_day_9 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_9, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_9, "wrong active_votes_day_9");
    const active_votes_day_8 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_8, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_8, "wrong active_votes_day_8");
    const active_votes_day_7 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_7, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_7, "wrong active_votes_day_7");
    const active_votes_day_6 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_6, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_6, "wrong active_votes_day_6");
    const active_votes_day_5 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_5, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_5, "wrong active_votes_day_5");
    const active_votes_day_4 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_4, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_4, "wrong active_votes_day_4");
    const active_votes_day_3 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_3, vestingMillis), "ether") * 1;
    assert.equal(100, active_votes_day_3, "wrong active_votes_day_3");
    const active_votes_day_2 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_2, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_2, "wrong active_votes_day_2");
    const active_votes_day_1 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_1, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_1, "wrong active_votes_day_1");
    const active_votes_day_0 = web3.fromWei(await _ballot.getUserActiveVotes(ADDR1, DOC1, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(200, active_votes_day_0, "wrong active_votes_day_0");
  });

  // ---------------------------------------------------------------------------------
  //    DAYS_9, DAYS_8, DAYS_7, DAYS_6, DAYS_5, DAYS_4, DAYS_3, DAYS_2, DAYS_1, DAYS_0
  // ---------------------------------------------------------------------------------
  // A.    100,    100,    100
  // B.                    100,    100,    100
  // C.                                            100,    100,    100
  // D.                                                            100,    100,    100
  // E.                                                                    100,    100
  // ---------------------------------------------------------------------------------
  //                       100,    100,    100
  //                                       100,    100,    100
  // ---------------------------------------------------------------------------------
  // CLAIMABLE (ADDR1)                       A       A     A,B     A,B     A,B   A,B,C
  // CLAIMABLE (ADDR1, DAYS_4)               A       A       B       B       B     B,C
  // ---------------------------------------------------------------------------------
  it("Get claimable user votes before claiming", async () => {
    const ADDR1 = accounts[1];
    const vestingMillis = await _pool.getVestingMillis();
    const claimable_day_9 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_9, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_9, "wrong claimable_day_9");
    const claimable_day_8 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_8, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_8, "wrong claimable_day_8");
    const claimable_day_7 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_7, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(200, claimable_day_7, "wrong claimable_day_7");
    const claimable_day_6 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_6, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_6, "wrong claimable_day_6");
    const claimable_day_5 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_5, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_5, "wrong claimable_day_5");
    const claimable_day_4 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_4, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_4, "wrong claimable_day_4");
    const claimable_day_3 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_3, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_3, "wrong claimable_day_3");
    const claimable_day_2 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_2, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_2, "wrong claimable_day_2");
    const claimable_day_1 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_1, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(0, claimable_day_1, "wrong claimable_day_1");
    const claimable_day_0 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_0, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(0, claimable_day_0, "wrong claimable_day_0");
  });

  // ---------------------------------------------------------------------------------
  //    DAYS_9, DAYS_8, DAYS_7, DAYS_6, DAYS_5, DAYS_4, DAYS_3, DAYS_2, DAYS_1, DAYS_0
  // ---------------------------------------------------------------------------------
  // A.    100,    100,    100
  // B.                    100,    100,    100
  // C.                                            100,    100,    100
  // D.                                                            100,    100,    100
  // E.                                                                    100,    100
  // ---------------------------------------------------------------------------------
  //                       100,    100,    100
  //                                       100,    100,    100
  // ---------------------------------------------------------------------------------
  // CLAIMABLE (ADDR1)                       A       A     A,B     A,B     A,B   A,B,C
  // CLAIMABLE (ADDR1, DAYS_4)               A       A       B       B       B     B,C
  // ---------------------------------------------------------------------------------
  it("Get claimable user votes after claiming", async () => {
    const ADDR1 = accounts[1];
    const withdraw = new web3.BigNumber('100000000000000000000');
    await _ballot.updateWithdraw(ADDR1, DOC1, DAYS_4, withdraw);
    const vestingMillis = await _pool.getVestingMillis();
    const claimable_day_9 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_9, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(0, claimable_day_9, "wrong claimable_day_9");
    const claimable_day_8 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_8, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(0, claimable_day_8, "wrong claimable_day_8");
    const claimable_day_7 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_7, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_7, "wrong claimable_day_7");
    const claimable_day_6 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_6, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_6, "wrong claimable_day_6");
    const claimable_day_5 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_5, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_5, "wrong claimable_day_5");
    const claimable_day_4 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_4, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_4, "wrong claimable_day_4");
    const claimable_day_3 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_3, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_3, "wrong claimable_day_3");
    const claimable_day_2 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_2, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(100, claimable_day_2, "wrong claimable_day_2");
    const claimable_day_1 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_1, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(0, claimable_day_1, "wrong claimable_day_1");
    const claimable_day_0 = web3.fromWei(await _ballot.getUserClaimableVotes(ADDR1, DOC1, DAYS_0, DAYS_0, vestingMillis), "ether") * 1;
    assert.equal(0, claimable_day_0, "wrong claimable_day_0");
  });

});
