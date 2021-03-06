pragma solidity ^0.6.12;
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

contract SampleToken is ERC20UpgradeSafe, OwnableUpgradeSafe {
    constructor() public {
        __ERC20_init("SampleToken", "ST");
        __Ownable_init();
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}
