pragma solidity ^0.5.0;

interface IAsset {
  function determineAt(address addr, bytes32 docId, uint256 dateMillis) external view returns (uint256, uint256);
}
