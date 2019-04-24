pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract DocumentRegistry is Ownable {

    event RegisterDocument(bytes32 docId, uint256 createTime, address owner);
    event UpdateDocument(bytes32 docId, uint256 createTime, uint256 lastClaimedDate, uint256 withdraw);
    event Withdraw(bytes32 docId, uint256 claimedDate, uint256 amount);
    event PutPageView(bytes32 docId, uint256 dateMillis, uint256 pv);
    event DelPageView(bytes32 docId, uint256 dateMillis);

    struct PageView {
        uint256 pv;
        uint256 idx;
    }

    struct Document {
        // registry
        address owner;
        uint createTime;
        uint lastClaimedDate;
        uint withdraw;
        // page view
        uint256[] pvIdx;
        mapping (uint256 => PageView) pvMap; // date => { page views, index }
    }

    // maps doc id to a document
    mapping (bytes32 => Document) internal _docByDocId;

    // doc id list for iteration
    bytes32[] internal _docIds;

    // maps an address to the user's documents
    mapping (address => bytes32[]) internal _docIdsByAddr;

    // address list for iteration
    address[] private _ownerAddrs;

    // daily total page views
    mapping (uint256 => uint256) private _tpvByDate;
    mapping (uint256 => uint256) private _tpvsByDate;

    // accessibility
    address private _foundation;
    address private _rewardPool;
    address private _creator;

    // current datetime in milliseconds
    uint256 public _dateMillis;

    function setDateMillis(uint256 dateMillis) external onlyOwner() {
        _dateMillis = dateMillis;
    }

    function setRewardPool(address addr) external onlyOwner() {
        if (addr != _rewardPool) {
            _rewardPool = addr;
        }
    }

    function setCreator(address addr) external onlyOwner() {
        if (addr != _creator) {
            _creator = addr;
        }
    }

    function setFoundation(address addr) external onlyOwner() {
        if (addr != _foundation) {
            _foundation = addr;
        }
    }

    function register(address owner, bytes32 docId) external {
        require(msg.sender == _creator);
        require(_docByDocId[docId].createTime == 0); // register once

        // adding to document registry
        _docByDocId[docId] = Document({
            owner: owner,
            createTime: getDateMillis(), // current date in milliseconds
            lastClaimedDate: 0,
            withdraw: 0,
            pvIdx: new uint256[](0)
        });

        _docIds.push(docId);

        // add a new owner
        if (_docIdsByAddr[owner].length == 0) {
            _ownerAddrs.push(owner);
        }

        // adding to doc id list by owner
        _docIdsByAddr[owner].push(docId);

        emit RegisterDocument(docId, _docByDocId[docId].createTime, _docByDocId[docId].owner);
    }

    function updateWithdraw(bytes32 docId, uint256 claimedDate, uint256 withdraw) external {
        require(msg.sender == _rewardPool);
        require(_docByDocId[docId].createTime != 0);
        _docByDocId[docId].lastClaimedDate = claimedDate;
        _docByDocId[docId].withdraw += withdraw;
        emit Withdraw(docId, claimedDate, withdraw);
    }

    function getDocuments(address owner) external view returns (bytes32[] memory) {
        return _docIdsByAddr[owner];
    }

    function isOwner(address owner, bytes32 docId) external view returns (bool) {
        return address(_docByDocId[docId].owner) == owner ? true : false;
    }

    function update(address owner, bytes32 docId, uint256 dt, uint256 lastClaimedDate, uint256 withdraw) public {
        require(msg.sender == _creator);
        require(dt != 0);
        require(_docByDocId[docId].createTime != 0);

        // adding to document registry
        _docByDocId[docId].owner = owner;
        _docByDocId[docId].createTime = dt;
        _docByDocId[docId].lastClaimedDate = lastClaimedDate;
        _docByDocId[docId].withdraw = withdraw;

        emit UpdateDocument(docId, dt, lastClaimedDate, withdraw);
    }

    function count() public view returns (uint256) {
        return _docIds.length;
    }

    function getDateMillis() public view returns (uint256) {
        return _dateMillis;
    }

    function getDocument(bytes32 docId) public view returns (address, uint256, uint256, uint256) {
        require(_docByDocId[docId].createTime > 0);
        return (
            _docByDocId[docId].owner,
            _docByDocId[docId].createTime,
            _docByDocId[docId].lastClaimedDate,
            _docByDocId[docId].withdraw
        );
    }

    function contains(bytes32 docId) public view returns (bool) {
        return _docByDocId[docId].createTime > 0;
    }

    // creator list for iteration
    function getCreators() public view returns (address[] memory) {
        return _ownerAddrs;
    }

    function getTotalPageView(uint dateMillis) public view returns (uint) {
        require(dateMillis != 0);
        return _tpvByDate[dateMillis];
    }

    function getTotalPageViewSquare(uint dateMillis) public view returns (uint) {
        require(dateMillis != 0);
        return _tpvsByDate[dateMillis];
    }

    function getPageView(bytes32 docId, uint dateMillis) public view returns (uint256) {
        require(_docByDocId[docId].createTime > 0);
        return (_docByDocId[docId].pvMap)[dateMillis].pv;
    }

    function setPageView(bytes32 docId, uint dateMillis, uint pv) public {
        require(msg.sender == _foundation);
        require(pv > 0);
        require(_docByDocId[docId].createTime != 0);
        require((_docByDocId[docId].pvMap)[dateMillis].pv == 0);

        (_docByDocId[docId].pvMap)[dateMillis].pv = pv;
        (_docByDocId[docId].pvMap)[dateMillis].idx = _docByDocId[docId].pvIdx.push(dateMillis) - 1;

        _tpvByDate[dateMillis] += pv;
        _tpvsByDate[dateMillis] += (pv ** 2);

        if (_dateMillis < dateMillis) {
            _dateMillis = dateMillis;
        }

        emit PutPageView(docId, dateMillis, pv);
    }

    function updatePageView(bytes32 docId, uint dateMillis, uint pv) public {
        require(msg.sender == _foundation);
        deletePageView(docId, dateMillis);
        setPageView(docId, dateMillis, pv);
    }

    function deletePageView(bytes32 docId, uint dateMillis) public {
        require(msg.sender == _foundation);
        require(_docByDocId[docId].createTime != 0);
        // delete only when pv > 0
        if ((_docByDocId[docId].pvMap)[dateMillis].pv > 0) {
          // subtract pv to delete from total page views
            _tpvByDate[dateMillis] -= (_docByDocId[docId].pvMap)[dateMillis].pv;
            _tpvsByDate[dateMillis] -= ((_docByDocId[docId].pvMap)[dateMillis].pv ** 2);
            // delete an item from index array
            uint toDelete = (_docByDocId[docId].pvMap)[dateMillis].idx;
            uint lastIndex = _docByDocId[docId].pvIdx[_docByDocId[docId].pvIdx.length-1];
            _docByDocId[docId].pvIdx[toDelete] = lastIndex;
            (_docByDocId[docId].pvMap)[lastIndex].idx = toDelete;
            _docByDocId[docId].pvIdx.length--;
            // set page view as 0
            (_docByDocId[docId].pvMap)[dateMillis].idx = 0;
            (_docByDocId[docId].pvMap)[dateMillis].pv = 0;
            // emit a delete event
            emit DelPageView(docId, dateMillis);
        }
    }

    function updatePageViews(uint dateMillis, bytes32[] memory docIds, uint[] memory pvs) public {
        require(msg.sender == _foundation);
        require(dateMillis > 0);
        require(docIds.length > 0);
        require(docIds.length == pvs.length);

        for (uint i=0; i < docIds.length; i++) {
            deletePageView(docIds[i], dateMillis);
            setPageView(docIds[i], dateMillis, pvs[i]);
        }
    }

}
