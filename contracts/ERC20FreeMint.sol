// SPDX-License-Identifier: MIT
// solhint-disable-next-line
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20FreeMint is ERC20 {
    uint256 internal constant MAX_MINT_AMOUNT = 10**25;
    uint8 private immutable _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 _dec
    ) ERC20(name, symbol) {
        _decimals = _dec;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(uint256 amount) public {
        require(amount < MAX_MINT_AMOUNT, "Mint amount needs to be less than max mint amount");
        _mint(msg.sender, amount);
    }
}