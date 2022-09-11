const hre = require("hardhat");

async function main() {
    const PairFactory = await hre.ethers.getContractFactory("PairFactory");
    const pairFactory = await PairFactory.deploy();

    await pairFactory.deployed();

    console.log("PairFactory deployed to:", pairFactory.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});