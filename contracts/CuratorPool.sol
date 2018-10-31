pragma solidity ^0.4.24;

import "./Deck.sol";
import "./Utility.sol";

contract CuratorPool is Ownable {

  event _InitializeCuratorPool(uint timestamp, address token);
  event _AddVote(bytes32 indexed docId, uint timestamp, uint deposit, address indexed applicant);
  event _UpdateVote(bytes32 indexed docId, uint timestamp, uint deposit, address indexed applicant);
  event _Withdraw(address indexed applicant, uint idx, uint withdraw);
  //event _DetermineReward(bytes32 indexed docId, uint cvd, uint tvd, uint pv, uint tpvs, uint drp);

  struct Vote {
    bytes32 docId;
    uint startDate;
    uint deposit;
    uint withdraw;
  }

  // maps address to the curator's vote data
  mapping (address => Vote[]) internal mapByAddr;

  // maps docId to the curator's vote data
  mapping (bytes32 => Vote[]) internal mapByDoc;

  // key list for iteration
  //address[] private keys;

  // private variables
  Utility private util;
  Deck private token;

  // public variables
  uint public createTime;

  function init(address _token, address _utility) public
    onlyOwner()
  {
    require(_token != 0 && address(token) == 0);
    require(_utility != 0 && address(util) == 0);

    token = Deck(_token);
    util = Utility(_utility);

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
  function addVote(address _curator, bytes32 _docId, uint _deposit) public
    onlyOwner()
  {
    uint dateMillis = util.getDateMillis();

    Vote memory vote = Vote(_docId, dateMillis, _deposit, 0);

    mapByAddr[_curator].push(vote);
    mapByDoc[_docId].push(vote);

    //if (mapByAddr[_curator].length == 1) {
    //  keys.push(_curator);
    //}

    emit _AddVote(_docId, dateMillis, _deposit, _curator);
  }

  function updateVote(address _curator, bytes32 _docId, uint _deposit, uint _dateMillis) public
    onlyOwner()
  {
    Vote memory vote = Vote(_docId, _dateMillis, _deposit, 0);

    mapByAddr[_curator].push(vote);
    mapByDoc[_docId].push(vote);

    //if (idx == 1) {
    //  keys.push(_curator);
    //}

    emit _UpdateVote(_docId, _dateMillis, _deposit, _curator);
  }

  function withdraw(address _curator, uint _idx, uint _withdraw) public
    onlyOwner()
  {
    mapByAddr[_curator][_idx].withdraw = _withdraw;
    Vote[] storage voteList = mapByDoc[mapByAddr[_curator][_idx].docId];
    for (uint i=0; i<voteList.length; i++) {
      if (voteList[i].startDate == mapByAddr[_curator][_idx].startDate
       && voteList[i].deposit == mapByAddr[_curator][_idx].deposit
       && voteList[i].withdraw == 0) {
         voteList[i].withdraw = _withdraw;
      }
    }
    emit _Withdraw(_curator, _idx, _withdraw);
  }

  function getVoteCountByAddr(address _addr) public view returns (uint) {
    return mapByAddr[_addr].length;
  }

  function getDocIdByAddr(address _addr, uint _idx) public view returns (bytes32) {
    return mapByAddr[_addr][uint(_idx)].docId;
  }

  function getStartDateByAddr(address _addr, uint _idx) public view returns (uint) {
    return mapByAddr[_addr][uint(_idx)].startDate;
  }

  function getDepositByAddr(address _addr, uint _idx) public view returns (uint) {
    return mapByAddr[_addr][uint(_idx)].deposit;
  }

  function getWithdrawByAddr(address _addr, uint _idx) public view returns (uint) {
    return mapByAddr[_addr][uint(_idx)].withdraw;
  }

  function getVoteCountByDoc(bytes32 _docId) public view returns (uint) {
    return mapByDoc[_docId].length;
  }

  function getAddressByDoc(bytes32 _docId, uint _idx) public view returns (bytes32) {
    return mapByDoc[_docId][uint(_idx)].docId;
  }

  function getStartDateByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    return mapByDoc[_docId][uint(_idx)].startDate;
  }

  function getDepositByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    return mapByDoc[_docId][uint(_idx)].deposit;
  }

  function getWithdrawByDoc(bytes32 _docId, uint _idx) public view returns (uint) {
    return mapByDoc[_docId][uint(_idx)].withdraw;
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
      if ((mapByAddr[_addr][i].docId == _docId)
       && (mapByAddr[_addr][i].withdraw == 0)
       && (dateMillis > mapByAddr[_addr][i].startDate)
       && (dateMillis - mapByAddr[_addr][i].startDate > util.getVoteDepositMillis())) {
         return int(i);
      }
    }
    return -1;
  }

  function determineReward(address _addr, uint _idx, uint _dateMillis, uint _pv, uint _tpvs) public view returns (uint) {

    require(_addr != 0);
    require(_dateMillis > 0);

    Vote memory vote = mapByAddr[_addr][_idx];
    if (vote.startDate > _dateMillis || vote.deposit == 0 || (_dateMillis - vote.startDate) > util.getVoteDepositMillis()) {
      return uint(0);
    }

    return calculateReward(vote.docId, _dateMillis, _pv, _tpvs, vote.deposit);
  }

  function getRewardByDoc(bytes32 _docId, uint _idx, uint _dateMillis, uint _pv, uint _tpvs) public view returns (uint) {

    require(_dateMillis > 0);

    Vote memory vote = mapByDoc[_docId][_idx];
    if (vote.startDate > _dateMillis || vote.deposit == 0) {
      return uint(0);
    }

    return calculateReward(_docId, _dateMillis, _pv, _tpvs, vote.deposit);
  }

  function calculateReward(bytes32 _docId, uint _dateMillis, uint _pv, uint _tpvs, uint _deposit) private view returns (uint) {

    if (_tpvs == 0 || _pv == 0) {
      return uint(0);
    }

    uint tvd = 0;
    Vote[] memory voteTotalList = mapByDoc[_docId];
    for (uint i=0; i<voteTotalList.length; i++) {
      uint offset = _dateMillis - voteTotalList[i].startDate;
      if (offset >= 0 && offset < util.getVoteDepositMillis()) {
        tvd += voteTotalList[i].deposit;
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
    Vote[] memory voteList = mapByAddr[_addr];
    for (uint i=0; i<voteList.length; i++) {
      if (voteList[i].docId == _docId
        && (_dateMillis - voteList[i].startDate) >= 0
        && (_dateMillis - voteList[i].startDate) < util.getVoteDepositMillis()) {
        sumDeposit += voteList[i].deposit;
      }
    }
    return sumDeposit;
  }

  function getSumDepositByDoc(bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumDeposit = 0;
    Vote[] memory voteList = mapByDoc[_docId];
    for (uint i=0; i<voteList.length; i++) {
      if ((_dateMillis - voteList[i].startDate) >= 0
       && (_dateMillis - voteList[i].startDate) < util.getVoteDepositMillis()) {
        sumDeposit += voteList[i].deposit;
      }
    }
    return sumDeposit;
  }

  function getSumWithdrawByAddr(address _addr, bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumWithdraw = 0;
    Vote[] memory voteList = mapByAddr[_addr];
    for (uint i=0; i<voteList.length; i++) {
      if (voteList[i].docId == _docId
        && (_dateMillis - voteList[i].startDate) > util.getVoteDepositMillis()) {
        sumWithdraw += voteList[i].withdraw;
      }
    }
    return sumWithdraw;
  }

  function getSumWithdrawByDoc(bytes32 _docId, uint _dateMillis) public view returns (uint) {
    uint sumWithdraw = 0;
    Vote[] memory voteList = mapByDoc[_docId];
    for (uint i=0; i<voteList.length; i++) {
      if ((_dateMillis - voteList[i].startDate) > util.getVoteDepositMillis()) {
        sumWithdraw += voteList[i].withdraw;
      }
    }
    return sumWithdraw;
  }

}
