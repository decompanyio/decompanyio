const Deck = artifacts.require("./Deck.sol");
const Utility = artifacts.require("./Utility.sol");
const DocumentReg = artifacts.require("./DocumentReg.sol");
const AuthorPool = artifacts.require("./AuthorPool.sol");
const CuratorPool = artifacts.require("./CuratorPool.sol");

contract("DocumentReg - confirm page view & total page view", accounts => {

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
  });

  it("confirm page view for 0 day", async () => {

    // ------------------
    // ACCOUNT[1]
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D3_D0 = (await _documentReg.getPageView(DOC3, DAYS_0)) * 1;
    assert.equal(0, pv_D3_D0, "different page view doc3, day0");
    const pv_D3_D1 = (await _documentReg.getPageView(DOC3, DAYS_1)) * 1;
    assert.equal(0, pv_D3_D1, "different page view doc3, day1");
  });

  it("confirm page view for 5 day", async () => {

    // ------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D1_D0 = (await _documentReg.getPageView(DOC1, DAYS_0)) * 1;
    assert.equal(0, pv_D1_D0, "different page view doc1, day0");
    const pv_D1_D1 = (await _documentReg.getPageView(DOC1, DAYS_1)) * 1;
    assert.equal(100, pv_D1_D1, "different page view doc1, day1");
    const pv_D1_D2 = (await _documentReg.getPageView(DOC1, DAYS_2)) * 1;
    assert.equal(200, pv_D1_D2, "different page view doc1, day2");
    const pv_D1_D3 = (await _documentReg.getPageView(DOC1, DAYS_3)) * 1;
    assert.equal(300, pv_D1_D3, "different page view doc1, day3");
    const pv_D1_D4 = (await _documentReg.getPageView(DOC1, DAYS_4)) * 1;
    assert.equal(400, pv_D1_D4, "different page view doc1, day4");
    const pv_D1_D5 = (await _documentReg.getPageView(DOC1, DAYS_5)) * 1;
    assert.equal(500, pv_D1_D5, "different page view doc1, day5");
    const pv_D1_D6 = (await _documentReg.getPageView(DOC1, DAYS_6)) * 1;
    assert.equal(0, pv_D1_D6, "different page view doc1, day6");
  });

  it("confirm total page view for 8 day", async () => {

    // ------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D4_D0 = (await _documentReg.getTotalPageView(DAYS_0)) * 1;
    assert.equal(0, pv_D4_D0, "different total page view day0");
    const tpvs_D4_D0 = (await _documentReg.getTotalPageViewSquare(DAYS_0)) * 1;
    assert.equal(0, tpvs_D4_D0, "different total page view square day0");
    const pv_D4_D1 = (await _documentReg.getTotalPageView(DAYS_1)) * 1;
    assert.equal(700, pv_D4_D1, "different total page view day1");
    const tpvs_D4_D1 = (await _documentReg.getTotalPageViewSquare(DAYS_1)) * 1;
    assert.equal(150000, tpvs_D4_D1, "different total page view square day1");
    const pv_D4_D2 = (await _documentReg.getTotalPageView(DAYS_2)) * 1;
    assert.equal(400, pv_D4_D2, "different total page view day2");
    const tpvs_D4_D2 = (await _documentReg.getTotalPageViewSquare(DAYS_2)) * 1;
    assert.equal(80000, tpvs_D4_D2, "different total page view square day2");
    const pv_D4_D3 = (await _documentReg.getTotalPageView(DAYS_3)) * 1;
    assert.equal(600, pv_D4_D3, "different total page view day3");
    const tpvs_D4_D3 = (await _documentReg.getTotalPageViewSquare(DAYS_3)) * 1;
    assert.equal(180000, tpvs_D4_D3, "different total page view square day3");
    const pv_D4_D4 = (await _documentReg.getTotalPageView(DAYS_4)) * 1;
    assert.equal(800, pv_D4_D4, "different total page view day4");
    const tpvs_D4_D4 = (await _documentReg.getTotalPageViewSquare(DAYS_4)) * 1;
    assert.equal(320000, tpvs_D4_D4, "different total page view square day4");
    const pv_D4_D5 = (await _documentReg.getTotalPageView(DAYS_5)) * 1;
    assert.equal(1000, pv_D4_D5, "different total page view day5");
    const tpvs_D4_D5 = (await _documentReg.getTotalPageViewSquare(DAYS_5)) * 1;
    assert.equal(500000, tpvs_D4_D5, "different total page view square day5");
    const pv_D4_D6 = (await _documentReg.getTotalPageView(DAYS_6)) * 1;
    assert.equal(600, pv_D4_D6, "different total page view day6");
    const tpvs_D4_D6 = (await _documentReg.getTotalPageViewSquare(DAYS_6)) * 1;
    assert.equal(360000, tpvs_D4_D6, "different total page view square day6");
    const pv_D4_D7 = (await _documentReg.getTotalPageView(DAYS_7)) * 1;
    assert.equal(700, pv_D4_D7, "different total page view day7");
    const tpvs_D4_D7 = (await _documentReg.getTotalPageViewSquare(DAYS_7)) * 1;
    assert.equal(490000, tpvs_D4_D7, "different total page view square day7");
    const pv_D4_D8 = (await _documentReg.getTotalPageView(DAYS_8)) * 1;
    assert.equal(800, pv_D4_D8, "different total page view day8");
    const tpvs_D4_D8 = (await _documentReg.getTotalPageViewSquare(DAYS_8)) * 1;
    assert.equal(640000, tpvs_D4_D8, "different total page view square day8");
    const pv_D4_D9 = (await _documentReg.getTotalPageView(DAYS_9)) * 1;
    assert.equal(0, pv_D4_D9, "different total page view day9");
    const tpvs_D4_D9 = (await _documentReg.getTotalPageViewSquare(DAYS_9)) * 1;
    assert.equal(0, tpvs_D4_D9, "different total page view square day9");
  });

  it("set foundation address", async () => {

    // set foundation as acount #4
    await _documentReg.setFoundation(accounts[4]);

    try {
      // calling from account #0 should throw exception
      await _documentReg.confirmPageView(DOC1, DAYS_0, 200, { from: accounts[0] });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.strictEqual(revertFound, true);
    }

    // check if the value was changed
    const pv_D1_D0 = (await _documentReg.getPageView(DOC1, DAYS_0)) * 1;
    assert.equal(0, pv_D1_D0, "different page view doc1, day0");

    // calling from account #4 should succeed
    await _documentReg.confirmPageView(DOC1, DAYS_0, 200, { from: accounts[4] });

    // check if the value was changed #2
    const pv_D1_D0_2 = (await _documentReg.getPageView(DOC1, DAYS_0)) * 1;
    assert.equal(200, pv_D1_D0_2, "different page view doc1, day0, stage 2");
  });

});
