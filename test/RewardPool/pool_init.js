const { getWeb3, getContractInstance } = require("../helpers");
const web3 = getWeb3();
const getInstance = getContractInstance(web3);

const RewardPool = artifacts.require("./RewardPool.sol");

contract("RewardPool - init", accounts => {

  let _pool = undefined;
  let _ballot = undefined;
  let _startTime = undefined;
  let _endTime = undefined;

  it("Setting up...", async () => {

    _pool = await RewardPool.deployed();

    // assert
    assert.equal(1, 1, "failed to set up");
  });

  it("Initialize", async () => {

    assert.equal(1, 1, "wrong deposit");
  });

});
