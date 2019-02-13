pragma solidity ^0.4.24;

import "./Deck.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract BountyOne is Ownable {

  event _InitializeBountyOne(address token, uint provision);
  event _ClaimBountyOne(address addr, uint provision);

  Deck private token;
  uint256 public provision;

  mapping (address => uint) private map;
  address[] public claimed;

  function init(address _token, uint256 _provision) public
    onlyOwner()
  {
    require(_token != 0 && address(token) == 0);
    require(_provision != 0 && provision == 0);

    token = Deck(_token);
    provision = _provision;

    emit _InitializeBountyOne(_token, _provision);
  }

  function available() public view returns (uint) {
    return (map[msg.sender] != 0 || token.balanceOf(address(this)) < provision) ? 0 : provision;
  }

  function count() public view returns (uint) {
    return uint(claimed.length);
  }

  function getClaimedUsers() public view returns (address[]) {
    return claimed;
  }

  function claim() public {
    //require(address(token) != 0);
    //require(address(msg.sender) != 0);
    //require(map[msg.sender] == 0);

    if (map[msg.sender] == 0) {
      token.transfer(msg.sender, provision);
      map[msg.sender] = provision;
      claimed.push(msg.sender);
      emit _ClaimBountyOne(msg.sender, provision);
      return;
    }
    emit _ClaimBountyOne(msg.sender, 0);
  }
}
