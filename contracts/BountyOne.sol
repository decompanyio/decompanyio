pragma solidity 0.5.0;

import "./Deck.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract BountyOne is Ownable {

    event InitializeBountyOne(address token, uint provision);
    event ClaimBountyOne(address addr, uint provision);

    Deck private token;
    uint256 public provision;

    mapping (address => uint) private map;
    address[] private claimed;

    function init(address _token, uint256 _provision) public
        onlyOwner()
    {
        require(_token != address(0) && address(token) == address(0));
        require(_provision != 0 && provision == 0);

        token = Deck(_token);
        provision = _provision;

        emit InitializeBountyOne(_token, _provision);
    }

    function available() public view returns (uint) {
        return (map[msg.sender] != 0 || token.balanceOf(address(this)) < provision) ? 0 : provision;
    }

    function count() public view returns (uint) {
        return uint(claimed.length);
    }

    function getClaimedUsers() public view returns (address[] memory) {
        return claimed;
    }

    function claim() public {
        require(address(token) != address(0));
        require(address(msg.sender) != address(0));

        if (map[msg.sender] == 0) {
            map[msg.sender] = provision;
            claimed.push(msg.sender);
            token.transfer(msg.sender, map[msg.sender]);
            emit ClaimBountyOne(msg.sender, map[msg.sender]);
        }
    }
}
