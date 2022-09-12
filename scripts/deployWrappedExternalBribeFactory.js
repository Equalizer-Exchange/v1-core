const hre = require("hardhat");

async function main() {
    const voterAddr = "0x866c1Af8266D5740563b3618267fA0e1e158FfD0";
    
    const WrappedExternalBribeFactory = await hre.ethers.getContractFactory("WrappedExternalBribeFactory");
    const wrappedExternalBribeFactory = await WrappedExternalBribeFactory.deploy(voterAddr);

    await wrappedExternalBribeFactory.deployed();

    console.log("WrappedExternalBribeFactory deployed to:", wrappedExternalBribeFactory.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
