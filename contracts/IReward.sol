pragma solidity ^0.4.24;

interface IReward {
  function determineAt(bytes32 docId, uint256 dateMillis) external view returns (uint256);
}
