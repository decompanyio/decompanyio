const RewardPool = artifacts.require("./RewardPool.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
//var moment = require('moment');

contract("DocumentRegistry - writing page views", accounts => {

  const DOC1 = "10000000000000000000000000000001";  // accounts[1]
  const DOC2 = "10000000000000000000000000000002";  // accounts[1]
  const DOC3 = "10000000000000000000000000000003";  // accounts[1]
  const DOC4 = "10000000000000000000000000000004";  // accounts[2]
  const DOC5 = "10000000000000000000000000000005";  // accounts[2]

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
  let _documentRegistry = undefined;
  let _startTime = undefined;
  let _endTime = undefined;

  it("Setting up...", async () => {

    _pool = await RewardPool.deployed();

    // prepare
    _documentRegistry = await DocumentRegistry.deployed();
    await _documentRegistry.setRewardPool(accounts[0]);
    await _documentRegistry.setCreator(accounts[0]);
    await _documentRegistry.setFoundation(accounts[0]);
    //await _documentRegistry.init(_pool.address);

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

    // ------------------
    // ACCOUNT[1]
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    await _documentRegistry.register(accounts[1], DOC1, { from: accounts[0] });
    await _documentRegistry.register(accounts[1], DOC2, { from: accounts[0] });
    await _documentRegistry.register(accounts[1], DOC3, { from: accounts[0] });
    await _documentRegistry.register(accounts[2], DOC4, { from: accounts[0] });
    await _documentRegistry.register(accounts[2], DOC5, { from: accounts[0] });

    await _documentRegistry.update(accounts[1], DOC1, DAYS_5, 0, 0, { from: accounts[0] });
    await _documentRegistry.update(accounts[1], DOC2, DAYS_1, 0, 0, { from: accounts[0] });
    await _documentRegistry.update(accounts[1], DOC3, DAYS_0, 0, 0, { from: accounts[0] });
    await _documentRegistry.update(accounts[2], DOC4, DAYS_8, 0, 0, { from: accounts[0] });
    await _documentRegistry.update(accounts[2], DOC5, DAYS_1, 0, 0, { from: accounts[0] });

    await _documentRegistry.setPageView(DOC1, DAYS_1, 100, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC1, DAYS_2, 200, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC1, DAYS_3, 300, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC1, DAYS_4, 400, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC1, DAYS_5, 500, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC2, DAYS_1, 200, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_1, 100, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_2, 200, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_3, 300, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_4, 400, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_5, 500, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_6, 600, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_7, 700, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC4, DAYS_8, 800, { from: accounts[0] });
    await _documentRegistry.setPageView(DOC5, DAYS_1, 300, { from: accounts[0] });

    assert.isTrue(true);
  });

  // writing the page view
  // 1. 오늘의 page view 기록하기 (Foundation만 가능)
  // 2. 과거 특정 날짜의 page view 업데이트하기 (Foundation만 가능)
  // 3. 특정일의 여러 문서의 pv를 한 번에 기록하기 (Foundation만 가능)

  it("set page view for 0 day", async () => {
    const pv_D3_D0 = (await _documentRegistry.getPageView(DOC3, DAYS_0)) * 1;
    assert.equal(0, pv_D3_D0, "different page view doc3, day0");
    const pv_D3_D1 = (await _documentRegistry.getPageView(DOC3, DAYS_1)) * 1;
    assert.equal(0, pv_D3_D1, "different page view doc3, day1");
  });

  it("set page view for 5 day", async () => {

    // ------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D1_D0 = (await _documentRegistry.getPageView(DOC1, DAYS_0)) * 1;
    assert.equal(0, pv_D1_D0, "different page view doc1, day0");
    const pv_D1_D1 = (await _documentRegistry.getPageView(DOC1, DAYS_1)) * 1;
    assert.equal(100, pv_D1_D1, "different page view doc1, day1");
    const pv_D1_D2 = (await _documentRegistry.getPageView(DOC1, DAYS_2)) * 1;
    assert.equal(200, pv_D1_D2, "different page view doc1, day2");
    const pv_D1_D3 = (await _documentRegistry.getPageView(DOC1, DAYS_3)) * 1;
    assert.equal(300, pv_D1_D3, "different page view doc1, day3");
    const pv_D1_D4 = (await _documentRegistry.getPageView(DOC1, DAYS_4)) * 1;
    assert.equal(400, pv_D1_D4, "different page view doc1, day4");
    const pv_D1_D5 = (await _documentRegistry.getPageView(DOC1, DAYS_5)) * 1;
    assert.equal(500, pv_D1_D5, "different page view doc1, day5");
    const pv_D1_D6 = (await _documentRegistry.getPageView(DOC1, DAYS_6)) * 1;
    assert.equal(0, pv_D1_D6, "different page view doc1, day6");
  });

  it("get total page view for 8 day", async () => {

    // ------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D4_D0 = (await _documentRegistry.getTotalPageView(DAYS_0)) * 1;
    assert.equal(0, pv_D4_D0, "different total page view day0");
    const tpvs_D4_D0 = (await _documentRegistry.getTotalPageViewSquare(DAYS_0)) * 1;
    assert.equal(0, tpvs_D4_D0, "different total page view square day0");
    const pv_D4_D1 = (await _documentRegistry.getTotalPageView(DAYS_1)) * 1;
    assert.equal(700, pv_D4_D1, "different total page view day1");
    const tpvs_D4_D1 = (await _documentRegistry.getTotalPageViewSquare(DAYS_1)) * 1;
    assert.equal(150000, tpvs_D4_D1, "different total page view square day1");
    const pv_D4_D2 = (await _documentRegistry.getTotalPageView(DAYS_2)) * 1;
    assert.equal(400, pv_D4_D2, "different total page view day2");
    const tpvs_D4_D2 = (await _documentRegistry.getTotalPageViewSquare(DAYS_2)) * 1;
    assert.equal(80000, tpvs_D4_D2, "different total page view square day2");
    const pv_D4_D3 = (await _documentRegistry.getTotalPageView(DAYS_3)) * 1;
    assert.equal(600, pv_D4_D3, "different total page view day3");
    const tpvs_D4_D3 = (await _documentRegistry.getTotalPageViewSquare(DAYS_3)) * 1;
    assert.equal(180000, tpvs_D4_D3, "different total page view square day3");
    const pv_D4_D4 = (await _documentRegistry.getTotalPageView(DAYS_4)) * 1;
    assert.equal(800, pv_D4_D4, "different total page view day4");
    const tpvs_D4_D4 = (await _documentRegistry.getTotalPageViewSquare(DAYS_4)) * 1;
    assert.equal(320000, tpvs_D4_D4, "different total page view square day4");
    const pv_D4_D5 = (await _documentRegistry.getTotalPageView(DAYS_5)) * 1;
    assert.equal(1000, pv_D4_D5, "different total page view day5");
    const tpvs_D4_D5 = (await _documentRegistry.getTotalPageViewSquare(DAYS_5)) * 1;
    assert.equal(500000, tpvs_D4_D5, "different total page view square day5");
    const pv_D4_D6 = (await _documentRegistry.getTotalPageView(DAYS_6)) * 1;
    assert.equal(600, pv_D4_D6, "different total page view day6");
    const tpvs_D4_D6 = (await _documentRegistry.getTotalPageViewSquare(DAYS_6)) * 1;
    assert.equal(360000, tpvs_D4_D6, "different total page view square day6");
    const pv_D4_D7 = (await _documentRegistry.getTotalPageView(DAYS_7)) * 1;
    assert.equal(700, pv_D4_D7, "different total page view day7");
    const tpvs_D4_D7 = (await _documentRegistry.getTotalPageViewSquare(DAYS_7)) * 1;
    assert.equal(490000, tpvs_D4_D7, "different total page view square day7");
    const pv_D4_D8 = (await _documentRegistry.getTotalPageView(DAYS_8)) * 1;
    assert.equal(800, pv_D4_D8, "different total page view day8");
    const tpvs_D4_D8 = (await _documentRegistry.getTotalPageViewSquare(DAYS_8)) * 1;
    assert.equal(640000, tpvs_D4_D8, "different total page view square day8");
    const pv_D4_D9 = (await _documentRegistry.getTotalPageView(DAYS_9)) * 1;
    assert.equal(0, pv_D4_D9, "different total page view day9");
    const tpvs_D4_D9 = (await _documentRegistry.getTotalPageViewSquare(DAYS_9)) * 1;
    assert.equal(0, tpvs_D4_D9, "different total page view square day9");
  });

  it("delete page view for 3 day", async () => {

    // ------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D4_D3_S1 = (await _documentRegistry.getPageView(DOC4, DAYS_3)) * 1;
    assert.equal(300, pv_D4_D3_S1, "different page view doc4, s1");
    //console.log("pv_D4_D3_S1");

    await _documentRegistry.deletePageView(DOC4, DAYS_3, { from: accounts[0] });
    const pv_D4_D3_S2 = (await _documentRegistry.getPageView(DOC4, DAYS_3)) * 1;
    assert.equal(0, pv_D4_D3_S2, "different page view doc4, s2");
    //console.log("pv_D4_D3_S2");

    await _documentRegistry.setPageView(DOC4, DAYS_3, 300, { from: accounts[0] });
    const pv_D4_D3_S3 = (await _documentRegistry.getPageView(DOC4, DAYS_3)) * 1;
    assert.equal(300, pv_D4_D3_S3, "different page view doc4, s3");
    //console.log("pv_D4_D3_S3");
  });

  it("set page view for 3 day with user account", async () => {

        // ------------------
        // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
        // DOC #2 : ACOUNT[1], PV(0, 200)
        // DOC #3 : ACOUNT[1], PV(0, )
        // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
        // DOC #5 : ACOUNT[2], PV(0, 300)

        const pv_D4_D3_S1 = (await _documentRegistry.getPageView(DOC4, DAYS_3)) * 1;
        assert.equal(300, pv_D4_D3_S1, "different page view doc4, s1");
        //console.log("pv_D4_D3_S1");

        await _documentRegistry.deletePageView(DOC4, DAYS_3, { from: accounts[0] });
        const pv_D4_D3_S2 = (await _documentRegistry.getPageView(DOC4, DAYS_3)) * 1;
        assert.equal(0, pv_D4_D3_S2, "different page view doc4, s2");
        //console.log("pv_D4_D3_S2");

        try {
          await _documentRegistry.setPageView(DOC4, DAYS_3, 300, { from: accounts[2] });
        } catch (error) {
          const revertFound = error.message.search('revert') >= 0;
          assert.strictEqual(revertFound, true);
        }
        const pv_D4_D3_S3 = (await _documentRegistry.getPageView(DOC4, DAYS_3)) * 1;
        assert.equal(0, pv_D4_D3_S3, "different page view doc4, s3");
        //console.log("pv_D4_D3_S3");

        await _documentRegistry.setPageView(DOC4, DAYS_3, 300, { from: accounts[0] });
        const pv_D4_D3_S4 = (await _documentRegistry.getPageView(DOC4, DAYS_3)) * 1;
        assert.equal(300, pv_D4_D3_S4, "different page view doc4, s4");
        //console.log("pv_D4_D3_S4");
  });

  it("update page view for 5 day", async () => {

    // ------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D1_D5_S1 = (await _documentRegistry.getPageView(DOC1, DAYS_5)) * 1;
    assert.equal(500, pv_D1_D5_S1, "different page view doc1, s1");
    //console.log("pv_D1_D5_S1");

    await _documentRegistry.updatePageView(DOC1, DAYS_5, 999, { from: accounts[0] });
    const pv_D1_D5_S2 = (await _documentRegistry.getPageView(DOC1, DAYS_5)) * 1;
    assert.equal(999, pv_D1_D5_S2, "different page view doc1, s2");
    //console.log("pv_D1_D5_S2");

    const pv_D4_D5_S1 = (await _documentRegistry.getTotalPageView(DAYS_5)) * 1;
    assert.equal(1499, pv_D4_D5_S1, "different total page view day5 s1");
    const tpvs_D4_D5_S1 = (await _documentRegistry.getTotalPageViewSquare(DAYS_5)) * 1;
    assert.equal(250000 + (999 ** 2), tpvs_D4_D5_S1, "different total page view square day5 s1");
    //console.log("tpvs_D4_D5_S1");

    await _documentRegistry.updatePageView(DOC1, DAYS_5, 500, { from: accounts[0] });
    const pv_D1_D5_S3 = (await _documentRegistry.getPageView(DOC1, DAYS_5)) * 1;
    assert.equal(500, pv_D1_D5_S3, "different page view doc1, s3");
    //console.log("pv_D1_D5_S3");

    const pv_D4_D5_S2 = (await _documentRegistry.getTotalPageView(DAYS_5)) * 1;
    assert.equal(1000, pv_D4_D5_S2, "different total page view day5 s2");
    const tpvs_D4_D5_S2 = (await _documentRegistry.getTotalPageViewSquare(DAYS_5)) * 1;
    assert.equal(500000, tpvs_D4_D5_S2, "different total page view square day5 s2");
    //console.log("tpvs_D4_D5_S2");
  });

  it("update page view of multi documents (#1, #2, #4, #5) for 1 day", async () => {

    // ------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D1_D1_S1 = (await _documentRegistry.getPageView(DOC1, DAYS_1)) * 1;
    assert.equal(100, pv_D1_D1_S1, "different page view doc1, s1");
    const pv_D2_D1_S1 = (await _documentRegistry.getPageView(DOC2, DAYS_1)) * 1;
    assert.equal(200, pv_D2_D1_S1, "different page view doc2, s1");
    const pv_D4_D1_S1 = (await _documentRegistry.getPageView(DOC4, DAYS_1)) * 1;
    assert.equal(100, pv_D4_D1_S1, "different page view doc4, s1");
    const pv_D5_D1_S1 = (await _documentRegistry.getPageView(DOC5, DAYS_1)) * 1;
    assert.equal(300, pv_D5_D1_S1, "different page view doc5, s1");
    //console.log("pv_D1_S1");

    const docs = [
      DOC1,
      DOC2,
      DOC4,
      DOC5
    ];

    // testing page views
    const pvs = [
      1,
      2,
      4,
      5
    ];

    // original page views
    const opvs = [
      100,
      200,
      100,
      300
    ];

    await _documentRegistry.updatePageViews(DAYS_1, docs, pvs, { from: accounts[0] });

    const pv_D1_D1_S2 = (await _documentRegistry.getPageView(DOC1, DAYS_1)) * 1;
    assert.equal(1, pv_D1_D1_S2, "different page view doc1, s2");
    const pv_D2_D1_S2 = (await _documentRegistry.getPageView(DOC2, DAYS_1)) * 1;
    assert.equal(2, pv_D2_D1_S2, "different page view doc2, s2");
    const pv_D4_D1_S2 = (await _documentRegistry.getPageView(DOC4, DAYS_1)) * 1;
    assert.equal(4, pv_D4_D1_S2, "different page view doc4, s2");
    const pv_D5_D1_S2 = (await _documentRegistry.getPageView(DOC5, DAYS_1)) * 1;
    assert.equal(5, pv_D5_D1_S2, "different page view doc5, s2");
    //console.log("pv_D1_S2");

    const tpv_D1_S1 = (await _documentRegistry.getTotalPageView(DAYS_1)) * 1;
    assert.equal(1+2+4+5, tpv_D1_S1, "different total page view day1 s1");
    const tpvs_D1_S1 = (await _documentRegistry.getTotalPageViewSquare(DAYS_1)) * 1;
    assert.equal(1 + (2 ** 2) + (4 ** 2) + (5 ** 2), tpvs_D1_S1, "different total page view square day1 s1");
    //console.log("tpvs_D1_S1");

    await _documentRegistry.updatePageViews(DAYS_1, docs, opvs, { from: accounts[0] });

    const pv_D1_D1_S3 = (await _documentRegistry.getPageView(DOC1, DAYS_1)) * 1;
    assert.equal(100, pv_D1_D1_S3, "different page view doc1, s3");
    const pv_D2_D1_S3 = (await _documentRegistry.getPageView(DOC2, DAYS_1)) * 1;
    assert.equal(200, pv_D2_D1_S3, "different page view doc2, s3");
    const pv_D4_D1_S3 = (await _documentRegistry.getPageView(DOC4, DAYS_1)) * 1;
    assert.equal(100, pv_D4_D1_S3, "different page view doc4, s3");
    const pv_D5_D1_S3 = (await _documentRegistry.getPageView(DOC5, DAYS_1)) * 1;
    assert.equal(300, pv_D5_D1_S3, "different page view doc5, s3");
    //console.log("pv_D1_S3");

    const pv_D4_D5_S2 = (await _documentRegistry.getTotalPageView(DAYS_1)) * 1;
    assert.equal(100 + 200 + 100 + 300, pv_D4_D5_S2, "different total page view day1 s2");
    const tpvs_D4_D5_S2 = (await _documentRegistry.getTotalPageViewSquare(DAYS_1)) * 1;
    assert.equal((100 ** 2) + (200 ** 2) + (100 ** 2) + (300 ** 2), tpvs_D4_D5_S2, "different total page view square day1 s2");
    //console.log("tpvs_D1_S3");
  });

});
