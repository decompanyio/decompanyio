const Deck = artifacts.require("./Deck.sol");
const Utility = artifacts.require("./Utility.sol");
const DocumentReg = artifacts.require("./DocumentReg.sol");
const AuthorPool = artifacts.require("./AuthorPool.sol");
const CuratorPool = artifacts.require("./CuratorPool.sol");

contract("DocumentReg - determine & claim author reward", accounts => {

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
  });

  it("register documents", async () => {

    // ---------------------------
    // DOCUMENT REGISTRY
    // ---------------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const doc1 = await _documentReg.contains(DOC1);
    //console.log('doc1 exists : ' + doc1);
    const doc2 = await _documentReg.contains(DOC2);
    //console.log('doc2 exists : ' + doc2);
    const doc3 = await _documentReg.contains(DOC3);
    //console.log('doc3 exists : ' + doc3);
    const doc4 = await _documentReg.contains(DOC4);
    //console.log('doc4 exists : ' + doc4);
    const doc5 = await _documentReg.contains(DOC5);
    //console.log('doc5 exists : ' + doc5);
    const doc6 = await _documentReg.contains('99000000000000000000000000000009');
    //console.log('doc6 exists : ' + doc6);

    assert.equal(true, doc1.valueOf(), "doc #1 does not exist");
    assert.equal(true, doc2.valueOf(), "doc #2 does not exist");
    assert.equal(true, doc3.valueOf(), "doc #3 does not exist");
    assert.equal(true, doc4.valueOf(), "doc #4 does not exist");
    assert.equal(true, doc5.valueOf(), "doc #5 does not exist");
    assert.equal(false, doc6.valueOf(), "doc #6 exist");
  });

  it("determine author reward for 0 day", async () => {

    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS, PV(0, 100, 200, 300, 400, 500)
    //  : DOC #2, +1 DAYS, PV(0, 200)
    //  : DOC #3, +0 DAYS, PV(0, )

    const doc3 = web3.fromWei(await _documentReg.determineAuthorReward(accounts[1], DOC3));
    //console.log('reward of doc2 : ' + doc3);
    assert.equal(0, doc3 * 1, "wrong amount of reward token determined doc #3");
  });

  it("determine author reward for last 1 day", async () => {

    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS
    //  : DOC #2, +1 DAYS
    //  : DOC #3, +0 DAYS

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const yesterdayMillis = todayMillis - (await _utility.getOneDayMillis()) * 1;

    const drp = web3.fromWei(await _utility.getDailyRewardPool(70, yesterdayMillis));
    const doc2 = web3.fromWei(await _documentReg.determineAuthorReward(accounts[1], DOC2));
    //console.log('reward of doc2 : ' + doc2);

    const sample = Math.round((doc2 * 1) / 100);
    const reference = Math.round((drp * 1) * (200 / 700) / 100);
    assert.equal(reference, sample, "wrong amount of reward token determined doc #2");
  });

  it("determine author reward for last 5 days", async () => {

    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS
    //  : DOC #2, +1 DAYS
    //  : DOC #3, +0 DAYS

    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;

    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 5 * dayMillis));

    const doc1 = web3.fromWei(await _documentReg.determineAuthorReward(accounts[1], DOC1));
    //console.log('reward of doc1 : ' + doc1);

    const ref_1 = (drp_1 * 1) * (100 / (100 + 200 + 100 + 300));
    const ref_2 = (drp_2 * 1) * (200 / (200 + 200));
    const ref_3 = (drp_3 * 1) * (300 / (300 + 300));
    const ref_4 = (drp_4 * 1) * (400 / (400 + 400));
    const ref_5 = (drp_5 * 1) * (500 / (500 + 500));

    const sample = Math.round((doc1 * 1) / 100);
    const reference = Math.round((ref_1 + ref_2 + ref_3 + ref_4 + ref_5) / 100);
    assert.equal(reference, sample, "wrong amount of reward token determined doc #1");
  });

  it("claim author reward from a wrong account", async () => {
    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS, PV(0, 100, 200, 300, 400, 500)
    //  : DOC #2, +1 DAYS, PV(0, 200)
    //  : DOC #3, +0 DAYS, PV(0, )

    // #1. check initial token balance
    const balance_A1_S1 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    //console.log('balance_A1_S1 : ' + balance_A1_S1.toString());
    assert.equal(300000, balance_A1_S1 * 1);

    const balance_A4_S1 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether");
    //console.log('balance_A4_S1 : ' + balance_A4_S1.toString());
    assert.equal(100000, balance_A4_S1 * 1);

    // #2. claim reward with a wrong account (DOC #1, ACCOUNT #4)
    await _documentReg.claimAuthorReward(DOC1, { from: accounts[4] });
    const balance_A1_S2 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    const balance_A4_S2 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether");
    //console.log('balance_A1_S2 : ' + balance_A1_S2.toString());
    //console.log('balance_A4_S2 : ' + balance_A4_S2.toString());
    assert.equal(balance_A1_S1 * 1, balance_A1_S2 * 1);
    assert.equal(balance_A4_S1 * 1, balance_A4_S2 * 1);
  });

  it("claim author reward for 0days", async () => {
    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS, PV(0, 100, 200, 300, 400, 500)
    //  : DOC #2, +1 DAYS, PV(0, 200)
    //  : DOC #3, +0 DAYS, PV(0, )

    // #1. check initial token balance
    const balance_A1_S1 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    //console.log('balance_A1_S1 : ' + balance_A1_S1.toString());
    assert.equal(300000, balance_A1_S1 * 1);

    // #2. check the amount of claimed reward (DOC #3, ACCOUNT #1)
    const rwdDoc3 = web3.fromWei(await _documentReg.determineAuthorReward(accounts[1], DOC3));
    await _documentReg.claimAuthorReward(DOC3, { from: accounts[1] });
    const balance_A1_S2 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    //console.log('balance_A1_S2 : ' + balance_A1_S2.toString());
    var ref = Math.round((balance_A1_S1 * 1) / 100);
    var smp = Math.round((balance_A1_S2 * 1) / 100);
    assert.equal(ref, smp);
  });

  it("claim author reward for last 5days", async () => {
    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS, PV(0, 100, 200, 300, 400, 500)
    //  : DOC #2, +1 DAYS, PV(0, 200)
    //  : DOC #3, +0 DAYS, PV(0, )

    // #1. check initial token balance
    const balance_A1_S1 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    //console.log('balance_A1_S1 : ' + balance_A1_S1.toString());
    assert.equal(300000, balance_A1_S1 * 1);

    const balance_A4_S1 = web3.fromWei(await _deck.balanceOf(accounts[4]), "ether");
    //console.log('balance_A4_S1 : ' + balance_A4_S1.toString());
    assert.equal(100000, balance_A4_S1 * 1);

    // #2. check the amount of claimed reward (DOC #1, ACCOUNT #1)
    const rwdDoc1 = web3.fromWei(await _documentReg.determineAuthorReward(accounts[1], DOC1));
    await _documentReg.claimAuthorReward(DOC1, { from: accounts[1] });
    const balance_A1_S2 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    //console.log('balance_A1_S2 : ' + balance_A1_S2.toString());
    //console.log('rwdDoc1 : ' + rwdDoc1.toString());
    var ref = Math.round(((balance_A1_S1 * 1) + (rwdDoc1 * 1)) / 100);
    var smp = Math.round((balance_A1_S2 * 1) / 100);
    assert.equal(ref, smp);
  });

  it("calculate estimated author reward for today", async () => {
    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS, PV(0, 100, 200, 300, 400, 500)
    //  : DOC #2, +1 DAYS, PV(0, 200)
    //  : DOC #3, +0 DAYS, PV(0, )

    const sample = await _documentReg.calculateAuthorReward(100, 300);
    //console.log('sample : ' + sample * 1);

    var rp = await _utility.getDailyRewardPool(70, DAYS_0);
    var ref = Math.round(((100 / 300) * (rp * 1)) / 100);
    var smp = Math.round((sample * 1) / 100);
    assert.equal(ref, smp);
  });

  it("get withdrawn author reward on a user document", async () => {
    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS, PV(0, 100, 200, 300, 400, 500)
    //  : DOC #2, +1 DAYS, PV(0, 200)
    //  : DOC #3, +0 DAYS, PV(0, )

    // #1. check withdrawn amount
    const withdrawDoc1 = await _documentReg.getAuthorWithdrawOnUserDocument(accounts[1], DOC1);
    //console.log('withdrawDoc1 : ' + withdrawDoc1.toString());
    assert.isBelow(821917, Math.floor(withdrawDoc1 * 1), "withdrawn author reward is 0");
  });

  it("should be able to claim reward only once", async () => {
    // ------------------
    // ACCOUNT[1]
    //  : 300,000 DECK
    //  : DOC #1, +5 DAYS, PV(0, 100, 200, 300, 400, 500)
    //  : DOC #2, +1 DAYS, PV(0, 200)
    //  : DOC #3, +0 DAYS, PV(0, )

    // #1. check initial token balance
    const balance_A1_S1 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    //console.log('balance_A1_S1 : ' + balance_A1_S1.toString());

    // #2. check the amount of claimed reward (DOC #1, ACCOUNT #1)
    const rwdDoc1 = web3.fromWei(await _documentReg.determineAuthorReward(accounts[1], DOC1));
    await _documentReg.claimAuthorReward(DOC1, { from: accounts[1] });
    const balance_A1_S2 = web3.fromWei(await _deck.balanceOf(accounts[1]), "ether");
    //console.log('balance_A1_S2 : ' + balance_A1_S2.toString());

    assert.equal(0, rwdDoc1 * 1, "determined author reward is not 0");
    assert.equal(balance_A1_S1 * 1, balance_A1_S2 * 1, "claimed author reward > 0");
  });

});
