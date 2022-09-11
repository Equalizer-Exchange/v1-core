const hre = require("hardhat");

async function main() {
    const VeArtProxy = await hre.ethers.getContractFactory("VeArtProxy");
    const veArtProxy = await VeArtProxy.deploy();

    await veArtProxy.deployed();

    console.log("VeArtProxy deployed to:", veArtProxy.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  