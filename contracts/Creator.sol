pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./RewardPool.sol";
import "./IAsset.sol";


contract Creator is IAsset, Ownable {

    RewardPool public _rewardPool;

    function init(address rewardPool) external
        onlyOwner()
    {
        require(address(rewardPool) != address(0));
        require(address(_rewardPool) == address(0));
        _rewardPool = RewardPool(rewardPool);
    }

    function getDocuments(address owner) external view returns (bytes32[] memory) {
        return _rewardPool._registry().getDocuments(owner);
    }

    function determine(bytes32 docId) external view returns (uint256, uint256) {
        require(docId != 0);
        require(address(_rewardPool) != address(0));
        require(_rewardPool._registry().contains(docId));
        (address owner, , ,) = _rewardPool._registry().getDocument(docId);
        require(msg.sender == owner);
        return totalReward(docId, _rewardPool.getDateMillis());
    }

    function recentEarnings(bytes32 docId, uint256 day) external view returns (uint256) {
        uint256 sum = 0;
        uint256 next = 0;
        uint256 todayMillis = _rewardPool.getDateMillis();
        uint256 listed;
        (, listed, ,) = _rewardPool._registry().getDocument(docId);
        next = (todayMillis - (day * 86400000)) < listed ? listed : (todayMillis - (day * 86400000));
        while (next < todayMillis) {
            sum += dailyReward(docId, next);
            next += 86400000;
        }
        return sum;
    }

    function determineAt(address addr, bytes32 docId, uint256 dateMillis) external view returns (uint256, uint256) {
        require(msg.sender == address(_rewardPool));
        require(address(_rewardPool) != address(0));
        require(_rewardPool._registry().isOwner(addr, docId));
        return totalReward(docId, dateMillis);
    }

    // register a new document
    function register(bytes32 docId) public {
        _rewardPool._registry().register(msg.sender, docId);
    }

    function update(address o, bytes32 d, uint256 ct, uint256 lt, uint256 withdraw) public
        onlyOwner()
    {
        _rewardPool._registry().update(o, d, ct, lt, withdraw);
    }

    function calculate(uint pv, uint tpv, uint drp) public pure returns (uint) {
        if (tpv == 0 || pv == 0 || drp == 0) return uint(0);
        return uint(pv * uint(drp / tpv));
    }

    function totalReward(bytes32 docId, uint256 dateMillis) private view returns (uint256, uint256) {
        uint256 sum = 0;
        uint256 next = 0;
        uint256 listed;
        uint256 last;
        (, listed, last,) = _rewardPool._registry().getDocument(docId);
        while (last < dateMillis) {
            if (last == 0) {
                last = listed;
            }
            sum += dailyReward(docId, last);
            next = last + 86400000;
            assert(last < next);
            last = next;
        }
        return (sum, uint256(0));
    }

    function dailyReward(bytes32 docId, uint256 dateMillis) private view returns (uint) {
        uint pv = _rewardPool._registry().getPageView(docId, dateMillis);
        uint tpv = _rewardPool._registry().getTotalPageView(dateMillis);
        uint drp = _rewardPool.getDailyRewardPool(uint(70), dateMillis);
        return calculate(pv, tpv, drp);
    }

}