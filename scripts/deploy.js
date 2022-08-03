// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  /* const Equal = await hre.ethers.getContractFactory("Equal");
  const equal = await Equal.deploy();

  await equal.deployed();

  console.log("Equal deployed to:", equal.address); */

  /* const PairFactory = await hre.ethers.getContractFactory("PairFactory");
  const pairFactory = await PairFactory.deploy();

  await pairFactory.deployed();

  console.log("PairFactory deployed to:", pairFactory.address); */

  // Wrapped Fantom address on the testnet
  /* const WFTM =  "0x07B9c47452C41e8E00f98aC4c075F5c443281d2A";
  let factory = "0x59aa4da57efd24255f58490c69b81ecfad20d70b";

  const Router = await hre.ethers.getContractFactory("Router");
  const router = await Router.deploy(factory, WFTM);

  await router.deployed();

  console.log("Router deployed to:", router.address); */

  /* const ROUTER_ADDR = "0xB9f3842dbEd7F90F4B095D0D328B2Ac7C2a88881";
  const EqualizerLibrary = await hre.ethers.getContractFactory("EqualizerLibrary");
  const equalizerLibrary = await EqualizerLibrary.deploy(ROUTER_ADDR);

  await equalizerLibrary.deployed();

  console.log("EqualizerLibrary deployed to:", equalizerLibrary.address); */

  /* const VeArtProxy = await hre.ethers.getContractFactory("VeArtProxy");
  const veArtProxy = await VeArtProxy.deploy();

  await veArtProxy.deployed();

  console.log("VeArtProxy deployed to:", veArtProxy.address); */

  /* const veArtProxyAddr = "0x3b2eeD935af5E21e3ccB4C090ca60B5d2801ACb5";
  const equalAddr = "0x9a5FdF8146467d70634fc48bEF67dD14B5A08757";
  const VotingEscrow = await hre.ethers.getContractFactory("VotingEscrow");
  const votingEscrow = await VotingEscrow.deploy(equalAddr, veArtProxyAddr);

  await votingEscrow.deployed();

  console.log("VotingEscrow deployed to:", votingEscrow.address); */

  const votingEscrowAddr = "0x04d5038adc155f8705c546b15d243a986fee9984";
  /* const RewardsDistributor = await hre.ethers.getContractFactory("RewardsDistributor");
  const rewardsDistributor = await RewardsDistributor.deploy(votingEscrowAddr);

  await rewardsDistributor.deployed();

  console.log("RewardsDistributor deployed to:", rewardsDistributor.address); */

  /* const GaugeFactory = await hre.ethers.getContractFactory("GaugeFactory");
  const gaugeFactory = await GaugeFactory.deploy();

  await gaugeFactory.deployed();

  console.log("GaugeFactory deployed to:", gaugeFactory.address); */

  /* const BribeFactory = await hre.ethers.getContractFactory("BribeFactory");
  const bribeFactory = await BribeFactory.deploy();

  await bribeFactory.deployed();

  console.log("BribeFactory deployed to:", bribeFactory.address); */

  const pairFactoryAddr = "0x59aa4da57efd24255f58490c69b81ecfad20d70b";
  const gaugeFactoryAddr = "0x9d5142ca7978d75e693014dcbb4e7dd076d6a77f";
  const bribeFactoryAddr = "0x0a7029cb0949da11dda4228fc780b723141e8329";

  const Voter = await hre.ethers.getContractFactory("Voter");
  const voter = await Voter.deploy(
    votingEscrowAddr,
    pairFactoryAddr,
    gaugeFactoryAddr,
    bribeFactoryAddr
  );

  await voter.deployed();

  console.log("Voter deployed to:", voter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
