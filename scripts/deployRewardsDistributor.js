const hre = require("hardhat");

async function main() {
    const votingEscrowAddr = "0x416ad61485bfA706f6E45fB3C4a996F3B1c4F942";
    const RewardsDistributor = await hre.ethers.getContractFactory("RewardsDistributor");
    const rewardsDistributor = await RewardsDistributor.deploy(votingEscrowAddr);

    await rewardsDistributor.deployed();

    console.log("RewardsDistributor deployed to:", rewardsDistributor.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});