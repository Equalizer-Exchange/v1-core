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

    const startTime = 1668384000; // Monday, Nov 14 2022 0:00:00
    await merkleClaim.setStartTime(startTime);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
