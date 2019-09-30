const Registry = artifacts.require("Registry");
const Ballot = artifacts.require("Ballot");
const RewardPool = artifacts.require("RewardPool");
const ERC20 = artifacts.require("ERC20");

const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

module.exports = function(deployer, network, accounts) {
  deployer.then(async() => {

    //const latestTime = (new Date).getTime();
    //const openingTime = latestTime;
    //const closingTime = openingTime + duration.weeks(1);

    await deployer.deploy(Registry);
    await deployer.deploy(Ballot);
    await deployer.deploy(RewardPool);
    await deployer.deploy(ERC20);
  });
};