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
        (uint256 amount, uint256 refund) = source.determineAt(msg.sender, docId, getDateMillis());
        if ((amount + refund) > 0 && _token.balanceOf(address(this)) > (amount + refund)) {
            _token.transfer(msg.sender, (amount + refund));
            if (refund == 0) {
                _registry.updateWithdraw(docId, getDateMillis(), amount);
            } else {
                _ballot.updateWithdraw(msg.sender, docId, getDateMillis(), amount);
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
        selfdestruct(msg.sender);
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

    function getDailyRewardPool(uint256 percent, uint256 dt) external view returns (uint256) {
        return uint256(((((_token.totalSupply() * 12 / 100) / 2) / (2 ** getOffsetYears(dt))) / 365) * percent / 100);
    }

    function getVestingMillis() external pure returns (uint256) {
        // vesting days for voting in milliseconds
        return uint256(7 * getOneDayMillis());
    }

    function getDateMillis() public view returns (uint256) {
        return _registry.getDateMillis();
    }

    function deposit(address from, uint256 amount) public {
        _token.transferFrom(from, address(this), amount);
    }

    function getOneDayMillis() public pure returns (uint256) {
        return uint256(86400000);
    }

    function getOffsetYears(uint256 dt) private view returns (uint256) {
        return uint256(uint256((getDateMillis() - dt) / getOneDayMillis()) / 365);
    }
}
