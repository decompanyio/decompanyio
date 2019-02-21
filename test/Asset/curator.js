const Deck = artifacts.require("./Deck.sol");
const Creator = artifacts.require("./Creator.sol");
const Curator = artifacts.require("./Curator.sol");
const RewardPool = artifacts.require("./RewardPool.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
const Ballot = artifacts.require("./Ballot.sol");
const Utility = artifacts.require("./Utility.sol");

contract("Asset - curator", accounts => {

  const DOC1 = web3.fromAscii("10000000000000000000000000000001");
  const DOC2 = web3.fromAscii("10000000000000000000000000000002");
  const DOC3 = web3.fromAscii("10000000000000000000000000000003");
  const DOC4 = web3.fromAscii("10000000000000000000000000000004");
  const DOC5 = web3.fromAscii("10000000000000000000000000000005");

  var DAYS_0;
  var DAYS_1;
  var DAYS_2;
  var DAYS_3;
  var DAYS_4;
  var DAYS_5;
  var DAYS_6;
  var DAYS_7;
  var DAYS_8;

  var VOTE100;
  var VOTE200;
  var VOTE300;
  var VOTE400;
  var VOTE500;
  var VOTE600;
  var VOTE700;
  var VOTE800;
  var VOTE900;

  let _deck = undefined;
  let _registry = undefined;
  let _ballot = undefined;
  let _creator = undefined;
  let _curator = undefined;
  let _pool = undefined;
  let _utility = undefined;

  it("Setting up...", async () => {

    _registry = await DocumentRegistry.deployed();
    _ballot = await Ballot.deployed();
    _creator = await Creator.deployed();
    _curator = await Curator.deployed();
    _pool = await RewardPool.deployed();
    _utility = await Utility.deployed();
    _deck = await Deck.deployed();

    await _creator.init(_pool.address);
    await _curator.init(_pool.address);
    await _pool.init(_deck.address, _registry.address, _ballot.address);

    await _pool.setCurator(_curator.address);
    await _pool.setCreator(_creator.address);
    await _pool.setFoundation(accounts[0]);

    await _registry.setRewardPool(_pool.address);
    await _registry.setCreator(_creator.address);
    await _registry.setFoundation(accounts[0]);

    await _ballot.setRewardPool(_pool.address);
    await _ballot.setCurator(_curator.address);
    await _ballot.setFoundation(accounts[0]);

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
    // - REWARD POOL : 200,000,000 DECK
    // - ACCOUNT[1] : 300,000 DECK
    // - ACCOUNT[2] : 200,000 DECK
    // - ACCOUNT[3] : 100,000 DECK
    // - ACCOUNT[4] : 100,000 DECK
    // - ACCOUNT[5] : 100,000 DECK

    const totalSupply = new web3.BigNumber('10000000000000000000000000000');
    const rewardPool = new web3.BigNumber('200000000000000000000000000');

    await _deck.mint(accounts[0], totalSupply, { from: accounts[0] });
    await _deck.transfer(_pool.address, rewardPool, { from: accounts[0] });

    await _deck.transfer(accounts[1], '300000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[2], '200000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[3], '100000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[4], '100000000000000000000000', { from: accounts[0] });
    await _deck.transfer(accounts[5], '100000000000000000000000', { from: accounts[0] });

    // ---------------------------
    // DOCUMENT REGISTRY
    // ---------------------------
    // ACOUNT[1] : DOC #1, +5 DAYS
    // ACOUNT[1] : DOC #2, +1 DAYS
    // ACOUNT[1] : DOC #3, +0 DAYS
    // ACOUNT[2] : DOC #4, +8 DAYS
    // ACOUNT[2] : DOC #5, +1 DAYS

    await _creator.register(DOC1, { from: accounts[1] });
    await _creator.register(DOC2, { from: accounts[1] });
    await _creator.register(DOC3, { from: accounts[1] });
    await _creator.register(DOC4, { from: accounts[2] });
    await _creator.register(DOC5, { from: accounts[2] });

    await _creator.update(accounts[1], DOC1, DAYS_5, 0, 0, { from: accounts[0] });
    await _creator.update(accounts[1], DOC2, DAYS_1, 0, 0, { from: accounts[0] });
    await _creator.update(accounts[1], DOC3, DAYS_0, 0, 0, { from: accounts[0] });
    await _creator.update(accounts[2], DOC4, DAYS_8, 0, 0, { from: accounts[0] });
    await _creator.update(accounts[2], DOC5, DAYS_1, 0, 0, { from: accounts[0] });

    // ---------------------------
    // Page Views
    // ---------------------------
    // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
    // DOC #2 : ACOUNT[1], PV(0, 200)
    // DOC #3 : ACOUNT[1], PV(0, )
    // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
    // DOC #5 : ACOUNT[2], PV(0, 300)
    await _registry.updatePageView(DOC1, DAYS_1, 100, { from: accounts[0] });
    await _registry.updatePageView(DOC1, DAYS_2, 200, { from: accounts[0] });
    await _registry.updatePageView(DOC1, DAYS_3, 300, { from: accounts[0] });
    await _registry.updatePageView(DOC1, DAYS_4, 400, { from: accounts[0] });
    await _registry.updatePageView(DOC1, DAYS_5, 500, { from: accounts[0] });
    await _registry.updatePageView(DOC2, DAYS_1, 200, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_1, 100, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_2, 200, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_3, 300, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_4, 400, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_5, 500, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_6, 600, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_7, 700, { from: accounts[0] });
    await _registry.updatePageView(DOC4, DAYS_8, 800, { from: accounts[0] });
    await _registry.updatePageView(DOC5, DAYS_1, 300, { from: accounts[0] });

    // ---------------------------
    // CURATOR POOL
    // ---------------------------
    // ACOUNT[3] : DOC #1(100), +4 DAYS
    // ACOUNT[3] : DOC #2(200), +1 DAYS
    // ACOUNT[4] : DOC #1(100), +3 DAYS
    // ACOUNT[4] : DOC #4(400), +7 DAYS
    // ACOUNT[4] : DOC #3(100), +0 DAYS
    // ACOUNT[4] : DOC #4(100), +5 DAYS

    // DOC #1 : Active Votes (0, 100, 200, 200, 100)
    // DOC #2 : Active Votes (200, 200)
    // DOC #3 : Active Votes (100)
    // DOC #4 : Active Votes (0, 0, 0, 100, 100, 500, 400, 400)
    // DOC #5 : Active Votes (0)

    VOTE100 = new web3.BigNumber('100000000000000000000');
    VOTE200 = new web3.BigNumber('200000000000000000000');
    VOTE300 = new web3.BigNumber('300000000000000000000');
    VOTE400 = new web3.BigNumber('400000000000000000000');
    VOTE500 = new web3.BigNumber('500000000000000000000');
    VOTE600 = new web3.BigNumber('600000000000000000000');
    VOTE700 = new web3.BigNumber('700000000000000000000');
    VOTE800 = new web3.BigNumber('800000000000000000000');
    VOTE900 = new web3.BigNumber('900000000000000000000');

    await _ballot.insert(await _ballot.next(), accounts[3], DOC1, VOTE100, DAYS_4, { from: accounts[0] });
    await _ballot.insert(await _ballot.next(), accounts[3], DOC2, VOTE200, DAYS_1, { from: accounts[0] });
    await _ballot.insert(await _ballot.next(), accounts[4], DOC1, VOTE100, DAYS_3, { from: accounts[0] });
    await _ballot.insert(await _ballot.next(), accounts[4], DOC4, VOTE400, DAYS_7, { from: accounts[0] });
    await _ballot.insert(await _ballot.next(), accounts[4], DOC3, VOTE100, DAYS_0, { from: accounts[0] });
    await _ballot.insert(await _ballot.next(), accounts[4], DOC4, VOTE100, DAYS_5, { from: accounts[0] });

    // assert
    assert.isTrue(true);
  });

  // ============================================
  // 투표하기 1 : 문서에 투표하기
  //  - 임의의 accounts[5]로
  //  - 특정 문서(DOC2)에
  //  - 임의의 토큰(100)을 투표하고
  //  - getVote로 저장된 vote의 값을 확인하기

  // ---- Page View ----
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)

  // ---- Votes ----
  // ** ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[3] : DOC #1(100), +4 DAYS
  // ACOUNT[3] : DOC #2(200), +1 DAYS
  // ACOUNT[4] : DOC #1(100), +3 DAYS
  // ACOUNT[4] : DOC #4(400), +7 DAYS
  // ACOUNT[4] : DOC #3(100), +0 DAYS
  // ACOUNT[4] : DOC #4(100), +5 DAYS

  // ---- Active Votes ----
  // DOC #1 : Active Votes (0, 100, 200, 200, 100)
  // DOC #2 : Active Votes (300, 200)
  // DOC #3 : Active Votes (100)
  // DOC #4 : Active Votes (0, 0, 0, 100, 100, 500, 400, 400)
  // DOC #5 : Active Votes (0)
  it("Vote #1: Add vote on a document", async () => {

    // prepare
    const docId = DOC2;
    const deposit = VOTE100;
    const voter = accounts[5];

    // check count
    const count_s1 = await _curator.count();
    await _curator.addVote(docId, deposit, { from: voter });
    const vid = await _curator.count();
    assert.equal((count_s1 * 1) + 1, vid * 1);

    // check value
    const vote = await _curator.getVote(vid);
    const ref_deposit = web3.fromWei(VOTE100, "ether") * 1;
    const sample_deposit = web3.fromWei(vote[3], "ether") * 1;
    assert.equal(voter, vote[0], "wrong voter address");
    assert.equal(docId, vote[1], "wrong document id");
    assert.equal(DAYS_0, vote[2] * 1, "wrong start date");
    assert.equal(ref_deposit, sample_deposit, "wrong deposit");
    assert.equal(0, vote[4] * 1, "wrong claimed date");
  });

  // ============================================
  // 투표하기 2 : 같은 문서에 한 번 더 투표하기
  //  - 투표하기 1 테스트에서와 동일하게 한 번 더 투표하고
  //  - getVote로 이번에 저장한 vote의 값과 투표하기 1에서 저장한 vote의 값을 모두 확인하기

  // ---- Page View ----
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)

  // ---- Votes ----
  // ** ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[3] : DOC #1(100), +4 DAYS
  // ACOUNT[3] : DOC #2(200), +1 DAYS
  // ACOUNT[4] : DOC #1(100), +3 DAYS
  // ACOUNT[4] : DOC #4(400), +7 DAYS
  // ACOUNT[4] : DOC #3(100), +0 DAYS
  // ACOUNT[4] : DOC #4(100), +5 DAYS

  // ---- Active Votes ----
  // DOC #1 : Active Votes (0, 100, 200, 200, 100)
  // DOC #2 : Active Votes (400, 200)
  // DOC #3 : Active Votes (100)
  // DOC #4 : Active Votes (0, 0, 0, 100, 100, 500, 400, 400)
  // DOC #5 : Active Votes (0)
  it("Vote #2: Add vote on a same document", async () => {

    // prepare
    const docId = DOC2;
    const deposit = VOTE100;
    const voter = accounts[5];

    // check count
    const count_s1 = await _curator.count();
    await _curator.addVote(docId, deposit, { from: voter });
    const vid = await _curator.count();
    assert.equal((count_s1 * 1) + 1, vid * 1);

    // check value
    const vote = await _curator.getVote(vid);
    const ref_deposit = web3.fromWei(VOTE100, "ether") * 1;
    const sample_deposit = web3.fromWei(vote[3], "ether") * 1;
    assert.equal(voter, vote[0], "wrong voter address");
    assert.equal(docId, vote[1], "wrong document id");
    assert.equal(DAYS_0, vote[2] * 1, "wrong start date");
    assert.equal(ref_deposit, sample_deposit, "wrong deposit");
    assert.equal(0, vote[4] * 1, "wrong claimed date");

    // check the previously voted value also
    const vote_prev = await _curator.getVote(vid-1);
    const sample_prev_deposit = web3.fromWei(vote_prev[3], "ether") * 1;
    assert.equal(voter, vote_prev[0], "wrong voter address prev");
    assert.equal(docId, vote_prev[1], "wrong document id prev");
    assert.equal(DAYS_0, vote_prev[2] * 1, "wrong start date prev");
    assert.equal(ref_deposit, sample_deposit, "wrong deposit prev");
    assert.equal(0, vote_prev[4] * 1, "wrong claimed date prev");

  });

  // ============================================
  // Active Votes 1 : 특정 문서의 active votes 열람하기
  //  - 문서 1~5의 active votes 값을 확인하기

  // ---- Page View ----
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)

  // ---- Votes ----
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[3] : DOC #1(100), +4 DAYS
  // ACOUNT[3] : DOC #2(200), +1 DAYS
  // ACOUNT[4] : DOC #1(100), +3 DAYS
  // ACOUNT[4] : DOC #4(400), +7 DAYS
  // ACOUNT[4] : DOC #3(100), +0 DAYS
  // ACOUNT[4] : DOC #4(100), +5 DAYS

  // ---- Active Votes ----
  // DOC #1 : Active Votes (0, 100, 200, 200, 100)
  // DOC #2 : Active Votes (400, 200)
  // DOC #3 : Active Votes (100)
  // DOC #4 : Active Votes (0, 0, 0, 100, 100, 500, 400, 400)
  // DOC #5 : Active Votes (0)
  it("Active Votes #1: The active votes of a document", async () => {
    // check active votes
    const av_doc_1 = web3.fromWei(await _curator.getActiveVotes(DOC1), "ether");
    assert.equal(0, av_doc_1 * 1);
    const av_doc_2 = web3.fromWei(await _curator.getActiveVotes(DOC2), "ether");
    assert.equal(400, av_doc_2 * 1);
    const av_doc_3 = web3.fromWei(await _curator.getActiveVotes(DOC3), "ether");
    assert.equal(100, av_doc_3 * 1);
    const av_doc_4 = web3.fromWei(await _curator.getActiveVotes(DOC4), "ether");
    assert.equal(0, av_doc_4 * 1);
    const av_doc_5 = web3.fromWei(await _curator.getActiveVotes(DOC5), "ether");
    assert.equal(0, av_doc_5 * 1);
  });

  // ============================================
  // Active Votes 2 : 특정 유저의 하나의 문서에 대한 active votes 열람하기
  //  - 문서 1~5의 유저 별 active votes 값을 확인하기

  // ---- Page View ----
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)

  // ---- Votes ----
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[3] : DOC #1(100), +4 DAYS
  // ACOUNT[3] : DOC #2(200), +1 DAYS
  // ACOUNT[4] : DOC #1(100), +3 DAYS
  // ACOUNT[4] : DOC #4(400), +7 DAYS
  // ACOUNT[4] : DOC #3(100), +0 DAYS
  // ACOUNT[4] : DOC #4(100), +5 DAYS

  // ---- Active Votes ----
  // DOC #1 : Active Votes (0, 100, 200, 200, 100)
  // DOC #2 : Active Votes (400, 200)
  // DOC #3 : Active Votes (100)
  // DOC #4 : Active Votes (0, 0, 0, 100, 100, 500, 400, 400)
  // DOC #5 : Active Votes (0)
  it("Active Votes #2: Active votes for a document from a specific user", async () => {
    // check active votes
    const av_doc_1_a3 = web3.fromWei(await _curator.getUserActiveVotes(accounts[3], DOC1), "ether");
    assert.equal(0, av_doc_1_a3 * 1);
    const av_doc_1_a4 = web3.fromWei(await _curator.getUserActiveVotes(accounts[4], DOC1), "ether");
    assert.equal(0, av_doc_1_a4 * 1);
    const av_doc_2_a5 = web3.fromWei(await _curator.getUserActiveVotes(accounts[5], DOC2), "ether");
    assert.equal(200, av_doc_2_a5 * 1);
    const av_doc_2_a3 = web3.fromWei(await _curator.getUserActiveVotes(accounts[3], DOC2), "ether");
    assert.equal(200, av_doc_2_a3 * 1);
    const av_doc_3_a4 = web3.fromWei(await _curator.getUserActiveVotes(accounts[4], DOC3), "ether");
    assert.equal(100, av_doc_3_a4 * 1);
    const av_doc_4_a4 = web3.fromWei(await _curator.getUserActiveVotes(accounts[4], DOC4), "ether");
    assert.equal(0, av_doc_4_a4 * 1);
    const av_doc_5_a4 = web3.fromWei(await _curator.getUserActiveVotes(accounts[4], DOC5), "ether");
    assert.equal(0, av_doc_5_a4 * 1);
  });

  // ============================================
  // Voted Documents 1 : 특정 유저가 투표한 문서의 목록
  //  - 유저 1~5의 유저 별 투표한 문서 목록을 받아와서
  //  - 문서 목록의 길이와 각 문서 ID를 확인하기

  // ---- Page View ----
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)

  // ---- Votes ----
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[3] : DOC #1(100), +4 DAYS
  // ACOUNT[3] : DOC #2(200), +1 DAYS
  // ACOUNT[4] : DOC #1(100), +3 DAYS
  // ACOUNT[4] : DOC #4(400), +7 DAYS
  // ACOUNT[4] : DOC #3(100), +0 DAYS
  // ACOUNT[4] : DOC #4(100), +5 DAYS

  // ---- Active Votes ----
  // DOC #1 : Active Votes (0, 100, 200, 200, 100)
  // DOC #2 : Active Votes (400, 200)
  // DOC #3 : Active Votes (100)
  // DOC #4 : Active Votes (0, 0, 0, 100, 100, 500, 400, 400)
  // DOC #5 : Active Votes (0)
  it("Voted Documents #1: List of documents that a user has voted for", async () => {
    // Testing for ACCOUNT[1]
    const docs_a1 = await _curator.getUserDocuments(accounts[1]);
    assert.equal(0, docs_a1.length, "wrong doc list for account[1]");
    // Testing for ACCOUNT[3]
    const docs_a3 = await _curator.getUserDocuments(accounts[3]);
    assert.equal(2, docs_a3.length, "wrong doc list for account[3]");
    assert.equal(web3.toAscii(DOC1), web3.toAscii(docs_a3[0]), "wrong doc list for account[3] #1");
    assert.equal(web3.toAscii(DOC2), web3.toAscii(docs_a3[1]), "wrong doc list for account[3] #2");
    // Testing for ACCOUNT[4]
    const docs_a4 = await _curator.getUserDocuments(accounts[4]);
    assert.equal(3, docs_a4.length, "wrong doc list for account[4]");
    assert.equal(web3.toAscii(DOC1), web3.toAscii(docs_a4[0]), "wrong doc list for account[4] #1");
    assert.equal(web3.toAscii(DOC4), web3.toAscii(docs_a4[1]), "wrong doc list for account[4] #2");
    assert.equal(web3.toAscii(DOC3), web3.toAscii(docs_a4[2]), "wrong doc list for account[4] #3");
    // Testing for ACCOUNT[5]
    const docs_a5 = await _curator.getUserDocuments(accounts[5]);
    assert.equal(1, docs_a5.length, "wrong doc list for account[5]");
    assert.equal(web3.toAscii(DOC2), web3.toAscii(docs_a5[0]), "wrong doc list for account[5] #1");
  });

  // ============================================
  // 보상액 산정하기 1 : 투표가 vesting 기간이 지나 만료되지 않은 경우 보상액은 0
  //  - ACCOUNT[4]가 DOC1에 +3 DAYS에 실행한 투표는
  //  - 아직 vesting 기간인 3 days + 1day(정산처리일)를 지나지 않았으므로
  //  - 보상액은 0임을 확인하기

  // ---- Page View ----
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)

  // ---- Votes ----
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[3] : DOC #1(100), +4 DAYS
  // ACOUNT[3] : DOC #2(200), +1 DAYS
  // ACOUNT[4] : DOC #1(100), +3 DAYS
  // ACOUNT[4] : DOC #4(400), +7 DAYS
  // ACOUNT[4] : DOC #3(100), +0 DAYS
  // ACOUNT[4] : DOC #4(100), +5 DAYS

  // ---- Active Votes ----
  // DOC #1 : Active Votes (0, 100, 200, 200, 100)
  // DOC #2 : Active Votes (400, 200)
  // DOC #3 : Active Votes (100)
  // DOC #4 : Active Votes (0, 0, 0, 100, 100, 500, 400, 400)
  // DOC #5 : Active Votes (0)
  it("Determine #1: The amount of reward for unexpired votes is 0.", async () => {
    const determined_doc1_a4 = web3.fromWei(await _curator.determine(DOC1, { from: accounts[4]}), "ether") * 1;
    assert.equal(0, determined_doc1_a4, "wrong determined amount on doc1 for account[4]");
  });

  // ============================================
  // 보상액 산정하기 2 : 투표 보상액을 인출하지 않은 경우 보상액 산정하기

  // ---- Page View ----
  // DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  // DOC #2 : ACOUNT[1], PV(0, 200)
  // DOC #3 : ACOUNT[1], PV(0, )
  // DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  // DOC #5 : ACOUNT[2], PV(0, 300)

  // ---- Votes ----
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[5] : DOC #2(100), +0 DAYS
  // ACOUNT[3] : DOC #1(100), +4 DAYS
  // ACOUNT[3] : DOC #2(200), +1 DAYS
  // ACOUNT[4] : DOC #1(100), +3 DAYS
  // ACOUNT[4] : DOC #4(400), +7 DAYS
  // ACOUNT[4] : DOC #3(100), +0 DAYS
  // ACOUNT[4] : DOC #4(100), +5 DAYS

  // ---- Active Votes ----
  // DOC #1 : Active Votes (  0, 100, 200, 200, 100)
  // DOC #2 : Active Votes (400, 200)
  // DOC #3 : Active Votes (100)
  // DOC #4 : Active Votes (  0,   0,   0, 100, 100, 500, 400, 400)
  // DOC #5 : Active Votes (0)
  it("Determine #2: The amount of reward for unexpired votes is 0.", async () => {

    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 5 * dayMillis));
    const drp_6 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 6 * dayMillis));
    const drp_7 = web3.fromWei(await _utility.getDailyRewardPool(30, todayMillis - 7 * dayMillis));

    // ACCOUNT[3], DOC1
    const ref_A3_DOC1_DAY1 = 0; //((drp_1 * 1) * (100 / (100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A3_DOC1_DAY2 = ((drp_2 * 1) * (100 / (100 + 100))) / (40000 + 40000) * 40000;
    const ref_A3_DOC1_DAY3 = ((drp_3 * 1) * (100 / (100 + 100))) / (90000 + 90000) * 90000;
    const ref_A3_DOC1_DAY4 = ((drp_4 * 1) * (100 / (100))) / (160000 + 160000) * 160000;
    const ref_A3_DOC1_DAY5 = 0; //((drp_5 * 1) * (100 / (100))) / (250000 + 250000) * 250000;
    const determined_doc1_a3 = web3.fromWei(await _curator.determine(DOC1, { from: accounts[3]}), "ether") * 1;
    const sample_doc1_a3 = Math.floor((determined_doc1_a3 * 1));
    const reference_doc1_a3 = Math.floor(ref_A3_DOC1_DAY2 + ref_A3_DOC1_DAY3 + ref_A3_DOC1_DAY4);
    assert.equal(reference_doc1_a3, sample_doc1_a3, "wrong amount of determined token : curator #3, doc #1, day 4");

    // ACCOUNT[3], DOC2
    const determined_doc2_a3 = web3.fromWei(await _curator.determine(DOC2, { from: accounts[3]}), "ether") * 1;
    const sample_doc2_a3 = Math.floor((determined_doc2_a3 * 1));
    assert.equal(0, sample_doc2_a3, "wrong amount of determined token : curator #3, doc #2, day 1");

    // ACCOUNT[4], DOC1
    const determined_doc1_a4 = web3.fromWei(await _curator.determine(DOC2, { from: accounts[3]}), "ether") * 1;
    const sample_doc1_a4 = Math.floor((determined_doc1_a4 * 1));
    assert.equal(0, sample_doc1_a4, "wrong amount of determined token : curator #4, doc #1, day 3");

    // ACCOUNT[4], DOC3
    const determined_doc3_a4 = web3.fromWei(await _curator.determine(DOC2, { from: accounts[3]}), "ether") * 1;
    const sample_doc3_a4 = Math.floor((determined_doc3_a4 * 1));
    assert.equal(0, sample_doc3_a4, "wrong amount of determined token : curator #4, doc #3, day 0");

    // ACCOUNT[4], DOC4
    const ref_A4_DOC4_DAY1 = 0; //((drp_1 * 1) * (100 / (100))) / (10000 + 40000 + 10000 + 90000) * 10000;
    const ref_A4_DOC4_DAY2 = 0; // ((drp_2 * 1) * (100 / (100))) / (40000 + 40000) * 40000;
    const ref_A4_DOC4_DAY3 = ((drp_3 * 1) * (100 / (100))) / (90000 + 90000) * 90000;
    const ref_A4_DOC4_DAY4 = ((drp_4 * 1) * (100 / (100))) / (160000 + 160000) * 160000;
    const ref_A4_DOC4_DAY5 = ((drp_5 * 1) * (500 / (500))) / (250000 + 250000) * 250000;
    const ref_A4_DOC4_DAY6 = ((drp_6 * 1) * (400 / (400))) / (360000) * 360000;
    const ref_A4_DOC4_DAY7 = ((drp_7 * 1) * (400 / (400))) / (490000) * 490000;
    const determined_doc4_a4 = web3.fromWei(await _curator.determine(DOC4, { from: accounts[4]}), "ether") * 1;
    const sample_doc4_a4 = Math.floor((determined_doc4_a4 * 1));
    const reference_doc4_a4 = Math.floor(ref_A4_DOC4_DAY3 + ref_A4_DOC4_DAY4 + ref_A4_DOC4_DAY5 + ref_A4_DOC4_DAY6 + ref_A4_DOC4_DAY7);
    assert.equal(reference_doc4_a4, sample_doc4_a4, "wrong amount of determined token : curator #4, doc #4, day 5,7");

    // ACCOUNT[5], DOC2
    const determined_doc2_a5 = web3.fromWei(await _curator.determine(DOC2, { from: accounts[5]}), "ether") * 1;
    const sample_doc2_a5 = Math.floor((determined_doc2_a5 * 1));
    assert.equal(0, sample_doc2_a5, "wrong amount of determined token : curator #5, doc #2, day 0");
  });

  // 보상액 산정하기 3 : 보상액 산정은 투/*의 소유자만 가능
  //  - 문서의 소유자가 아닌 경우 exception을 발생함
  //  - 문서의 소유자인 경우 산정된 보상액을 리턴
  it("Determine #2: Only the owner of the document can determine the amount of reward", async () => {

    const docId = DOC3;

    try {
      await _creator.determine(docId, { from: accounts[5] });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.strictEqual(revertFound, true);
      return;
    }
    assert.isTrue(false);
  });


    // 보상액 청구하기 #1 : 보상금은 소유자 본인만 청구할 수 있습니다.
    // 보상액 청구하기 #2 : 보상액을 청구하면 산정된 보상액과 동일한 금액을 지급받습니다.
    // 보상액 청구하기 #3 : 보상금은 한 번만 청구할 수 있습니다.
    // 보상액 산정하기 5 : 이미 인출한 보상액은 제외
    // 보상금 열람하기 #1 : 최근 N일간의 해당 문서에서 발생한 보상액 열람하기
    // 보상금 열람하기 #2 : 누구나 열람할 수 있음
    
/*
  // 보상액 청구하기 #1 : 보상금은 소유자 본인만 청구할 수 있습니다.
  it("Claim #1: can only be claimed by the owner", async () => {

    const src = _creator.address;
    const docId = DOC1;

    try {
      await _pool.claim(docId, src, { from: accounts[5] });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.strictEqual(revertFound, true);
      return;
    }
    assert.isTrue(false);
  });

  // 보상액 청구하기 #2 : 보상액을 청구하면 산정된 보상액과 동일한 금액을 지급받습니다.
  it("Claim #2: By claiming reward, be paid the same amount as the reward determined", async () => {

    // -------------------------
    // Preparing : 초기 잔고 및 보상액 확인하기
    // -------------------------
    const owner = accounts[1];
    const token = _deck.address;
    const source = _creator.address;
    const docId = DOC1;

    // Account #1 유저의 초기 잔고
    const bal_wei_S1 = await _deck.balanceOf(owner);
    const bal_ether_S1 = web3.fromWei(bal_wei_S1, "ether") * 1;
    //console.log('bal_ether_S1 : ' + bal_ether_S1.toString());

    // determined된 보상액
    const reward_wei = await _creator.determine(docId, { from: owner });
    const reward_ether = web3.fromWei(reward_wei, "ether") * 1;
    //console.log('reward_ether : ' + reward_ether.toString());

    // -------------------------
    // Testing : 청구하고 입급된 잔고 확인하기
    // -------------------------
    await _pool.claim(docId, source, { from: owner });
    //console.log('claimed');

    const bal_wei_S2 = await _deck.balanceOf(accounts[1]);
    const bal_ether_S2 = web3.fromWei(bal_wei_S2, "ether") * 1;
    //console.log('bal_ether_S2 : ' + bal_ether_S2.toString());

    // -------------------------
    // Check result
    // -------------------------
    var reference = bal_ether_S1 + reward_ether;
    var sample = bal_ether_S2;
    assert.equal(reference, sample);
  });

  // 보상액 청구하기 #3 : 보상금은 한 번만 청구할 수 있습니다.
  it("Claim #3: can only claim one's reward once", async () => {

    // -------------------------
    // Preparing : 초기 잔고 및 보상액 확인하기
    // -------------------------
    const owner = accounts[1];
    const token = _deck.address;
    const source = _creator.address;
    const docId = DOC1;

    // Account #1 유저의 초기 잔고
    const bal_wei_S1 = await _deck.balanceOf(owner);
    const bal_ether_S1 = web3.fromWei(bal_wei_S1, "ether") * 1;
    //console.log('bal_ether_S1 : ' + bal_ether_S1.toString());

    // determined된 보상액
    const reward_wei = await _creator.determine(docId, { from: owner });
    const reward_ether = web3.fromWei(reward_wei, "ether") * 1;
    //console.log('reward_ether : ' + reward_ether.toString());
    assert.equal(0, reward_ether, "determined amount is not 0");

    // -------------------------
    // Testing : 청구하고 입급된 잔고 확인하기
    // -------------------------
    await _pool.claim(docId, source, { from: owner });
    //console.log('claimed');

    const bal_wei_S2 = await _deck.balanceOf(accounts[1]);
    const bal_ether_S2 = web3.fromWei(bal_wei_S2, "ether") * 1;
    //console.log('bal_ether_S2 : ' + bal_ether_S2.toString());

    // -------------------------
    // Check result
    // -------------------------
    var reference = bal_ether_S1;
    var sample = bal_ether_S2;
    assert.equal(reference, sample);
  });

  // 보상액 산정하기 5 : 이미 인출한 보상액은 제외
  //  -----------------------------------
  //  DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  //  DOC #2 : ACOUNT[1], PV(0, 200)
  //  DOC #3 : ACOUNT[1], PV(0, )
  //  DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  //  DOC #5 : ACOUNT[2], PV(0, 300)
  //  -----------------------------------
  //  - 8일전(DAY_8) 등록한 문서(DOC #4)에 대해서
  //  - 3일전(DAY_3)에 보상을 인출한 경우,
  //  - 최종 산정된 보상액은 DAY_3부터 DAY_1까지의 보상액을 합산한 금액
  //
  //  - DAY_3 보상액 : (70% of Daily Reward Pool) * (300 / (300 + 300))
  //  - DAY_2 보상액 : (70% of Daily Reward Pool) * (200 / (200 + 200))
  //  - DAY_1 보상액 : (70% of Daily Reward Pool) * (100 / (100 + 200 + 100 + 300))
  it("Determine #5: Excludes the amount of reward already claimed.", async () => {

    // -------------------------
    // Preparing : 초기 잔고 및 보상액 확인하기
    // -------------------------
    const docId = DOC4;
    const owner = accounts[2];
    const foundation = accounts[0];

    const token = _deck.address;
    const source = _creator.address;

    // Account #2 유저의 초기 잔고
    const bal_wei_S1 = await _deck.balanceOf(owner);
    const bal_ether_S1 = web3.fromWei(bal_wei_S1, "ether") * 1;
    //console.log('bal_ether_S1 : ' + bal_ether_S1.toString());

    // determined된 보상액
    const reward_wei = await _creator.determine(docId, { from: owner });
    const reward_ether = web3.fromWei(reward_wei, "ether") * 1;
    //console.log('reward_ether : ' + reward_ether.toString());

    // -------------------------
    // Testing : DAYS_3에 지급 후 청구하고 입급된 잔고 확인하기
    // -------------------------

    //  - DAY_3기준으로 보상 지급하기
    const amount = await _creator.determineAt(docId, DAYS_3, { from: _pool.address });
    await _pool.pay(docId, owner, amount, DAYS_3, { from: foundation });
    //console.log('paid');

    const bal_wei_S2 = await _deck.balanceOf(owner);
    const bal_ether_S2 = web3.fromWei(bal_wei_S2, "ether") * 1;
    //console.log('bal_ether_S2 : ' + bal_ether_S2.toString());

    const paid_ether = bal_ether_S2 - bal_ether_S1;
    assert.isTrue(paid_ether > 0, "DAYS_3 reward wasn't paid");

    //  - 보상 청구하기
    await _pool.claim(docId, source, { from: owner });
    //console.log('claimed');

    const bal_wei_S3 = await _deck.balanceOf(owner);
    const bal_ether_S3 = web3.fromWei(bal_wei_S3, "ether") * 1;
    //console.log('bal_ether_S3 : ' + bal_ether_S3.toString());

    // -------------------------
    // Check result
    // -------------------------
    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 3 * dayMillis));

    const ref_1 = (drp_1 * 1) * (100 / (100 + 200 + 100 + 300));
    const ref_2 = (drp_2 * 1) * (200 / (200 + 200));
    const ref_3 = (drp_3 * 1) * (300 / (300 + 300));

    const sample1 = reward_ether;
    const sample2 = bal_ether_S3 - bal_ether_S1;
    const reference = paid_ether + ref_1 + ref_2 + ref_3;

    assert.equal(reference, sample1, "determined wrong amount");
    assert.equal(sample1, sample2, "paid wrong amount");
  });

  // 보상금 열람하기 #1 : 최근 N일간의 해당 문서에서 발생한 보상액 열람하기
  //  -----------------------------------
  //  DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  //  DOC #2 : ACOUNT[1], PV(0, 200)
  //  DOC #3 : ACOUNT[1], PV(0, )
  //  DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  //  DOC #5 : ACOUNT[2], PV(0, 300)
  //  -----------------------------------
  //  - 8일전(DAY_8) 등록한 문서(DOC #4)에 대해서
  //  - 3일전(DAY_3)에 보상을 인출한 경우,
  //  - 최근 7일간 합산 보상금은 DAY_7부터 DAY_1까지의 보상액을 합산한 금액

  //  - DAY_7 보상액 : (70% of Daily Reward Pool) * (700 / 700)
  //  - DAY_6 보상액 : (70% of Daily Reward Pool) * (600 / 600)
  //  - DAY_5 보상액 : (70% of Daily Reward Pool) * (500 / (500 + 500))
  //  - DAY_4 보상액 : (70% of Daily Reward Pool) * (400 / (400 + 400))
  //  - DAY_3 보상액 : (70% of Daily Reward Pool) * (300 / (300 + 300))
  //  - DAY_2 보상액 : (70% of Daily Reward Pool) * (200 / (200 + 200))
  //  - DAY_1 보상액 : (70% of Daily Reward Pool) * (100 / (100 + 200 + 100 + 300))
  it("Estimate #1: The amount of reward that occurred in the document for the last N days.", async () => {

    // preparing
    const docId = DOC4;

    // Testing
    const earnings_wei = await _creator.recentEarnings(docId, 7);
    const earnings_ether = web3.fromWei(earnings_wei, "ether") * 1;
    //console.log('earnings_ether : ' + earnings_ether.toString());

    // -------------------------
    // Check result
    // -------------------------
    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;

    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 5 * dayMillis));
    const drp_6 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 6 * dayMillis));
    const drp_7 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 7 * dayMillis));

    const ref_1 = (drp_1 * 1) * (100 / (100 + 200 + 100 + 300));
    const ref_2 = (drp_2 * 1) * (200 / (200 + 200));
    const ref_3 = (drp_3 * 1) * (300 / (300 + 300));
    const ref_4 = (drp_4 * 1) * (400 / (400 + 400));
    const ref_5 = (drp_5 * 1) * (500 / (500 + 500));
    const ref_6 = (drp_6 * 1) * (600 / (600));
    const ref_7 = (drp_7 * 1) * (700 / (700));

    // check to 2 decimal places
    const reference = Math.round((ref_1 + ref_2 + ref_3 + ref_4 + ref_5 + ref_6 + ref_7) / 100);
    const sample = Math.round(earnings_ether / 100);
    assert.equal(reference, sample, "wrong amount of earnings");
  });

  it("Estimate #2: Anyone can read the estimation of reward amount.", async () => {
    // preparing
    const docId = DOC1;

    // Testing
    const earnings_wei = await _creator.recentEarnings(docId, 7, { from: accounts[7] });
    const earnings_ether = web3.fromWei(earnings_wei, "ether") * 1;
    //console.log('earnings_ether : ' + earnings_ether.toString());

    // -------------------------
    // Check result
    // -------------------------
    const todayMillis = (await _utility.getTimeMillis()) * 1;
    const dayMillis = (await _utility.getOneDayMillis()) * 1;

    const drp_1 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _utility.getDailyRewardPool(70, todayMillis - 5 * dayMillis));

    const ref_1 = (drp_1 * 1) * (100 / (100 + 200 + 100 + 300));
    const ref_2 = (drp_2 * 1) * (200 / (200 + 200));
    const ref_3 = (drp_3 * 1) * (300 / (300 + 300));
    const ref_4 = (drp_4 * 1) * (400 / (400 + 400));
    const ref_5 = (drp_5 * 1) * (500 / (500 + 500));

    // check to 2 decimal places
    const reference = Math.round((ref_1 + ref_2 + ref_3 + ref_4 + ref_5) / 100);
    const sample = Math.round(earnings_ether / 100);
    assert.equal(reference, sample, "wrong amount of earnings");
  });

  // 문서 목록 보기 #1 : 특정 유저가 소유한 문서 전체의 목록 열람하기
  //  -----------------------------------
  //  DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  //  DOC #2 : ACOUNT[1], PV(0, 200)
  //  DOC #3 : ACOUNT[1], PV(0, )
  //  DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  //  DOC #5 : ACOUNT[2], PV(0, 300)
  //  -----------------------------------
  //  - ACCOUNT[1] 유저가 소유한 문서 목록 (DOC #1, DOC #2, DOC #3)
  it("Document List #1: A list of entire documents owned by a specific user.", async () => {
    // preparing
    const owner = accounts[1];

    // Testing
    const rp = await _creator._rewardPool();
    assert.equal(_pool.address, rp);
    const rg = await _pool._registry();
    assert.equal(_registry.address, rg);

    const docIds = await _registry.getDocuments(owner);
    assert.equal(web3.toAscii(DOC1), web3.toAscii(docIds[0]), "wrong doc id #1");
    assert.equal(web3.toAscii(DOC2), web3.toAscii(docIds[1]), "wrong doc id #2");
    assert.equal(web3.toAscii(DOC3), web3.toAscii(docIds[2]), "wrong doc id #3");
  });

  // 문서 목록 보기 #2 : 누구나 열람할 수 있습니다.
  it("Document List #2: Anyone can read.", async () => {
    // preparing
    const owner = accounts[2];

    // Testing
    const docIds = await _registry.getDocuments(owner, { from: accounts[7] });

    assert.equal(web3.toAscii(DOC4), web3.toAscii(docIds[0]), "wrong doc id #4");
    assert.equal(web3.toAscii(DOC5), web3.toAscii(docIds[1]), "wrong doc id #5");
  });
*/
});
