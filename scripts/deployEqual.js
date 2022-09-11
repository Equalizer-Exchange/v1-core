const hre = require("hardhat");

async function main() {
    const Equal = await hre.ethers.getContractFactory("Equal");
    const equal = await Equal.deploy();
    await equal.deployed();

    console.log("Equal deployed to:", equal.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  