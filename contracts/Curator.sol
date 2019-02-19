pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./RewardPool.sol";
import "./IAsset.sol";

contract Curator is IAsset, Ownable {

  RewardPool public _rewardPool;

  function init(address rewardPool) external
    onlyOwner()
  {
    require(address(rewardPool) != address(0));
    require(address(_rewardPool) == address(0));
    _rewardPool = RewardPool(rewardPool);
  }

  function addVote(bytes32 docId, uint256 deposit) external {
    _rewardPool._ballot().create(_rewardPool._ballot().next(), msg.sender, docId, deposit);
  }

  function getVote(uint256 i) external view returns (address, bytes32, uint256, uint256, uint256) {
    return _rewardPool._ballot().getVote(i);
  }

  function count() external view returns (uint256) {
    return _rewardPool._ballot().count();
  }

  function getActiveVotes(bytes32 docId) external view returns (uint256) {
    return _rewardPool._ballot().getActiveVotes(docId, uint(block.timestamp/86400) * 86400000, _rewardPool.getVestingMillis());
  }

  function getUserActiveVotes(address addr, bytes32 docId) external view returns (uint256) {
    return _rewardPool._ballot().getUserActiveVotes(addr, docId, uint(block.timestamp/86400) * 86400000, _rewardPool.getVestingMillis());
  }

  function getUserDocuments(address addr) external view returns (bytes32[]) {
    return _rewardPool._ballot().getUserDocuments(addr);
  }

  function determine(bytes32 docId) external view returns (uint256) {
      return docId == 0 ? 0 : 1;
  }

  function determineAt(bytes32 docId, uint256 dateMillis) external view returns (uint256) {
      return docId == 0 ? 0 : dateMillis;
  }

}
