const Deck = artifacts.require("./Deck.sol");
const BountyOne = artifacts.require("./BountyOne.sol");

contract("BountyOne", accounts => {

  it("setting up....", async () => {

    // ---------------------------
    // INIT CONTRACTS
    // ---------------------------
    _deck = await Deck.deployed();
    _bountyOne = await BountyOne.deployed();

    // ---------------------------
    // DECK
    // ---------------------------
    // - TOTAL SUPPLY (ACCOUNT[0]) : 100,000,000 DECK
    // - BOUNTY POOL (ACCOUNT[0]) : 50,000,000 DECK

    await _deck.issue(accounts[0], new web3.BigNumber('100000000000000000000000000'), { from: accounts[0] });
    await _deck.release({ from: accounts[0] });
    await _deck.transfer(_bountyOne.address, new web3.BigNumber('50000000000000000000000000'), { from: accounts[0] });
    const balance_bounty_S1 = web3.fromWei(await _deck.balanceOf(_bountyOne.address), "ether");
    assert.equal(50000000, balance_bounty_S1 * 1);

    // ---------------------------
    // BOUNTY ONE
    // ---------------------------
    // - BOUNTY POOL (ACCOUNT[0]) : 50,000,000 DECK
    // - PROVISION : 5,000 DECK
    await _bountyOne.init(_deck.address, new web3.BigNumber('5000000000000000000000'), { from: accounts[0] });
  });

  it("check initial amount of bounty available", async () => {
    const available_A1_S1 = web3.fromWei(await _bountyOne.available({ from: accounts[1] }), "ether");
    assert.equal(5000, available_A1_S1 * 1, "wrong amount of available token");
  });

  it("claim bounty", async () => {
    const balance_A2_S1 = web3.fromWei(await _deck.balanceOf(accounts[2]), "ether") * 1;
    await _bountyOne.claim({ from: accounts[2] });

    const balance_A2_S2 = web3.fromWei(await _deck.balanceOf(accounts[2], { from: accounts[0] }), "ether") * 1;
    assert.equal(5000, balance_A2_S2 - balance_A2_S1, "wrong amount of bounty claimed");
  });

  it("count claimed users", async () => {
    const count_S1 = await _bountyOne.count({ from: accounts[0] });
    assert.equal(1, count_S1, "wrong initial number of claimed users");

    await _bountyOne.claim({ from: accounts[3] });

    const count_S2 = await _bountyOne.count({ from: accounts[0] });
    assert.equal(2, count_S2, "wrong number of claimed users");
  });

  it("get claimed users", async () => {
    const array_S1 = await _bountyOne.getClaimedUsers({ from: accounts[0] });
    assert.equal(2, array_S1.length, "wrong number of claimed users");
    assert.equal(accounts[2], array_S1[0], "wrong account of user #1");
    assert.equal(accounts[3], array_S1[1], "wrong account of user #2");
  });

  it("claim bounty twice", async () => {
    const balance_A2_S1 = web3.fromWei(await _deck.balanceOf(accounts[2]), "ether") * 1;

    try {
      // calling claim from account #2 should throw exception
      await _bountyOne.claim({ from: accounts[2] });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.strictEqual(revertFound, true);
    }

    const balance_A2_S2 = web3.fromWei(await _deck.balanceOf(accounts[2], { from: accounts[0] }), "ether") * 1;
    assert.equal(0, balance_A2_S2 - balance_A2_S1, "duplicated claim request operational");
  });

});
