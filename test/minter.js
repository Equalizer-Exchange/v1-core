const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Minter", () => {
    let owner, owner2, owner3;
    let ve, minter;
    let equal;

    before(async() => {
        [owner, owner2, owner3] = await ethers.getSigners();
        const EqualFactory = await ethers.getContractFactory("Equal");
        equal = await EqualFactory.deploy();

        const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
        const veArtProxy = await VeArtProxy.deploy();
  
        const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
        ve = await VotingEscrow.deploy(equal.address, veArtProxy.address);

        const RewardsDistributor = await ethers.getContractFactory("RewardsDistributor");
        const rewardsDistributor = await RewardsDistributor.deploy(ve.address);
        await rewardsDistributor.deployed();

        const PairFactory = await ethers.getContractFactory("PairFactory");
        const factory = await PairFactory.deploy();
        await factory.deployed();

        const GaugeFactory = await ethers.getContractFactory("GaugeFactory");
        const gauge_factory = await GaugeFactory.deploy();
        await gauge_factory.deployed();

        const BribeFactory = await ethers.getContractFactory("BribeFactory");
        const bribe_factory = await BribeFactory.deploy();
        await bribe_factory.deployed();

        const Voter = await ethers.getContractFactory("Voter");
        const voter = await Voter.deploy(
            ve.address, 
            factory.address, 
            gauge_factory.address, 
            bribe_factory.address
        );
        await voter.deployed();

        await ve.setVoter(voter.address);

        const Minter = await ethers.getContractFactory("Minter");
        minter = await Minter.deploy(voter.address, ve.address, rewardsDistributor.address);
        await minter.deployed();
        console.log("Minter deployed to ", minter.address);

        await rewardsDistributor.setDepositor(minter.address);
        await equal.setMinter(minter.address);
    });

    it("initialize", async function () {
      await minter.initialize([owner2.address], [1000], 1000);
    });
});