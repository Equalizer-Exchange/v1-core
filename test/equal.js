const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Equal Token Test Suite", () => {
    let equal;
    let minter, minter2, recipient, user;

    before(async () => {
        [minter, minter2, recipient, user] = await ethers.getSigners();

        const Equal = await ethers.getContractFactory("Equal");
        equal = await Equal.deploy();
        await equal.deployed();

        console.log(equal.address);
    });

    describe("Initial Mint", () => {
        it("initialMint", async() => {
            await equal.initialMint(recipient.address);
            expect(await equal.initialMinted()).to.be.equal(true);
            expect(await equal.balanceOf(recipient.address)).to.be.equal(
                ethers.utils.parseUnits("2500000", 18)
            );
        });

        it("reverts if the caller is not a minter or it is already initialized", async() => {
            await expect(
                equal.connect(user).initialMint(recipient.address)
            ).to.be.revertedWith("Not minter or already initialized");

            await expect(
                equal.initialMint(recipient.address)
            ).to.be.revertedWith("Not minter or already initialized");
        });
    });

    describe("Set minter", () => {
        it("reverts if the caller is not a minter", async() => {
            await expect(
                equal.connect(user).setMinter(minter2.address)
            ).to.be.revertedWith("Not minter");
        });

        it("set minter", async() => {
            await equal.setMinter(minter2.address);
            expect(await equal.minter()).to.equal(minter2.address);
        });
    });

    describe("Mint", () => {
        it("reverts if the caller is not a minter", async() => {
            await expect(
                equal.connect(minter).mint(user.address, ethers.utils.parseUnits("10000", 18))
            ).to.be.revertedWith("Not minter");
        });

        it("mint successfully", async() => {
            await equal.connect(minter2).mint(user.address, ethers.utils.parseUnits("10000", 18));
            expect(await equal.balanceOf(user.address)).to.equal(ethers.utils.parseUnits("10000", 18));
        });
    });
});
