pragma solidity ^0.4.24;

import "./Utility.sol";
import "./DocumentRegistry.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract AuthorPool is Ownable {

  event _InitializeAuthorPool(uint timestamp);
  event _RegisterNewUserDocument(bytes32 indexed docId, uint timestamp, address indexed applicant);
  event _Withdraw(address indexed applicant, bytes32 indexed docId, uint withdraw, uint timestamp);
/*
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
*/
  // private variables
  Utility private _util;
  DocumentRegistry private _docReg;

  // public variables
  uint public createTime;

  function init(address docReg, address util) public
    onlyOwner()
  {
    require(util != 0 && address(_util) == 0);
    require(docReg != 0 && address(_docReg) == 0);

    _util = Utility(util);
    _docReg = DocumentRegistry(docReg);

    createTime = _util.getTimeMillis();
    emit _InitializeAuthorPool(createTime);
  }

  // -------------------------------
  // For iteration
  // -------------------------------

  // author list for iteration
  function getAuthors() public view returns (address[]) {
    return _docReg.getCreators();
  }

  // -------------------------------
  // User Document Functions
  // -------------------------------

  // register a new document
  function registerUserDocument(bytes32 docId, address author) public
    onlyOwner()
  {
    _docReg.registerUserDocument(author, docId);
  }

  function updateUserDocument(bytes32 docId, address author, uint timeMillis) public
    onlyOwner()
  {
    _docReg.update(author, docId, timeMillis, 0, 0);
  }

  function containsDocument(bytes32 _docId) public view returns (bool) {
    return _docReg.contains(_docId);
  }

  function containsUserDocument(address _addr, bytes32 _docId) public view returns (bool) {
    return _docReg.isOwner(_addr, _docId);
  }

  function getUserDocumentListedDate(bytes32 _docId) public view returns (uint) {
    // address, uint256, uint256, uint256, uint256, uint256
    (, uint256 t,,) = _docReg.getDocument(_docId);
    return t;
  }

  function getUserDocumentOwner(bytes32 _docId) public view returns (address) {
    (address a,,,) = _docReg.getDocument(_docId);
    return a;
  }

  function getUserDocumentLastClaimedDate(bytes32 _docId) public view returns (uint) {
    (,, uint256 t,) = _docReg.getDocument(_docId);
    return t;
  }

  function getUserDocumentWithdraw(bytes32 _docId) public view returns (uint) {
    (,,, uint256 w) = _docReg.getDocument(_docId);
    return w;
  }

  function withdraw(address _author, bytes32 _docId, uint _withdraw, uint _dateMillis) public
    onlyOwner()
  {
    (address o, uint256 t,, uint256 w) = _docReg.getDocument(_docId);
    _docReg.update(o, _docId, t, _dateMillis, w + _withdraw);
    emit _Withdraw(_author, _docId, _withdraw, _dateMillis);
  }

  function determineReward(uint _pv, uint _tpv, uint _dateMillis) public view returns (uint) {
    if (_tpv == 0 || _pv == 0) {
      return uint(0);
    }

    uint drp = _util.getDailyRewardPool(uint(70), _dateMillis);
    return uint(_pv * uint(drp / _tpv));
  }

}
