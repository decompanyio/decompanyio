const Deck = artifacts.require("Deck");
//const Utility = artifacts.require("Utility");
//const ether = (n) => new web3.BigNumber(web3.toWei(n, 'ether'));

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

    const name = "KT Alpha";
    const symbol = "KTA";
    const decimals = 18;
    await deployer.deploy(Deck , name, symbol, decimals);
    //await deployer.deploy(Utility);
  });
};
