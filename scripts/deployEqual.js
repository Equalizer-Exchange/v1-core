const { ethers, upgrades } = require("hardhat");

async function main() {
    const Equal = await ethers.getContractFactory("Equal");
    const equal = await upgrades.deployProxy(Equal, []);
    await equal.deployed();

    console.log("Equal deployed to:", equal.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  