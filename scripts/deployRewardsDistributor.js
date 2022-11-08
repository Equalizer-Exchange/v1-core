const { ethers, upgrades } = require("hardhat");

async function main() {
    const votingEscrowAddr = "0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94";
    const RewardsDistributor = await ethers.getContractFactory("RewardsDistributor");
    const rewardsDistributor = await upgrades.deployProxy(RewardsDistributor, [votingEscrowAddr]);

    await rewardsDistributor.deployed();

    console.log("RewardsDistributor deployed to:", rewardsDistributor.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});