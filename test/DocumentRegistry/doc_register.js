const Utility = artifacts.require("./Utility.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
//var moment = require('moment');

contract("DocumentRegistry - register", accounts => {

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

  // DOC #1 : ACCOUNTS[0]
  it("register a document with creator account", async () => {

    const DOC_COUNT_S0 = await _documentRegistry.count();
    assert.equal(0, DOC_COUNT_S0, "the doc map is not empty");
    await _documentRegistry.registerByCreator(accounts[0], DOC1, { from: accounts[0] } );
    const DOC_COUNT_S1 = await _documentRegistry.count();
    assert.equal(1, DOC_COUNT_S1*1, "the doc map is still empty");

    const doc1 = await _documentRegistry.getDocument(DOC1);
    //console.log("doc1 : " + doc1);
    assert.equal(accounts[0], doc1[0], "wrong address");
    assert.isBelow(0, doc1[1]*1, "wrong createTime");
    assert.equal(0, doc1[2]*1, "wrong lastClaimedDate");
    assert.equal(0, doc1[3]*1, "wrong withdraw");
  });

  // DOC #1 : ACCOUNTS[0]
  // DOC #2 : ACCOUNTS[1]
  it("register a document with a user account", async () => {

    const DOC_COUNT_S0 = await _documentRegistry.count();
    assert.equal(1, DOC_COUNT_S0, "wrong count");
    await _documentRegistry.register(DOC2, { from: accounts[1] });
    const DOC_COUNT_S1 = await _documentRegistry.count();
    assert.equal(2, DOC_COUNT_S1*1, "count wasn't increased");

    const doc1 = await _documentRegistry.getDocument(DOC2);
    //console.log("doc1 : " + doc1);
    assert.equal(accounts[1], doc1[0], "wrong address");
    assert.isBelow(0, doc1[1]*1, "wrong createTime");
    assert.equal(0, doc1[2]*1, "wrong lastClaimedDate");
    assert.equal(0, doc1[3]*1, "wrong withdraw");
  });

  // DOC #1 : ACCOUNTS[0]
  // DOC #2 : ACCOUNTS[1]
  // DOC #3 : ACCOUNTS[2]
  // DOC #4 : ACCOUNTS[2]
  // DOC #5 : ACCOUNTS[2]
  it("register multi document with a user account", async () => {

    await _documentRegistry.register(DOC3, { from: accounts[2] });
    await _documentRegistry.register(DOC4, { from: accounts[2] });
    await _documentRegistry.register(DOC5, { from: accounts[2] });

    const doc3 = await _documentRegistry.getDocument(DOC3);
    const doc4 = await _documentRegistry.getDocument(DOC4);
    const doc5 = await _documentRegistry.getDocument(DOC5);

    assert.equal(accounts[2], doc3[0], "wrong address doc3");
    assert.equal(accounts[2], doc4[0], "wrong address doc4");
    assert.equal(accounts[2], doc5[0], "wrong address doc5");

    assert.isBelow(0, doc3[1]*1, "wrong createTime doc3");
    assert.isBelow(0, doc4[1]*1, "wrong createTime doc4");
    assert.isBelow(0, doc5[1]*1, "wrong createTime doc5");

    assert.equal(0, doc3[2]*1, "wrong lastClaimedDate doc3");
    assert.equal(0, doc4[2]*1, "wrong lastClaimedDate doc4");
    assert.equal(0, doc5[2]*1, "wrong lastClaimedDate doc5");

    assert.equal(0, doc3[3]*1, "wrong withdraw doc3");
    assert.equal(0, doc4[3]*1, "wrong withdraw doc4");
    assert.equal(0, doc5[3]*1, "wrong withdraw doc5");
  });

  // 쓰기
  // 1. 신규 문서를 등록하기 (본인만 가능)
  // 2. 특정 문서를 등록헤제하기 (본인만 가능)
  // 3. 일자 별 정산된 보상액 기록하기 (본인만 가능)
  // 4. 등록된 문서의 Effective Page View를 입데이트하기 (Foundation만 가능)
  // 5. 한 사람이 여러 개의 문서를 등록하기

});
