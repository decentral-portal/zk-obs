// SPDX-License-Identifier: MIT
// solhint-disable-next-line
pragma solidity ^0.8.17;

interface PoseidonUnit2 {
    function poseidon(uint256[2] memory input) external pure returns (uint256);
}
