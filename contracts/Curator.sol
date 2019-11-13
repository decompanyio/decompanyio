pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./RewardPool.sol";
import "./IAsset.sol";


contract Curator is IAsset, Ownable {

    RewardPool public _rewardPool;

    function init(address rewardPool) external
        onlyOwner()
    {
        require(address(rewardPool) != address(0));
        require(address(_rewardPool) == address(0));
        _rewardPool = RewardPool(rewardPool);
    }

    function addVote(bytes32 docId, uint256 deposit) external {
        require(deposit > 0);
        require(_rewardPool._token().balanceOf(msg.sender) > deposit);
        _rewardPool.deposit(msg.sender, deposit);
        _rewardPool._ballot().create(_rewardPool._ballot().next(), msg.sender, docId, deposit);
    }

    function getVote(uint256 i) external view returns (address, bytes32, uint256, uint256) {
        return _rewardPool._ballot().getVote(i);
    }

    function getDocuments(address owner) external view returns (bytes32[] memory) {
        return _rewardPool._ballot().getUserDocuments(owner);
    }

    function count() external view returns (uint256) {
        return _rewardPool._ballot().count();
    }

    function getActiveVotes(bytes32 d) external view returns (uint256) {
        return _rewardPool._ballot().getActiveVotes(d, getMillis(), _rewardPool.getVestingMillis());
    }

    function getUserActiveVotes(address a, bytes32 d) external view returns (uint256) {
        return _rewardPool._ballot().getUserActiveVotes(a, d, getMillis(), _rewardPool.getVestingMillis());
    }

    function getUserDocuments(address a) external view returns (bytes32[] memory) {
        return _rewardPool._ballot().getUserDocuments(a);
    }

    function determine(bytes32 d) external view returns (uint256, uint256) {
        require(d != 0);
        require(address(_rewardPool) != address(0));
        require(_rewardPool._registry().contains(d));
        return totalReward(msg.sender, d, getMillis());
    }

    function determineAt(address a, bytes32 d, uint256 dm) external view returns (uint256, uint256) {
        require(msg.sender == address(_rewardPool));
        require(address(_rewardPool) != address(0));
        return totalReward(a, d, dm);
    }

    function recentEarnings(address a, bytes32 d, uint256 day) external view returns (uint256) {
        uint256 sum = 0;
        uint256 next = 0;
        uint256 listed;
        (, listed, , ) = _rewardPool._registry().getDocument(d);
        next = (getMillis() - (day * 86400000)) < listed ? listed : (getMillis() - (day * 86400000));
        while (next < getMillis()) {
            uint deposit = _rewardPool._ballot().getUserActiveVotes(a, d, next, _rewardPool.getVestingMillis());
            sum += dailyReward(d, next, deposit);
            next += 86400000;
        }
        return sum;
    }

    function calculate(uint pool, uint v, uint tv, uint pv, uint tpvs) public pure returns (uint) {
        if (tpvs == 0 || pv == 0 || tv == 0) {
            return uint(0);
        }
        assert(tv >= v);
        assert(tpvs >= (pv ** 2));
        uint reward = uint(uint((pool * (pv ** 2)) / tpvs) * v / tv);
        assert(pool >= reward);
        return reward;
    }

    function totalReward(address a, bytes32 d, uint256 cm) private view returns (uint256, uint256) {
        uint256 sum = 0;
        uint256 refund = 0;
        uint256 next = 0;
        uint256 listed = 0;
        uint256 last = 0;
        (, listed, last,) = _rewardPool._registry().getDocument(d);
        while (last <= cm) {
            if (last == 0) {
                last = listed;
            }
            uint deposit = _rewardPool._ballot().getUserClaimableVotes(a, d, last, cm, _rewardPool.getVestingMillis());
            sum += dailyReward(d, last, deposit);
            refund += dailyRefund(a, d, last, cm);
            next = last + 86400000;
            assert(last < next);
            last = next;
        }
        return (sum, refund);
    }

    function dailyReward(bytes32 docId, uint dateMillis, uint deposit) private view returns (uint) {
        uint pool = _rewardPool.getDailyRewardPool(uint(30), dateMillis);
        uint tvd = _rewardPool._ballot().getActiveVotes(docId, dateMillis, _rewardPool.getVestingMillis());
        uint pv = _rewardPool._registry().getPageView(docId, dateMillis);
        uint tpvs = _rewardPool._registry().getTotalPageViewSquare(dateMillis);
        return calculate(pool, deposit, tvd, pv, tpvs);
    }

    function dailyRefund(address a, bytes32 d, uint dm, uint cm) private view returns (uint) {
        return _rewardPool._ballot().getUserRefundableDeposit(a, d, dm, cm, _rewardPool.getVestingMillis());
    }

    function getMillis() private view returns (uint) {
        return _rewardPool.getDateMillis();
    }

}
