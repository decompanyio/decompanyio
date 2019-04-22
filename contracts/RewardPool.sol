pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Deck.sol";
import "./Ballot.sol";
import "./DocumentRegistry.sol";
import "./IAsset.sol";


contract RewardPool is Ownable {

    address private _creator;
    address private _curator;
    address private _foundation;

    Deck public _token;
    Ballot public _ballot;
    DocumentRegistry public _registry;

    function init(address token, address registry, address ballot) external onlyOwner() {
        require(address(token) != address(0));
        require(address(_token) == address(0));
        require(address(ballot) != address(0));
        require(address(_ballot) == address(0));
        require(address(registry) != address(0));
        require(address(_registry) == address(0));
        _token = Deck(token);
        _ballot = Ballot(ballot);
        _registry = DocumentRegistry(registry);
    }

    function claim(bytes32 docId, IAsset source) external {
        require(address(_registry) != address(0));
        require(address(source) == _creator || address(source) == _curator);
        uint256 dateMillis = uint(block.timestamp/86400) * 86400000;
        (uint256 amount, uint256 refund) = source.determineAt(msg.sender, docId, dateMillis);
        if ((amount + refund) > 0 && _token.balanceOf(address(this)) > (amount + refund)) {
            _token.transfer(msg.sender, (amount + refund));
            if (refund == 0) {
                _registry.updateWithdraw(docId, dateMillis, amount);
            } else {
                _ballot.updateWithdraw(msg.sender, docId, dateMillis, amount);
            }
        }
    }

    function pay(bytes32 docId, address owner, uint256 amount, uint256 refund, uint256 dateMillis) external {
        require(msg.sender == _foundation);
        require(address(_registry) != address(0));
        require(amount + refund > 0);
        require(_token.balanceOf(address(this)) > amount + refund);
        _token.transfer(owner, amount + refund);
        if (refund == 0) {
            _registry.updateWithdraw(docId, dateMillis, amount);
        } else {
            _ballot.updateWithdraw(owner, docId, dateMillis, amount);
        }
    }

    function revoke() external onlyOwner() {
        _token.transfer(msg.sender, _token.balanceOf(address(this)));
    }

    function setFoundation(address addr) external onlyOwner() {
        if (_foundation != addr) _foundation = addr;
    }

    function setCreator(address addr) external onlyOwner() {
        if (_creator != addr) _creator = addr;
    }

    function setCurator(address addr) external onlyOwner() {
        if (_curator != addr) _curator = addr;
    }

    function getDailyRewardPool(uint _percent, uint _createTime) external view returns (uint) {
        uint offsetYears = getOffsetYears(_createTime);
        // initial daily reward pool tokens : (60000000 / 365) * decimals(10 ** 18) / percent(100)
        uint initialTokens = 16438356164 * (10 ** 11);
        return uint((initialTokens * _percent) / (2 ** offsetYears));
    }

    function getVestingMillis() external pure returns (uint) {
        return 3 * 86400000;
    }

    function getDateMillis() public view returns (uint) {
        uint tDay = uint(block.timestamp / uint(86400000 / 1000));
        uint tMillis = tDay * 86400000;
        return tMillis;
    }

    function deposit(address from, uint256 amount) public {
        _token.transferFrom(from, address(this), amount);
    }

    function getOneDayMillis() public pure returns (uint) {
        return 86400000;
    }

    function getOffsetYears(uint _from) private view returns (uint) {
        uint curTimeSec = block.timestamp;
        uint createTimeSec = uint(_from / 1000);
        uint offsetSec = curTimeSec - createTimeSec;
        uint offsetDays = uint(offsetSec / uint(86400));
        return uint(offsetDays / 365);
    }
}
