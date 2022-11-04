// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require("hardhat");

async function main() {
  const voterAddr = "0x0b034D57a3f21fafa35FB5002e81f48923DD4ffB";
  const votingEscrowAddr = "0x99a5075d29047c6Df029163F40338f288731642F";
  const reDisAddr = "0x07378e3B1fC43F7A37630C739a2f29F5b2442e60";

  const Minter = await ethers.getContractFactory("Minter");
  const minter = await upgrades.deployProxy(Minter, [
    voterAddr,
    votingEscrowAddr,
    reDisAddr
  ]);

  await minter.deployed();

  console.log("Minter deployed to:", minter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
