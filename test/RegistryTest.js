const Registry = artifacts.require("./Registry.sol");

contract("Registry", accounts => {

    const DOC1 = web3.utils.fromAscii("10000000000000000000000000000001");  // accounts[1]
    const DOC2 = web3.utils.fromAscii("10000000000000000000000000000002");  // accounts[1]
    const DOC3 = web3.utils.fromAscii("10000000000000000000000000000003");  // accounts[1]
    const DOC4 = web3.utils.fromAscii("10000000000000000000000000000004");  // accounts[2]
    const DOC5 = web3.utils.fromAscii("10000000000000000000000000000005");  // accounts[2]
    const DOC6 = web3.utils.fromAscii("10000000000000000000000000000006");  // accounts[2]

    const HASH1 = web3.utils.fromAscii("20000000000000000000000000000001");  // accounts[1]
    const HASH2 = web3.utils.fromAscii("20000000000000000000000000000002");  // accounts[1]
    const HASH3 = web3.utils.fromAscii("20000000000000000000000000000003");  // accounts[1]
    const HASH4 = web3.utils.fromAscii("20000000000000000000000000000004");  // accounts[2]
    const HASH5 = web3.utils.fromAscii("20000000000000000000000000000005");  // accounts[2]
    const HASH6 = web3.utils.fromAscii("20000000000000000000000000000006");  // accounts[2]

    const HASH31 = web3.utils.fromAscii("22000000000000000000000000000003");  // accounts[1]
    const HASH32 = web3.utils.fromAscii("22000000000000000000000000000004");  // accounts[1]

    let _registry = undefined;
    let _dateMillis = undefined;

    it("Setting up...", async () => {

        _registry = await Registry.deployed();
        _dateMillis = await _registry.getBlockDateMillis();

        // assert
        const DOC_COUNT_S0 = await _registry.count();
        assert.equal(0, DOC_COUNT_S0, "the doc map is not empty");
    });

    it("transfer ownership", async () => {
        await _registry.transferOwnership(accounts[8]);
    });

    it("should fail to transfer ownership with different account", async () => {

        try {
            await _registry.transferOwnership(accounts[0]);
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("transfer ownership back", async () => {
        await _registry.transferOwnership(accounts[0], { from: accounts[8] });
    });

    it("should fail to set foundation from other address", async () => {

        try {
            await _registry.setFoundation(accounts[0], { from: accounts[5] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("set foundation", async () => {
        await _registry.setFoundation(accounts[9]);
    });

    it("should fail to set date from other address", async () => {

        try {
            await _registry.setDateMillis("1556064000000", { from: accounts[0] });
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("set date milliseconds", async () => {
        await _registry.setDateMillis("1556064000000", { from: accounts[9] });
    });

    it("should fail to get old date", async () => {

        try {
            const sample = await _registry.getLastDateMillis();
            assert.equal(sample, 1556064000000, "wrong date");
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
    });

    it("update date milliseconds again", async () => {
        await _registry.setDateMillis(_dateMillis, { from: accounts[9] });
    });

    it("get last date milliseconds", async () => {

        const sample = await _registry.getLastDateMillis();
        assert.equal(sample * 1, _dateMillis * 1, "wrong date");
    });

    it("register a document", async () => {

        await _registry.addDocument(DOC1, HASH1, { from: accounts[1] } );
        const DOC_COUNT_S0 = await _registry.count();
        assert.equal(1, DOC_COUNT_S0*1, "the doc map is still empty");
    });

    it("get the registered document", async () => {
    
        const doc = await _registry.getDocument(DOC1);

        assert.equal(_dateMillis, doc[0]*1, "wrong createTime");
        assert.equal(accounts[1], doc[1], "wrong address");
        assert.equal(HASH1, doc[2], "wrong hash");
    });

    it("should fail to register same document", async () => {

        try {
            await _registry.addDocument(DOC1, HASH1, { from: accounts[1] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("register second document with same account", async () => {

        await _registry.addDocument(DOC2, HASH2, { from: accounts[1] } );
        const DOC_COUNT_S0 = await _registry.count();
        assert.equal(2, DOC_COUNT_S0*1, "the document is not added");
    });

    it("get the lastest document", async () => {
    
        const doc = await _registry.getDocument(DOC2);

        assert.equal(_dateMillis, doc[0]*1, "wrong createTime");
        assert.equal(accounts[1], doc[1], "wrong address");
        assert.equal(HASH2, doc[2], "wrong hash");
    });

    it("register another document with a different account", async () => {

        await _registry.addDocument(DOC4, HASH4, { from: accounts[2] } );
        const DOC_COUNT_S0 = await _registry.count();
        assert.equal(3, DOC_COUNT_S0*1, "the document is not added");
    });

    it("get not registered document", async () => {
    
        const doc = await _registry.getDocument(DOC3);

        assert.equal(0, doc[0]*1, "wrong createTime");
        assert.equal(0, doc[1]*1, "wrong address");
        assert.equal(0, doc[2]*1, "wrong hash");
    });

    it("get the 3rd document", async () => {
    
        const doc = await _registry.getDocument(DOC4);

        assert.equal(_dateMillis, doc[0]*1, "wrong createTime");
        assert.equal(accounts[2], doc[1], "wrong address");
        assert.equal(HASH4, doc[2], "wrong hash");
    });

    it("should fail to register the same id with different hash", async () => {

        try {
            await _registry.addDocument(DOC1, HASH2, { from: accounts[1] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("should fail to register the document with different account", async () => {

        try {
            await _registry.addDocument(DOC1, HASH1, { from: accounts[2] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("should fail to register the same id with different account", async () => {

        try {
            await _registry.addDocument(DOC1, HASH2, { from: accounts[2] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("should fail to register the same hash", async () => {

        try {
            await _registry.addDocument(DOC5, HASH2, { from: accounts[2] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("register 4th document with a different account", async () => {

        await _registry.addDocument(DOC5, HASH5, { from: accounts[2] } );
        const DOC_COUNT_S0 = await _registry.count();
        assert.equal(4, DOC_COUNT_S0*1, "the document is not added");
    });

    it("get the 4th document", async () => {
    
        const doc = await _registry.getDocument(DOC5);

        assert.equal(_dateMillis, doc[0]*1, "wrong createTime");
        assert.equal(accounts[2], doc[1], "wrong address");
        assert.equal(HASH5, doc[2], "wrong hash");
    });

    it("register a missing document", async () => {

        await _registry.addDocument(DOC3, HASH3, { from: accounts[1] } );
        const DOC_COUNT_S0 = await _registry.count();
        assert.equal(5, DOC_COUNT_S0*1, "the document is not added");
    });

    it("get 5th registered document", async () => {
    
        const doc = await _registry.getDocument(DOC3);

        assert.equal(_dateMillis, doc[0]*1, "wrong createTime");
        assert.equal(accounts[1], doc[1], "wrong address");
        assert.equal(HASH3, doc[2], "wrong hash");
    });

    it("should fail to update a document with existing hash", async () => {

        try {
            await _registry.updateDocument(DOC3, HASH2, { from: accounts[1] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("should fail to update a document with different account", async () => {

        try {
            await _registry.updateDocument(DOC3, HASH31, { from: accounts[2] } );
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert.strictEqual(revertFound, true);
            return;
        }
        assert.isTrue(false);
    });

    it("update a document", async () => {

        await _registry.updateDocument(DOC3, HASH31, { from: accounts[1] } );
        const DOC_COUNT_S0 = await _registry.count();
        assert.equal(5, DOC_COUNT_S0*1, "the document is not added");
    });

    it("get updated document", async () => {
    
        const doc = await _registry.getDocument(DOC3);

        assert.equal(_dateMillis, doc[0]*1, "wrong createTime");
        assert.equal(accounts[1], doc[1], "wrong address");
        assert.equal(HASH31, doc[2], "wrong hash");
    });
});