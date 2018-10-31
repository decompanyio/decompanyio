pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Deck is Ownable, StandardToken {

  string public name;
  string public symbol;
  uint8 public decimals;
  uint256 public totalSupply;

  bool public releasedForTransfer;

  constructor() public {
    name = "Decompany DECK Token";
    symbol = "DECK";
    decimals = 18;
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
      require(releasedForTransfer);
      return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
      require(releasedForTransfer);
      return super.transferFrom(_from, _to, _value);
  }

  function release() public
      onlyOwner()
  {
      releasedForTransfer = true;
  }

  function issue(address _recepient, uint256 _amount) public
      onlyOwner()
  {
      require (!releasedForTransfer);
      balances[_recepient] += _amount;
      totalSupply += _amount;
  }

}
