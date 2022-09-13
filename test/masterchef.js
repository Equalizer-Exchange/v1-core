const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MasterChef", function () {
  let owner;
  let equal, masterChef, ve;

  const FOUR_WEEKS_IN_SECS = 28 * 24 * 60 * 60;
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + FOUR_WEEKS_IN_SECS;

  const equalPerSecond = 0.2583498677 * 10 ^ 18;

  before(async() => {
    // Contracts are deployed using the first signer/account by default
    [owner] = await ethers.getSigners();

    const Equal = await ethers.getContractFactory("Equal");
    equal = await Equal.deploy();
    await equal.deployed();

    const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
    const veArtProxy = await VeArtProxy.deploy();

    const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    ve = await VotingEscrow.deploy(equal.address, veArtProxy.address);

    const MasterChef = await ethers.getContractFactory("MasterChef");
    masterChef = await MasterChef.deploy(
      ve.address,
      equalPerSecond,
      startTime,
      endTime
    );
    await masterChef.deployed();
    
    console.log("MasterChef deployed at ", masterChef.address);
  });

  it("should set right startTime", async() => {
    expect(await masterChef.startTime()).to.equal(startTime);
  });
});
