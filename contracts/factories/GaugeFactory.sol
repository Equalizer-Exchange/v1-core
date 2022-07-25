// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../Gauge.sol";
import "../interfaces/IPairFactory.sol";
import "../interfaces/IGaugeFactory.sol";

contract GaugeFactory is IGaugeFactory {
    address public lastGauge;

    function createGauge(
        address _pool, 
        address _internalBribe, 
        address _externalBribe, 
        address _ve, 
        bool isPair, 
        address[] memory _allowedRewards
    ) external returns (address) {
        lastGauge = address(
            new Gauge(_pool, _internalBribe, _externalBribe, _ve, msg.sender, isPair, _allowedRewards)
        );
        return lastGauge;
    }
}
