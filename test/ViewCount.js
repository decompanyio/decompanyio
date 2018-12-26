const ViewCount = artifacts.require("./ViewCount.sol");
var moment = require('moment');

contract("ViewCount", accounts => {

  it("Get view count through the oraclize api", async () => {

    // prepare
    const viewCount = await ViewCount.deployed();

    // send query to oraclize api
    await viewCount.init();

    var vc = 0;
    for(var i=0; i<30 && vc*1 == 0; i++) {
      // wait for 1 second
      await new Promise(r => {setTimeout(function () {r();}, 1000)});
      vc = await viewCount.count.call();
    }
    //console.log("view count : " + vc);

    // assert
    assert.isAbove(vc*1, 0, "view count is 0");
  });

});
