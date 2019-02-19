const Utility = artifacts.require("./Utility.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
//var moment = require('moment');

contract("DocumentRegistry - reading page views", accounts => {

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

  let _util = undefined;
  let _documentRegistry = undefined;
  let _startTime = undefined;
  let _endTime = undefined;

  it("Setting up...", async () => {

    _util = await Utility.deployed();

    // prepare
    _documentRegistry = await DocumentRegistry.deployed();
    await _documentRegistry.setRewardPool(accounts[0]);
    await _documentRegistry.setCreator(accounts[0]);
    await _documentRegistry.setFoundation(accounts[0]);
    //await _documentRegistry.init(_util.address);

    DAYS_0 = ((await _util.getDateMillis()) * 1) - 0 * (await _util.getOneDayMillis());
    DAYS_1 = ((await _util.getDateMillis()) * 1) - 1 * (await _util.getOneDayMillis());
    DAYS_2 = ((await _util.getDateMillis()) * 1) - 2 * (await _util.getOneDayMillis());
    DAYS_3 = ((await _util.getDateMillis()) * 1) - 3 * (await _util.getOneDayMillis());
    DAYS_4 = ((await _util.getDateMillis()) * 1) - 4 * (await _util.getOneDayMillis());
    DAYS_5 = ((await _util.getDateMillis()) * 1) - 5 * (await _util.getOneDayMillis());
    DAYS_6 = ((await _util.getDateMillis()) * 1) - 6 * (await _util.getOneDayMillis());
    DAYS_7 = ((await _util.getDateMillis()) * 1) - 7 * (await _util.getOneDayMillis());
    DAYS_8 = ((await _util.getDateMillis()) * 1) - 8 * (await _util.getOneDayMillis());
    DAYS_9 = ((await _util.getDateMillis()) * 1) - 9 * (await _util.getOneDayMillis());

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

  // reading the page views
  // 1. 지정된 기간에 대해서 대상 문서의 Effective Page View 수를 열람하기
  // 2. 대상 문서의 미정산 날짜 목록과 해당일의 Effective Page View 수를 열람하기
  // 3. 유저 별 등록한 문서 목록 열람하기
  // 4. 유저 별 등록한 문서 중 지정된 기간 동안 Effective Page View가 양수인 목록 열람하기

  // ------------------
  // ACCOUNT[1]
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)
  it("get page view for 1 day", async () => {
    const pv_D1_D1 = (await _documentRegistry.getPageView(DOC1, DAYS_1)) * 1;
    assert.equal(100, pv_D1_D1, "different page view doc1, day1");
  });

});
