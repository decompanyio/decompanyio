pragma solidity ^0.4.24;

interface IUtility {
  function getTimeMillis() external view returns (uint);
  function getDateMillis() external view returns (uint);
}
