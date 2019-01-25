const Utility = artifacts.require("./Utility.sol");
const AuthorPool = artifacts.require("./AuthorPool.sol");
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");

contract("AuthorPool", accounts => {

  it("should be initialized", async () => {

    // prepare
    objects = await Promise.all([
      Utility.deployed(),
      AuthorPool.deployed(),
      DocumentRegistry.deployed()
    ]);

    const utility = objects[0];
    const authorPool = objects[1];
    const documentRegistry = objects[2];

    // logic
    await documentRegistry.init(utility.address, { from: accounts[0] });
    await documentRegistry.transferOwnership(authorPool.address, { from: accounts[0] });

    await authorPool.init(documentRegistry.address, utility.address, { from: accounts[0] });

    // assert
    const b = await authorPool.createTime.call();
    assert.notEqual(b, 0, "was not initialized");
  });

  it("registered document should exist", async () => {

    // prepare
    const docId = "1234567890abcdefghijklmnopqrstuv";
    const authorPool = await AuthorPool.deployed();

    // logic
    await authorPool.registerUserDocument(docId, accounts[0], { from: accounts[0] });

    // assert
    const isExist = await authorPool.containsUserDocument(accounts[0], docId);
    assert.equal(true, isExist, "can't find document");
  });

  it("register multi document by one user", async () => {

    // prepare
    const docId1 = "1234567890abcdefghijklmnopqrstu1";
    const docId2 = "1234567890abcdefghijklmnopqrstu2";
    const authorPool = await AuthorPool.deployed();

    // logic
    await authorPool.registerUserDocument(docId1, accounts[0]);
    var authors1 = await authorPool.getAuthors();
    //console.log('author1 : ' + authors1.length);
    await authorPool.registerUserDocument(docId2, accounts[0]);
    var authors2 = await authorPool.getAuthors();
    //console.log('author2 : ' + authors2.length);

    try {
      // calling from account #1 should throw exception
      await authorPool.registerUserDocument(docId2, accounts[1]);
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.strictEqual(revertFound, true);
    }

    var authors3 = await authorPool.getAuthors();
    //console.log('author3 : ' + authors3.length);

    // assert
    assert.equal(authors1.length, authors2.length, "user duplicated 1");
    assert.equal(authors2.length, authors3.length, "user duplicated 2");
  });

  it("registered multi document by users should exist", async () => {

    // prepare
    const docId1 = "1234567890abcdefghijklmnopqrstu3";
    const docId2 = "1234567890abcdefghijklmnopqrstu4";
    const docId3 = "1234567890abcdefghijklmnopqrstu5";
    const authorPool = await AuthorPool.deployed();

    // logic
    await authorPool.registerUserDocument(docId1, accounts[0]);
    var authors1 = await authorPool.getAuthors();
    //console.log('author1 : ' + authors1.length);
    await authorPool.registerUserDocument(docId2, accounts[0]);
    var authors2 = await authorPool.getAuthors();
    //console.log('author2 : ' + authors2.length);
    await authorPool.registerUserDocument(docId3, accounts[1]);
    var authors3 = await authorPool.getAuthors();
    //console.log('author3 : ' + authors3.length);

    // assert
    const isExist1 = await authorPool.containsUserDocument(accounts[0], docId1);
    //console.log('isExist1 : ' + isExist1);
    assert.equal(true, isExist1, "can't find document");
    const isExist2 = await authorPool.containsUserDocument(accounts[0], docId2);
    //console.log('isExist2 : ' + isExist2);
    assert.equal(true, isExist2, "can't find document");
    const isExist3 = await authorPool.containsUserDocument(accounts[1], docId1);
    //console.log('isExist3 : ' + isExist3);
    assert.equal(false, isExist3, "can't find document");
    const isExist4 = await authorPool.containsUserDocument(accounts[1], docId3);
    //console.log('isExist4 : ' + isExist4);
    assert.equal(true, isExist4, "can't find document");
  });

});
