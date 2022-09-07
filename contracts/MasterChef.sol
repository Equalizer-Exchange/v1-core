// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IEqual.sol";
import "./interfaces/IVotingEscrow.sol";

import "./libraries/Ownable.sol";

// The biggest change made is using per second instead of per block for rewards
// This is due to Fantoms extremely inconsistent block times
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once c is sufficiently
// distributed and the community can show to govern itself.

contract MasterChef is Ownable {
    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 pendingReward;
        //
        // We do some fancy math here. Basically, any point in time, the amount of EQUAL
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accEQUALPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accEQUALPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken;           // Address of LP token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool. EQUALs to distribute per block.
        uint256 lastRewardTime;  // Last block time that EQUALs distribution occurs.
        uint256 accEQUALPerShare; // Accumulated EQUALs per share, times 1e12. See below.
    }

    IEqual public immutable equal;
    IVotingEscrow public immutable ve;

    // EQUAL tokens created per second.
    uint256 public immutable equalPerSecond;
 
    uint256 public constant MAX_ALLOC_POINT = 4000;
    uint256 public constant LOCK = 86400 * 7 * 26;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping (uint256 => mapping (address => UserInfo)) public userInfo;
    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block time when EQUAL mining starts.
    uint256 public immutable startTime;
    // The block time when EQUAL mining stops.
    uint256 public immutable endTime;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvest(address indexed user, uint256 totalReward, uint256 tokenId);

    constructor(
        address _ve,
        uint256 _equalPerSecond,
        uint256 _startTime,
        uint256 _endTime
    ) {
        equal = IEqual(IVotingEscrow(_ve).token());
        ve = IVotingEscrow(_ve);
        equalPerSecond = _equalPerSecond;
        startTime = _startTime;
        endTime = _endTime;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function checkForDuplicate(IERC20 _lpToken) internal view {
        uint256 length = poolInfo.length;
        for (uint256 _pid = 0; _pid < length; _pid++) {
            require(poolInfo[_pid].lpToken != _lpToken, "add: pool already exists!!!!");
        }
    }

    // Add a new lp to the pool. Can only be called by the owner.
    function add(uint256 _allocPoint, IERC20 _lpToken) external onlyOwner {
        require(_allocPoint <= MAX_ALLOC_POINT, "add: too many alloc points!!");

        checkForDuplicate(_lpToken); // ensure you cant add duplicate pools

        massUpdatePools();

        uint256 lastRewardTime = block.timestamp > startTime ? block.timestamp : startTime;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        poolInfo.push(PoolInfo({
            lpToken: _lpToken,
            allocPoint: _allocPoint,
            lastRewardTime: lastRewardTime,
            accEQUALPerShare: 0
        }));
    }

    // Update the given pool's EQUAL allocation point. Can only be called by the owner.
    function set(uint256 _pid, uint256 _allocPoint) external onlyOwner {
        require(_allocPoint <= MAX_ALLOC_POINT, "add: too many alloc points!!");

        massUpdatePools();

        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    // Return reward multiplier over the given _from to _to timestamp.
    function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
        _from = _from > startTime ? _from : startTime;
        if (_to < startTime || _from >= endTime) {
            return 0;
        } else if (_to <= endTime) {
            return _to - _from;
        } else {
            return endTime - _from;
        }
    }

    // View function to see pending EQUALs on frontend.
    function pendingEQUAL(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accEQUALPerShare = pool.accEQUALPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.timestamp > pool.lastRewardTime && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardTime, block.timestamp);
            uint256 equalReward = multiplier * equalPerSecond * pool.allocPoint / totalAllocPoint;
            accEQUALPerShare = accEQUALPerShare + (equalReward * 1e12 / lpSupply);
        }
        // modified;  return user.amount * accEQUALPerShare / 1e12 - user.rewardDebt
        return user.amount * accEQUALPerShare / 1e12 - user.rewardDebt + user.pendingReward;
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardTime, block.timestamp);
        uint256 equalReward = multiplier * equalPerSecond * pool.allocPoint / totalAllocPoint;

        // IEqual(equal).mint(address(this), equalReward);

        pool.accEQUALPerShare = pool.accEQUALPerShare + (equalReward * 1e12 / lpSupply);
        pool.lastRewardTime = block.timestamp;
    }

    // Deposit LP tokens to MasterChef for EQUAL allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(_pid);

        uint256 pending = user.amount * pool.accEQUALPerShare / 1e12 - user.rewardDebt;
    
        user.amount = user.amount + _amount;
        user.rewardDebt = user.amount * pool.accEQUALPerShare / 1e12;
        user.pendingReward = user.pendingReward + pending; // added
        // modified
        /* if(pending > 0) {
            safeEQUALTransfer(msg.sender, pending);
        } */
        pool.lpToken.transferFrom(address(msg.sender), address(this), _amount);

        emit Deposit(msg.sender, _pid, _amount);
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _amount) public {  
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(user.amount >= _amount, "withdraw: not good");

        updatePool(_pid);

        uint256 pending = user.amount * pool.accEQUALPerShare / 1e12 - user.rewardDebt;

        user.amount = user.amount - _amount;
        user.rewardDebt = user.amount * pool.accEQUALPerShare / 1e12;
        user.pendingReward = user.pendingReward + pending; // added
        // modified
        /* if(pending > 0) {
            safeEQUALTransfer(msg.sender, pending);
        } */
        pool.lpToken.transfer(address(msg.sender), _amount);
        
        emit Withdraw(msg.sender, _pid, _amount);
    }

    function harvestAll() public {
        uint256 length = poolInfo.length;
        uint calc;
        uint pending;
        UserInfo storage user;
        PoolInfo storage pool;
        uint totalPending;
        for (uint256 pid = 0; pid < length; ++pid) {
            user = userInfo[pid][msg.sender];
            if (user.amount > 0) {
                pool = poolInfo[pid];
                updatePool(pid);

                calc = user.amount * pool.accEQUALPerShare / 1e12;
                pending = calc - user.rewardDebt + user.pendingReward; // modified; pending = calc - user.rewardDebt;
                user.rewardDebt = calc;

                if(pending > 0) {
                    totalPending += pending;
                }
            }
        }
        uint256 tokenId;
        if (totalPending > 0) {
            // modified
            // safeEQUALTransfer(msg.sender, totalPending); 
            equal.approve(address(ve), totalPending);
            tokenId = ve.create_lock_for(totalPending, LOCK, msg.sender); // added
        }
        emit Harvest(msg.sender, totalPending, tokenId);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        uint oldUserAmount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;

        pool.lpToken.transfer(address(msg.sender), oldUserAmount);
        emit EmergencyWithdraw(msg.sender, _pid, oldUserAmount);

    }

    // Safe EQUAL transfer function, just in case if rounding error causes pool to not have enough EQUALs.
    function safeEQUALTransfer(address _to, uint256 _amount) internal {
        uint256 equalBal = equal.balanceOf(address(this));
        if (_amount > equalBal) {
            equal.transfer(_to, equalBal);
        } else {
            equal.transfer(_to, _amount);
        }
    }
}
