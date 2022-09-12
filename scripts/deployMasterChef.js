const hre = require("hardhat");

async function main() {
    const FOUR_WEEKS_IN_SECS = 28 * 24 * 60 * 60;
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + FOUR_WEEKS_IN_SECS;
    const equalPerSecond = 0.2583498677 * 10 ^ 18;

    const votingEscrowAddr = "0x416ad61485bfA706f6E45fB3C4a996F3B1c4F942";
    const MasterChef = await hre.ethers.getContractFactory("MasterChef");
    const masterChef = await MasterChef.deploy(
        votingEscrowAddr,
        equalPerSecond,
        startTime,
        endTime
    );

    await masterChef.deployed();

    console.log("MasterChef deployed to:", masterChef.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
