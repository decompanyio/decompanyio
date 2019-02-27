var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.then(async() => {
    await deployer.deploy(Migrations, {gas: 4700000});
  });
};
