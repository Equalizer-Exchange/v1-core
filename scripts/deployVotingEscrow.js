const { ethers, upgrades } = require("hardhat");

async function main() {
    const equalAddr = "0x3Fd3A0c85B70754eFc07aC9Ac0cbBDCe664865A6";

    const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
    const veArtProxy = await upgrades.deployProxy(VeArtProxy, []);
    await veArtProxy.deployed();

    console.log("VeArtProxy deployed to:", veArtProxy.address);

    const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    const votingEscrow = await upgrades.deployProxy(VotingEscrow, [
        equalAddr, veArtProxy.address
    ]);

    await votingEscrow.deployed();

    console.log("VotingEscrow deployed to:", votingEscrow.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
    