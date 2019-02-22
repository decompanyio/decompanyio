const Deck = artifacts.require("./Deck.sol");
const Creator = artifacts.require("./Creator.sol");
const Curator = artifacts.require("./Curator.sol");
const RewardPool = artifacts.require("./RewardPool.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
const Ballot = artifacts.require("./Ballot.sol");

contract("Asset - creator", accounts => {

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

  let _deck = undefined;
  let _registry = undefined;
  let _ballot = undefined;
  let _creator = undefined;
  let _curator = undefined;
  let _pool = undefined;

  it("Setting up...", async () => {

    _registry = await DocumentRegistry.deployed();
    _ballot = await Ballot.deployed();
    _creator = await Creator.deployed();
    _curator = await Curator.deployed();
    _pool = await RewardPool.deployed();
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

    DAYS_0 = ((await _pool.getDateMillis()) * 1) - 0 * (await _pool.getOneDayMillis());
    DAYS_1 = ((await _pool.getDateMillis()) * 1) - 1 * (await _pool.getOneDayMillis());
    DAYS_2 = ((await _pool.getDateMillis()) * 1) - 2 * (await _pool.getOneDayMillis());
    DAYS_3 = ((await _pool.getDateMillis()) * 1) - 3 * (await _pool.getOneDayMillis());
    DAYS_4 = ((await _pool.getDateMillis()) * 1) - 4 * (await _pool.getOneDayMillis());
    DAYS_5 = ((await _pool.getDateMillis()) * 1) - 5 * (await _pool.getOneDayMillis());
    DAYS_6 = ((await _pool.getDateMillis()) * 1) - 6 * (await _pool.getOneDayMillis());
    DAYS_7 = ((await _pool.getDateMillis()) * 1) - 7 * (await _pool.getOneDayMillis());
    DAYS_8 = ((await _pool.getDateMillis()) * 1) - 8 * (await _pool.getOneDayMillis());

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

    // assert
    assert.isTrue(true);
  });

  // 보상액 산정하기 1 : 당일 등록한 문서의 보상액은 0
  //  - 오늘(DAY_0) 등록한 문서에 대해서
  //  - pv 발생 여부와 상관 없이 보상액은 0
  it("Determine #1: The amount of reward for documents registered on that day is 0", async () => {

    const docId = DOC3;

    const wei = await _creator.determine(docId, { from: accounts[1] });
    const doc3 = web3.fromWei(wei[0], "ether");
    //console.log('reward of doc3 : ' + doc3);
    assert.equal(0, doc3 * 1);
  });

  // 보상액 산정하기 2 : 보상액 산정은 문서의 소유자만 가능
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

  // 보상액 산정하기 3 : 하루 전 등록한 문서는 pv에 따른 보상액 발생
  //  - 1일전(DAY_1) 등록한 문서에 대해서
  //  - 어제는 pv가 0이고 오늘 pv가 0초과이면 보상액은 0
  //  - 어제 하루 동안의 pv가 0이면 보상액은 0
  //  - 어제 하루 동안의 pv가 0초과면 pv에 따른 보상액 산정
  //  -----------------------------------
  //  DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  //  DOC #2 : ACOUNT[1], PV(0, 200)
  //  DOC #3 : ACOUNT[1], PV(0, )
  //  DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  //  DOC #5 : ACOUNT[2], PV(0, 300)
  //  -----------------------------------

  it("Determine #3: Documents registered before the day have reward according to pv", async () => {

    // prepare
    const todayMillis = (await _pool.getDateMillis()) * 1;
    const yesterdayMillis = todayMillis - (await _pool.getOneDayMillis()) * 1;

    // stage 1 :
    const docId = DOC2;

    const drp = web3.fromWei(await _pool.getDailyRewardPool(70, yesterdayMillis));
    const doc2_wei = await _creator.determine(docId, { from: accounts[1] });
    const doc2_ether = web3.fromWei(doc2_wei[0], "ether");
    //console.log('reward of doc2 : ' + doc2_ether);

    const sample = Math.round((doc2_ether * 1) / 100);
    const reference = Math.round((drp * 1) * (200 / (100 + 200 + 100 + 300)) / 100);
    assert.equal(reference, sample, "wrong amount of reward token determined doc #2");
  });

  // 보상액 산정하기 4 : 매일 발생하는 보상액을 합산하여 제공
  //  -----------------------------------
  //  DOC #1 : ACOUNT[1], PV(0, 100, 200, 300, 400, 500)
  //  DOC #2 : ACOUNT[1], PV(0, 200)
  //  DOC #3 : ACOUNT[1], PV(0, )
  //  DOC #4 : ACOUNT[2], PV(0, 100, 200, 300, 400, 500, 600, 700, 800)
  //  DOC #5 : ACOUNT[2], PV(0, 300)
  //  -----------------------------------
  //  - 5일전(DAY_5) 등록한 문서(DOC #1)에 대해서
  //  - 등록이후 보상액을 한 번도 인출하지 않은 경우,
  //  - 최종 산정된 보상액은 DAY_5부터 DAY_1까지의 보상액을 합산한 금액
  //
  //  - DAY_5 보상액 : (70% of Daily Reward Pool) * (500 / (500 + 500))
  //  - DAY_4 보상액 : (70% of Daily Reward Pool) * (400 / (400 + 400))
  //  - DAY_3 보상액 : (70% of Daily Reward Pool) * (300 / (300 + 300))
  //  - DAY_2 보상액 : (70% of Daily Reward Pool) * (200 / (200 + 200))
  //  - DAY_1 보상액 : (70% of Daily Reward Pool) * (100 / (100 + 200 + 100 + 300))
  it("Determine #4: Daily reward is added up to determine the final amount of reward", async () => {

    const todayMillis = (await _pool.getDateMillis()) * 1;
    const dayMillis = (await _pool.getOneDayMillis()) * 1;

    const drp_1 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 5 * dayMillis));

    // stage 1 :
    const docId = DOC1;
    const determined_wei = await _creator.determine(docId, { from: accounts[1] });
    const determined = web3.fromWei(determined_wei[0], "ether");
    //console.log('reward of doc1 : ' + doc1);

    const ref_1 = (drp_1 * 1) * (100 / (100 + 200 + 100 + 300));
    const ref_2 = (drp_2 * 1) * (200 / (200 + 200));
    const ref_3 = (drp_3 * 1) * (300 / (300 + 300));
    const ref_4 = (drp_4 * 1) * (400 / (400 + 400));
    const ref_5 = (drp_5 * 1) * (500 / (500 + 500));

    const sample = Math.round((determined * 1) / 100);
    const reference = Math.round((ref_1 + ref_2 + ref_3 + ref_4 + ref_5) / 100);
    assert.equal(reference, sample, "wrong amount of reward token determined doc #1");
  });

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
    const reward_ether = web3.fromWei(reward_wei[0], "ether") * 1;
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
    const reward_ether = web3.fromWei(reward_wei[0], "ether") * 1;
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
    const reward_ether = web3.fromWei(reward_wei[0], "ether") * 1;
    //console.log('reward_ether : ' + reward_ether.toString());

    // -------------------------
    // Testing : DAYS_3에 지급 후 청구하고 입급된 잔고 확인하기
    // -------------------------

    //  - DAY_3기준으로 보상 지급하기
    const amount = await _creator.determineAt(owner, docId, DAYS_3, { from: _pool.address });
    await _pool.pay(docId, owner, amount[0], 0, DAYS_3, { from: foundation });
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
    const todayMillis = (await _pool.getDateMillis()) * 1;
    const dayMillis = (await _pool.getOneDayMillis()) * 1;
    const drp_1 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 3 * dayMillis));

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
    const todayMillis = (await _pool.getDateMillis()) * 1;
    const dayMillis = (await _pool.getOneDayMillis()) * 1;

    const drp_1 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 5 * dayMillis));
    const drp_6 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 6 * dayMillis));
    const drp_7 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 7 * dayMillis));

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
    const todayMillis = (await _pool.getDateMillis()) * 1;
    const dayMillis = (await _pool.getOneDayMillis()) * 1;

    const drp_1 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 1 * dayMillis));
    const drp_2 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 2 * dayMillis));
    const drp_3 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 3 * dayMillis));
    const drp_4 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 4 * dayMillis));
    const drp_5 = web3.fromWei(await _pool.getDailyRewardPool(70, todayMillis - 5 * dayMillis));

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
    const docIds = await _creator.getDocuments(owner);
    assert.equal(web3.toAscii(DOC1), web3.toAscii(docIds[0]), "wrong doc id #1");
    assert.equal(web3.toAscii(DOC2), web3.toAscii(docIds[1]), "wrong doc id #2");
    assert.equal(web3.toAscii(DOC3), web3.toAscii(docIds[2]), "wrong doc id #3");
  });

  // 문서 목록 보기 #2 : 누구나 열람할 수 있습니다.
  it("Document List #2: Anyone can read.", async () => {
    // preparing
    const owner = accounts[2];
    const docIds = await _creator.getDocuments(owner, { from: accounts[7] });
    assert.equal(web3.toAscii(DOC4), web3.toAscii(docIds[0]), "wrong doc id #4");
    assert.equal(web3.toAscii(DOC5), web3.toAscii(docIds[1]), "wrong doc id #5");
  });

});
