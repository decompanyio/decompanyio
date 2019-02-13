pragma solidity ^0.4.24;

import "./IReward.sol";
import "./IRegistry.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract RewardPool is Ownable {

  address private _creator;
  address private _curator;

  IRegistry private _registry;

  function init(IRegistry registry, address creator, address curator) public
    onlyOwner()
  {
    require(address(registry) != address(0));
    require(creator != address(0));
    require(curator != address(0));

    require(address(_registry) == address(0));
    require(_creator == address(0));
    require(_curator == address(0));

    _registry = registry;
    _creator = creator;
    _curator = curator;
  }

  function claim(IERC20 token, bytes32 docId, IReward source) public {
    require(source == _creator || source == _curator);
    token.transfer(msg.sender, source.determine(_registry, msg.sender, docId));
  }

  function revoke(IERC20 token) public
    onlyOwner()
  {
    token.transfer(msg.sender, token.balanceOf(address(this)));

    _creator = address(0);
    _curator = address(0);
  }
}
