pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Ballot is Ownable {

  event CreateVote(uint256 voteId, address addr, bytes32 docId, uint256 dateMillis, uint256 deposit);
  event ClaimVote(uint256 voteId, uint256 amount);
  event Withdraw(address addr, bytes32 docId, uint256 claimedDate, uint256 amount);

  struct Vote {
    address addr;
    bytes32 docId;
    uint256 startDate;
    uint256 deposit;
    uint256 claimed;
  }

  struct Status {
    uint lastClaimedDate;
    uint withdraw;
    bool added;
  }

  // voteId to the vote data
  mapping (uint256 => Vote) internal _mapById;

  // address to the curator's vote data
  mapping (address => uint256[]) internal _mapByAddr;

  // docId to the curator's vote data
  mapping (bytes32 => uint256[]) internal _mapByDoc;

  // for user document list
  mapping (address => mapping (bytes32 => Status)) internal _mapUserDocAdded;
  mapping (address => bytes32[]) internal _mapUserDoc;

  // number of total votes
  uint256 _length;

  // accessibility
  address private _foundation;
  address private _rewardPool;
  address private _curator;

  function count() external view returns (uint256) {
    return uint256(_length);
  }

  function next() external view returns (uint256) {
    return uint256(_length + 1);
  }

  // adding a new vote
  function create(uint256 i, address addr, bytes32 docId, uint256 deposit) external {
    require(msg.sender == _curator);
    add(i, addr, docId, deposit, uint(block.timestamp/86400) * 86400000);
  }

  function insert(uint256 i, address addr, bytes32 docId, uint256 deposit, uint256 dateMillis) external {
    require(msg.sender == _foundation);
    add(i, addr, docId, deposit, dateMillis);
  }

  // adding a new vote
  function add(uint256 i, address addr, bytes32 docId, uint256 deposit, uint256 dateMillis) private {
    require(i == _length + 1);

    Vote memory vote = Vote(addr, docId, dateMillis, deposit, 0);
    _mapById[i] = vote;
    _mapByAddr[addr].push(i);
    _mapByDoc[docId].push(i);
    _length++;

    if (_mapUserDocAdded[addr][docId].added == false) {
      _mapUserDoc[addr].push(docId);
      _mapUserDocAdded[addr][docId].added = true;
    }

    emit CreateVote(i, addr, docId, dateMillis, deposit);
  }

  function getVote(uint256 i) external view returns (address, bytes32, uint256, uint256, uint256) {
    return (_mapById[i].addr, _mapById[i].docId, _mapById[i].startDate, _mapById[i].deposit, _mapById[i].claimed);
  }

  function getActiveVotes(bytes32 docId, uint dateMillis, uint vestingMillis) external view returns (uint256) {
    uint256 sum = 0;
    for (uint i=0; i<_mapByDoc[docId].length; i++) {
      if (isActive(_mapById[_mapByDoc[docId][i]], dateMillis, vestingMillis)) {
        sum += _mapById[_mapByDoc[docId][i]].deposit;
      }
    }
    return sum;
  }

  function getUserActiveVotes(address addr, bytes32 docId, uint dateMillis, uint vestingMillis) external view returns (uint256) {
    uint256 sum = 0;
    for (uint i=0; i<_mapByAddr[addr].length; i++) {
      if (sameDoc(_mapById[_mapByAddr[addr][i]], docId)
       && isActive(_mapById[_mapByAddr[addr][i]], dateMillis, vestingMillis)) {
        sum += _mapById[_mapByAddr[addr][i]].deposit;
      }
    }
    return sum;
  }

  function getUserClaimableVotes(address addr, bytes32 docId, uint dateMillis, uint claimDateMillis, uint vestingMillis) external view returns (uint256) {
    uint256 sum = 0;
    uint256 lastDateMillis = _mapUserDocAdded[addr][docId].lastClaimedDate;
    for (uint i=0; i<_mapByAddr[addr].length; i++) {
      if (sameDoc(_mapById[_mapByAddr[addr][i]], docId)
       && isActive(_mapById[_mapByAddr[addr][i]], dateMillis, vestingMillis)
       && isClaimable(_mapById[_mapByAddr[addr][i]], lastDateMillis, claimDateMillis, vestingMillis)) {
        sum += _mapById[_mapByAddr[addr][i]].deposit;
      }
    }
    return sum;
  }

  function getUserRefundableDeposit(address addr, bytes32 docId, uint dateMillis, uint claimDateMillis, uint vestingMillis) external view returns (uint256) {
    uint256 sum = 0;
    uint256 lastDateMillis = _mapUserDocAdded[addr][docId].lastClaimedDate;
    for (uint i=0; i<_mapByAddr[addr].length; i++) {
      if (sameDoc(_mapById[_mapByAddr[addr][i]], docId)
       && isRefundable(_mapById[_mapByAddr[addr][i]], dateMillis, vestingMillis)
       && isClaimable(_mapById[_mapByAddr[addr][i]], lastDateMillis, claimDateMillis, vestingMillis)) {
        sum += _mapById[_mapByAddr[addr][i]].deposit;
      }
    }
    return sum;
  }

  function getUserDocuments(address addr) external view returns (bytes32[]) {
    return _mapUserDoc[addr];
  }

  function updateWithdraw(address addr, bytes32 docId, uint256 claimedDate, uint256 withdraw) external {
    require(msg.sender == _rewardPool);
    require(_mapUserDocAdded[addr][docId].added);
    _mapUserDocAdded[addr][docId].lastClaimedDate = claimedDate;
    _mapUserDocAdded[addr][docId].withdraw += withdraw;
    emit Withdraw(addr, docId, claimedDate, withdraw);
  }

  function updateClaimed(uint256 i, uint256 amount) external {
    require(amount != 0);
    require(msg.sender == _rewardPool);
    require(address(_mapById[i].addr) != 0);
    require(uint256(_mapById[i].deposit) != 0);
    require(uint256(_mapById[i].claimed) == 0);

    _mapById[i].claimed = amount;

    emit ClaimVote(i, amount);
  }

  function sameDoc(Vote vote, bytes32 docId) private pure returns (bool) {
    return (docId == vote.docId);
  }

  function isActive(Vote vote, uint dateMillis, uint vestingMillis) private pure returns (bool) {
    return (vote.startDate <= dateMillis) && (dateMillis < vote.startDate + vestingMillis);
  }

  function isClaimable(Vote vote, uint lastDateMillis, uint claimDateMillis, uint vestingMillis) private pure returns (bool) {
    lastDateMillis = lastDateMillis == 0 ? vestingMillis : lastDateMillis;
    return (lastDateMillis <= vote.startDate + vestingMillis) && (vote.startDate + vestingMillis < claimDateMillis);
  }

  function isRefundable(Vote vote, uint dateMillis, uint vestingMillis) private pure returns (bool) {
    return (dateMillis == vote.startDate + vestingMillis);
  }

  function setRewardPool(address addr) external onlyOwner() {
    if (addr != _rewardPool) {
      _rewardPool = addr;
    }
  }

  function setCurator(address addr) external onlyOwner() {
    if (addr != _curator) {
      _curator = addr;
    }
  }

  function setFoundation(address addr) external onlyOwner() {
    if (addr != _foundation) {
      _foundation = addr;
    }
  }
}
