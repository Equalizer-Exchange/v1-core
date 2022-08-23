// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IExternalBribe {
    struct Checkpoint {
        uint timestamp;
        uint balanceOf;
    }

    struct SupplyCheckpoint {
        uint timestamp;
        uint supply;
    }

    function rewardsListLength() external view returns (uint);
    function rewardAddr(uint i) external view returns (address);
    function numCheckpoints(uint tokenId) external view returns (uint);
    function getPriorBalanceIndex(uint tokenId, uint timestamp) external view returns (uint);
    function getPriorSupplyIndex(uint timestamp) external view returns (uint);
    function getCheckpoints(uint tokenId, uint i) external view returns (uint, uint);
    function getSupplyCheckpoints(uint i) external view returns (uint, uint);
}
