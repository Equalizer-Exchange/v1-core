const { ethers, upgrades } = require("hardhat");

async function main() {
    const votingEscrowAddr = "0x99a5075d29047c6Df029163F40338f288731642F";
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
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
