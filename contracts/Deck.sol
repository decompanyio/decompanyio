pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract Deck is ERC20Detailed, ERC20Mintable, ERC20Burnable {

  constructor(string _name, string _symbol, uint8 _decimals)
  ERC20Detailed(_name, _symbol, _decimals)
  public {
  }

}
