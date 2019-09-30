const Ballot = artifacts.require("./Ballot.sol");
const Registry = artifacts.require("./Registry.sol");
const ERC20 = artifacts.require("./ERC20.sol");

contract("Ballot", accounts => {

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
    let _token = undefined;

    it("Setting up...", async () => {

        _ballot = await Ballot.deployed();
        _registry = await Registry.deployed();
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
        //await _token.transfer(_ballot.address, rewardPool, { from: accounts[0] });

        await _token.transfer(accounts[1], '300000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[2], '200000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[3], '100000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[4], '100000000000000000000000', { from: accounts[0] });
        await _token.transfer(accounts[5], '100000000000000000000000', { from: accounts[0] });

        await _ballot.setToken(_token.address);
        await _ballot.setFoundation(accounts[7]);
        await _ballot.setRewardPool(accounts[0]);

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
        await _ballot.transferOwnership(accounts[8]);
    });

    it("should fail to transfer ownership with different account", async () => {

        try {
            await _ballot.transferOwnership(accounts[0]);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("transfer ownership back", async () => {
        await _ballot.transferOwnership(accounts[0], { from: accounts[8] });
    });

    it("set the registry", async () => {
        await _ballot.setRegistry(_registry.address, { from: accounts[0] });
    });

    it("check original balance of accounts[1]", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300000, bal_ether_S1, "wrong original token amount");
    });

    it("approve tokens for voting", async () => {
        await _token.approve(_ballot.address, VOTE200, { from: accounts[1] });
    });

    // ACCOUNT[1] : DOC1 : 200
    it("add a vote", async () => {
        await _ballot.addVote(DOC1, VOTE200, { from: accounts[1] });
    });

    it("check the balance of accounts[1] after voting", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300000 - 200, bal_ether_S1, "wrong token amount after voting");
    });

    // ACCOUNT[1] : DOC1 : 200
    it("get the total vote", async () => {
        const totalVote = await _ballot.getTotalVote(DAYS_0);
        assert.equal(VOTE200, totalVote[0], "wrong total deposit");
        assert.isTrue(Date.now() - totalVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200
    it("get the doc vote", async () => {
        const docVote = await _ballot.getVoteByDocument(DAYS_0, DOC1);
        assert.equal(VOTE200, docVote[0], "wrong doc deposit");
        assert.isTrue(Date.now() - docVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200
    it("get the user vote", async () => {
        const userVote = await _ballot.getVoteByUser(DAYS_0, DOC1, accounts[1]);
        assert.equal(VOTE200, userVote[0], "wrong user deposit");
        assert.isTrue(Date.now() - userVote[1] * 1 < 3000, "wrong modified time");
    });

    it("approve another user's token for voting", async () => {
        await _token.approve(_ballot.address, VOTE100, { from: accounts[2] });
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    it("add another vote from different account", async () => {
        await _ballot.addVote(DOC1, VOTE100, { from: accounts[2] });
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    it("get the total vote from different accounts", async () => {
        const totalVote = await _ballot.getTotalVote(DAYS_0);
        assert.equal(VOTE300, totalVote[0], "wrong total deposit");
        assert.isTrue(Date.now() - totalVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    it("get the doc vote from different accounts", async () => {
        const docVote = await _ballot.getVoteByDocument(DAYS_0, DOC1);
        assert.equal(VOTE300, docVote[0], "wrong doc deposit");
        assert.isTrue(Date.now() - docVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    it("get the user vote from different accounts", async () => {
        const userVote = await _ballot.getVoteByUser(DAYS_0, DOC1, accounts[2]);
        assert.equal(VOTE100, userVote[0], "wrong user deposit");
        assert.isTrue(Date.now() - userVote[1] * 1 < 3000, "wrong modified time");
    });

    it("approve 3rd user's token for voting", async () => {
        await _token.approve(_ballot.address, VOTE100, { from: accounts[2] });
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("add vote from different account and documents", async () => {
        await _ballot.addVote(DOC2, VOTE100, { from: accounts[2] });
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the total vote from different accounts and documents", async () => {
        const totalVote = await _ballot.getTotalVote(DAYS_0);
        assert.equal(VOTE400, totalVote[0], "wrong total deposit");
        assert.isTrue(Date.now() - totalVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the doc vote from different accounts and documents", async () => {
        const docVote = await _ballot.getVoteByDocument(DAYS_0, DOC1);
        assert.equal(VOTE300, docVote[0], "wrong doc deposit");
        assert.isTrue(Date.now() - docVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the user vote from different accounts and documents", async () => {
        const userVote = await _ballot.getVoteByUser(DAYS_0, DOC1, accounts[2]);
        assert.equal(VOTE100, userVote[0], "wrong user deposit");
        assert.isTrue(Date.now() - userVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the new user vote from different accounts and documents", async () => {
        const userVote = await _ballot.getVoteByUser(DAYS_0, DOC2, accounts[2]);
        assert.equal(VOTE100, userVote[0], "wrong user deposit");
        assert.isTrue(Date.now() - userVote[1] * 1 < 3000, "wrong modified time");
    });

    it("approve same user's token for voting", async () => {
        await _token.approve(_ballot.address, VOTE100, { from: accounts[1] });
    });

    // ACCOUNT[1] : DOC1 : 200 + 100
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("add vote from same account and documents", async () => {
        await _ballot.addVote(DOC1, VOTE100, { from: accounts[1] });
    });

    it("check the balance of accounts[1] after 2nd voting", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300000 - 200 - 100, bal_ether_S1, "wrong token amount after voting");
    });

    // ACCOUNT[1] : DOC1 : 200 + 100
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the total vote from same accounts and documents", async () => {
        const totalVote = await _ballot.getTotalVote(DAYS_0);
        assert.equal(VOTE500, totalVote[0], "wrong total deposit");
        assert.isTrue(Date.now() - totalVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200 + 100
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the doc vote from same accounts and documents", async () => {
        const docVote = await _ballot.getVoteByDocument(DAYS_0, DOC1);
        assert.equal(VOTE400, docVote[0], "wrong doc deposit");
        assert.isTrue(Date.now() - docVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200 + 100
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the user vote from same accounts and documents", async () => {
        const userVote = await _ballot.getVoteByUser(DAYS_0, DOC1, accounts[1]);
        assert.equal(VOTE300, userVote[0], "wrong user deposit");
        assert.isTrue(Date.now() - userVote[1] * 1 < 3000, "wrong modified time");
    });

    it("should fail to add vote when was not approved", async () => {

        try {
            await _ballot.addVote(DOC1, VOTE100, { from: accounts[1] });
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    // ACCOUNT[1] : DOC1 : 200 + 100
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("should fail when request to refund too much token", async () => {

        try {
            await _ballot.refund(accounts[1], VOTE800);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("check the balance of accounts[1] after refund failure", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300000 - 200 - 100, bal_ether_S1, "wrong token amount after voting");
    });

    it("should fail when request more than deposit", async () => {

        try {
            await _ballot.refund(accounts[1], VOTE400);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("request less than deposit", async () => {
        await _ballot.refund(accounts[1], VOTE100);
    });

    it("check the balance of accounts[1] after partial refund", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300000 - 200, bal_ether_S1, "wrong token amount after partial refund");
    });

    it("request all deposit", async () => {
        await _ballot.refund(accounts[1], VOTE200);
    });

    it("check the balance of accounts[1] after full refund", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[1]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(300000, bal_ether_S1, "wrong token amount after full refund");
    });

    it("should fail when there's nothing to refund", async () => {

        try {
            await _ballot.refund(accounts[1], VOTE100);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("request all deposit from different account", async () => {
        await _ballot.refund(accounts[2], VOTE200);
    });

    it("check the balance of accounts[2] after full refund", async () => {
        const bal_wei_S1 = await _token.balanceOf(accounts[2]);
        const bal_ether_S1 = web3.utils.fromWei(bal_wei_S1, "ether") * 1;
        assert.equal(200000, bal_ether_S1, "wrong token amount after full refund");
    });

    it("should fail to update vote from other accounts", async () => {

        try {
            await _ballot.updateVote(DAYS_0, DOC1, accounts[1], VOTE200, DAYS_0);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("update vote", async () => {
        await _ballot.updateVote(DAYS_0, DOC1, accounts[1], VOTE600, Date.now(), { from: accounts[7] });
    });

    // ACCOUNT[1] : DOC1 : 200 + 100 => 600
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the total vote after updating", async () => {
        const totalVote = await _ballot.getTotalVote(DAYS_0);
        assert.equal(VOTE800, totalVote[0], "wrong total deposit");
        assert.isTrue(Date.now() - totalVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200 + 100 => 600
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the doc vote after updating", async () => {
        const docVote = await _ballot.getVoteByDocument(DAYS_0, DOC1);
        assert.equal(VOTE700, docVote[0], "wrong doc deposit");
        assert.isTrue(Date.now() - docVote[1] * 1 < 3000, "wrong modified time");
    });

    // ACCOUNT[1] : DOC1 : 200 + 100 => 600
    // ACCOUNT[2] : DOC1 : 100
    // ACCOUNT[2] : DOC2 : 100
    it("get the user vote after updating", async () => {
        const userVote = await _ballot.getVoteByUser(DAYS_0, DOC1, accounts[1]);
        assert.equal(VOTE600, userVote[0], "wrong user deposit");
        assert.isTrue(Date.now() - userVote[1] * 1 < 3000, "wrong modified time");
    });

    it("upsert vote", async () => {
        await _ballot.updateVote(DAYS_0, DOC1, accounts[1], VOTE600, Date.now(), { from: accounts[7] });
    });
});