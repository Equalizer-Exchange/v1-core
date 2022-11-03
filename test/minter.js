const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Minter", () => {
    let owner, owner2, owner3;
    let ve, minter;
    let equal;

    before(async() => {
        [owner, owner2, owner3] = await ethers.getSigners();
        const EqualFactory = await ethers.getContractFactory("Equal");
        equal = await upgrades.deployProxy(EqualFactory, []);

        const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
        const veArtProxy = await upgrades.deployProxy(VeArtProxy, []);
  
        const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
        ve = await upgrades.deployProxy(VotingEscrow, [
            equal.address, veArtProxy.address
        ]);

        const RewardsDistributor = await ethers.getContractFactory("RewardsDistributor");
        const rewardsDistributor = await upgrades.deployProxy(RewardsDistributor, [ve.address]);
        await rewardsDistributor.deployed();

        const PairFactory = await ethers.getContractFactory("PairFactory");
        const factory = await upgrades.deployProxy(PairFactory, []);
        await factory.deployed();

        const GaugeFactory = await ethers.getContractFactory("GaugeFactory");
        const gauge_factory = await upgrades.deployProxy(GaugeFactory, []);
        await gauge_factory.deployed();

        const BribeFactory = await ethers.getContractFactory("BribeFactory");
        const bribe_factory = await upgrades.deployProxy(BribeFactory, []);
        await bribe_factory.deployed();

        const Voter = await ethers.getContractFactory("Voter");
        const voter = await upgrades.deployProxy(Voter, [
            ve.address, 
            factory.address, 
            gauge_factory.address, 
            bribe_factory.address
        ]);
        await voter.deployed();

        await ve.setVoter(voter.address);

        const Minter = await ethers.getContractFactory("Minter");
        minter = await upgrades.deployProxy(Minter, [
            voter.address, ve.address, rewardsDistributor.address
        ]);
        await minter.deployed();
        console.log("Minter deployed to ", minter.address);

        await rewardsDistributor.setDepositor(minter.address);
        await equal.setMinter(minter.address);
    });

    it("initialSetup", async function () {
      await minter.initialSetup([owner2.address], [1000], 1000);
    });
});