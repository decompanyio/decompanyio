const Deck = artifacts.require("./Deck.sol");

contract("Deck", accounts => {

  it("could issue additional 100 tokens before releasing", async () => {
    const deck = await Deck.deployed();
    const originalTokenAmount = await deck.totalSupply.call();
    await deck.mint(accounts[0], 100, { from: accounts[0] });
    const issuedTokenAmount = await deck.totalSupply.call();
    assert.equal(100, issuedTokenAmount - originalTokenAmount, "wrong amount of tokens issued");
  });

  it("detailed token", async () => {
    const deck = await Deck.deployed();
    const name = await deck.name.call();
    assert.equal("KT Alpha", name, "wrong name");
    const symbol = await deck.symbol.call();
    assert.equal("KTA", symbol, "wrong symbol");
  });

});
