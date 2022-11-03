const { ethers, upgrades } = require("hardhat");

async function main() {
    const PairFactory = await ethers.getContractFactory("PairFactory");
    const pairFactory = await upgrades.deployProxy(PairFactory, []);

    await pairFactory.deployed();

    console.log("PairFactory deployed to:", pairFactory.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});