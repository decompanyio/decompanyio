pragma solidity ^0.4.24;

import "./Utility.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Ballot is Ownable {

  event Initialize(uint256 createTime, address util);
  event CreateVote(uint256 voteId, address addr, bytes32 docId, uint256 dateMillis, uint256 deposit);
  event ClaimVote(uint256 voteId, uint256 amount);

  Utility private _util;

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

  // public variables
  uint256 public _createTime;

  function init(address util) public
    onlyOwner()
  {
    require(util != 0 && address(_util) == 0);
    _util = Utility(util);
    _createTime = _util.getTimeMillis();
    emit Initialize(_createTime, _util);
  }

  function count() public view returns (uint256) {
    return uint256(_length);
  }

  function next() public view returns (uint256) {
    return uint256(_length + 1);
  }

  // adding a new vote
  function create(uint256 i, address addr, bytes32 docId, uint256 deposit) public
    onlyOwner()
  {
    insert(i, addr, docId, deposit, _util.getDateMillis());
  }

  // adding a new vote
  function insert(uint256 i, address addr, bytes32 docId, uint256 deposit, uint256 dateMillis) public
    onlyOwner()
  {
    require(i == _length + 1);

    Vote memory vote = Vote(addr, docId, dateMillis, deposit, 0);
    _mapById[i] = vote;
    _length++;

    emit CreateVote(i, addr, docId, dateMillis, deposit);
  }

  function claim(uint256 i, uint256 amount) public
    onlyOwner()
  {
    require(amount != 0);
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
