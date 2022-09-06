// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./libraries/Math.sol";
import "./interfaces/IRewardsDistributor.sol";
import "./interfaces/IEqual.sol";
import "./interfaces/IVoter.sol";
import "./interfaces/IVotingEscrow.sol";
import "./interfaces/IMinter.sol";
import "./interfaces/IERC20.sol";

/**
* @title Minter
* @notice codifies the minting rules as per ve(3,3), abstracted from the token to support any token that allows minting
*/
contract Minter is IMinter {
    uint internal constant WEEK = 86400 * 7; // allows minting once per week (reset every Thursday 00:00 UTC)
    uint internal constant TAIL_EMISSION = 2;
    uint internal constant PRECISION = 1000;
    uint internal emission = 995;
    uint internal numEpoch;

    IEqual public immutable _equal;
    IVoter public immutable _voter;
    IVotingEscrow public immutable _ve;
    IRewardsDistributor public immutable _rewards_distributor;

    IERC20 public equalWftmPair;
    uint internal constant EQUAL_WFTM_PAIR_RATE = 10;

    /// @notice represents a starting weekly emission of 50K EQUAL (EQUAL has 18 decimals)
    uint public weekly = 50000 * 1e18;
    uint public active_period;

    /// @notice max lock period 26 weeeks
    uint internal constant LOCK = 86400 * 7 * 26;
    
    address internal initializer;
    address public team;
    address public pendingTeam;

    address public treasury;
    uint public treasuryRate;
    

    // uint public constant MAX_TEAM_RATE = 50; // 50 bps
    uint public constant MAX_TREASURY_RATE = 50; // 50 bps

    event Mint(address indexed sender, uint weekly, uint circulating_supply, uint circulating_emission);

    /**
     * @dev constructor
     * @param __voter the voting & distribution system
     * @param __ve the ve(3,3) system that will be locked into
     * @param __rewards_distributor the distribution system that ensures users aren't diluted
     */
    constructor(
        address __voter,
        address __ve,
        address __rewards_distributor
    ) {
        initializer = msg.sender;
        team = msg.sender;
        treasuryRate = 20; // 20 bps
        _equal = IEqual(IVotingEscrow(__ve).token());
        _voter = IVoter(__voter);
        _ve = IVotingEscrow(__ve);
        _rewards_distributor = IRewardsDistributor(__rewards_distributor);
        active_period = ((block.timestamp + (2 * WEEK)) / WEEK) * WEEK;
    }

    /// @notice sum amounts / max = % ownership of top protocols, 
    /// so if initial 20m is distributed, and target is 25% protocol ownership, then max - 4 x 20m = 80m
    function initialize(
        address[] memory claimants,
        uint[] memory amounts,
        uint max
    ) external {
        require(initializer == msg.sender);
        _equal.mint(address(this), max);
        _equal.approve(address(_ve), type(uint).max);
        for (uint i = 0; i < claimants.length; i++) {
            _ve.create_lock_for(amounts[i], LOCK, claimants[i]);
        }
        initializer = address(0);
        active_period = ((block.timestamp) / WEEK) * WEEK; // allow minter.update_period() to mint new emissions THIS Thursday
    }

    function setTeam(address _team) external {
        require(msg.sender == team, "not team");
        pendingTeam = _team;
    }

    function acceptTeam() external {
        require(msg.sender == pendingTeam, "not pending team");
        team = pendingTeam;
    }

    function setTreasury(address _treasury) external {
        require(msg.sender == team, "not team");
        treasury = _treasury;
    }

    /* function setTeamRate(uint _teamRate) external {
        require(msg.sender == team, "not team");
        require(_teamRate <= MAX_TEAM_RATE, "rate too high");
        teamRate = _teamRate;
    } */

    function setTreasuryRate(uint _treasuryRate) external {
        require(msg.sender == team, "not team");
        require(_treasuryRate <= MAX_TREASURY_RATE, "rate too high");
        treasuryRate = _treasuryRate;
    }

    function setEqualWftmPair(address _equalWftmPair) external {
        require(msg.sender == team, "not team");
        require(_equalWftmPair != address(0), "zero address");
        equalWftmPair = IERC20(_equalWftmPair);
    }

    /// @notice calculate circulating supply as total token supply - locked supply
    function circulating_supply() public view returns (uint) {
        return _equal.totalSupply() - _ve.totalSupply();
    }

    /// @notice emission calculation is 0.5% of available supply to mint adjusted by circulating / total supply until EPOCH 104, 0.1% thereafter
    function calculate_emission() public view returns (uint) {
        return (weekly * emission) / PRECISION;
    }

    /// @notice weekly emission takes the max of calculated (aka target) emission versus circulating tail end emission
    function weekly_emission() public view returns (uint) {
        return Math.max(calculate_emission(), circulating_emission());
    }

    /// @notice calculates tail end (infinity) emissions as 0.2% of total supply
    function circulating_emission() public view returns (uint) {
        return (circulating_supply() * TAIL_EMISSION) / PRECISION;
    }

    /// @notice calculate inflation and adjust ve balances accordingly
    /* function calculate_growth(uint _minted) public view returns (uint) {
        uint _veTotal = _ve.totalSupply();
        uint _equalTotal = _equal.totalSupply();
        return (
            ((((_minted * _veTotal) / _equalTotal) * _veTotal) / _equalTotal) * _veTotal
        ) / _equalTotal / 2;
    } */

    /// @notice update period can only be called once per cycle (1 week)
    function update_period() external returns (uint) {
        uint _period = active_period;
        if (block.timestamp >= _period + WEEK && initializer == address(0)) { // only trigger if new week
            _period = (block.timestamp / WEEK) * WEEK;
            active_period = _period;
            weekly = weekly_emission();

            // uint _growth = calculate_growth(weekly);
            uint _treasuryEmissions = (treasuryRate * weekly) / PRECISION;
            uint _equalWftmPairEmissions = (EQUAL_WFTM_PAIR_RATE * weekly) / PRECISION;
            uint _required = weekly + _treasuryEmissions + _equalWftmPairEmissions;
            uint _balanceOf = _equal.balanceOf(address(this));
            if (_balanceOf < _required) {
                _equal.mint(address(this), _required - _balanceOf);
            }
            
            unchecked {
                ++numEpoch;
            }
            if (numEpoch == 104) emission = 999;

            require(_equal.transfer(treasury, _treasuryEmissions));
            require(_equal.transfer(address(equalWftmPair), _equalWftmPairEmissions));

            // _rewards_distributor.checkpoint_token(); // checkpoint token balance that was just minted in rewards distributor
            // _rewards_distributor.checkpoint_total_supply(); // checkpoint supply

            _equal.approve(address(_voter), weekly);
            _voter.notifyRewardAmount(weekly);

            emit Mint(msg.sender, weekly, circulating_supply(), circulating_emission());
        }
        return _period;
    }
}
