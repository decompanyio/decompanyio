pragma solidity ^0.4.24;

import "./IReward.sol";
import "./IRegistry.sol";

contract Creator is IReward {

  function determine(IRegistry registry, address addr, bytes32 docId) public view returns (uint256) {

    require(addr != address(0));
    require(docId != 0);
    require(registry.contains(docId));

    uint sumReward = 0;
    (,,, uint256 lastClaimed,,) = registry.getDocument(docId, 0);
    while (lastClaimed < uint(block.timestamp/86400) * 86400000) {
      if (lastClaimed == 0) {
        (, lastClaimed,,,,) = registry.getDocument(docId, 0);
      }
      (,,,,,uint256 pv) = registry.getDocument(docId, lastClaimed);
      sumReward += determineReward(pv, registry.getTotalPageView(lastClaimed), lastClaimed);
      uint nextDate = lastClaimed + 86400000;
      assert(lastClaimed < nextDate);
      lastClaimed = nextDate;
    }
    return sumReward;
  }

  function determineReward(uint _pv, uint _tpv, uint _dateMillis) private view returns (uint) {
    if (_tpv == 0 || _pv == 0) {
      return uint(0);
    }

    uint drp = getDailyRewardPool(uint(70), _dateMillis);
    return uint(_pv * uint(drp / _tpv));
  }

  function getDailyRewardPool(uint _percent, uint _createTime) private view returns (uint) {
    uint offsetYears = getOffsetYears(_createTime);
    // initial daily reward pool tokens : (60000000 / 365) * decimals(10 ** 18) / percent(100)
    uint initialTokens = 16438356164 * (10 ** 11);
    return uint((initialTokens * _percent) / (2 ** offsetYears));
  }

  function getOffsetYears(uint _from) private view returns (uint) {
    uint curTimeSec = block.timestamp;
    uint createTimeSec = uint(_from / 1000);
    uint offsetSec = curTimeSec - createTimeSec;
    uint offsetDays = uint(offsetSec / uint(86400));
    return uint(offsetDays / 365);
  }
}
