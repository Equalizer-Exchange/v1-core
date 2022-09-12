const hre = require("hardhat");

async function main() {
    const votingEscrowAddr = "0x416ad61485bfA706f6E45fB3C4a996F3B1c4F942";
    const pairFactoryAddr = "0xBD0c75cFf5e679FD3893Dc590b7F77f858328cCD";

    const GaugeFactory = await hre.ethers.getContractFactory("GaugeFactory");
    const gaugeFactory = await GaugeFactory.deploy();

    await gaugeFactory.deployed();

    console.log("GaugeFactory deployed to:", gaugeFactory.address);

    const BribeFactory = await hre.ethers.getContractFactory("BribeFactory");
    const bribeFactory = await BribeFactory.deploy();

    await bribeFactory.deployed();

    console.log("BribeFactory deployed to:", bribeFactory.address);  

    const Voter = await hre.ethers.getContractFactory("Voter");
    const voter = await Voter.deploy(
        votingEscrowAddr,
        pairFactoryAddr,
        gaugeFactory.address,
        bribeFactory.address
    );

    await voter.deployed();

    console.log("Voter deployed to:", voter.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
