const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MasterChef", function () {
  let owner, owner2, owner3;
  let equal, masterChef, ve, pairFactory, router;
  let usdt, mim, dai;
  let pair, pair2;

  const FOUR_WEEKS_IN_SECS = 28 * 24 * 60 * 60;
  const startTime = 1668643200; // Thursday, Nov 17, 2022 0:00:00;
  const endTime = startTime + FOUR_WEEKS_IN_SECS;

  const equalPerSecond = ethers.utils.parseUnits("0.2583498677", 18);

  before(async() => {
    // Contracts are deployed using the first signer/account by default
    [owner, owner2, owner3] = await ethers.getSigners();

    const Equal = await ethers.getContractFactory("Equal");
    equal = await upgrades.deployProxy(Equal, []);
    await equal.deployed();

    const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
    const veArtProxy = await upgrades.deployProxy(VeArtProxy, []);

    const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    ve = await upgrades.deployProxy(VotingEscrow, [equal.address, veArtProxy.address]);

    const PairFactory = await ethers.getContractFactory("PairFactory");
    pairFactory = await upgrades.deployProxy(PairFactory, []);
    await pairFactory.deployed();
    console.log("PairFactory deployed to:", pairFactory.address);

    const Router = await ethers.getContractFactory("Router");
    router = await Router.deploy(pairFactory.address, owner.address);
    await router.deployed();

    const MasterChef = await ethers.getContractFactory("MasterChef");
    masterChef = await upgrades.deployProxy(MasterChef, [
      ve.address,
      equalPerSecond,
      startTime,
      endTime
    ]);
    await masterChef.deployed();
    
    console.log("MasterChef deployed at ", masterChef.address);

    await equal.initialMint(masterChef.address);

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

  describe("Create pair", () => {
    const usdt_10 = ethers.utils.parseUnits("10", 6);
    const mim_10 = ethers.utils.parseUnits("10", 18);
    const dai_10 = ethers.utils.parseUnits("10", 18);

    it("deploy pair via PairFactory owner", async () => {
        await mim.approve(router.address, mim_10);
        await usdt.approve(router.address, usdt_10);
        await router.addLiquidity(
            mim.address, usdt.address, true, mim_10, usdt_10, 0, 0, owner.address, Date.now()
        );
        
        await mim.approve(router.address, mim_10);
        await usdt.approve(router.address, usdt_10);
        await router.addLiquidity(
            mim.address, usdt.address, false, mim_10, usdt_10, 0, 0, owner.address, Date.now()
        );
        
        await mim.approve(router.address, mim_10);
        await dai.approve(router.address, dai_10);
        await router.addLiquidity(
            mim.address, dai.address, true, mim_10, dai_10, 0, 0, owner.address, Date.now()
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

  describe("MasterChef", () => {
    it("should return right startTime & endTime", async () => {
      expect(await masterChef.startTime()).to.equal(startTime);
      expect(await masterChef.endTime()).to.equal(endTime);
    });

    it("should return right equalPerSecond", async() => {
      expect(await masterChef.equalPerSecond()).to.equal(equalPerSecond);
    });

    it("add lp pool", async () => {
      await masterChef.add(25, pair.address);
      await masterChef.add(75, pair2.address);

      expect(await masterChef.totalAllocPoint()).to.equal(100);
      console.log(await pair.balanceOf(owner.address));
    });

    it("update start & end time", async () => {
      const startTime = 1669248000;
      const duration = 28; // days
      await masterChef.setTime(startTime, duration);
      expect(await masterChef.endTime()).to.equal(startTime + duration * 24 * 3600);
    });

    it("deposit", async () => {
      await ethers.provider.send('evm_increaseTime', [14 * 24 * 3600]); // fast-forward 2 weeks
      await ethers.provider.send('evm_mine');
      const lpAmount = await pair.balanceOf(owner.address);
      await pair.approve(masterChef.address, lpAmount);
      await masterChef.deposit(0, lpAmount);
      expect(await pair.balanceOf(masterChef.address)).to.equal(lpAmount);
    });

    it("harvest reward", async() => {
      await ethers.provider.send('evm_increaseTime', [7 * 24 * 3600]); // fast-forward 1 week
      await ethers.provider.send('evm_mine');

      const calcReward = 0.2583498677 * 7 * 24 * 3600 * 25 * Math.pow(10, 8);
      expect(
        await masterChef.pendingEQUAL(0, owner.address)
      ).to.below(ethers.utils.parseUnits(calcReward.toString(), 18));

      await masterChef.harvestAll();
      expect(await masterChef.pendingEQUAL(0, owner.address)).to.equal(0);
      console.log(await ve.balanceOfNFT(1));
    });

    it("withdraw", async() => {
      const lpAmount = await pair.balanceOf(masterChef.address);
      await masterChef.withdraw(0, lpAmount);
      expect(await pair.balanceOf(masterChef.address)).to.equal(0);
    });
  });
});
