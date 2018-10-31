const Deck = artifacts.require("./Deck.sol");
const Utility = artifacts.require("./Utility.sol");
const DocumentReg = artifacts.require("./DocumentReg.sol");
const AuthorPool = artifacts.require("./AuthorPool.sol");
const CuratorPool = artifacts.require("./CuratorPool.sol");

contract("DocumentReg - estimate, determine & claim curator rewards", accounts => {

  const DOC1 = "10000000000000000000000000000001";
  const DOC2 = "10000000000000000000000000000002";
  const DOC3 = "10000000000000000000000000000003";
  const DOC4 = "10000000000000000000000000000004";
  const DOC5 = "10000000000000000000000000000005";

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

  it("setting up....", async () => {

    // ---------------------------
    // INIT CONTRACTS
    // ---------------------------
    _deck = await Deck.deployed();
    _utility = await Utility.deployed();
    _authorPool = await AuthorPool.deployed();
    _curatorPool = await CuratorPool.deployed();
    _documentReg = await DocumentReg.deployed();

    await _authorPool.transferOwnership(_documentReg.address, { from: accounts[0] });
    await _curatorPool.transferOwnership(_documentReg.address, { from: accounts[0] });

    await _documentReg.init (
      _deck.address,
      _authorPool.address,
      _curatorPool.address,
      _utility.address,
      { from: accounts[0] }
    );

    DAYS_0 = ((await _utility.getDateMillis()) * 1) - 0 * (await _utility.getOneDayMillis());
    DAYS_1 = ((await _utility.getDateMillis()) * 1) - 1 * (await _utility.getOneDayMillis());
    DAYS_2 = ((await _utility.getDateMillis()) * 1) - 2 * (await _utility.getOneDayMillis());
    DAYS_3 = ((await _utility.getDateMillis()) * 1) - 3 * (await _utility.getOneDayMillis());
    DAYS_4 = ((await _utility.getDateMillis()) * 1) - 4 * (await _utility.getOneDayMillis());
    DAYS_5 = ((await _utility.getDateMillis()) * 1) - 5 * (await _utility.getOneDayMillis());
    DAYS_6 = ((await _utility.getDateMillis()) * 1) - 6 * (await _utility.getOneDayMillis());
    DAYS_7 = ((await _utility.getDateMillis()) * 1) - 7 * (await _utility.getOneDayMillis());
    DAYS_8 = ((await _utility.getDateMillis()) * 1) - 8 * (await _utility.getOneDayMillis());
    DAYS_9 = ((await _utility.getDateMillis()) * 1) - 9 * (await _utility.getOneDayMillis());

    // ---------------------------
    // DECK
    // ---------------------------
    // - TOTAL SUPPLY (ACCOUNT[0]) : 10,000,000,000 DECK
    // - REWARD POOL (documentReg.address) : 200,000,000 DECK
    // - ACCOUNT[1] : 300,000 DECK
    // - ACCOUNT[2] : 200,000 DECK
    // - ACCOUNT[3] : 100,000 DECK
    // - ACCOUNT[4] : 100,000 DECK
    // - ACCOUNT[5] : 100,000 DECK

    const totalSupply = new web3.BigNumber('10000000000000000000000000000');
    const rewardPool = new web3.BigNumber('200000000000000000000000000');

    await _deck.issue(accounts[0], totalSupply, { from: accounts[0] });
    await _deck.release({ from: accounts[0] });

    await _deck.transfer(accounts[1], '300000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[2], '200000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[3], '100000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[4], '100000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[5], '100000000000000000000000', { from: accounts[0] });

    await _deck.transfer(_documentReg.address, rewardPool, { from: accounts[0] });

    // ---------------------------
    // DOCUMENT REGISTRY
    // ---------------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    // ---------------------------
    // AUTHOR POOL
    // ---------------------------
    // ACOUNT[1] : DOC #1, +5 DAYS
    // ACOUNT[1] : DOC #2, +1 DAYS
    // ACOUNT[1] : DOC #3, +0 DAYS
    // ACOUNT[2] : DOC #4, +8 DAYS
    // ACOUNT[2] : DOC #5, +1 DAYS

    await _documentReg.update(accounts[1], DOC1, DAYS_5, { from: accounts[0] });
    await _documentReg.update(accounts[1], DOC2, DAYS_1, { from: accounts[0] });
    await _documentReg.update(accounts[1], DOC3, DAYS_0, { from: accounts[0] });
    await _documentReg.update(accounts[2], DOC4, DAYS_8, { from: accounts[0] });
    await _documentReg.update(accounts[2], DOC5, DAYS_1, { from: accounts[0] });

    await _documentReg.confirmPageView(DOC1, DAYS_1, 100, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC1, DAYS_2, 200, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC1, DAYS_3, 300, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC1, DAYS_4, 400, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC1, DAYS_5, 500, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC2, DAYS_1, 200, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_1, 100, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_2, 200, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_3, 300, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_4, 400, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_5, 500, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_6, 600, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_7, 700, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC4, DAYS_8, 800, { from: accounts[0] });
    await _documentReg.confirmPageView(DOC5, DAYS_1, 300, { from: accounts[0] });

    //await _documentReg.confirmTotalPageView(DAYS_1, 700, 150000, { from: accounts[0] });
    //await _documentReg.confirmTotalPageView(DAYS_2, 400, 80000, { from: accounts[0] });
    //await _documentReg.confirmTotalPageView(DAYS_3, 600, 180000, { from: accounts[0] });
    //await _documentReg.confirmTotalPageView(DAYS_4, 800, 320000, { from: accounts[0] });
    //await _documentReg.confirmTotalPageView(DAYS_5, 1000, 500000, { from: accounts[0] });
    //await _documentReg.confirmTotalPageView(DAYS_6, 600, 360000, { from: accounts[0] });
    //await _documentReg.confirmTotalPageView(DAYS_7, 700, 490000, { from: accounts[0] });
    //await _documentReg.confirmTotalPageView(DAYS_8, 800, 640000, { from: accounts[0] });

    const balance_A1_S1 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    assert.equal(300000, balance_A1_S1 * 1);

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS
    // ACOUNT[3] : DOC #2(200), +1 DAYS
    // ACOUNT[4] : DOC #1(100), +3 DAYS
    // ACOUNT[4] : DOC #4(400), +2 DAYS
    // ACOUNT[4] : DOC #3(100), +0 DAYS

    const VOTE_A3_D1 = new web3.BigNumber('100000000000000000000');
    const VOTE_A3_D2 = new web3.BigNumber('200000000000000000000');
    const VOTE_A4_D1 = new web3.BigNumber('100000000000000000000');
    const VOTE_A4_D4 = new web3.BigNumber('400000000000000000000');
    const VOTE_A4_D3 = new web3.BigNumber('100000000000000000000');

    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_2, { from: accounts[0] });
    await _documentReg.updateVoteOnDocument(accounts[3], DOC2, VOTE_A3_D2, DAYS_1, { from: accounts[0] });
    await _documentReg.updateVoteOnDocument(accounts[4], DOC1, VOTE_A4_D1, DAYS_3, { from: accounts[0] });
    await _documentReg.updateVoteOnDocument(accounts[4], DOC4, VOTE_A4_D4, DAYS_2, { from: accounts[0] });
    await _documentReg.updateVoteOnDocument(accounts[4], DOC3, VOTE_A4_D3, DAYS_0, { from: accounts[0] });

    const deposit_A3_D1 = (await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_2)) * 1;
    //console.log('deposit_A3_D1 : ' + deposit_A3_D1);
    assert.equal(VOTE_A3_D1, deposit_A3_D1);

/*
    const deposit_A3_D1 = (await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_5)) * 1;
    //console.log('deposit_A3_D1 : ' + deposit_A3_D1);
    assert.equal(VOTE_A3_D1, deposit_A3_D1);
*/
    const deposit_A3_D2 = (await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC2, DAYS_1)) * 1;
    //console.log('deposit_A3_D2 : ' + deposit_A3_D2);
    assert.equal(VOTE_A3_D2, deposit_A3_D2);

    const deposit_A4_D1 = (await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC1, DAYS_3)) * 1;
    //console.log('deposit_A4_D1 : ' + deposit_A4_D1);
    assert.equal(VOTE_A4_D1, deposit_A4_D1);

    const deposit_A4_D4 = (await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC4, DAYS_2)) * 1;
    //console.log('deposit_A4_D4 : ' + deposit_A4_D4);
    assert.equal(VOTE_A4_D4, deposit_A4_D4);
/*
    const deposit_A4_D4 = (await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC4, DAYS_4)) * 1;
    //console.log('deposit_A4_D4 : ' + deposit_A4_D4);
    assert.equal(VOTE_A4_D4, deposit_A4_D4);
*/
    const deposit_A4_D3 = (await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC3, DAYS_0)) * 1;
    //console.log('deposit_A4_D3 : ' + deposit_A4_D3);
    assert.equal(VOTE_A4_D3, deposit_A4_D3);
  });

  it("estimate curator reward for 1day", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));

    // ---------------
    const ref_A3_D2_D1 = (drp_1 * 1) * (200 / (200)) * (40000 / (10000 + 40000 + 10000 + 90000));

    const reward_A3_D2 = web3.fromWei(await _documentReg.getCuratorRewardOnUserDocument(accounts[3], DOC2));
    const sample = Math.round((reward_A3_D2 * 1) / 100);
    const reference = Math.round((ref_A3_D2_D1) / 100);
    assert.equal(reference, sample, "wrong amount of estimated token : curator #3, doc #2");
  });

  it("estimate curator reward for 3days", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    // ---------------
    const ref_A3_D1_D1 = ((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = 0; //((drp_3 * 1) * (100 / (100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = 0;
    const ref_A3_D1_D5 = 0;

    //console.log('ref_A3_D1_D1 : ' + ref_A3_D1_D1);
    //console.log('ref_A3_D1_D2 : ' + ref_A3_D1_D2);
    //console.log('ref_A3_D1_D3 : ' + ref_A3_D1_D3);
    //console.log('ref_A3_D1_D4 : ' + ref_A3_D1_D4);
    //console.log('ref_A3_D1_D5 : ' + ref_A3_D1_D5);

    const reward_A3_D1 = web3.fromWei(await _documentReg.getCuratorRewardOnUserDocument(accounts[3], DOC1, { from: accounts[0] }));
    const sample = Math.floor((reward_A3_D1 * 1) / 10);
    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5) / 10);
    assert.equal(reference, sample, "wrong amount of estimated token : curator #3, doc #1");
  });

  it("determine curator reward for 2, 3, 4 days", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100)

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    // ---------------
    const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = 0; //((drp_5 * 1) * (100 / (100 + 100 + 100 + 100))) / (250000 + 250000) * 250000;

    const ref_A3_D1_D3_1 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4_1 = ((drp_4 * 1) * (100 / (100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5_1 = ((drp_5 * 1) * (100 / (100))) / (250000 + 250000) * 250000;

    //console.log('ref_A3_D1_D1 : ' + ref_A3_D1_D1);
    //console.log('ref_A3_D1_D2 : ' + ref_A3_D1_D2);
    //console.log('ref_A3_D1_D3 : ' + ref_A3_D1_D3);
    //console.log('ref_A3_D1_D4 : ' + ref_A3_D1_D4);
    //console.log('ref_A3_D1_D5 : ' + ref_A3_D1_D5);

    const VOTE_A3_D1 = new web3.BigNumber('100000000000000000000');
    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5));
    const reference2 = Math.floor((ref_A3_D1_D2 + ref_A3_D1_D3_1 * 2 + ref_A3_D1_D4_1 * 2 + ref_A3_D1_D5_1));

    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_2, { from: accounts[0] });
    const reward_A3_D1_2 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_2 = Math.floor((reward_A3_D1_2 * 1));
    assert.equal(0, sample_2, "wrong amount of determined token : curator #3, doc #1, day 2");

    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_3, { from: accounts[0] });
    const reward_A3_D1_3 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_3 = Math.floor((reward_A3_D1_3 * 1));
    assert.equal(0, sample_3, "wrong amount of determined token : curator #3, doc #1, day 3");

    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_4, { from: accounts[0] });
    const reward_A3_D1_4 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_4 = Math.floor((reward_A3_D1_4 * 1));
    assert.equal(reference, sample_4, "wrong amount of determined token : curator #3, doc #1, day 4");

    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_5, { from: accounts[0] });
    const reward_A3_D1_5 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_5 = Math.floor((reward_A3_D1_5 * 1));
    assert.equal(reference2, sample_5, "wrong amount of determined token : curator #3, doc #1, day 5");

  });

  it("claim curator reward for 2, 3, 4 days", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100))) / (250000 + 250000) * 250000;

    const VOTE_A3_D1 = new web3.BigNumber('100000000000000000000');
    const reference = Math.floor((ref_A3_D1_D2 + ref_A3_D1_D3 * 2 + ref_A3_D1_D4 * 2 + ref_A3_D1_D5));

    const balance_A3_S1 = web3.fromWei(await _deck.balanceOf(accounts[3]), "ether");
    //console.log('balance_A3_S1 : ' + balance_A3_S1);

    const reward_A3_D1_4 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_4 = Math.floor((reward_A3_D1_4 * 1));
    assert.equal(reference, sample_4, "wrong amount of determined token : curator #3, doc #1, day 4");

    await _documentReg.claimCuratorReward(DOC1, { from: accounts[3] })
    const balance_A3_S2 = web3.fromWei(await _deck.balanceOf(accounts[3]), "ether");
    //console.log('balance_A3_S2 : ' + balance_A3_S2);
    const reward_claimed = Math.floor(balance_A3_S2 * 1 - balance_A3_S1 * 1) - (web3.fromWei(VOTE_A3_D1, "ether") * 2);
    assert.equal(sample_4, reward_claimed, "wrong amount of claimed token : curator #3, doc #1, day 4");
  });

  it("calculate estimated curator reward for today", async () => {

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #4(200), +5 DAYS, VOTE(  0,   0,   0, 200, 200, 200) => CLAIMED
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));

    //console.log('drp_3 : ' + drp_3 * 1);
    const ref_A3_D1_D0 = (((drp_3 * 90000) / (180000)) * 10000 / (20000)) ;

    // addr : curator address
    // doc id
    // pv : page view
    // tpvs : sum((page view)^2)
    const sample = web3.fromWei(await _documentReg.calculateCuratorReward(accounts[3], DOC1, 100, 20000), "ether");
    //console.log('sample : ' + sample * 1);

    var ref = Math.round((ref_A3_D1_D0 * 2));
    var smp = Math.round((sample * 1));

    assert.equal(ref, smp);
  });

  it("vote on a document", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #2(300),  +0 DAYS, VOTE(300)

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    // S1. check initial balance of account #4
    const balance_A4_S1 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether") * 1;
    //console.log('balance_A4_S1 : ' + balance_A4_S1);

    // S2. approve 300 tokens which will be used for voting on document #2
    const VOTE_A4_D2 = new web3.BigNumber('300000000000000000000');
    await _deck.approve(_documentReg.address, VOTE_A4_D2, { from: accounts[4] });

    // S3. vote 300 tokens on document #2
    await _documentReg.voteOnDocument(DOC2, VOTE_A4_D2, { from: accounts[4] });

    // S4. check amount of tokens account #4 has deposited on document #2
    const deposit_A4_D2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D2 : ' + deposit_A4_D2);
    assert.equal(300, deposit_A4_D2, "wrong amount of tokens deposited on doc #2");

    // S5. check the balance of account #4
    const balance_A4_S5 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether") * 1;
    //console.log('balance_A4_S5 : ' + balance_A4_S5);
    assert.equal(balance_A4_S1 - balance_A4_S5, 300, "wrong amount of tokens deposited from DECK wallet");
  });

  it("get tokens a user voted on a document", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #2(300),  +0 DAYS, VOTE(300)

    // DOC #1 : ACOUNT[1], PV(100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(200)
    // DOC #3 : ACOUNT[1], PV()
    // DOC #4 : ACOUNT[2], PV(100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(300)

    const deposit_A1_D1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[1], DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_A1_D1 : ' + deposit_A1_D1);
    assert.equal(0, deposit_A1_D1, "wrong amount of tokens deposited on doc #1, account #1");

    const deposit_A3_D1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_A3_D1 : ' + deposit_A3_D1);
    assert.equal(200, deposit_A3_D1, "wrong amount of tokens deposited on doc #1, account #3");

    const deposit_A3_D1_DAY1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_1), "ether") * 1;
    //console.log('deposit_A3_D1_DAY1 : ' + deposit_A3_D1_DAY1);
    assert.equal(300, deposit_A3_D1_DAY1, "wrong amount of tokens deposited on doc #1, account #3, yesterday");

    const deposit_A3_D1_DAY2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_2), "ether") * 1;
    //console.log('deposit_A3_D1_DAY2 : ' + deposit_A3_D1_DAY2);
    assert.equal(400, deposit_A3_D1_DAY2, "wrong amount of tokens deposited on doc #1, account #3, a day before yesterday");

    const deposit_A3_D2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_A3_D2 : ' + deposit_A3_D2);
    assert.equal(200, deposit_A3_D2, "wrong amount of tokens deposited on doc #2, account #3");

    const deposit_A4_D1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D1 : ' + deposit_A4_D1);
    assert.equal(0, deposit_A4_D1, "wrong amount of tokens deposited on doc #1, account #4");

    const deposit_A4_D2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D2 : ' + deposit_A4_D2);
    assert.equal(300, deposit_A4_D2, "wrong amount of tokens deposited on doc #2, account #4");

    const deposit_A4_D5 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC5, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D5 : ' + deposit_A4_D5);
    assert.equal(0, deposit_A4_D5, "wrong amount of tokens deposited on doc #5, account #4");

    const deposit_A4_D4 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC4, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D4 : ' + deposit_A4_D4);
    assert.equal(400, deposit_A4_D4, "wrong amount of tokens deposited on doc #4, account #4");

  });

  it("get tokens voted on a document", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #2(300),  +0 DAYS, VOTE(300)

    const deposit_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_D1_DAY0 : ' + deposit_D1_DAY0);
    assert.equal(200, deposit_D1_DAY0, "wrong amount of tokens deposited on doc #1, day 0");

    const deposit_D1_DAY1 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_1), "ether") * 1;
    //console.log('deposit_D1_DAY1 : ' + deposit_D1_DAY1);
    assert.equal(400, deposit_D1_DAY1, "wrong amount of tokens deposited on doc #1, day 1");

    const deposit_D1_DAY2 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_2), "ether") * 1;
    //console.log('deposit_D1_DAY2 : ' + deposit_D1_DAY2);
    assert.equal(500, deposit_D1_DAY2, "wrong amount of tokens deposited on doc #1, day 2");

    const deposit_D1_DAY3 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_3), "ether") * 1;
    //console.log('deposit_D1_DAY3 : ' + deposit_D1_DAY3);
    assert.equal(400, deposit_D1_DAY3, "wrong amount of tokens deposited on doc #1, day 3");

    const deposit_D1_DAY4 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_4), "ether") * 1;
    //console.log('deposit_D1_DAY4 : ' + deposit_D1_DAY4);
    assert.equal(200, deposit_D1_DAY4, "wrong amount of tokens deposited on doc #1, day 4");

    const deposit_D1_DAY5 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_5), "ether") * 1;
    //console.log('deposit_D1_DAY5 : ' + deposit_D1_DAY5);
    assert.equal(100, deposit_D1_DAY5, "wrong amount of tokens deposited on doc #1, day 5");

    const deposit_D2_DAY0 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_D2_DAY0 : ' + deposit_D2_DAY0);
    assert.equal(500, deposit_D2_DAY0, "wrong amount of tokens deposited on doc #2, day 0");

    const deposit_D2_DAY1 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC2, DAYS_1), "ether") * 1;
    //console.log('deposit_D2_DAY1 : ' + deposit_D2_DAY1);
    assert.equal(200, deposit_D2_DAY1, "wrong amount of tokens deposited on doc #2, day 1");

    const deposit_D2_DAY2 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC2, DAYS_2), "ether") * 1;
    //console.log('deposit_D2_DAY2 : ' + deposit_D2_DAY2);
    assert.equal(0, deposit_D2_DAY2, "wrong amount of tokens deposited on doc #2, day 2");

  });

  it("get tokens a user withdrawn on a document", async () => {

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100))) / (250000 + 250000) * 250000;

    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 * 2 + ref_A3_D1_D4 * 2 + ref_A3_D1_D5));

    const withdraw_A1_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorWithdrawOnUserDocument(accounts[1], DOC1, DAYS_0), "ether") * 1;
    //console.log('withdraw_A1_D1_DAY0 : ' + withdraw_A1_D1_DAY0);
    assert.equal(0, Math.floor(withdraw_A1_D1_DAY0), "wrong amount of tokens withdraw on doc #1, account #1, day 0");

    const withdraw_A3_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorWithdrawOnUserDocument(accounts[3], DOC1, DAYS_0), "ether") * 1;
    //console.log('withdraw_A3_D1_DAY0 : ' + withdraw_A3_D1_DAY0);
    assert.equal(reference, Math.floor(withdraw_A3_D1_DAY0), "wrong amount of tokens withdraw on doc #1, account #3, day 0");
  });

  it("get tokens withdrawn on a document", async () => {

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #4(200), +5 DAYS, VOTE(  0,   0,   0, 200, 200, 200) => CLAIMED
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100))) / (250000 + 250000) * 250000;

    //const ref_A4_D1_D3 = ((drp_3 * 1) * (200 / (200 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    //const ref_A4_D1_D4 = ((drp_4 * 1) * (200 / (200 + 100))) / (160000 + 160000) * 160000;
    //const ref_A4_D1_D5 = ((drp_5 * 1) * (200 / (200))) / (250000 + 250000) * 250000;

    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 * 2 + ref_A3_D1_D4 * 2 + ref_A3_D1_D5));
    const reference2 = Math.floor((ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5));

    const withdraw_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorWithdrawOnDocument(DOC1, DAYS_0), "ether") * 1;
    //console.log('withdraw_D1_DAY0 : ' + Math.floor(withdraw_D1_DAY0));
    assert.equal(reference, Math.floor(withdraw_D1_DAY0), "wrong amount of tokens withdraw on doc #1, day 0");

    const withdraw_D1_DAY1 = web3.fromWei(await _documentReg.getCuratorWithdrawOnDocument(DOC1, DAYS_1), "ether") * 1;
    //console.log('withdraw_D1_DAY1 : ' + Math.floor(withdraw_D1_DAY1));
    assert.equal(reference2, Math.floor(withdraw_D1_DAY1), "wrong amount of tokens withdraw on doc #1, day 1");

    // additional claim - same document & different account
    const VOTE_A4_D1_S2 = new web3.BigNumber('200000000000000000000');
    const balance_A4_S1 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether");
    // console.log('balance_A4_S1 : ' + balance_A4_S1);
    await _documentReg.updateVoteOnDocument(accounts[4], DOC1, VOTE_A4_D1_S2, DAYS_5, { from: accounts[0] });
    await _documentReg.claimCuratorReward(DOC1, { from: accounts[4] })

    const balance_A4_S2 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether");
    // console.log('balance_A4_S2 : ' + balance_A4_S2);

    const reward_claimed = Math.floor(balance_A4_S2 * 1 - balance_A4_S1 * 1) - (web3.fromWei(VOTE_A4_D1_S2, "ether") * 1);
    const withdraw_D1_S2 = web3.fromWei(await _documentReg.getCuratorWithdrawOnDocument(DOC1, DAYS_0), "ether") * 1;
    assert.equal(Math.floor((reference + reward_claimed) / 10), Math.floor(withdraw_D1_S2/10), "wrong amount of claimed token : doc #1, stage 2");
  });

  it("get tokens earned on a document", async () => {

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +2 DAYS, VOTE(400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +2 DAYS, VOTE(100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +3 DAYS, VOTE(  0, 100, 100, 100)
    // ACOUNT[3] : DOC #1(100), +4 DAYS, VOTE(  0,   0, 100, 100, 100) => CLAIMED
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(  0,   0,   0, 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #4(200), +5 DAYS, VOTE(  0,   0,   0, 200, 200, 200) => CLAIMED
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    const ref_A1_D1_D1 = ((drp_1 * 1) * (100 / (100 + 100 + 100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100))) / (250000 + 250000) * 250000;

    const reference = Math.floor((ref_A1_D1_D1 * 4 + ref_A3_D1_D2 * 5 + ref_A3_D1_D3 * 4 + ref_A3_D1_D4 * 2 + ref_A3_D1_D5 * 1));

    const earn_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorRewardOnDocument(DOC1), "ether") * 1;
    //console.log('earn_D1_DAY0 : ' + Math.floor(earn_D1_DAY0));
    assert.equal(reference, Math.floor(earn_D1_DAY0), "wrong amount of tokens earn on doc #1");

    const earn_D1_DAY1 = web3.fromWei(await _documentReg.getCurator3DayRewardOnDocument(DOC1, DAYS_2), "ether") * 1;
    //console.log('earn_D1_DAY1 : ' + Math.floor(earn_D1_DAY1));
    assert.equal(Math.round((reference - ref_A1_D1_D1 * 4)/10), Math.round(earn_D1_DAY1/10), "wrong amount of tokens earn on doc #1, day 1");

    const reference3 = Math.floor((ref_A1_D1_D1 * 4 + ref_A3_D1_D2 * 5 + ref_A3_D1_D3 * 4));
    const earn_D1_DAY3 = web3.fromWei(await _documentReg.getCurator3DayRewardOnDocument(DOC1, DAYS_0), "ether") * 1;
    //console.log('earn_D1_DAY3 : ' + Math.floor(earn_D1_DAY3));
    assert.equal(Math.round((reference3)/10), Math.round(earn_D1_DAY3/10), "wrong amount of tokens earn on doc #1, day 0");

  });
/*
 // =================================
 // Vote Deposit for 30 days
 // =================================

  it("estimate curator reward for 5days", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    // ---------------
    const ref_A3_D1_D1 = ((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100))) / (250000 + 250000) * 250000;

    //console.log('ref_A3_D1_D1 : ' + ref_A3_D1_D1);
    //console.log('ref_A3_D1_D2 : ' + ref_A3_D1_D2);
    //console.log('ref_A3_D1_D3 : ' + ref_A3_D1_D3);
    //console.log('ref_A3_D1_D4 : ' + ref_A3_D1_D4);
    //console.log('ref_A3_D1_D5 : ' + ref_A3_D1_D5);

    const reward_A3_D1 = web3.fromWei(await _documentReg.getCuratorRewardOnDocumentByAddr(accounts[3], DOC1, { from: accounts[0] }));
    const sample = Math.floor((reward_A3_D1 * 1) / 10);
    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5) / 10);
    assert.equal(reference, sample, "wrong amount of estimated token : curator #3, doc #1");
  });

  it("determine curator reward for 29, 30, 31 days", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +29 DAYS, VOTE(100, 100, 100, 100, 100, 100, ...., 100)
    // ACOUNT[3] : DOC #1(100), +30 DAYS, VOTE(  0, 100, 100, 100, 100, 100, ...., 100, 100)
    // ACOUNT[3] : DOC #1(100), +31 DAYS, VOTE(  0,   0, 100, 100, 100, 100, ...., 100, 100, 100)

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const DAYS_29 = ((await _utility.getDateMillis()) * 1) - 29 * (await _utility.getOneDayMillis());
    const DAYS_30 = ((await _utility.getDateMillis()) * 1) - 30 * (await _utility.getOneDayMillis());
    const DAYS_31 = ((await _utility.getDateMillis()) * 1) - 31 * (await _utility.getOneDayMillis());

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    // ---------------
    const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100 + 100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100 + 100 + 100 + 100))) / (250000 + 250000) * 250000;

    //console.log('ref_A3_D1_D1 : ' + ref_A3_D1_D1);
    //console.log('ref_A3_D1_D2 : ' + ref_A3_D1_D2);
    //console.log('ref_A3_D1_D3 : ' + ref_A3_D1_D3);
    //console.log('ref_A3_D1_D4 : ' + ref_A3_D1_D4);
    //console.log('ref_A3_D1_D5 : ' + ref_A3_D1_D5);

    const VOTE_A3_D1 = new web3.BigNumber('100000000000000000000');
    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5));

    await _documentReg.update(accounts[1], DOC1, DAYS_31, { from: accounts[0] });
    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_29, { from: accounts[0] });
    const reward_A3_D1_29 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_29 = Math.floor((reward_A3_D1_29 * 1));
    assert.equal(0, sample_29, "wrong amount of determined token : curator #3, doc #1, day 29");

    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_30, { from: accounts[0] });
    const reward_A3_D1_30 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_30 = Math.floor((reward_A3_D1_30 * 1));
    assert.equal(0, sample_30, "wrong amount of determined token : curator #3, doc #1, day 30");

    await _documentReg.updateVoteOnDocument(accounts[3], DOC1, VOTE_A3_D1, DAYS_31, { from: accounts[0] });
    const reward_A3_D1_31 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_31 = Math.floor((reward_A3_D1_31 * 1));
    assert.equal(reference, sample_31, "wrong amount of determined token : curator #3, doc #1, day 31");
  });

  it("claim curator reward for 29, 30, 31 days", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +29 DAYS, VOTE(100, 100, 100, 100, 100, 100, ...., 100)
    // ACOUNT[3] : DOC #1(100), +30 DAYS, VOTE(  0, 100, 100, 100, 100, 100, ...., 100, 100)
    // ACOUNT[3] : DOC #1(100), +31 DAYS, VOTE(  0,   0, 100, 100, 100, 100, ...., 100, 100, 100) => CLAIMED

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const DAYS_29 = ((await _utility.getDateMillis()) * 1) - 29 * (await _utility.getOneDayMillis());
    const DAYS_30 = ((await _utility.getDateMillis()) * 1) - 30 * (await _utility.getOneDayMillis());
    const DAYS_31 = ((await _utility.getDateMillis()) * 1) - 31 * (await _utility.getOneDayMillis());

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100 + 100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100 + 100 + 100 + 100))) / (250000 + 250000) * 250000;

    const VOTE_A3_D1 = new web3.BigNumber('100000000000000000000');
    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5));

    const balance_A3_S1 = web3.fromWei(await _deck.balanceOf(accounts[3]), "ether");
    //console.log('balance_A3_S1 : ' + balance_A3_S1);

    const reward_A3_D1_31 = web3.fromWei(await _documentReg.determineCuratorReward(DOC1, { from: accounts[3] }));
    const sample_31 = Math.floor((reward_A3_D1_31 * 1));
    assert.equal(reference, sample_31, "wrong amount of determined token : curator #3, doc #1, day 31");

    await _documentReg.claimCuratorReward(DOC1, { from: accounts[3] })
    const balance_A3_S2 = web3.fromWei(await _deck.balanceOf(accounts[3]), "ether");
    //console.log('balance_A3_S2 : ' + balance_A3_S2);
    const reward_claimed = Math.floor(balance_A3_S2 * 1 - balance_A3_S1 * 1) - (web3.fromWei(VOTE_A3_D1, "ether") * 1);
    assert.equal(sample_31, reward_claimed, "wrong amount of claimed token : curator #3, doc #1, day 31");
  });

  it("vote on a document", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +29 DAYS, VOTE(100, 100, 100, 100, 100, 100, ...., 100)
    // ACOUNT[3] : DOC #1(100), +30 DAYS, VOTE(  0, 100, 100, 100, 100, 100, ...., 100, 100)
    // ACOUNT[3] : DOC #1(100), +31 DAYS, VOTE(  0,   0, 100, 100, 100, 100, ...., 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #2(300),  +0 DAYS, VOTE(300)

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    // S1. check initial balance of account #4
    const balance_A4_S1 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether") * 1;
    //console.log('balance_A4_S1 : ' + balance_A4_S1);

    // S2. approve 300 tokens which will be used for voting on document #2
    const VOTE_A4_D2 = new web3.BigNumber('300000000000000000000');
    await _deck.approve(_documentReg.address, VOTE_A4_D2, { from: accounts[4] });

    // S3. vote 300 tokens on document #2
    await _documentReg.voteOnDocument(DOC2, VOTE_A4_D2, { from: accounts[4] });

    // S4. check amount of tokens account #4 has deposited on document #2
    const deposit_A4_D2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D2 : ' + deposit_A4_D2);
    assert.equal(300, deposit_A4_D2, "wrong amount of tokens deposited on doc #2");

    // S5. check the balance of account #4
    const balance_A4_S5 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether") * 1;
    //console.log('balance_A4_S5 : ' + balance_A4_S5);
    assert.equal(balance_A4_S1 - balance_A4_S5, 300, "wrong amount of tokens deposited from DECK wallet");
  });

  it("get tokens a user voted on a document", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +29 DAYS, VOTE(100, 100, 100, 100, 100, 100, ...., 100)
    // ACOUNT[3] : DOC #1(100), +30 DAYS, VOTE(  0, 100, 100, 100, 100, 100, ...., 100, 100)
    // ACOUNT[3] : DOC #1(100), +31 DAYS, VOTE(  0,   0, 100, 100, 100, 100, ...., 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #2(300),  +0 DAYS, VOTE(300)

    // DOC #1 : ACOUNT[1], PV(100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(200)
    // DOC #3 : ACOUNT[1], PV()
    // DOC #4 : ACOUNT[2], PV(100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(300)

    const deposit_A1_D1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[1], DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_A1_D1 : ' + deposit_A1_D1);
    assert.equal(0, deposit_A1_D1, "wrong amount of tokens deposited on doc #1, account #1");

    const deposit_A3_D1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_A3_D1 : ' + deposit_A3_D1);
    assert.equal(200, deposit_A3_D1, "wrong amount of tokens deposited on doc #1, account #3");

    const deposit_A3_D1_DAY1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_1), "ether") * 1;
    //console.log('deposit_A3_D1_DAY1 : ' + deposit_A3_D1_DAY1);
    assert.equal(300, deposit_A3_D1_DAY1, "wrong amount of tokens deposited on doc #1, account #3, yesterday");

    const deposit_A3_D1_DAY2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC1, DAYS_2), "ether") * 1;
    //console.log('deposit_A3_D1_DAY2 : ' + deposit_A3_D1_DAY2);
    assert.equal(400, deposit_A3_D1_DAY2, "wrong amount of tokens deposited on doc #1, account #3, a day before yesterday");

    const deposit_A3_D2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[3], DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_A3_D2 : ' + deposit_A3_D2);
    assert.equal(200, deposit_A3_D2, "wrong amount of tokens deposited on doc #2, account #3");

    const deposit_A4_D1 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D1 : ' + deposit_A4_D1);
    assert.equal(100, deposit_A4_D1, "wrong amount of tokens deposited on doc #1, account #4");

    const deposit_A4_D2 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D2 : ' + deposit_A4_D2);
    assert.equal(300, deposit_A4_D2, "wrong amount of tokens deposited on doc #2, account #4");

    const deposit_A4_D5 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC5, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D5 : ' + deposit_A4_D5);
    assert.equal(0, deposit_A4_D5, "wrong amount of tokens deposited on doc #5, account #4");

    const deposit_A4_D4 = web3.fromWei(await _documentReg.getCuratorDepositOnUserDocument(accounts[4], DOC4, DAYS_0), "ether") * 1;
    //console.log('deposit_A4_D4 : ' + deposit_A4_D4);
    assert.equal(400, deposit_A4_D4, "wrong amount of tokens deposited on doc #4, account #4");

  });

  it("get tokens voted on a document", async () => {

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +29 DAYS, VOTE(100, 100, 100, 100, 100, 100, ...., 100)
    // ACOUNT[3] : DOC #1(100), +30 DAYS, VOTE(  0, 100, 100, 100, 100, 100, ...., 100, 100)
    // ACOUNT[3] : DOC #1(100), +31 DAYS, VOTE(  0,   0, 100, 100, 100, 100, ...., 100, 100, 100) => CLAIMED

    // ACOUNT[4] : DOC #2(300),  +0 DAYS, VOTE(300)

    const deposit_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_0), "ether") * 1;
    //console.log('deposit_D1_DAY0 : ' + deposit_D1_DAY0);
    assert.equal(300, deposit_D1_DAY0, "wrong amount of tokens deposited on doc #1, day 0");

    const deposit_D1_DAY1 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_1), "ether") * 1;
    //console.log('deposit_D1_DAY1 : ' + deposit_D1_DAY1);
    assert.equal(400, deposit_D1_DAY1, "wrong amount of tokens deposited on doc #1, day 1");

    const deposit_D1_DAY2 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_2), "ether") * 1;
    //console.log('deposit_D1_DAY2 : ' + deposit_D1_DAY2);
    assert.equal(500, deposit_D1_DAY2, "wrong amount of tokens deposited on doc #1, day 2");

    const deposit_D1_DAY3 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_3), "ether") * 1;
    //console.log('deposit_D1_DAY3 : ' + deposit_D1_DAY3);
    assert.equal(500, deposit_D1_DAY3, "wrong amount of tokens deposited on doc #1, day 3");

    const DAYS_31 = ((await _utility.getDateMillis()) * 1) - 31 * (await _utility.getOneDayMillis());
    const deposit_D1_DAY31 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_31), "ether") * 1;
    //console.log('deposit_D1_DAY31 : ' + deposit_D1_DAY31);
    assert.equal(100, deposit_D1_DAY31, "wrong amount of tokens deposited on doc #1, day 31");

    const DAYS_32 = ((await _utility.getDateMillis()) * 1) - 32 * (await _utility.getOneDayMillis());
    const deposit_D1_DAY32 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC1, DAYS_32), "ether") * 1;
    //console.log('deposit_D1_DAY32 : ' + deposit_D1_DAY32);
    assert.equal(0, deposit_D1_DAY32, "wrong amount of tokens deposited on doc #1, day 32");

    const deposit_D2_DAY0 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC2, DAYS_0), "ether") * 1;
    //console.log('deposit_D2_DAY0 : ' + deposit_D2_DAY0);
    assert.equal(500, deposit_D2_DAY0, "wrong amount of tokens deposited on doc #2, day 0");

    const deposit_D2_DAY1 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC2, DAYS_1), "ether") * 1;
    //console.log('deposit_D2_DAY1 : ' + deposit_D2_DAY1);
    assert.equal(200, deposit_D2_DAY1, "wrong amount of tokens deposited on doc #2, day 1");

    const deposit_D2_DAY2 = web3.fromWei(await _documentReg.getCuratorDepositOnDocument(DOC2, DAYS_2), "ether") * 1;
    //console.log('deposit_D2_DAY2 : ' + deposit_D2_DAY2);
    assert.equal(0, deposit_D2_DAY2, "wrong amount of tokens deposited on doc #2, day 2");

  });

  it("get tokens a user earned on a document", async () => {

    // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
    // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
    // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
    // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
    // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

    // ACOUNT[3] : DOC #1(100), +29 DAYS, VOTE(100, 100, 100, 100, 100, 100, ...., 100)
    // ACOUNT[3] : DOC #1(100), +30 DAYS, VOTE(  0, 100, 100, 100, 100, 100, ...., 100, 100)
    // ACOUNT[3] : DOC #1(100), +31 DAYS, VOTE(  0,   0, 100, 100, 100, 100, ...., 100, 100, 100) => CLAIMED

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

    const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100 + 100 + 100))) / (160000 + 160000) * 160000;
    const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100 + 100 + 100 + 100))) / (250000 + 250000) * 250000;

    const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5));

    const withdraw_A1_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorWithdrawOnUserDocument(accounts[1], DOC1, DAYS_0), "ether") * 1;
    //console.log('withdraw_A1_D1_DAY0 : ' + withdraw_A1_D1_DAY0);
    assert.equal(0, Math.floor(withdraw_A1_D1_DAY0), "wrong amount of tokens withdraw on doc #1, account #1, day 0");

    const withdraw_A3_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorWithdrawOnUserDocument(accounts[3], DOC1, DAYS_0), "ether") * 1;
    //console.log('withdraw_A3_D1_DAY0 : ' + withdraw_A3_D1_DAY0);
    assert.equal(reference, Math.floor(withdraw_A3_D1_DAY0), "wrong amount of tokens withdraw on doc #1, account #3, day 0");
  });

  it("get tokens earned on a document", async () => {

        // ACOUNT[3] : DOC #1(100), +5 DAYS, VOTE(100, 100, 100, 100, 100, 100)
        // ACOUNT[3] : DOC #2(200), +1 DAYS, VOTE(200, 200)
        // ACOUNT[4] : DOC #1(100), +3 DAYS, VOTE(100, 100, 100, 100)
        // ACOUNT[4] : DOC #4(400), +4 DAYS, VOTE(400, 400, 400, 400, 400)
        // ACOUNT[4] : DOC #3(100), +0 DAYS, VOTE(100)

        // ACOUNT[3] : DOC #1(100), +29 DAYS, VOTE(100, 100, 100, 100, 100, 100, ...., 100)
        // ACOUNT[3] : DOC #1(100), +30 DAYS, VOTE(  0, 100, 100, 100, 100, 100, ...., 100, 100)
        // ACOUNT[3] : DOC #1(100), +31 DAYS, VOTE(  0,   0, 100, 100, 100, 100, ...., 100, 100, 100) => CLAIMED

        const todayMillis = (await _utility.getTimeMillis()) * 1;
        const dayMillis = (await _utility.getOneDayMillis()) * 1;
        const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
        const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
        const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
        const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
        const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));

        const ref_A3_D1_D1 = 0; //((drp_1 * 1) * (100 / (100 + 100))) / (10000 + 40000 + 10000 + 90000) * 10000;
        const ref_A3_D1_D2 = ((drp_2 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (40000 + 40000) * 40000;
        const ref_A3_D1_D3 = ((drp_3 * 1) * (100 / (100 + 100 + 100 + 100 + 100))) / (90000 + 90000) * 90000;
        const ref_A3_D1_D4 = ((drp_4 * 1) * (100 / (100 + 100 + 100 + 100))) / (160000 + 160000) * 160000;
        const ref_A3_D1_D5 = ((drp_5 * 1) * (100 / (100 + 100 + 100 + 100))) / (250000 + 250000) * 250000;

        const reference = Math.floor((ref_A3_D1_D1 + ref_A3_D1_D2 + ref_A3_D1_D3 + ref_A3_D1_D4 + ref_A3_D1_D5));

        const withdraw_D1_DAY0 = web3.fromWei(await _documentReg.getCuratorWithdrawOnDocument(DOC1, DAYS_0), "ether") * 1;
        //console.log('withdraw_D1_DAY0 : ' + Math.floor(withdraw_D1_DAY0));
        assert.equal(reference, Math.floor(withdraw_D1_DAY0), "wrong amount of tokens withdraw on doc #1, day 0");

        const withdraw_D1_DAY1 = web3.fromWei(await _documentReg.getCuratorWithdrawOnDocument(DOC1, DAYS_1), "ether") * 1;
        //console.log('withdraw_D1_DAY1 : ' + Math.floor(withdraw_D1_DAY1));
        assert.equal(0, Math.floor(withdraw_D1_DAY1), "wrong amount of tokens withdraw on doc #1, day 1");
  });
*/
});
