const Ballot = artifacts.require("./Ballot.sol");
const Registry = artifacts.require("./Registry.sol");
const RewardPool = artifacts.require("./RewardPool.sol");
const ERC20 = artifacts.require("./ERC20.sol");

contract("RewardPool", accounts => {

    const DOC1 = web3.utils.fromAscii("10000000000000000000000000000001");  // accounts[1]
    const DOC2 = web3.utils.fromAscii("10000000000000000000000000000002");  // accounts[1]
    const DOC3 = web3.utils.fromAscii("10000000000000000000000000000003");  // accounts[1]
    const DOC4 = web3.utils.fromAscii("10000000000000000000000000000004");  // accounts[2]
    const DOC5 = web3.utils.fromAscii("10000000000000000000000000000005");  // accounts[2]

    const HASH1 = web3.utils.fromAscii("20000000000000000000000000000001");  // accounts[1]
    const HASH2 = web3.utils.fromAscii("20000000000000000000000000000002");  // accounts[1]
    const HASH3 = web3.utils.fromAscii("20000000000000000000000000000003");  // accounts[1]
    const HASH4 = web3.utils.fromAscii("20000000000000000000000000000004");  // accounts[2]
    const HASH5 = web3.utils.fromAscii("20000000000000000000000000000005");  // accounts[2]

    const HASH31 = web3.utils.fromAscii("22000000000000000000000000000003");  // accounts[1]

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

    let _ballot = undefined;
    let _registry = undefined;
    let _rewardPool = undefined;
    let _token = undefined;

    it("Setting up...", async () => {

        _ballot = await Ballot.deployed();
        _registry = await Registry.deployed();
        _rewardPool = await RewardPool.deployed();
        _token = await ERC20.deployed();

        const currentDateMillis = Math.floor(Date.now() / 86400000) * 86400000;
        DAYS_0 = currentDateMillis - 0 * 86400000;
        DAYS_1 = currentDateMillis - 1 * 86400000;
        DAYS_2 = currentDateMillis - 2 * 86400000;
        DAYS_3 = currentDateMillis - 3 * 86400000;
        DAYS_4 = currentDateMillis - 4 * 86400000;
        DAYS_5 = currentDateMillis - 5 * 86400000;
        DAYS_6 = currentDateMillis - 6 * 86400000;
        DAYS_7 = currentDateMillis - 7 * 86400000;
        DAYS_8 = currentDateMillis - 8 * 86400000;

        await _registry.setFoundation(accounts[0]);
        await _registry.setDateMillis(currentDateMillis);

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

        const totalSupply = '10000000000000000000000000000';
        const rewardPool = '200000000000000000000000000';

        await _token.mint(accounts[0], totalSupply, { from: accounts[0] });
        await _token.transfer(_rewardPool.address, rewardPool, { from: accounts[0] });

        await _token.transfer(accounts[1], '300000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[2], '200000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[3], '100000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[4], '100000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[5], '100000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[6], '100000000000000000000000', { from: accounts[0] });

        await _ballot.setToken(_token.address);
        await _ballot.setRegistry(_registry.address);
        await _ballot.setRewardPool(_rewardPool.address);
        await _ballot.setFoundation(accounts[7]);

        VOTE100 = '100000000000000000000';
        VOTE200 = '200000000000000000000';
        VOTE300 = '300000000000000000000';
        VOTE400 = '400000000000000000000';
        VOTE500 = '500000000000000000000';
        VOTE600 = '600000000000000000000';
        VOTE700 = '700000000000000000000';
        VOTE800 = '800000000000000000000';
        VOTE900 = '900000000000000000000';

        // assert
        assert.isTrue(true);
    });

    it("transfer ownership", async () => {
        await _rewardPool.transferOwnership(accounts[8]);
    });

    it("should fail to transfer ownership with different account", async () => {

        try {
            await _rewardPool.transferOwnership(accounts[0]);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("transfer ownership back", async () => {
        await _rewardPool.transferOwnership(accounts[0], { from: accounts[8] });
    });

    it("set the registry", async () => {
        await _rewardPool.setRegistry(_registry.address, { from: accounts[0] });
    });

    it("set foundation", async () => {
        await _rewardPool.setFoundation(accounts[9], { from: accounts[0] });
    });

    it("set ballot", async () => {
        await _rewardPool.setBallot(_ballot.address, { from: accounts[0] });
    });

    it("set token", async () => {
        await _rewardPool.setToken(_token.address, { from: accounts[0] });
    });

    it("check original balance of accounts[1]", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300000, bal_ether_S1, "wrong original token amount");
    });

    it("should fail to pay from an other account", async () => {

        try {
            await _rewardPool.payRoyalty(DAYS_0, accounts[1], DAYS_5, VOTE100);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("pay some amount of royalties to a user account", async () => {
        await _rewardPool.payRoyalty(DAYS_0, accounts[1], DAYS_5, VOTE100, { from: accounts[9] });
    });

    it("check the balance of accounts[1] after paying", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300100, bal_ether_S1, "wrong amount of tokens paid");
    });

    it("pay some amount of royalties againg to the user account", async () => {
        await _rewardPool.payRoyalty(DAYS_0, accounts[1], DAYS_5, VOTE100, { from: accounts[9] });
    });

    it("check the balance of accounts[1] again after paying", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300200, bal_ether_S1, "wrong amount of tokens paid");
    });

    it("pay some amount of reward to a user account", async () => {
        await _rewardPool.payReward(DAYS_0, accounts[2], DAYS_5, VOTE100, 0, { from: accounts[9] });
    });

    it("check the balance of accounts[2] after paying reward", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[2]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(200100, bal_ether_S1, "wrong amount of tokens paid");
    });

    it("pay some amount of rewards againg to the user account", async () => {
        await _rewardPool.payReward(DAYS_0, accounts[2], DAYS_5, VOTE100, 0, { from: accounts[9] });
    });

    it("check the balance of accounts[2] again after paying rewards", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[2]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(200200, bal_ether_S1, "wrong amount of tokens paid");
    });

    it("check the balance of accounts[3]", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[3]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100000, bal_ether_S1, "wrong amount of tokens");
    });

    it("approve tokens for voting", async () => {
        await _token.approve(_ballot.address, VOTE200, { from: accounts[3] });
    });

    // ACCOUNT[3] : DOC1 : 100
    it("add a vote", async () => {
        await _ballot.addVote(DOC1, VOTE200, { from: accounts[3] });
    });

    it("check the balance of accounts[3] after voting", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[3]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(99800, bal_ether_S1, "wrong amount of tokens");
    });

    it("should fail to pay refund when the refundable balance is insufficient", async () => {

        try {
            await _rewardPool.payReward(DAYS_0, accounts[3], DAYS_5, VOTE100, VOTE300, { from: accounts[9] });
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("pay some amount of refund to a user account", async () => {
        await _rewardPool.payReward(DAYS_0, accounts[3], DAYS_5, VOTE100, VOTE100, { from: accounts[9] });
    });

    it("check the balance of accounts[3] after refund", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[3]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100000, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("pay some amount of refund again to a user account", async () => {
        await _rewardPool.payReward(DAYS_0, accounts[3], DAYS_5, VOTE100, VOTE100, { from: accounts[9] });
    });

    it("check the balance of accounts[3] again after additional refund", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[3]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100200, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("should fail to pay refund when the refundable balance is insufficient 2", async () => {

        try {
            await _rewardPool.payReward(DAYS_0, accounts[3], DAYS_5, VOTE100, VOTE100, { from: accounts[9] });
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("should fail to add royalty from an other account", async () => {

        try {
            await _rewardPool.addRoyalty(DAYS_0, accounts[1], VOTE100);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("should fail to claim royalty when the royalty is 0", async () => {

        try {
            await _rewardPool.claimRoyalty({ from: accounts[4] });
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("check the balance of accounts[4]", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[4]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100000, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("add royalty", async () => {
        await _rewardPool.addRoyalty(DAYS_0, accounts[4], VOTE100, { from: accounts[9] });
    });

    it("check the balance of accounts[4] after adding royalties", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[4]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100000, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("claim royalties", async () => {
        await _rewardPool.claimRoyalty({ from: accounts[4] });
    });

    it("check the balance of accounts[4] after claiming royalties", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[4]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100100, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("should fail to add reward from an other account", async () => {

        try {
            await _rewardPool.addReward(DAYS_0, accounts[5], VOTE100);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("should fail to claim royalty when the royalty is 0", async () => {

        try {
            await _rewardPool.claimReward({ from: accounts[5] });
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("check the balance of accounts[5]", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[5]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100000, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("add reward", async () => {
        await _rewardPool.addReward(DAYS_0, accounts[5], VOTE100, { from: accounts[9] });
    });

    it("check the balance of accounts[5] after adding rewards", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[5]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100000, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("claim rewards", async () => {
        await _rewardPool.claimReward({ from: accounts[5] });
    });

    it("check the balance of accounts[5] after claiming rewards", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[5]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100100, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("check the balance of accounts[6]", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[6]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100000, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("add reward 2", async () => {
        await _rewardPool.addReward(DAYS_0, accounts[6], VOTE100, { from: accounts[9] });
    });

    it("approve tokens for voting (accounts[6])", async () => {
        await _token.approve(_ballot.address, VOTE100, { from: accounts[6] });
    });

    // ACCOUNT[6] : DOC1 : 100
    it("add a vote (accounts[6])", async () => {
        await _ballot.addVote(DOC1, VOTE100, { from: accounts[6] });
    });

    it("check the balance of accounts[6] after voting", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[6]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(99900, bal_ether_S1, "wrong amount of tokens");
    });

    it("add refund", async () => {
        await _rewardPool.addRefund(DAYS_0, accounts[6], VOTE100, { from: accounts[9] });
    });

    it("check the balance of accounts[6] after adding refund", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[6]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(99900, bal_ether_S1, "wrong amount of tokens refunded");
    });

    it("should fail to claim rewards when the rewards is 0", async () => {

        try {
            await _rewardPool.claimReward({ from: accounts[1] });
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("claim rewards (accounts[6])", async () => {
        await _rewardPool.claimReward({ from: accounts[6] });
    });

    it("check the balance of accounts[6] after claiming rewards", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[6]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(100100, bal_ether_S1, "wrong amount of tokens refunded");
    });
});