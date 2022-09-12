// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const votingEscrowAddr = "0x416ad61485bfA706f6E45fB3C4a996F3B1c4F942";
  const voterAddr = "0x866c1Af8266D5740563b3618267fA0e1e158FfD0";
  const reDisAddr = "0xFDb551237D8d9A605aC07be05e9dDD6500Bc3aaF";

  const Minter = await hre.ethers.getContractFactory("Minter");
  const minter = await Minter.deploy(
    voterAddr,
    votingEscrowAddr,
    reDisAddr
  );

  await minter.deployed();

  console.log("Minter deployed to:", minter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
