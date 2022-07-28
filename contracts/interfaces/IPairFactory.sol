// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IPairFactory {
    function isPaused() external view returns (bool);
    function allPairsLength() external view returns (uint);
    function isPair(address pair) external view returns (bool);
    function getFee(bool _stable) external view returns(uint256);
    function pairCodeHash() external pure returns (bytes32);
    function getPair(address tokenA, address token, bool stable) external view returns (address);
    function getInitializable() external view returns (address, address, bool);
    function createPair(address tokenA, address tokenB, bool stable) external returns (address pair);
}
