pragma solidity ^0.4.24;

import "./IReward.sol";

contract Curator is IReward {

  function determine(address addr, bytes32 docId) public view returns (uint256) {
      return 0;
  }

}
