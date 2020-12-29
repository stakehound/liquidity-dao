// SPDX-License-Identifier: MIT

// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

interface IStakehoundGeyser {
    function stake(address) external returns (uint256);

    function signalTokenLock(
        address token,
        uint256 amount,
        uint256 durationSec,
        uint256 startTime
    ) external;
}
