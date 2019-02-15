pragma solidity ^0.4.24;

import "./IReward.sol";

contract Curator is IReward {

  function determine(bytes32 docId) external view returns (uint256) {
      return docId == 0 ? 0 : 1;
  }

  function determineAt(bytes32 docId, uint256 dateMillis) external view returns (uint256) {
      return docId == 0 ? 0 : dateMillis;
  }

}
