pragma solidity ^0.4.24;

contract Utility {

  uint private ONE_DAY_MILLIS = 86400000;
  uint private DEPOSIT_DAYS = 3;

  function bytes32ToStr(bytes32 _bytes32) private pure returns (string) {
    bytes memory bytesArray = new bytes(32);
    for (uint256 i; i < 32; i++) {
      bytesArray[i] = _bytes32[i];
    }
    return string(bytesArray);
  }

  function getTimeMillis() public view returns (uint) {
    return block.timestamp * 1000;
  }

  function getDateMillis() public view returns (uint) {
    uint tDay = uint(block.timestamp / uint(ONE_DAY_MILLIS / 1000));
    uint tMillis = tDay * ONE_DAY_MILLIS;
    return tMillis;
  }

  function getOffsetYears(uint _from) public view returns (uint) {
    uint curTimeSec = block.timestamp;
    uint createTimeSec = uint(_from / 1000);
    uint offsetSec = curTimeSec - createTimeSec;
    uint offsetDays = uint(offsetSec / uint(ONE_DAY_MILLIS / 1000));
    return uint(offsetDays / 365);
  }

  function getOneDayMillis() public view returns (uint) {
    return ONE_DAY_MILLIS;
  }

  function getVoteDepositMillis() public view returns (uint) {
    return DEPOSIT_DAYS * ONE_DAY_MILLIS;
  }

  function getVoteDepositDays() public view returns (uint) {
    return DEPOSIT_DAYS;
  }

  function getDailyRewardPool(uint _percent, uint _createTime) public view returns (uint) {
    uint offsetYears = getOffsetYears(_createTime);
    // initial daily reward pool tokens : (60000000 / 365) * decimals(10 ** 18) / percent(100)
    uint initialTokens = 16438356164 * (10 ** 11);
    return uint((initialTokens * _percent) / (2 ** offsetYears));
  }
}
