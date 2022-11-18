const { ethers, upgrades } = require("hardhat");

async function main() {
    const ROUTER_ADDR = "0x1A05EB736873485655F29a37DEf8a0AA87F5a447";
    const EqualizerLibrary = await ethers.getContractFactory("EqualizerLibrary");
    const equalizerLibrary = await upgrades.deployProxy(EqualizerLibrary, [ROUTER_ADDR]);

    await equalizerLibrary.deployed();

    console.log("EqualizerLibrary deployed to:", equalizerLibrary.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
