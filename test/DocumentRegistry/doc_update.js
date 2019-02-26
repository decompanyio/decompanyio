const { getWeb3, getContractInstance } = require("../helpers");
const web3 = getWeb3();
const getInstance = getContractInstance(web3);

const RewardPool = artifacts.require("./RewardPool.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
//var moment = require('moment');

contract("DocumentRegistry - upadte", accounts => {

  const DOC1 = web3.utils.fromAscii("10000000000000000000000000000001");  // accounts[1]
  const DOC2 = web3.utils.fromAscii("10000000000000000000000000000002");  // accounts[1]
  const DOC3 = web3.utils.fromAscii("10000000000000000000000000000003");  // accounts[1]
  const DOC4 = web3.utils.fromAscii("10000000000000000000000000000004");  // accounts[2]
  const DOC5 = web3.utils.fromAscii("10000000000000000000000000000005");  // accounts[2]

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

    const DOC_COUNT_S0 = await _documentRegistry.count();
    assert.equal(0, DOC_COUNT_S0, "the doc map is not empty");
    await _documentRegistry.register(accounts[0], DOC1);
    const DOC_COUNT_S1 = await _documentRegistry.count();
    assert.equal(1, DOC_COUNT_S1*1, "the doc map is still empty");

    const doc1 = await _documentRegistry.getDocument(DOC1);
    //console.log("doc1 : " + doc1);
    assert.equal(accounts[0], doc1[0], "wrong address");
    assert.isBelow(0, doc1[1]*1, "wrong createTime");
    assert.equal(0, doc1[2]*1, "wrong lastClaimedDate");
    assert.equal(0, doc1[3]*1, "wrong withdraw");
  });

  // 업데이트하기
  // 1. 특정 문서를 업데이트하기 (foundation만 가능)
  // 2. 특정 문서를 등록헤제하기 (Foundation만 가능)
  // 3. 일자 별 정산된 보상액 기록하기 (Foundation만 가능)

  it("update a document", async () => {

    // ------------------
    // ACCOUNT[1]
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)

    const DOC_COUNT_S0 = await _documentRegistry.count();
    await _documentRegistry.update(accounts[1], DOC1, 1, 3, 4);
    const DOC_COUNT_S1 = await _documentRegistry.count();
    assert.equal(1, DOC_COUNT_S1*1, "the doc map is still empty");

    const doc1 = await _documentRegistry.getDocument(DOC1);
    //console.log("doc1 : " + doc1);
    assert.equal(accounts[1], doc1[0], "wrong address");
    assert.equal(1, doc1[1]*1, "wrong createTime");
    assert.equal(3, doc1[2]*1, "wrong lastClaimedDate");
    assert.equal(4, doc1[3]*1, "wrong withdraw");
  });

  it("try to update a document with a user account", async () => {
    try {
      // calling from account #1 should throw exception
      await _documentRegistry.update(accounts[1], DOC1, 11, 13, 14, { from: accounts[1] });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.strictEqual(revertFound, true);
    }

    const doc1 = await _documentRegistry.getDocument(DOC1);
    //console.log("doc1 : " + doc1);
    assert.equal(accounts[1], doc1[0], "wrong address");
    assert.equal(1, doc1[1]*1, "wrong createTime");
    assert.equal(3, doc1[2]*1, "wrong lastClaimedDate");
    assert.equal(4, doc1[3]*1, "wrong withdraw");
  });

});
