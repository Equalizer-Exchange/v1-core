const hre = require("hardhat");

async function main() {
    const WFTM =  "0x07B9c47452C41e8E00f98aC4c075F5c443281d2A";
    const factoryAddr = "0xBD0c75cFf5e679FD3893Dc590b7F77f858328cCD";

    const Router = await hre.ethers.getContractFactory("Router");
    const router = await Router.deploy(factoryAddr, WFTM);

    await router.deployed();

    console.log("Router deployed to:", router.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
