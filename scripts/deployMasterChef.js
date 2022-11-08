const { ethers, upgrades } = require("hardhat");

async function main() {
    const FOUR_WEEKS_IN_SECS = 28 * 24 * 60 * 60;
    const startTime = 1668643200; // Thursday, Nov 17, 2022 0:00:00
    const endTime = startTime + FOUR_WEEKS_IN_SECS;
    const equalPerSecond = 0.2583498677 * 10 ^ 18;

    const votingEscrowAddr = "0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94";
    const MasterChef = await ethers.getContractFactory("MasterChef");
    const masterChef = await upgrades.deployProxy(MasterChef, [
        votingEscrowAddr,
        equalPerSecond,
        startTime,
        endTime
    ]);

    await masterChef.deployed();

    console.log("MasterChef deployed to:", masterChef.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
