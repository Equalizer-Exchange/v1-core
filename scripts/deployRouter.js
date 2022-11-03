const { ethers, upgrades } = require("hardhat");

async function main() {
    const WFTM =  "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
    const factoryAddr = "0xc6366EFD0AF1d09171fe0EBF32c7943BB310832a";

    const Router = await ethers.getContractFactory("Router");
    const router = await upgrades.deployProxy(Router, [factoryAddr, WFTM]);

    await router.deployed();

    console.log("Router deployed to:", router.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
