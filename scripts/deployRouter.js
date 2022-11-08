const { ethers, upgrades } = require("hardhat");

async function main() {
    const WFTM =  "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
    const PairFactory = await ethers.getContractFactory("PairFactory");
    const pairFactory = await upgrades.deployProxy(PairFactory, []);

    await pairFactory.deployed();

    console.log("PairFactory deployed to:", pairFactory.address);

    const Router = await ethers.getContractFactory("Router");
    const router = await upgrades.deployProxy(Router, [pairFactory.address, WFTM]);

    await router.deployed();

    console.log("Router deployed to:", router.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
