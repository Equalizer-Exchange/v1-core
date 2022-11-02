// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../Gauge.sol";
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
        Gauge gauge = new Gauge();
        gauge.initialize(
            _pool, 
            _internalBribe, 
            _externalBribe, 
            _ve, 
            msg.sender, 
            isPair, 
            _allowedRewards
        );
        lastGauge = address(gauge);
        return lastGauge;
    }
}
