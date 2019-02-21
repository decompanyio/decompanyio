pragma solidity ^0.4.24;

interface IAsset {
  function determineAt(address addr, bytes32 docId, uint256 dateMillis) external view returns (uint256);
  function refundableAt(address addr, bytes32 docId, uint256 dateMillis) external view returns (uint256);
}
