pragma solidity ^0.4.24;

interface IRegistry {
  function getDocument(bytes32 docId, uint dateMillis) external view returns (address, uint256, uint256, uint256, uint256, uint256);
  function contains(bytes32 docId) external view returns (bool);
  function getTotalPageView(uint _dateMillis) external view returns (uint);
}
