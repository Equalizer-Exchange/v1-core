const { ethers, upgrades } = require("hardhat");

async function main() {
    const votingEscrowAddr = "0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94";
    const pairFactoryAddr = "0xc6366EFD0AF1d09171fe0EBF32c7943BB310832a";

    const GaugeFactory = await ethers.getContractFactory("GaugeFactory");
    const gaugeFactory = await upgrades.deployProxy(GaugeFactory, []);

    await gaugeFactory.deployed();

    console.log("GaugeFactory deployed to:", gaugeFactory.address);

    const BribeFactory = await ethers.getContractFactory("BribeFactory");
    const bribeFactory = await upgrades.deployProxy(BribeFactory, []);

    await bribeFactory.deployed();

    console.log("BribeFactory deployed to:", bribeFactory.address);  

    const Voter = await ethers.getContractFactory("Voter");
    const voter = await upgrades.deployProxy(Voter, [
        votingEscrowAddr,
        pairFactoryAddr,
        gaugeFactory.address,
        bribeFactory.address
    ]);

    await voter.deployed();

    console.log("Voter deployed to:", voter.address);

    // upgrade
    /* const voterAddr = "0x4bebEB8188aEF8287f9a7d1E4f01d76cBE060d5b";
    const VoterV2 = await ethers.getContractFactory("Voter");
    const voter = await upgrades.upgradeProxy(voterAddr, VoterV2);
    console.log("Voter upgraded"); */

    // check whitelist
    /* const voterAddr = "0x4bebEB8188aEF8287f9a7d1E4f01d76cBE060d5b";
    const voter = await ethers.getContractAt("Voter", voterAddr);
    console.log(await voter.isWhitelisted("0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83")); */
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
