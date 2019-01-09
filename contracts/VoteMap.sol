pragma solidity ^0.4.24;

import "./Utility.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract VoteMap is Ownable {

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
  function create(uint256 voteId, address addr, bytes32 docId, uint256 deposit) public
    onlyOwner()
  {
    insert(voteId, addr, docId, deposit, _util.getDateMillis());
  }

  // adding a new vote
  function insert(uint256 voteId, address addr, bytes32 docId, uint256 deposit, uint256 dateMillis) public
    onlyOwner()
  {
    require(voteId == _length + 1);

    Vote memory vote = Vote(addr, docId, dateMillis, deposit, 0);
    _mapById[voteId] = vote;
    _length++;

    emit CreateVote(voteId, addr, docId, dateMillis, deposit);
  }

  function claim(uint256 voteId, uint256 amount) public
    onlyOwner()
  {
    require(amount != 0);
    require(address(_mapById[voteId].addr) != 0);
    require(uint256(_mapById[voteId].deposit) != 0);
    require(uint256(_mapById[voteId].claimed) == 0);

    _mapById[voteId].claimed = amount;

    emit ClaimVote(voteId, amount);
  }

  function getVoteAddress(uint256 voteId) public view returns (address) {
    return _mapById[voteId].addr;
  }

  function getVoteDocId(uint256 voteId) public view returns (bytes32) {
    return _mapById[voteId].docId;
  }

  function getVoteStartDate(uint256 voteId) public view returns (uint256) {
    return _mapById[voteId].startDate;
  }

  function getVoteDeposit(uint256 voteId) public view returns (uint256) {
    return _mapById[voteId].deposit;
  }

  function getVoteClaimed(uint256 voteId) public view returns (uint256) {
    return _mapById[voteId].claimed;
  }
}
