const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bribe", () => {
    let owner, owner2, owner3;
    let pairFactory, router, voter, ve, wrappedExternalBribeFactory;
    let usdt, mim, dai;
    let pair, pair2, pair3, gauge, gauge2;
    
    before(async() => {
        [owner, owner2, owner3] = await ethers.getSigners();

        const PairFactory = await ethers.getContractFactory("PairFactory");
        pairFactory = await PairFactory.deploy();
        await pairFactory.deployed();

        const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
        const veArtProxy = await VeArtProxy.deploy();
  
        const EqualFactory = await ethers.getContractFactory("Equal");
        const equal = await EqualFactory.deploy();

        const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
        ve = await VotingEscrow.deploy(equal.address, veArtProxy.address);

        const GaugeFactory = await ethers.getContractFactory("GaugeFactory");
        const gauge_factory = await GaugeFactory.deploy();
        await gauge_factory.deployed();

        const BribeFactory = await ethers.getContractFactory("BribeFactory");
        const bribe_factory = await BribeFactory.deploy();
        await bribe_factory.deployed();

        const Voter = await ethers.getContractFactory("Voter");
        voter = await Voter.deploy(
            ve.address, 
            pairFactory.address, 
            gauge_factory.address, 
            bribe_factory.address
        );
        await voter.deployed();

        const WrappedExternalBribeFactory = await ethers.getContractFactory("WrappedExternalBribeFactory");
        wrappedExternalBribeFactory = await WrappedExternalBribeFactory.deploy(voter.address);
        await wrappedExternalBribeFactory.deployed();

        const Router = await ethers.getContractFactory("Router");
        router = await Router.deploy(pairFactory.address, owner.address);
        await router.deployed();

        token = await ethers.getContractFactory("Token");
        usdt = await token.deploy('USDT', 'USDT', 6, owner.address);
        await usdt.mint(owner.address, ethers.utils.parseUnits("1000000", 6));
        await usdt.mint(owner2.address, ethers.utils.parseUnits("1000000", 6));
        await usdt.mint(owner3.address, ethers.utils.parseUnits("1000000", 6));
        mim = await token.deploy('MIM', 'MIM', 18, owner.address);
        await mim.mint(owner.address, ethers.utils.parseUnits("1000000", 18));
        await mim.mint(owner2.address, ethers.utils.parseUnits("1000000", 18));
        await mim.mint(owner3.address, ethers.utils.parseUnits("1000000", 18));
        dai = await token.deploy('DAI', 'DAI', 18, owner.address);
        await dai.mint(owner.address, ethers.utils.parseUnits("1000000", 18));
        await dai.mint(owner2.address, ethers.utils.parseUnits("1000000", 18));
        await dai.mint(owner3.address, ethers.utils.parseUnits("1000000", 18));
    });

    it("test pair length", async() => {
        expect(await pairFactory.allPairsLength()).to.equal(0);
    });
      
    it("test factory address", async function () {
        expect(await router.factory()).to.equal(pairFactory.address);
    });

    it("deploy pair via PairFactory owner", async function () {
        const usdt_1 = ethers.utils.parseUnits("10", 6);
        const mim_1 = ethers.utils.parseUnits("10", 18);
        const dai_1 = ethers.utils.parseUnits("10", 18);
        await mim.approve(router.address, mim_1);
        await usdt.approve(router.address, usdt_1);
        await router.addLiquidity(
            mim.address, usdt.address, true, mim_1, usdt_1, 0, 0, owner.address, Date.now()
        );
        
        await mim.approve(router.address, mim_1);
        await usdt.approve(router.address, usdt_1);
        await router.addLiquidity(
            mim.address, usdt.address, false, mim_1, usdt_1, 0, 0, owner.address, Date.now()
        );
        
        await mim.approve(router.address, mim_1);
        await dai.approve(router.address, dai_1);
        await router.addLiquidity(
            mim.address, dai.address, true, mim_1, dai_1, 0, 0, owner.address, Date.now()
        );
        expect(await pairFactory.allPairsLength()).to.equal(3);
    });

    it("confirm pair for mim-usdt", async function () {
        const create2address = await router.pairFor(mim.address, usdt.address, true);
        const Pair = await ethers.getContractFactory("Pair");
        const address = await pairFactory.getPair(mim.address, usdt.address, true);

        pair = await Pair.attach(address);

        const address2 = await pairFactory.getPair(mim.address, usdt.address, false);
        pair2 = await Pair.attach(address2);

        const address3 = await pairFactory.getPair(mim.address, dai.address, true);
        pair3 = await Pair.attach(address3);
    
        expect(pair.address).to.equal(create2address);
    });

    it("Create gauge", async function () {
        const pair_1000 = ethers.utils.parseUnits("1000", 6);

        await voter.createGauge(pair.address);
        await voter.createGauge(pair2.address);

        expect(
            await voter.gauges(pair.address)
        ).to.not.equal(ethers.constants.AddressZero);

        const gauge_address = await voter.gauges(pair.address);
        const internal_bribe_address = await voter.internal_bribes(gauge_address); 
        const external_bribe_address = await voter.external_bribes(gauge_address); 

        const gauge_address2 = await voter.gauges(pair2.address);
        const internal_bribe_address2 = await voter.internal_bribes(gauge_address2); 
        const external_bribe_address2 = await voter.external_bribes(gauge_address2); 

        const Gauge = await ethers.getContractFactory("Gauge");
        gauge = await Gauge.attach(gauge_address);
        gauge2 = await Gauge.attach(gauge_address2);

        const InternalBribe = await ethers.getContractFactory("InternalBribe");
        internal_bribe = await InternalBribe.attach(internal_bribe_address);
        internal_bribe2 = await InternalBribe.attach(internal_bribe_address2);

        const ExternalBribe = await ethers.getContractFactory("ExternalBribe");
        external_bribe = await ExternalBribe.attach(external_bribe_address);
        external_bribe2 = await ExternalBribe.attach(external_bribe_address2);
        
        await wrappedExternalBribeFactory.createBribe(external_bribe_address);
        await wrappedExternalBribeFactory.createBribe(external_bribe_address2);

        await pair.approve(gauge.address, pair_1000);
        await gauge.deposit(pair_1000, 0);

        await pair2.approve(gauge2.address, pair_1000);
        await gauge2.deposit(pair_1000, 0);

        expect(await gauge.totalSupply()).to.equal(pair_1000);
        expect(await gauge.earned(ve.address, owner.address)).to.equal(0);
    });
});
