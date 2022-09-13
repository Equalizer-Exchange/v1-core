const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Core", function () {

  let owner, owner2, owner3;
  let token;
  let usdt, mim, dai, ve_underlying, late_reward;

  let ve; // VotingEscrow
  let factory;
  let router;
  let pair, pair2, pair3;

  let voter, rewardsDistributor, minter;
  let gauge, gauge2;
  let internal_bribe, internal_bribe2;

  before(async () => {
    [owner, owner2, owner3] = await ethers.getSigners();
    token = await ethers.getContractFactory("Token");

    usdt = await token.deploy('USDT', 'USDT', 6, owner.address);
    await usdt.mint(owner.address, ethers.BigNumber.from("1000000000000000000"));
    await usdt.mint(owner2.address, ethers.BigNumber.from("1000000000000000000"));
    await usdt.mint(owner3.address, ethers.BigNumber.from("1000000000000000000"));
    mim = await token.deploy('MIM', 'MIM', 18, owner.address);
    await mim.mint(owner.address, ethers.BigNumber.from("1000000000000000000000000000000"));
    await mim.mint(owner2.address, ethers.BigNumber.from("1000000000000000000000000000000"));
    await mim.mint(owner3.address, ethers.BigNumber.from("1000000000000000000000000000000"));
    dai = await token.deploy('DAI', 'DAI', 18, owner.address);
    await dai.mint(owner.address, ethers.BigNumber.from("1000000000000000000000000000000"));
    await dai.mint(owner2.address, ethers.BigNumber.from("1000000000000000000000000000000"));
    await dai.mint(owner3.address, ethers.BigNumber.from("1000000000000000000000000000000"));
    ve_underlying = await token.deploy('VE', 'VE', 18, owner.address);
    await ve_underlying.mint(owner.address, ethers.BigNumber.from("20000000000000000000000000"));
    await ve_underlying.mint(owner2.address, ethers.BigNumber.from("10000000000000000000000000"));
    await ve_underlying.mint(owner3.address, ethers.BigNumber.from("10000000000000000000000000"));
    late_reward = await token.deploy('LR', 'LR', 18, owner.address);
    await late_reward.mint(owner.address, ethers.BigNumber.from("20000000000000000000000000"));

    await usdt.deployed();
    await mim.deployed();
    await dai.deployed();
  });

  describe("VotingEscrow", () => {
    before(async() => {
      const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
      const veArtProxy = await VeArtProxy.deploy();
  
      const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
      ve = await VotingEscrow.deploy(ve_underlying.address, veArtProxy.address);
    });

    it("create lock", async function () {
      await ve_underlying.approve(ve.address, ethers.BigNumber.from("500000000000000000"));
      await ve.create_lock(ethers.BigNumber.from("500000000000000000"), 26 * 7 * 86400);
      // expect(await ve.balanceOfNFT(1)).to.above(ethers.BigNumber.from("495063075414519385"));
      expect(await ve_underlying.balanceOf(ve.address)).to.be.equal(ethers.BigNumber.from("500000000000000000"));
    });

    it("increase lock", async function () {
      await ve_underlying.approve(ve.address, ethers.BigNumber.from("500000000000000000"));
      await ve.increase_amount(1, ethers.BigNumber.from("500000000000000000"));
      await expect(ve.increase_unlock_time(1, 26 * 7 * 86400)).to.be.reverted;
      // expect(await ve.balanceOfNFT(1)).to.above(ethers.BigNumber.from("990298509348339878"));
      expect(await ve_underlying.balanceOf(ve.address)).to.be.equal(ethers.BigNumber.from("1000000000000000000"));
    });

    it("ve views", async function () {
      const block = await ve.block_number();
      expect(await ve.balanceOfAtNFT(1, block)).to.equal(await ve.balanceOfNFT(1));
      expect(await ve.totalSupplyAt(block)).to.equal(await ve.totalSupply());
  
      // expect(await ve.balanceOfNFT(1)).to.above(ethers.BigNumber.from("990298509348339878"));
      expect(await ve_underlying.balanceOf(ve.address)).to.be.equal(ethers.BigNumber.from("1000000000000000000"));
    });

    it("steal NFT", async function () {
      await expect(ve.connect(owner2).transferFrom(owner.address, owner2.address, 1)).to.be.reverted
      await expect(ve.connect(owner2).approve(owner2.address, 1)).to.be.reverted
      await expect(ve.connect(owner2).merge(1, 2)).to.be.reverted
    });

    it("ve merge", async function () {
      await ve_underlying.approve(ve.address, ethers.BigNumber.from("1000000000000000000"));
      await ve.create_lock(ethers.BigNumber.from("1000000000000000000"), 26 * 7 * 86400);
      // expect(await ve.balanceOfNFT(2)).to.above(ethers.BigNumber.from("990298191379271913"));
      expect(await ve_underlying.balanceOf(ve.address)).to.be.equal(ethers.BigNumber.from("2000000000000000000"));
      console.log(await ve.totalSupply());
      await ve.merge(2, 1);
      console.log(await ve.totalSupply());
      // expect(await ve.balanceOfNFT(1)).to.above(ethers.BigNumber.from("1990063075414519385"));
      expect(await ve.balanceOfNFT(2)).to.equal(ethers.BigNumber.from("0"));
      expect((await ve.locked(2)).amount).to.equal(ethers.BigNumber.from("0"));
      expect(await ve.ownerOf(2)).to.equal('0x0000000000000000000000000000000000000000');
      await ve_underlying.approve(ve.address, ethers.BigNumber.from("1000000000000000000"));
      await ve.create_lock(ethers.BigNumber.from("1000000000000000000"), 26 * 7 * 86400);
      // expect(await ve.balanceOfNFT(3)).to.above(ethers.BigNumber.from("995063075414519385"));
      expect(await ve_underlying.balanceOf(ve.address)).to.be.equal(ethers.BigNumber.from("3000000000000000000"));
      console.log(await ve.totalSupply());
      await ve.merge(3, 1);
      console.log(await ve.totalSupply());
      // expect(await ve.balanceOfNFT(1)).to.above(ethers.BigNumber.from("1990063075414519385"));
      expect(await ve.balanceOfNFT(3)).to.equal(ethers.BigNumber.from("0"));
      expect((await ve.locked(3)).amount).to.equal(ethers.BigNumber.from("0"));
      expect(await ve.ownerOf(3)).to.equal('0x0000000000000000000000000000000000000000');
    });
  });

  describe("PairFactory & Router", () => {
    before(async () => {
      const PairFactory = await ethers.getContractFactory("PairFactory");
      factory = await PairFactory.deploy();
      await factory.deployed();

      const Router = await ethers.getContractFactory("Router");
      router = await Router.deploy(factory.address, owner.address);
      await router.deployed();
    });

    it("test pair length", async() => {
      expect(await factory.allPairsLength()).to.equal(0);
    });
    
    it("test factory address", async function () {
      expect(await router.factory()).to.equal(factory.address);
    });

    it("deploy pair via PairFactory owner", async function () {
      const usdt_1 = ethers.BigNumber.from("1000000");
      const mim_1 = ethers.BigNumber.from("1000000000000000000");
      const dai_1 = ethers.BigNumber.from("1000000000000000000");
      await mim.approve(router.address, mim_1);
      await usdt.approve(router.address, usdt_1);
      await router.addLiquidity(mim.address, usdt.address, true, mim_1, usdt_1, 0, 0, owner.address, Date.now());
      await mim.approve(router.address, mim_1);
      await usdt.approve(router.address, usdt_1);
      await router.addLiquidity(mim.address, usdt.address, false, mim_1, usdt_1, 0, 0, owner.address, Date.now());
      await mim.approve(router.address, mim_1);
      await dai.approve(router.address, dai_1);
      await router.addLiquidity(mim.address, dai.address, true, mim_1, dai_1, 0, 0, owner.address, Date.now());
      expect(await factory.allPairsLength()).to.equal(3);
    });

    it("deploy pair via PairFactory owner2", async function () {
      const usdt_1 = ethers.BigNumber.from("1000000");
      const mim_1 = ethers.BigNumber.from("1000000000000000000");
      const dai_1 = ethers.BigNumber.from("1000000000000000000");
      await mim.connect(owner2).approve(router.address, mim_1);
      await usdt.connect(owner2).approve(router.address, usdt_1);
      await router.connect(owner2).addLiquidity(mim.address, usdt.address, true, mim_1, usdt_1, 0, 0, owner.address, Date.now());
      await mim.connect(owner2).approve(router.address, mim_1);
      await usdt.connect(owner2).approve(router.address, usdt_1);
      await router.connect(owner2).addLiquidity(mim.address, usdt.address, false, mim_1, usdt_1, 0, 0, owner.address, Date.now());
      await mim.connect(owner2).approve(router.address, mim_1);
      await dai.connect(owner2).approve(router.address, dai_1);
      await router.connect(owner2).addLiquidity(mim.address, dai.address, true, mim_1, dai_1, 0, 0, owner.address, Date.now());
      expect(await factory.allPairsLength()).to.equal(3);
    });

    it("confirm pair for mim-usdt", async function () {
      const create2address = await router.pairFor(mim.address, usdt.address, true);
      const Pair = await ethers.getContractFactory("Pair");
      const address = await factory.getPair(mim.address, usdt.address, true);
      const allpairs0 = await factory.allPairs(0);
      pair = await Pair.attach(address);
      const address2 = await factory.getPair(mim.address, usdt.address, false);
      pair2 = await Pair.attach(address2);
      const address3 = await factory.getPair(mim.address, dai.address, true);
      pair3 = await Pair.attach(address3);
  
      expect(pair.address).to.equal(create2address);
    });
  
    it("confirm tokens for mim-usdt", async function () {
      [token0, token1] = await router.sortTokens(usdt.address, mim.address);
      expect((await pair.token0()).toUpperCase()).to.equal(token0.toUpperCase());
      expect((await pair.token1()).toUpperCase()).to.equal(token1.toUpperCase());
    });
  
    it("mint & burn tokens for pair mim-usdt", async function () {
      const usdt_1 = ethers.BigNumber.from("1000000");
      const mim_1 = ethers.BigNumber.from("1000000000000000000");
      const before_balance = await usdt.balanceOf(owner.address);
      await usdt.transfer(pair.address, usdt_1);
      await mim.transfer(pair.address, mim_1);
      await pair.mint(owner.address);
      expect(await pair.getAmountOut(usdt_1, usdt.address)).to.equal(ethers.BigNumber.from("982024667941568835"));
      const output = await router.getAmountOut(usdt_1, usdt.address, mim.address);
      expect(await pair.getAmountOut(usdt_1, usdt.address)).to.equal(output.amount);
      expect(output.stable).to.equal(true);
      expect(await router.isPair(pair.address)).to.equal(true);
    });
  
    it("mint & burn tokens for pair mim-usdt owner2", async function () {
      const usdt_1 = ethers.BigNumber.from("1000000");
      const mim_1 = ethers.BigNumber.from("1000000000000000000");
      const before_balance = await usdt.balanceOf(owner.address);
      await usdt.connect(owner2).transfer(pair.address, usdt_1);
      await mim.connect(owner2).transfer(pair.address, mim_1);
      await pair.connect(owner2).mint(owner2.address);
      // expect(await pair.connect(owner2).getAmountOut(usdt_1, usdt.address)).to.equal(ethers.BigNumber.from("990378409267468270"));
    });
  
    it("Router addLiquidity", async function () {
      const usdt_1000 = ethers.BigNumber.from("100000000000");
      const mim_1000 = ethers.BigNumber.from("100000000000000000000000");
      const mim_100000000 = ethers.BigNumber.from("100000000000000000000000000");
      const dai_100000000 = ethers.BigNumber.from("100000000000000000000000000");
      const expected_2000 = ethers.BigNumber.from("2000000000000");
      await usdt.approve(router.address, usdt_1000);
      await mim.approve(router.address, mim_1000);
      const expected = await router.quoteAddLiquidity(mim.address, usdt.address, true, mim_1000, usdt_1000);
      await router.addLiquidity(mim.address, usdt.address, true, mim_1000, usdt_1000, expected.amountA, expected.amountB, owner.address, Date.now());
      await usdt.approve(router.address, usdt_1000);
      await mim.approve(router.address, mim_1000);
      await router.addLiquidity(mim.address, usdt.address, false, mim_1000, usdt_1000, mim_1000, usdt_1000, owner.address, Date.now());
      await dai.approve(router.address, dai_100000000);
      await mim.approve(router.address, mim_100000000);
      await router.addLiquidity(mim.address, dai.address, true, mim_100000000, dai_100000000, 0, 0, owner.address, Date.now());
    });
  
    it("Router removeLiquidity", async function () {
      const usdt_1000 = ethers.BigNumber.from("100000000000");
      const mim_1000 = ethers.BigNumber.from("100000000000000000000000");
      const mim_100000000 = ethers.BigNumber.from("100000000000000000000000000");
      const dai_100000000 = ethers.BigNumber.from("100000000000000000000000000");
      const expected_2000 = ethers.BigNumber.from("2000000000000");
      await usdt.approve(router.address, usdt_1000);
      await mim.approve(router.address, mim_1000);
      const expected = await router.quoteAddLiquidity(mim.address, usdt.address, true, mim_1000, usdt_1000);
      const output = await router.quoteRemoveLiquidity(mim.address, usdt.address, true, usdt_1000);
    });
  
    it("Router addLiquidity owner2", async function () {
      const usdt_1000 = ethers.BigNumber.from("100000000000");
      const mim_1000 = ethers.BigNumber.from("100000000000000000000000");
      const mim_100000000 = ethers.BigNumber.from("100000000000000000000000000");
      const dai_100000000 = ethers.BigNumber.from("100000000000000000000000000");
      const expected_2000 = ethers.BigNumber.from("2000000000000");
      await usdt.connect(owner2).approve(router.address, usdt_1000);
      await mim.connect(owner2).approve(router.address, mim_1000);
      await router.connect(owner2).addLiquidity(mim.address, usdt.address, true, mim_1000, usdt_1000, mim_1000, usdt_1000, owner.address, Date.now());
      await usdt.connect(owner2).approve(router.address, usdt_1000);
      await mim.connect(owner2).approve(router.address, mim_1000);
      await router.connect(owner2).addLiquidity(mim.address, usdt.address, false, mim_1000, usdt_1000, mim_1000, usdt_1000, owner.address, Date.now());
      await dai.connect(owner2).approve(router.address, dai_100000000);
      await mim.connect(owner2).approve(router.address, mim_100000000);
      await router.connect(owner2).addLiquidity(mim.address, dai.address, true, mim_100000000, dai_100000000, 0, 0, owner.address, Date.now());
    });
  
    it("Router pair1 getAmountsOut & swapExactTokensForTokens", async function () {
      const usdt_1 = ethers.BigNumber.from("1000000");
      const route = {from: usdt.address, to: mim.address, stable:true}
  
      expect((await router.getAmountsOut(usdt_1, [route]))[1]).to.be.equal(await pair.getAmountOut(usdt_1, usdt.address));
  
      const before = await mim.balanceOf(owner.address);
      const expected_output_pair = await pair.getAmountOut(usdt_1, usdt.address);
      const expected_output = await router.getAmountsOut(usdt_1, [route]);
      await usdt.approve(router.address, usdt_1);
      await router.swapExactTokensForTokens(usdt_1, expected_output[1], [route], owner.address, Date.now());
      const fees = await pair.fees()
      expect(await usdt.balanceOf(fees)).to.be.equal(200);
      const b = await usdt.balanceOf(owner.address);
      await pair.claimFees();
      expect(await usdt.balanceOf(owner.address)).to.be.above(b);
    });
  
    it("Router pair1 getAmountsOut & swapExactTokensForTokens owner2", async function () {
      const usdt_1 = ethers.BigNumber.from("1000000");
      const route = {from: usdt.address, to: mim.address, stable:true}
  
      expect((await router.getAmountsOut(usdt_1, [route]))[1]).to.be.equal(await pair.getAmountOut(usdt_1, usdt.address));
  
      const before = await mim.balanceOf(owner2.address);
      const expected_output_pair = await pair.getAmountOut(usdt_1, usdt.address);
      const expected_output = await router.getAmountsOut(usdt_1, [route]);
      await usdt.connect(owner2).approve(router.address, usdt_1);
      await router.connect(owner2).swapExactTokensForTokens(usdt_1, expected_output[1], [route], owner2.address, Date.now());
      const fees = await pair.fees()
      expect(await usdt.balanceOf(fees)).to.be.equal(201);
      const b = await usdt.balanceOf(owner.address);
      await pair.connect(owner2).claimFees();
      expect(await usdt.balanceOf(owner.address)).to.be.equal(b);
    });
  
    it("Router pair2 getAmountsOut & swapExactTokensForTokens", async function () {
      const usdt_1 = ethers.BigNumber.from("1000000");
      const route = {from: usdt.address, to: mim.address, stable:false}
  
      expect((await router.getAmountsOut(usdt_1, [route]))[1]).to.be.equal(await pair2.getAmountOut(usdt_1, usdt.address));
  
      const before = await mim.balanceOf(owner.address);
      const expected_output_pair = await pair.getAmountOut(usdt_1, usdt.address);
      const expected_output = await router.getAmountsOut(usdt_1, [route]);
      await usdt.approve(router.address, usdt_1);
      await router.swapExactTokensForTokens(usdt_1, expected_output[1], [route], owner.address, Date.now());
    });
  
    it("Router pair3 getAmountsOut & swapExactTokensForTokens", async function () {
      const mim_1000000 = ethers.BigNumber.from("1000000000000000000000000");
      const route = {from: mim.address, to:dai.address, stable:true}
  
      expect((await router.getAmountsOut(mim_1000000, [route]))[1]).to.be.equal(await pair3.getAmountOut(mim_1000000, mim.address));
  
      const before = await mim.balanceOf(owner.address);
      const expected_output_pair = await pair3.getAmountOut(mim_1000000, mim.address);
      const expected_output = await router.getAmountsOut(mim_1000000, [route]);
      await mim.approve(router.address, mim_1000000);
      await router.swapExactTokensForTokens(mim_1000000, expected_output[1], [route], owner.address, Date.now());
    });
  });

  describe("Voter", () => {
    before(async() => {
      const GaugeFactory = await ethers.getContractFactory("GaugeFactory");
      const gauge_factory = await GaugeFactory.deploy();
      await gauge_factory.deployed();

      const BribeFactory = await ethers.getContractFactory("BribeFactory");
      const bribe_factory = await BribeFactory.deploy();
      await bribe_factory.deployed();

      const Voter = await ethers.getContractFactory("Voter");
      voter = await Voter.deploy(
        ve.address, 
        factory.address, 
        gauge_factory.address, 
        bribe_factory.address
      );
      await voter.deployed();

      await ve.setVoter(voter.address);
    });

    it("Pools length is zero", async() => {
      expect(await voter.length()).to.equal(0);
    });

    it("createGauge", async() => {
      const pair_1000 = ethers.BigNumber.from("1000000000");

      await ve_underlying.approve(voter.address, ethers.BigNumber.from("1500000000000000000000000"));

      await voter.createGauge(pair.address);
      await voter.createGauge(pair2.address);

      expect(await voter.gauges(pair.address)).to.not.equal(0x0000000000000000000000000000000000000000);
      
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

      await pair.approve(gauge.address, pair_1000);
      await gauge.deposit(pair_1000, 0);

      await pair2.approve(gauge2.address, pair_1000);
      await gauge2.deposit(pair_1000, 0);

      expect(await gauge.totalSupply()).to.equal(pair_1000);
      expect(await gauge.earned(ve.address, owner.address)).to.equal(0);
    });

    it("veNFT gauge manipulate", async function () {
      const pair_1000 = ethers.BigNumber.from("1000000000");
      expect(await gauge.tokenIds(owner.address)).to.equal(0);
      
      await pair.approve(gauge.address, pair_1000);
      await gauge.deposit(pair_1000, 1);
      expect(await gauge.tokenIds(owner.address)).to.equal(1);

      await pair.approve(gauge.address, pair_1000);
      await expect(gauge.deposit(pair_1000, 2)).to.be.reverted;
      expect(await gauge.tokenIds(owner.address)).to.equal(1);

      await expect(gauge.withdrawToken(0, 2)).to.be.reverted;
      expect(await gauge.tokenIds(owner.address)).to.equal(1);
      await gauge.withdrawToken(0, 1);
      expect(await gauge.tokenIds(owner.address)).to.equal(0);
    });

    it("poke hacking", async function () {
      expect(await voter.usedWeights(1)).to.equal(0);
      expect(await voter.votes(1, pair.address)).to.equal(0);
      await voter.poke(1);
      expect(await voter.usedWeights(1)).to.equal(0);
      expect(await voter.votes(1, pair.address)).to.equal(0);
    });
  });

  describe("Minter", () => {
    before(async() => {
      const RewardsDistributor = await ethers.getContractFactory("RewardsDistributor");
      rewardsDistributor = await RewardsDistributor.deploy(ve.address);
      await rewardsDistributor.deployed();

      const Minter = await ethers.getContractFactory("Minter");
      minter = await Minter.deploy(voter.address, ve.address, rewardsDistributor.address);
      await minter.deployed();
      console.log("Minter deployed to ", minter.address);
      await rewardsDistributor.setDepositor(minter.address);
      await voter.initialize(
        [usdt.address, mim.address, dai.address, ve_underlying.address],
        minter.address
      );
    });

    it("initialize", async function () {
      await minter.initialize([owner2.address], [1000], 1000);
    });
  });
});
