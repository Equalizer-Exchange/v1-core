// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IVeArtProxy {
    // solhint-disable-next-line
    function _tokenURI(uint _tokenId, uint _balanceOf, uint _locked_end, uint _value) external pure returns (string memory output);
}
