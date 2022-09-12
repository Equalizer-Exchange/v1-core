const hre = require("hardhat");

async function main() {
    const ROUTER_ADDR = "0x59c710624055763a8E0131b023195E48C4D5619D";
    const EqualizerLibrary = await hre.ethers.getContractFactory("EqualizerLibrary");
    const equalizerLibrary = await EqualizerLibrary.deploy(ROUTER_ADDR);

    await equalizerLibrary.deployed();

    console.log("EqualizerLibrary deployed to:", equalizerLibrary.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
