// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IERC20.sol";

/**
* @title Pair Fees
* @notice used as a 1:1 pair relationship to split out fees, this ensures 
* that the curve does not need to be modified for LP shares
*/

contract PairFees is Initializable {

    address internal pair; // The pair it is bonded to
    address internal token0; // token0 of pair, saved localy and statically for gas optimization
    address internal token1; // Token1 of pair, saved localy and statically for gas optimization

    function initialize(address _token0, address _token1) public initializer {
        pair = msg.sender;
        token0 = _token0;
        token1 = _token1;
    }

    function _safeTransfer(address token,address to,uint256 value) internal {
        require(token.code.length > 0, "PairFees: invalid token");
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "PairFees: transfer failed");
    }

    // Allow the pair to transfer fees to users
    function claimFeesFor(address recipient, uint amount0, uint amount1) external {
        require(msg.sender == pair, "Only pair contract can call");
        if (amount0 > 0) _safeTransfer(token0, recipient, amount0);
        if (amount1 > 0) _safeTransfer(token1, recipient, amount1);
    }
}
