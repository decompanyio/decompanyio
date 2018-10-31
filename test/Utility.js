const Utility = artifacts.require("./Utility.sol");

contract("Utility", accounts => {

  it("Get current time in milliseconds", async () => {

    // prepare
    const util = await Utility.deployed();

    // sample
    var x = new Date();
    var y = x.getFullYear();
    var m = x.getMonth();
    var d = x.getDate();
    var hh = x.getHours();
    var mm = x.getMinutes();
    var ss = x.getSeconds();
    var u = new Date(Date.UTC(y, m, d, hh, mm, ss, 0, 0));
    const timestamp = u.getTime();

    // test
    const t_time = await util.getTimeMillis();
    var diff = timestamp - t_time.valueOf();
    
    // assert
    assert.isBelow(diff, 86400000, "wrong time returned");
  });

});
