pragma solidity 0.5.0;

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
    uint256 private _length;

    // accessibility
    address private _foundation;
    address private _rewardPool;
    address private _curator;

    // adding a new vote
    function create(uint256 i, address addr, bytes32 docId, uint256 deposit) external {
        require(msg.sender == _curator);
        add(i, addr, docId, deposit, uint(block.timestamp/86400) * 86400000);
    }

    function insert(uint256 i, address addr, bytes32 docId, uint256 deposit, uint256 dateMillis) external {
        require(msg.sender == _foundation);
        add(i, addr, docId, deposit, dateMillis);
    }

    function updateWithdraw(address a, bytes32 d, uint256 claimedDate, uint256 withdraw) external {
        require(msg.sender == _rewardPool);
        require(_mapUserDocAdded[a][d].added);
        _mapUserDocAdded[a][d].lastClaimedDate = claimedDate;
        _mapUserDocAdded[a][d].withdraw += withdraw;
        emit Withdraw(a, d, claimedDate, withdraw);
    }

    function updateClaimed(uint256 i, uint256 amount) external {
        require(amount != 0);
        require(msg.sender == _rewardPool);
        require(address(_mapById[i].addr) != address(0));
        require(uint256(_mapById[i].deposit) != 0);
        require(uint256(_mapById[i].claimed) == 0);

        _mapById[i].claimed = amount;

        emit ClaimVote(i, amount);
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

    function getVote(uint256 i) external view returns (address, bytes32, uint256, uint256, uint256) {
        return (_mapById[i].addr, _mapById[i].docId, _mapById[i].startDate, _mapById[i].deposit, _mapById[i].claimed);
    }

    function getActiveVotes(bytes32 docId, uint dMillis, uint vMillis) external view returns (uint256) {
        uint256 sum = 0;
        for (uint i=0; i < _mapByDoc[docId].length; i++) {
            if (isActive(_mapById[_mapByDoc[docId][i]], dMillis, vMillis)) {
                sum += _mapById[_mapByDoc[docId][i]].deposit;
            }
        }
        return sum;
    }

    function getUserActiveVotes(address a, bytes32 d, uint dMillis, uint vMillis) external view returns (uint256) {
        uint256 sum = 0;
        for (uint i=0; i < _mapByAddr[a].length; i++) {
            if (sameDoc(_mapById[_mapByAddr[a][i]], d)
            && isActive(_mapById[_mapByAddr[a][i]], dMillis, vMillis)) {
                sum += _mapById[_mapByAddr[a][i]].deposit;
            }
        }
        return sum;
    }

    function getUserClaimableVotes(address a, bytes32 d, uint dm, uint cm, uint vm) external view returns (uint256) {
        uint256 sum = 0;
        uint256 lm = _mapUserDocAdded[a][d].lastClaimedDate;
        for (uint i=0; i < _mapByAddr[a].length; i++) {
            if (sameDoc(_mapById[_mapByAddr[a][i]], d)
            && isActive(_mapById[_mapByAddr[a][i]], dm, vm)
            && isClaimable(_mapById[_mapByAddr[a][i]], lm, cm, vm)) {
                sum += _mapById[_mapByAddr[a][i]].deposit;
            }
        }
        return sum;
    }

    function getUserRefundableDeposit(address a, bytes32 d, uint dm, uint cm, uint vm) external view returns (uint256) {
        uint256 sum = 0;
        uint256 lm = _mapUserDocAdded[a][d].lastClaimedDate;
        for (uint i=0; i < _mapByAddr[a].length; i++) {
            if (sameDoc(_mapById[_mapByAddr[a][i]], d)
            && isRefundable(_mapById[_mapByAddr[a][i]], dm, vm)
            && isClaimable(_mapById[_mapByAddr[a][i]], lm, cm, vm)) {
                sum += _mapById[_mapByAddr[a][i]].deposit;
            }
        }
        return sum;
    }

    function getUserDocuments(address a) external view returns (bytes32[] memory) {
        return _mapUserDoc[a];
    }

    function count() external view returns (uint256) {
        return uint256(_length);
    }

    function next() external view returns (uint256) {
        return uint256(_length + 1);
    }

    // adding a new vote
    function add(uint256 i, address a, bytes32 d, uint256 deposit, uint256 dm) private {
        require(i == _length + 1);

        Vote memory vote = Vote(a, d, dm, deposit, 0);
        _mapById[i] = vote;
        _mapByAddr[a].push(i);
        _mapByDoc[d].push(i);
        _length++;

        if (_mapUserDocAdded[a][d].added == false) {
            _mapUserDoc[a].push(d);
            _mapUserDocAdded[a][d].added = true;
        }

        emit CreateVote(i, a, d, dm, deposit);
    }

    function sameDoc(Vote storage vote, bytes32 d) private view returns (bool) {
        return (d == vote.docId);
    }

    function isActive(Vote storage vote, uint dm, uint vm) private view returns (bool) {
        return (vote.startDate <= dm) && (dm < vote.startDate + vm);
    }

    function isClaimable(Vote storage vote, uint lm, uint cm, uint vm) private view returns (bool) {
        lm = lm == 0 ? vm : lm;
        return (lm <= vote.startDate + vm) && (vote.startDate + vm < cm);
    }

    function isRefundable(Vote storage vote, uint dm, uint vm) private view returns (bool) {
        return (dm == vote.startDate + vm);
    }
}
