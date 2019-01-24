pragma solidity ^0.4.24;

import "./Utility.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DocumentRegistry is Ownable {

  event Initialize(uint256 createTime, address util);
  event RegisterDocument(bytes32 docId, uint256 dateMillis, address creator);

  Utility private _util;

  struct Document {
    address creator;
    uint createTime;
    mapping (uint256 => uint256) pv; // date => page views
  }

  // maps voteId to the vote data
  mapping (bytes32 => Document) internal _mapByDocId;
  bytes32[] internal _docIds;

  // public variables
  uint256 public _createTime;

  mapping (uint256 => uint256) private _tpvByDate;
  mapping (uint256 => uint256) private _tpvsByDate;

  function init(address util) public
    onlyOwner()
  {
    require(util != 0 && address(_util) == 0);
    _util = Utility(util);
    _createTime = _util.getTimeMillis();
    emit Initialize(_createTime, _util);
  }

  function count() public view returns (uint256) {
    return _docIds.length;
  }

  // adding a new vote
  function register(bytes32 docId) public
    onlyOwner()
  {
    require(_mapByDocId[docId].createTime == 0); // register once

    // adding to document registry
    _mapByDocId[docId] = Document(msg.sender, _util.getDateMillis());
    _docIds.push(docId);

    emit RegisterDocument(docId, _mapByDocId[docId].createTime, _mapByDocId[docId].creator);
  }

  function getDocument(bytes32 docId, uint dateMillis) public view returns (address, uint256, uint256) {
    return (_mapByDocId[docId].creator, _mapByDocId[docId].createTime, (_mapByDocId[docId].pv)[dateMillis]);
  }
}
