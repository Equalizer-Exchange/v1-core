const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { MerkleTree } = require('merkletreejs');

describe("Merkle claim for airdrop", () => {
    let owner, user1, user2, user3;
    let equal, merkleClaim;
    let whitelisted, tree;

    const claimDuration = 21; // 21 days

    before(async() => {
        [owner, user1, user2, user3] = await ethers.getSigners();
        const Equal = await ethers.getContractFactory("Equal");
        equal = await upgrades.deployProxy(Equal, []);

        const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
        const veArtProxy = await upgrades.deployProxy(VeArtProxy, []);
  
        const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
        ve = await upgrades.deployProxy(VotingEscrow, [equal.address, veArtProxy.address]);

        whitelisted = [
            { address: user1.address, level: 1},
            { address: user2.address, level: 2},
            { address: user3.address, level: 3}
        ];

        const leaves = whitelisted.map(item =>
            ethers.utils.keccak256(
                ethers.utils.solidityPack(['address', 'uint256'], [item.address, item.level])
            )
        );
        
        tree = new MerkleTree(leaves, ethers.utils.keccak256);
        const merkleRoot = tree.getHexRoot();
        console.log("MerkleRoot; ", merkleRoot);

        const MerkleClaim = await ethers.getContractFactory("MerkleClaim");
        merkleClaim = await upgrades.deployProxy(MerkleClaim, [
            ve.address, merkleRoot, claimDuration
        ]);
        await merkleClaim.deployed();

        console.log("MerkleClaim deployed at ", merkleClaim.address);
    });

    it("set startTime", async() => {
        const startTime = 1668384000; // Monday, Nov 14 2022 0:00:00
        await merkleClaim.setStartTime(startTime);

        expect(await merkleClaim.startTime()).to.equal(startTime);
    });

    it("transfer Equal into MerkleClaim contract", async() => {
        await equal.initialMint(owner.address);
        // transfer 20% of total mint amount into the MerkleClaim contract
        await equal.transfer(merkleClaim.address, ethers.utils.parseUnits("500000", 18));
        const balance = await equal.balanceOf(merkleClaim.address);
        expect(2500000 * 0.2).to.equal(parseInt(ethers.utils.formatUnits(balance, "18")));
    });

    it("user1 claim veEQUAL token", async() => {

        await ethers.provider.send('evm_increaseTime', [24 * 3600]); // fast-forward 24 hrs
        await ethers.provider.send('evm_mine');
        
        const boostAmount = await merkleClaim.boostAmount(whitelisted[0].level);
        const leaf = ethers.utils.keccak256(
            ethers.utils.solidityPack(['address', 'uint256'], [whitelisted[0].address, whitelisted[0].level])
        );
        const proof = tree.getHexProof(leaf);

        const veTokenId = 1; // will be first veEQUAL token mint so tokenId => 1
        expect(
            await merkleClaim.connect(user1).claim(user1.address, 1, proof)
        ).to.be.emit(merkleClaim, "Claim").withArgs(user1.address, boostAmount, veTokenId);
    });

    it("revert if user1 claims again", async() => {
        const leaf = ethers.utils.keccak256(
            ethers.utils.solidityPack(['address', 'uint256'], [whitelisted[0].address, whitelisted[0].level])
        );
        const proof = tree.getHexProof(leaf);
        await expect(
            merkleClaim.connect(user1).claim(whitelisted[0].address, whitelisted[0].level, proof)
        ).to.be.revertedWith("ALREADY_CLAIMED");
    });
});
