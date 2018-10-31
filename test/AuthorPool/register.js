const Deck = artifacts.require("./Deck.sol");
const Utility = artifacts.require("./Utility.sol");
const AuthorPool = artifacts.require("./AuthorPool.sol");

contract("AuthorPool", accounts => {

  it("should be initialized", async () => {

    // prepare
    const deck = await Deck.deployed();
    const utility = await Utility.deployed();
    const authorPool = await AuthorPool.deployed();

    var _token = deck.address;
    var _utility = utility.address;

    // logic
    await authorPool.init(_token, _utility, { from: accounts[0] });

    // assert
    const b = await authorPool.createTime.call();
    assert.notEqual(b, 0, "was not initialized");
  });

  it("registered document should exist", async () => {

    // prepare
    const docId = "1234567890abcdefghijklmnopqrstuv";
    const authorPool = await AuthorPool.deployed();

    // logic
    await authorPool.registerUserDocument(docId, accounts[0]);

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
    await authorPool.registerUserDocument(docId2, accounts[1]);
    var authors3 = await authorPool.getAuthors();
    //console.log('author3 : ' + authors3.length);

    // assert
    assert.equal(authors1.length, authors2.length, "user duplicated 1");
    assert.isBelow(authors2.length, authors3.length, "user duplicated 2");
  });

  it("registered multi document by users should exist", async () => {

    // prepare
    const docId1 = "1234567890abcdefghijklmnopqrstu3";
    const docId2 = "1234567890abcdefghijklmnopqrstu4";
    const authorPool = await AuthorPool.deployed();

    // logic
    await authorPool.registerUserDocument(docId1, accounts[0]);
    var authors1 = await authorPool.getAuthors();
    //console.log('author1 : ' + authors1.length);
    await authorPool.registerUserDocument(docId2, accounts[0]);
    var authors2 = await authorPool.getAuthors();
    //console.log('author2 : ' + authors2.length);
    await authorPool.registerUserDocument(docId2, accounts[1]);
    var authors3 = await authorPool.getAuthors();
    //console.log('author3 : ' + authors3.length);

    // assert
    const isExist1 = await authorPool.containsUserDocument(accounts[0], docId1);
    assert.equal(true, isExist1, "can't find document");
    const isExist2 = await authorPool.containsUserDocument(accounts[0], docId2);
    assert.equal(true, isExist2, "can't find document");
    const isExist3 = await authorPool.containsUserDocument(accounts[1], docId1);
    assert.equal(false, isExist3, "can't find document");
    const isExist4 = await authorPool.containsUserDocument(accounts[1], docId2);
    assert.equal(true, isExist4, "can't find document");
  });

});
