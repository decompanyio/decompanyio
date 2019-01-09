pragma solidity ^0.4.24;

import "./Deck.sol";
import "./Utility.sol";
import "./VoteMap.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract CuratorPool is Ownable {

  event _InitializeCuratorPool(uint timestamp, address token);
  event _AddVote(bytes32 indexed docId, uint timestamp, uint deposit, address indexed applicant);
  event _UpdateVote(bytes32 indexed docId, uint timestamp, uint deposit, address indexed applicant);
  event _Withdraw(address indexed applicant, uint idx, uint withdraw);
  //event _DetermineReward(bytes32 indexed docId, uint cvd, uint tvd, uint pv, uint tpvs, uint drp);

  VoteMap private _voteMap;
/*
  struct Vote {
    bytes32 docId;
    uint startDate;
    uint deposit;
    uint withdraw;
  }
*/
  // maps address to the curator's vote data
  mapping (address => uint256[]) internal mapByAddr;

  // maps docId to the curator's vote data
  mapping (bytes32 => uint256[]) internal mapByDoc;

  // key list for iteration
  //address[] private keys;

  // private variables
  Utility private util;
  Deck private token;

  // public variables
  uint public createTime;

  function init(address _token, address _utility, address voteMap) public
    onlyOwner()
  {
    require(_token != 0 && address(token) == 0);
    require(_utility != 0 && address(util) == 0);
    require(voteMap != 0 && address(_voteMap) == 0);

    token = Deck(_token);
    util = Utility(_utility);
    _voteMap = VoteMap(voteMap);

    createTime = util.getTimeMillis();
    emit _InitializeCuratorPool(createTime, _token);
  }

  // -------------------------------
  // For iteration
  // -------------------------------

  // curator list for iteration
  //function getCurators() public view returns (address[]) {
  //  return keys;
  //}

  // -------------------------------
  // Voting Information Functions
  // -------------------------------

  // adding a new vote
  function addVote(address _curator, bytes32 _docId, uint256 _deposit) public
    onlyOwner()
  {
    uint256 dateMillis = util.getDateMillis();

    // create a new vote
    uint256 voteId = _voteMap.next();
    _voteMap.create(voteId, _curator, _docId, _deposit);

    // store mapping information
    mapByAddr[_curator].push(voteId);
    mapByDoc[_docId].push(voteId);

    //if (mapByAddr[_curator].length == 1) {
    //  keys.push(_curator);
    //}

    emit _AddVote(_docId, dateMillis, _deposit, _curator);
  }

  function updateVote(address _curator, bytes32 _docId, uint _deposit, uint _dateMillis) public
    onlyOwner()
  {
    // create a new vote
    uint256 voteId = _voteMap.next();
    _voteMap.insert(voteId, _curator, _docId, _deposit, _dateMillis);

    // store mapping information
    mapByAddr[_curator].push(voteId);
    mapByDoc[_docId].push(voteId);

    //if (mapByAddr[_curator].length == 1) {
    //  keys.push(_curator);
    //}

    emit _AddVote(_docId, _dateMillis, _deposit, _curator);
  }

  function withdraw(address _curator, uint _idx, uint _withdraw) public
    onlyOwner()
  {
    _voteMap.claim(mapByAddr[_curator][_idx], _withdraw);
    emit _Withdraw(_curator, _idx, _withdraw);
  }

  function getVoteCountByAddr(address _addr) public view returns (uint) {
    return mapByAddr[_addr].length;
  }

  function getDocIdByAddr(address _addr, uint _idx) public view returns (bytes32) {
    return _voteMap.getVoteDocId(mapByAddr[_addr][uint(_idx)]);
  }

  function getStartDateByAddr(address _addr, uint _idx) public view returns (uint) {
    return _voteMap.getVoteStartDate(mapByAddr[_addr][uint(_idx)]);
  }

  function getDepositByAddr(address _addr, uint _idx) public view returns (uint) {
    return _voteMap.getVoteDeposit(mapByAddr[_addr][uint(_idx)]);
  }

  function getWithdrawByAddr(address _addr, uint _idx) public view returns (uint) {
    return _voteMap.getVoteClaimed(mapByAddr[_addr][uint(_idx)]);
  }

  function getVoteCountByDoc(bytes32 _docId) public view returns (uint) {
    return mapByDoc[_docId].length;
  }

  function getAddressByDoc(bytes32 _docId, uint _idx) public view returns (bytes32) {
    return _voteMap.getVoteDocId(mapByDoc[_docId][uint(_idx)]);
  }

  function getStartDateByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    return _voteMap.getVoteStartDate(mapByDoc[_docId][uint(_idx)]);
  }

  function getDepositByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    return _voteMap.getVoteDeposit(mapByDoc[_docId][uint(_idx)]);
  }

  function getWithdrawByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    return _voteMap.getVoteClaimed(mapByDoc[_docId][uint(_idx)]);
  }

  // --------------------------------
  // Find the next index of votes that can be claimed
  // --------------------------------
  function indexOfNextVoteForClaim(address _addr, bytes32 _docId, uint _index) public view returns (int) {

    if (mapByAddr[_addr].length == 0) {
      return int(-1);
    }

    if (mapByDoc[_docId].length == 0) {
      return int(-1);
    }

    // Going around the full vote list of the curator
    //  a. Select only the votes for the specified docuemnt
    //  b. Exclude votes that have already been withdrawn
    //  c. Check whether voting period expired since start date (can be claimed)
    uint dateMillis = util.getDateMillis();
    for (uint i=(_index+1); i<mapByAddr[_addr].length; i++) {
      if ((_voteMap.getVoteDocId(mapByAddr[_addr][i]) == _docId)
       && (_voteMap.getVoteClaimed(mapByAddr[_addr][i]) == 0)
       && (dateMillis > _voteMap.getVoteStartDate(mapByAddr[_addr][i]))
       && (dateMillis - _voteMap.getVoteStartDate(mapByAddr[_addr][i]) > util.getVoteDepositMillis())) {
         return int(i);
      }
    }
    return -1;
  }

  function determineReward(address _addr, uint _idx, uint _dateMillis, uint _pv, uint _tpvs) public view returns (uint) {

    require(_addr != 0);
    require(_dateMillis > 0);

    if (_voteMap.getVoteStartDate(mapByAddr[_addr][_idx]) > _dateMillis
     || (_voteMap.getVoteDeposit(mapByAddr[_addr][_idx]) == 0)
     || (_dateMillis - _voteMap.getVoteStartDate(mapByAddr[_addr][_idx])) > util.getVoteDepositMillis()) {
      return uint(0);
    }

    return calculateReward(_voteMap.getVoteDocId(mapByAddr[_addr][_idx]), _dateMillis, _pv, _tpvs, _voteMap.getVoteDeposit(mapByAddr[_addr][_idx]));
  }

  function getRewardByDoc(bytes32 _docId, uint _idx, uint _dateMillis, uint _pv, uint _tpvs) public view returns (uint) {

    require(_dateMillis > 0);

    if (_voteMap.getVoteStartDate(mapByDoc[_docId][_idx]) > _dateMillis
     || _voteMap.getVoteDeposit(mapByDoc[_docId][_idx]) == 0) {
      return uint(0);
    }

    return calculateReward(_docId, _dateMillis, _pv, _tpvs, _voteMap.getVoteDeposit(mapByDoc[_docId][_idx]));
  }

  function calculateReward(bytes32 _docId, uint _dateMillis, uint _pv, uint _tpvs, uint _deposit) private view returns (uint) {

    if (_tpvs == 0 || _pv == 0) {
      return uint(0);
    }

    uint tvd = 0;
    uint256[] memory voteTotalList = mapByDoc[_docId];
    for (uint i=0; i<voteTotalList.length; i++) {
      uint offset = _dateMillis - _voteMap.getVoteStartDate(voteTotalList[i]);
      if (offset >= 0 && offset < util.getVoteDepositMillis()) {
        tvd += _voteMap.getVoteDeposit(voteTotalList[i]);
      }
    }

    if (tvd == 0) {
      return uint(0);
    }

    assert(tvd >= _deposit);
    assert(_tpvs >= (_pv ** 2));

    uint drp = util.getDailyRewardPool(30, _dateMillis);
    uint reward = uint(uint((drp * (_pv ** 2)) / _tpvs) * _deposit / tvd);

    assert(drp >= reward);

    return reward;
  }

  function getSumDepositByAddr(address _addr, bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumDeposit = 0;
    uint[] memory voteList = mapByAddr[_addr];
    for (uint i=0; i<voteList.length; i++) {
      if (_voteMap.getVoteDocId(voteList[i]) == _docId
        && (_dateMillis - _voteMap.getVoteStartDate(voteList[i])) >= 0
        && (_dateMillis - _voteMap.getVoteStartDate(voteList[i])) < util.getVoteDepositMillis()) {
        sumDeposit += _voteMap.getVoteDeposit(voteList[i]);
      }
    }
    return sumDeposit;
  }

  function getSumDepositByDoc(bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumDeposit = 0;
    uint[] memory voteList = mapByDoc[_docId];
    for (uint i=0; i<voteList.length; i++) {
      if ((_dateMillis - _voteMap.getVoteStartDate(voteList[i])) >= 0
        && (_dateMillis - _voteMap.getVoteStartDate(voteList[i])) < util.getVoteDepositMillis()) {
        sumDeposit += _voteMap.getVoteDeposit(voteList[i]);
      }
    }
    return sumDeposit;
  }

  function getSumWithdrawByAddr(address _addr, bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumWithdraw = 0;
    uint[] memory voteList = mapByAddr[_addr];
    for (uint i=0; i<voteList.length; i++) {
      if (_voteMap.getVoteDocId(voteList[i]) == _docId
        && (_dateMillis - _voteMap.getVoteStartDate(voteList[i])) > util.getVoteDepositMillis()) {
        sumWithdraw += _voteMap.getVoteClaimed(voteList[i]);
      }
    }
    return sumWithdraw;
  }

  function getSumWithdrawByDoc(bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumWithdraw = 0;
    uint[] memory voteList = mapByDoc[_docId];
    for (uint i=0; i<voteList.length; i++) {
      if ((_dateMillis - _voteMap.getVoteStartDate(voteList[i])) > util.getVoteDepositMillis()) {
        sumWithdraw += _voteMap.getVoteClaimed(voteList[i]);
      }
    }
    return sumWithdraw;
  }

}
