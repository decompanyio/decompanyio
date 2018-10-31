pragma solidity ^0.4.24;

import "./Deck.sol";
import "./Utility.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract AuthorPool is Ownable {

  event _InitializeAuthorPool(uint timestamp, address token);
  event _RegisterNewUserDocument(bytes32 indexed docId, uint timestamp, address indexed applicant, uint count);
  event _Withdraw(address indexed applicant, uint idx, uint withdraw, uint timestamp);

  struct Asset {
    bytes32 docId;
    uint listedDate;
    uint lastClaimedDate;
    uint withdraw;
  }

  // maps address to the user's asset data
  mapping (address => Asset[]) internal map;

  // key list for iteration
  address[] private keys;

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
    emit _InitializeAuthorPool(createTime, _token);
  }

  // -------------------------------
  // For iteration
  // -------------------------------

  // author list for iteration
  function getAuthors() public view returns (address[]) {
    return keys;
  }

  // -------------------------------
  // User Document Functions
  // -------------------------------

  // register a new document
  function registerUserDocument(bytes32 _docId, address _author) public
    onlyOwner()
  {
    require(getIndex(_docId, _author) < 0);

    // adding to document registry
    uint tMillis = util.getDateMillis();
    if (map[_author].length == 0){
      keys.push(_author);
    }
    uint index = map[_author].push(Asset(_docId, tMillis, 0, 0));

    emit _RegisterNewUserDocument(_docId, tMillis, _author, index);
  }

  function updateUserDocument(bytes32 _docId, address _author, uint _timestamp) public
    onlyOwner()
  {
    if (map[_author].length == 0){
      keys.push(_author);
    }
    for (uint i=0; i<map[_author].length; i++) {
      if (map[_author][i].docId == _docId) {
        map[_author][i].listedDate = _timestamp;
        return;
      }
    }
    uint index = map[_author].push(Asset(_docId, _timestamp, 0, 0));

    emit _RegisterNewUserDocument(_docId, _timestamp, _author, index);
  }

  function containsUserDocument(address _addr, bytes32 _docId) public view returns (bool) {
    return getIndex(_docId, _addr) >= 0;
  }

  function getUserDocumentIndex(address _addr, bytes32 _docId) public view returns (int) {
    return getIndex(_docId, _addr);
  }

  function getUserDocumentListedDate(address _addr, uint _idx) public view returns (uint) {
    return map[_addr][_idx].listedDate;
  }

  function getUserDocumentLastClaimedDate(address _addr, uint _idx) public view returns (uint) {
    return map[_addr][_idx].lastClaimedDate;
  }

  function getUserDocumentWithdraw(address _addr, bytes32 _docId) public view returns (uint) {
    int idx = getIndex(_docId, _addr);
    if (idx < 0) {
      return 0;
    }
    return map[_addr][uint(idx)].withdraw;
  }

  function withdraw(address _author, uint _idx, uint _withdraw, uint _dateMillis) public
    onlyOwner()
  {
    map[_author][_idx].withdraw += _withdraw;
    map[_author][_idx].lastClaimedDate = _dateMillis;
    emit _Withdraw(_author, _idx, _withdraw, _dateMillis);
  }

  function determineReward(uint _pv, uint _tpv, uint _dateMillis) public view returns (uint) {
    if (_tpv == 0 || _pv == 0) {
      return uint(0);
    }

    uint drp = util.getDailyRewardPool(uint(70), _dateMillis);
    return uint(_pv * uint(drp / _tpv));
  }

  function getIndex(bytes32 _docId, address _author) private view returns (int) {
    Asset[] storage assetList = map[_author];
    if (assetList.length > 0) {
      for (uint i=0; i<assetList.length; i++) {
        if (assetList[i].docId == _docId) {
          return int(i);
        }
      }
    }
    return -1;
  }

}
