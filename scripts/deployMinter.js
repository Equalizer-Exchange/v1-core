// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require("hardhat");

async function main() {
  const voterAddr = "0x4bebEB8188aEF8287f9a7d1E4f01d76cBE060d5b";
  const votingEscrowAddr = "0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94";
  const reDisAddr = "0x4325d07222186F438c83Ac1Ed579ecAC2a7d1426";

  const Minter = await ethers.getContractFactory("Minter");
  const minter = await upgrades.deployProxy(Minter, [
    voterAddr,
    votingEscrowAddr,
    reDisAddr
  ]);

  await minter.deployed();

  console.log("Minter deployed to:", minter.address);

  // Upgrade
  /* const minterAddr = "0x85E7f59248d1c52BD635F27518333F75FB80C72D";
  const Minter = await ethers.getContractFactory("Minter");
  const minter = await upgrades.upgradeProxy(minterAddr, Minter);
  console.log("Minter upgraded"); */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
