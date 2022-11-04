const { ethers, upgrades } = require("hardhat");

async function main() {
    const equalAddr = "0xbC74B39DAE67287437406A1C37F89D948Cc415D0";
    const veArtProxyAddr = "0x777928F0B5F9066a14f7317D57e660F1d754CAd8";

    const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    const votingEscrow = await upgrades.deployProxy(VotingEscrow, [
        equalAddr, veArtProxyAddr
    ]);

    await votingEscrow.deployed();

    console.log("VotingEscrow deployed to:", votingEscrow.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
    