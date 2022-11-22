const { ethers, upgrades } = require("hardhat");

async function main() {
    const votingEscrowAddr = "0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94";
    const duration = 21;
    const merkleRoot = "0x7b23e27fd066cdac61ce0868bf9fc56c4960d5f78e340bea43c38fc30c6b0291";

    const MerkleClaim = await ethers.getContractFactory("MerkleClaim");
    const merkleClaim = await upgrades.deployProxy(MerkleClaim, [
        votingEscrowAddr, merkleRoot, duration
    ]);

    await merkleClaim.deployed();

    console.log("MerkleClaim deployed to:", merkleClaim.address);

    const startTime = 1668988800; // Monday, Nov 21 2022 0:00:00
    await merkleClaim.setStartTime(startTime);

    /* const merkleClaimAddr = "0x6ef2Fa893319dB4A06e864d1dEE17A90fcC34130";
    const merkleClaim = await ethers.getContractAt("MerkleClaim", merkleClaimAddr);

    await merkleClaim.setClaimStatus(["0x2fef6742d30c81c518d7742d5c7ae6723f64a79c"], [false]); */
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
