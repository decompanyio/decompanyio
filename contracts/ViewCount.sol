pragma solidity ^0.4.0;
import "./OraclizeAPI.sol";

contract ViewCount is usingOraclize {

    uint public count;

    event _newOraclizeQuery(string description);
    event _newViewCount(bytes32 myid, string count);

    constructor() payable public {
    }

    function init() public {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        //oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        update(); // first check at contract creation
    }

    function __callback(bytes32 myid, string result) public {
        require (msg.sender == oraclize_cbAddress());
        emit _newViewCount(myid, result);
        count = parseInt(result, 2); // let's save it as $ cents
    }

    function update() payable public {
        emit _newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        oraclize_query("URL", "xml(https://www.w3schools.com/xml/simple.xml).breakfast_menu.food[0].price");
    }

}
