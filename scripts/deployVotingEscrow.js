const hre = require("hardhat");

async function main() {
    const equalAddr = "0x433b6C328a15490568b47277D02c66D4Eda14b29";
    const veArtProxyAddr = "0x7dD5dF9b35b1296C0F4B11b320a7DE25f12bf8Da";

    const VotingEscrow = await hre.ethers.getContractFactory("VotingEscrow");
    const votingEscrow = await VotingEscrow.deploy(equalAddr, veArtProxyAddr);

    await votingEscrow.deployed();

    console.log("VotingEscrow deployed to:", votingEscrow.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
    