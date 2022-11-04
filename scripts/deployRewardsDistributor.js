const { ethers, upgrades } = require("hardhat");

async function main() {
    const votingEscrowAddr = "0x99a5075d29047c6Df029163F40338f288731642F";
    const RewardsDistributor = await ethers.getContractFactory("RewardsDistributor");
    const rewardsDistributor = await upgrades.deployProxy(RewardsDistributor, [votingEscrowAddr]);

    await rewardsDistributor.deployed();

    console.log("RewardsDistributor deployed to:", rewardsDistributor.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});