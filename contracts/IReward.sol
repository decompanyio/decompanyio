pragma solidity ^0.4.24;

import "./IRegistry.sol";

interface IReward {
  function determine(IRegistry registry, address addr, bytes32 docId) external view returns (uint256);
}
