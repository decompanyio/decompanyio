pragma solidity ^0.4.24;

import "./Utility.sol";
import "./Ballot.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract CuratorPool is Ownable {

  event _InitializeCuratorPool(uint timestamp);
  event _AddVote(bytes32 indexed docId, uint timestamp, uint deposit, address indexed applicant);
  event _UpdateVote(bytes32 indexed docId, uint timestamp, uint deposit, address indexed applicant);
  event _Withdraw(address indexed applicant, uint idx, uint withdraw);
  //event _DetermineReward(bytes32 indexed docId, uint cvd, uint tvd, uint pv, uint tpvs, uint drp);

  Ballot private _ballot;

  // maps address to the curator's vote data
  mapping (address => uint256[]) internal mapByAddr;

  // maps docId to the curator's vote data
  mapping (bytes32 => uint256[]) internal mapByDoc;

  // key list for iteration
  //address[] private keys;

  // private variables
  Utility private util;

  // public variables
  uint public createTime;

  function init(address _utility, address ballot) public
    onlyOwner()
  {
    require(_utility != 0 && address(util) == 0);
    require(ballot != 0 && address(_ballot) == 0);

    util = Utility(_utility);
    _ballot = Ballot(ballot);

    createTime = util.getTimeMillis();
    emit _InitializeCuratorPool(createTime);
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
    uint256 voteId = _ballot.next();
    _ballot.create(voteId, _curator, _docId, _deposit);

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
    uint256 voteId = _ballot.next();
    _ballot.insert(voteId, _curator, _docId, _deposit, _dateMillis);

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
    _ballot.claim(mapByAddr[_curator][_idx], _withdraw);
    emit _Withdraw(_curator, _idx, _withdraw);
  }

  function getVoteCountByAddr(address _addr) public view returns (uint) {
    return mapByAddr[_addr].length;
  }

  function getDocIdByAddr(address _addr, uint _idx) public view returns (bytes32) {
    (,bytes32 i,,,) = _ballot.getVote(mapByAddr[_addr][uint(_idx)]);
    return i;
  }

  function getStartDateByAddr(address _addr, uint _idx) public view returns (uint) {
    (,, uint256 t,,) = _ballot.getVote(mapByAddr[_addr][uint(_idx)]);
    return t;
  }

  function getDepositByAddr(address _addr, uint _idx) public view returns (uint) {
    (,,, uint256 d,) = _ballot.getVote(mapByAddr[_addr][uint(_idx)]);
    return d;
  }

  function getWithdrawByAddr(address _addr, uint _idx) public view returns (uint) {
    (,,,, uint256 c) = _ballot.getVote(mapByAddr[_addr][uint(_idx)]);
    return c;
  }

  function getVoteCountByDoc(bytes32 _docId) public view returns (uint) {
    return mapByDoc[_docId].length;
  }

  function getAddressByDoc(bytes32 _docId, uint _idx) public view returns (address) {
    (address a,,,,) = _ballot.getVote(mapByDoc[_docId][uint(_idx)]);
    return a;
  }

  function getStartDateByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    (,, uint256 t,,) = _ballot.getVote(mapByDoc[_docId][uint(_idx)]);
    return t;
  }

  function getDepositByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    (,,, uint256 d,) = _ballot.getVote(mapByDoc[_docId][uint(_idx)]);
    return d;
  }

  function getWithdrawByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    (,,,, uint256 c) = _ballot.getVote(mapByDoc[_docId][uint(_idx)]);
    return c;
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
      (, bytes32 d, uint256 t,, uint256 c) = _ballot.getVote(mapByAddr[_addr][i]);
      if ((d == _docId)
       && (c == 0)
       && (dateMillis > t)
       && (dateMillis - t > util.getVoteDepositMillis())) {
         return int(i);
      }
    }
    return -1;
  }

  function determineReward(address _addr, uint _idx, uint _dateMillis, uint _pv, uint _tpvs) public view returns (uint) {

    require(_addr != 0);
    require(_dateMillis > 0);

    (, bytes32 d, uint256 t, uint256 p,) = _ballot.getVote(mapByAddr[_addr][_idx]);

    if (t > _dateMillis
     || (p == 0)
     || (_dateMillis - t) > util.getVoteDepositMillis()) {
      return uint(0);
    }

    return calculateReward(d, _dateMillis, _pv, _tpvs, p);
  }

  function getRewardByDoc(bytes32 _docId, uint _idx, uint _dateMillis, uint _pv, uint _tpvs) public view returns (uint) {

    require(_dateMillis > 0);

    (,, uint256 t, uint256 p,) = _ballot.getVote(mapByDoc[_docId][_idx]);

    if (t > _dateMillis
     || p == 0) {
      return uint(0);
    }

    return calculateReward(_docId, _dateMillis, _pv, _tpvs, p);
  }

  function calculateReward(bytes32 _docId, uint _dateMillis, uint _pv, uint _tpvs, uint _deposit) private view returns (uint) {

    if (_tpvs == 0 || _pv == 0) {
      return uint(0);
    }

    uint tvd = getTotalVoted(_docId, _dateMillis);
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

  function getTotalVoted(bytes32 _docId, uint _dateMillis) private view returns (uint) {
    uint tvd = 0;
    for (uint i=0; i<mapByDoc[_docId].length; i++) {
      (,, uint t, uint p,) = _ballot.getVote(mapByDoc[_docId][i]);
      if (_dateMillis - t >= 0 && _dateMillis - t < util.getVoteDepositMillis()) {
        tvd += p;
      }
    }
    return tvd;
  }

  function getSumDepositByAddr(address _addr, bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumDeposit = 0;
    for (uint i=0; i<mapByAddr[_addr].length; i++) {
      (, bytes32 d, uint256 t, uint256 p,) = _ballot.getVote(mapByAddr[_addr][i]);
      if (d == _docId
        && (_dateMillis - t) >= 0
        && (_dateMillis - t) < util.getVoteDepositMillis()) {
        sumDeposit += p;
      }
    }
    return sumDeposit;
  }

  function getSumDepositByDoc(bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumDeposit = 0;
    uint[] memory voteList = mapByDoc[_docId];
    for (uint i=0; i<voteList.length; i++) {
      (,, uint256 t, uint256 p,) = _ballot.getVote(voteList[i]);
      if ((_dateMillis - t) >= 0
        && (_dateMillis - t) < util.getVoteDepositMillis()) {
        sumDeposit += p;
      }
    }
    return sumDeposit;
  }

  function getSumWithdrawByAddr(address _addr, bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumWithdraw = 0;
    uint[] memory voteList = mapByAddr[_addr];
    for (uint i=0; i<voteList.length; i++) {
      (, bytes32 d, uint256 t,, uint256 c) = _ballot.getVote(voteList[i]);
      if (d == _docId
        && (_dateMillis - t) > util.getVoteDepositMillis()) {
        sumWithdraw += c;
      }
    }
    return sumWithdraw;
  }

  function getSumWithdrawByDoc(bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumWithdraw = 0;
    uint[] memory voteList = mapByDoc[_docId];
    for (uint i=0; i<voteList.length; i++) {
      (,, uint256 t,, uint256 c) = _ballot.getVote(voteList[i]);
      if ((_dateMillis - t) > util.getVoteDepositMillis()) {
        sumWithdraw += c;
      }
    }
    return sumWithdraw;
  }

}
