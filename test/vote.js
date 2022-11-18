const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Vote Test Suite", () => {
    let owner, owner2, owner3;
    let pairFactory, router, voter, ve, equal, minter;
    let usdt, mim, dai;
    let pair, pair2, gauge, gauge2;
    
    before(async() => {
        [owner, owner2, owner3] = await ethers.getSigners();

        const PairFactory = await ethers.getContractFactory("PairFactory");
        pairFactory = await upgrades.deployProxy(PairFactory, []);
        await pairFactory.deployed();
        console.log("PairFactory deployed to:", pairFactory.address);
        
        const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
        const veArtProxy = await upgrades.deployProxy(VeArtProxy, []);
  
        const EqualFactory = await ethers.getContractFactory("Equal");
        equal = await upgrades.deployProxy(EqualFactory, []);

        const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
        ve = await upgrades.deployProxy(VotingEscrow, [
            equal.address, veArtProxy.address
        ]);

        const RewardsDistributor = await ethers.getContractFactory("RewardsDistributor");
        const rewardsDistributor = await upgrades.deployProxy(RewardsDistributor, [ve.address]);
        await rewardsDistributor.deployed();

        const GaugeFactory = await ethers.getContractFactory("GaugeFactory");
        const gauge_factory = await upgrades.deployProxy(GaugeFactory, []);
        await gauge_factory.deployed();

        const BribeFactory = await ethers.getContractFactory("BribeFactory");
        const bribe_factory = await upgrades.deployProxy(BribeFactory, []);
        await bribe_factory.deployed();

        const Voter = await ethers.getContractFactory("Voter");
        voter = await upgrades.deployProxy(Voter, [
            ve.address, 
            pairFactory.address, 
            gauge_factory.address, 
            bribe_factory.address
        ]);
        await voter.deployed();

        const Minter = await ethers.getContractFactory("Minter");
        minter = await upgrades.deployProxy(Minter, [
            voter.address, ve.address, rewardsDistributor.address
        ]);
        await minter.deployed();
        console.log("Minter deployed to ", minter.address);

        const Router = await ethers.getContractFactory("Router");
        router = await Router.deploy(pairFactory.address, owner.address);
        await router.deployed();
        
        // Test token contract
        const Token = await ethers.getContractFactory("Token");
        usdt = await upgrades.deployProxy(Token, [
            'USDT', 'USDT', 6, owner.address
        ]);
        await usdt.mint(owner.address, ethers.utils.parseUnits("1000000", 6));
        await usdt.mint(owner2.address, ethers.utils.parseUnits("1000000", 6));
        await usdt.mint(owner3.address, ethers.utils.parseUnits("1000000", 6));
        mim = await upgrades.deployProxy(Token, [
            'MIM', 'MIM', 18, owner.address
        ]);
        await mim.mint(owner.address, ethers.utils.parseUnits("1000000", 18));
        await mim.mint(owner2.address, ethers.utils.parseUnits("1000000", 18));
        await mim.mint(owner3.address, ethers.utils.parseUnits("1000000", 18));
        dai = await upgrades.deployProxy(Token, [
            'DAI', 'DAI', 18, owner.address
        ]);
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

    describe("Create pair", () => {
        const usdt_1 = ethers.utils.parseUnits("1", 6);
        const mim_1 = ethers.utils.parseUnits("1", 18);
        const dai_1 = ethers.utils.parseUnits("1", 18);

        it("deploy pair via PairFactory owner", async () => {
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
    
        it("confirm pair for mim-usdt", async () => {
            const Pair = await ethers.getContractFactory("Pair");
            const create2address = await router.pairFor(mim.address, usdt.address, true);
            const address = await pairFactory.getPair(mim.address, usdt.address, true);
    
            pair = Pair.attach(address);
            expect(pair.address).to.equal(create2address);
            
            const create2address2 = await router.pairFor(mim.address, usdt.address, false);
            const address2 = await pairFactory.getPair(mim.address, usdt.address, false);
            pair2 = Pair.attach(address2);
            expect(pair2.address).to.equal(create2address2);
        });        
    });
    
    describe("Create gauge & bribe", () => {
        it("Create gauge & bribe", async function () {
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
            gauge = Gauge.attach(gauge_address);
            gauge2 = Gauge.attach(gauge_address2);
    
            const InternalBribe = await ethers.getContractFactory("InternalBribe");
            internal_bribe = InternalBribe.attach(internal_bribe_address);
            internal_bribe2 = InternalBribe.attach(internal_bribe_address2);
    
            const ExternalBribe = await ethers.getContractFactory("ExternalBribe");
            external_bribe = ExternalBribe.attach(external_bribe_address);
            external_bribe2 = ExternalBribe.attach(external_bribe_address2);
    
            await pair.approve(gauge.address, pair_1000);
            await gauge.deposit(pair_1000, 0);
    
            await pair2.approve(gauge2.address, pair_1000);
            await gauge2.deposit(pair_1000, 0);
    
            expect(await gauge.totalSupply()).to.equal(pair_1000);
            expect(await gauge.earned(ve.address, owner.address)).to.equal(0);
        });
    });

    describe("Create lock & Vote", async () => {
        before(async () => {
            await ve.setVoter(voter.address);
            await equal.setMinter(owner.address);
            const equalTokenAmount = ethers.utils.parseUnits("1000", 18);
            await equal.mint(owner2.address, equalTokenAmount);
        })
        it("Create lock", async () => {
            const lockAmount = ethers.utils.parseUnits("100", 18);
            const lockDuration = 13 * 7 * 24 * 3600;
            await equal.connect(owner2).approve(ve.address, lockAmount);
            expect(await ve.connect(owner2).create_lock(lockAmount, lockDuration)).to.be.emit(ve, "Deposit");
            expect(await equal.balanceOf(ve.address)).to.be.equal(lockAmount);
        });

        it("Vote", async () => {
            const tokenId = await ve.tokenOfOwnerByIndex(owner2.address, 0);
            console.log(await ve.balanceOfNFT(tokenId));
            await ve.connect(owner2).approve(voter.address, tokenId);
            await voter.connect(owner2).vote(tokenId, [pair.address], [10000]);
            console.log(await ve.balanceOfNFT(tokenId));
        });
    });

    describe("Whitelist", async () => {
        it("initial setup", async () => {
            const tokensToWhitelist = [
                "0x00a35FD824c717879BF370E70AC6868b95870Dfb"
                ,"0x02a2b736F9150d36C0919F3aCEE8BA2A92FBBb40"
                ,"0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
            ];
            await voter.initialSetup(tokensToWhitelist, minter.address);

            expect(await voter.isWhitelisted(tokensToWhitelist[0])).to.equal(true);
            expect(await voter.isWhitelisted(tokensToWhitelist[1])).to.equal(true);
            expect(await voter.isWhitelisted(tokensToWhitelist[2])).to.equal(true);
            expect(await voter.isWhitelisted(owner2.address)).to.equal(false);
        });

        it("whitelist additional tokens", async () => {
            const token1 = "0x14d6111dbfD64CEb9676a494BF86AA9f7DD54acC";
            await expect(
                voter.whitelist([token1])
            ).to.emit(voter, "Whitelisted").withArgs(owner.address, token1);

            const token2 = "0x00a35FD824c717879BF370E70AC6868b95870Dfb";
            await expect(
                voter.whitelist([token2])
            ).to.be.revertedWith("Already whitelisted");
        });

        it("remove from whitelist", async () => {
            const tokensToRemove = [
                "0x00a35FD824c717879BF370E70AC6868b95870Dfb"
                ,"0x02a2b736F9150d36C0919F3aCEE8BA2A92FBBb40",
                "0x488177c42bD58104618cA771A674Ba7e4D5A2FBB"
            ];
            await voter.removeFromWhitelist(tokensToRemove);
            expect(await voter.isWhitelisted(tokensToRemove[0])).to.equal(false);
        });
    });
});
