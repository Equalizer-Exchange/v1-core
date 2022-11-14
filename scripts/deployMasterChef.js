const { ethers, upgrades } = require("hardhat");

async function main() {
    const FOUR_WEEKS_IN_SECS = 28 * 24 * 60 * 60;
    const startTime = 1669248000; // Thursday, Nov 24, 2022 0:00:00
    const endTime = startTime + FOUR_WEEKS_IN_SECS;
    const equalPerSecond = ethers.utils.parseUnits("0.2583498677", 18);

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

    // Upgrade
    /* const masterChefAddr = "0x93b97347722b8A0d21b0ddDF79aE1c85c05041f8";
    const MasterChef = await ethers.getContractFactory("MasterChef");
    const masterChef = await upgrades.upgradeProxy(masterChefAddr, MasterChef);
    console.log("MasterChef upgraded"); */
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
