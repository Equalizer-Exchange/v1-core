// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../interfaces/IBribeFactory.sol";
import "../InternalBribe.sol";
import "../ExternalBribe.sol";

contract BribeFactory is IBribeFactory {
    address public lastInternalBribe;
    address public lastExternalBribe;

    function createInternalBribe(address[] memory _allowedRewards) external returns (address) {
        lastInternalBribe = address(new InternalBribe(msg.sender, _allowedRewards));
        return lastInternalBribe;
    }

    function createExternalBribe(address[] memory _allowedRewards) external returns (address) {
        lastExternalBribe = address(new ExternalBribe(msg.sender, _allowedRewards));
        return lastExternalBribe;
    }
}
