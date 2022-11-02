// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../interfaces/IBribeFactory.sol";
import "../InternalBribe.sol";
import "../ExternalBribe.sol";

contract BribeFactory is IBribeFactory {
    address public lastInternalBribe;
    address public lastExternalBribe;

    function createInternalBribe(address[] memory _allowedRewards) external returns (address) {
        InternalBribe internalBribe = new InternalBribe();
        internalBribe.initialize(msg.sender, _allowedRewards);
        lastInternalBribe = address(internalBribe);
        return lastInternalBribe;
    }

    function createExternalBribe(address[] memory _allowedRewards) external returns (address) {
        ExternalBribe externalBribe = new ExternalBribe();
        externalBribe.initialize(msg.sender, _allowedRewards);
        lastExternalBribe = address(externalBribe);
        return lastExternalBribe;
    }
}
