pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Ballot is Ownable {

  event CreateVote(uint256 voteId, address addr, bytes32 docId, uint256 dateMillis, uint256 deposit);
  event ClaimVote(uint256 voteId, uint256 amount);

  struct Vote {
    address addr;
    bytes32 docId;
    uint256 startDate;
    uint256 deposit;
    uint256 claimed;
  }

  // maps voteId to the vote data
  mapping (uint256 => Vote) internal _mapById;

  // number of total votes
  uint256 _length;

  address private _rewardPool;
  address private _curator;

  function setRewardPool(address addr) external
    onlyOwner()
  {
    if (addr != _rewardPool) {
      _rewardPool = addr;
    }
  }

  function setCurator(address addr) external
    onlyOwner()
  {
    if (addr != _curator) {
      _curator = addr;
    }
  }

  function count() public view returns (uint256) {
    return uint256(_length);
  }

  function next() public view returns (uint256) {
    return uint256(_length + 1);
  }

  // adding a new vote
  function create(uint256 i, address addr, bytes32 docId, uint256 deposit) public {
    require(msg.sender == _curator);
    add(i, addr, docId, deposit, uint(block.timestamp/86400) * 86400000);
  }

  function insert(uint256 i, address addr, bytes32 docId, uint256 deposit, uint256 dateMillis) public {
    require(msg.sender == _curator);
    add(i, addr, docId, deposit, dateMillis);
  }

  // adding a new vote
  function add(uint256 i, address addr, bytes32 docId, uint256 deposit, uint256 dateMillis) private {
    require(i == _length + 1);

    Vote memory vote = Vote(addr, docId, dateMillis, deposit, 0);
    _mapById[i] = vote;
    _length++;

    emit CreateVote(i, addr, docId, dateMillis, deposit);
  }

  function updateClaimed(uint256 i, uint256 amount) public {
    require(amount != 0);
    require(msg.sender == _rewardPool);
    require(address(_mapById[i].addr) != 0);
    require(uint256(_mapById[i].deposit) != 0);
    require(uint256(_mapById[i].claimed) == 0);

    _mapById[i].claimed = amount;

    emit ClaimVote(i, amount);
  }

  function getVote(uint256 i) public view returns (address, bytes32, uint256, uint256, uint256) {
    return (_mapById[i].addr, _mapById[i].docId, _mapById[i].startDate, _mapById[i].deposit, _mapById[i].claimed);
  }
}
