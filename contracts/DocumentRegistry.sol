pragma solidity ^0.4.24;

import "./Utility.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DocumentRegistry is Ownable {

  event InitializeDocumentRegistry(uint256 createTime, address util);
  event RegisterDocument(bytes32 docId, uint256 dateMillis, address creator);
  event UpdateDocument(bytes32 docId, uint256 createTime, uint256 unlistedDate, uint256 lastClaimedDate, uint256 withdraw);

  Utility private _util;

  struct Document {
    address owner;
    uint createTime;
    uint unlistedDate;
    uint lastClaimedDate;
    uint withdraw;
    mapping (uint256 => uint256) pv; // date => page views
  }

  // maps doc id to a document
  mapping (bytes32 => Document) internal _docByDocId;

  // doc id list for iteration
  bytes32[] internal _docIds;

  // maps an address to the user's documents
  mapping (address => bytes32[]) internal _docIdsByAddr;

  // address list for iteration
  address[] private _ownerAddrs;

  // public variables
  uint256 public _createTime;

  // daily total page views
  mapping (uint256 => uint256) private _tpvByDate;
  mapping (uint256 => uint256) private _tpvsByDate;

  function init(address util) public
    onlyOwner()
  {
    require(util != 0 && address(_util) == 0);
    _util = Utility(util);
    _createTime = _util.getTimeMillis();
    emit InitializeDocumentRegistry(_createTime, _util);
  }

  function count() public view returns (uint256) {
    return _docIds.length;
  }

  // adding a new vote
  function register(bytes32 docId) public
  {
    registerDocument(msg.sender, docId);
  }

  // adding a new vote
  function registerUserDocument(address owner, bytes32 docId) public
    onlyOwner()
  {
    registerDocument(owner, docId);
  }

  // adding a new vote
  function registerDocument(address owner, bytes32 docId) private
  {
    require(_docByDocId[docId].createTime == 0); // register once

    // adding to document registry
    _docByDocId[docId] = Document(owner, _util.getDateMillis(), 0, 0, 0);
    _docIds.push(docId);

    // add a new owner
    if (_docIdsByAddr[owner].length == 0){
      _ownerAddrs.push(owner);
    }

    // adding to doc id list by owner
    _docIdsByAddr[owner].push(docId);

    emit RegisterDocument(docId, _docByDocId[docId].createTime, _docByDocId[docId].owner);
  }

  function update(address owner, bytes32 docId, uint256 createTime, uint256 unlistedDate, uint256 lastClaimedDate, uint256 withdraw) public
    onlyOwner()
  {
    require(_docByDocId[docId].createTime != 0);
    require(createTime != 0);

    // adding to document registry
    _docByDocId[docId].owner = owner;
    _docByDocId[docId].createTime = createTime;
    _docByDocId[docId].unlistedDate = unlistedDate;
    _docByDocId[docId].lastClaimedDate = lastClaimedDate;
    _docByDocId[docId].withdraw = withdraw;

    emit UpdateDocument(docId, createTime, unlistedDate, lastClaimedDate, withdraw);
  }

  function getDocument(bytes32 docId, uint dateMillis) public view returns (address, uint256, uint256, uint256, uint256, uint256) {
    require(_docByDocId[docId].createTime > 0);
    return (
      _docByDocId[docId].owner,
      _docByDocId[docId].createTime,
      _docByDocId[docId].unlistedDate,
      _docByDocId[docId].lastClaimedDate,
      _docByDocId[docId].withdraw,
      (_docByDocId[docId].pv)[dateMillis]
    );
  }

  function contains(bytes32 docId) public view returns (bool) {
    return _docByDocId[docId].createTime >= 0;
  }

  function isOwner(address owner, bytes32 docId) public view returns (bool) {
    if (_docIdsByAddr[owner].length == 0) {
      return false;
    }
    for (uint i=0; i<_docIdsByAddr[owner].length; i++) {
      if (_docIdsByAddr[owner][i] == docId) {
        return true;
      }
    }
    return false;
  }

  // creator list for iteration
  function getCreators() public view returns (address[]) {
    return _ownerAddrs;
  }


}
