const { ethers, upgrades } = require("hardhat");

async function main() {
    const ROUTER_ADDR = "0xbae81eBB5E897C7143c82725e1c2039C2D7e2a78";
    const EqualizerLibrary = await ethers.getContractFactory("EqualizerLibrary");
    const equalizerLibrary = await upgrades.deployProxy(EqualizerLibrary, [ROUTER_ADDR]);

    await equalizerLibrary.deployed();

    console.log("EqualizerLibrary deployed to:", equalizerLibrary.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
