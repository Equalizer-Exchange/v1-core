// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IRewardsDistributor {
    function checkpoint_token() external;
    function checkpoint_total_supply() external;
}
