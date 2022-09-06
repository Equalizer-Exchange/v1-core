// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./libraries/MerkleProof.sol";
import "./interfaces/IEqual.sol";
import "./interfaces/IVotingEscrow.sol";

/// @title MerkleClaim
/// @notice Claims EQUAL for members of a merkle tree
/// @author Modified from Merkle Airdrop Starter (https://github.com/Anish-Agnihotri/merkle-airdrop-starter/blob/master/contracts/src/MerkleClaimERC20.sol)
contract MerkleClaim {
    /// @notice max lock period 26 weeeks
    uint internal constant LOCK = 86400 * 7 * 26;

    /// ============ Immutable storage ============
    IVotingEscrow public immutable ve;
    /// @notice EQUAL token to claim
    IEqual public immutable equal;
    /// @notice ERC20-claimee inclusion root
    bytes32 public immutable merkleRoot;

    /// @notice Mapping from boost level to veEQUAL token amount
    mapping(uint => uint) public boostAmount;

    /// ============ Mutable storage ============

    /// @notice Mapping of addresses who have claimed tokens
    mapping(address => bool) public hasClaimed;

    /// ============ Constructor ============

    /// @notice Creates a new MerkleClaim contract
    /// @param _ve address
    /// @param _merkleRoot of claimees
    constructor(address _ve, bytes32 _merkleRoot) {
        ve = IVotingEscrow(_ve);
        equal = IEqual(IVotingEscrow(_ve).token());
        merkleRoot = _merkleRoot;

        boostAmount[1] = 150;
        boostAmount[2] = 220;
        boostAmount[3] = 300;
    }

    /// ============ Events ============

    /// @notice Emitted after a successful token claim
    /// @param to recipient of claim
    /// @param amount of veTokens claimed
    event Claim(address indexed to, uint256 amount);

    /// ============ Functions ============

    /// @notice Allows claiming tokens if address is part of merkle tree
    /// @param _to address of claimee
    /// @param _boostLevel depending on number 1-3 is how many veEQUAL the receive 
    /// @param _proof merkle proof to prove address and amount are in tree
    function claim(
        address _to,
        uint256 _boostLevel,
        bytes32[] calldata _proof
    ) external {
        // Throw if address has already claimed tokens
        require(!hasClaimed[_to], "ALREADY_CLAIMED");

        // Verify merkle proof, or revert if not in tree
        bytes32 leaf = keccak256(abi.encodePacked(_to, _boostLevel));
        bool isValidLeaf = MerkleProof.verify(_proof, merkleRoot, leaf);
        require(isValidLeaf, "NOT_IN_MERKLE");

        // Set address to claimed
        hasClaimed[_to] = true;

        // Claim tokens for address
        // require(EQUAL.claim(to, amount), "CLAIM_FAILED");
        ve.create_lock_for(boostAmount[_boostLevel], LOCK, msg.sender);
        // Emit claim event
        emit Claim(_to, boostAmount[_boostLevel]);
    }
}
