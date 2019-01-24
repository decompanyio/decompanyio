const Utility = artifacts.require("./Utility.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
//var moment = require('moment');

contract("DocumentRegistry", accounts => {

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
    await _documentRegistry.init(_util.address);

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

    // assert
    assert.equal(1, 1, "failed to set up");
  });

  it("register a document", async () => {

    // ------------------
    // ACCOUNT[1]
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const DOC_COUNT_S0 = await _documentRegistry.count();
    assert.equal(0, DOC_COUNT_S0, "the doc map is not empty");
    await _documentRegistry.register(DOC1);
    const DOC_COUNT_S1 = await _documentRegistry.count();
    assert.equal(1, DOC_COUNT_S1*1, "the doc map is still empty");

    const doc1 = await _documentRegistry.getDocument(DOC1, 0);
    console.log("doc1 : " + doc1);
    assert.equal(accounts[0], doc1[0], "wrong address");
    assert.isBelow(0, doc1[1]*1, "wrong doc id");
    assert.equal(0, doc1[2]*1, "wrong page view");
  });

  it("confirm page view for 0 day", async () => {

    // ------------------
    // ACCOUNT[1]
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const pv_D3_D0 = (await _documentRegistry.getPageView(DOC3, DAYS_0)) * 1;
    assert.equal(0, pv_D3_D0, "different page view doc3, day0");
    const pv_D3_D1 = (await _documentRegistry.getPageView(DOC3, DAYS_1)) * 1;
    assert.equal(0, pv_D3_D1, "different page view doc3, day1");
  });

});
