const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const axios = require('axios');

describe("Merkle claim for airdrop", () => {
    let owner, user1, user2, user3;
    let equal, merkleClaim;
    let whitelisted = [], tree;

    const claimDuration = 21; // 21 days

    const base = `https://docs.google.com/spreadsheets/d/1KkY6sb7Bx7kUitiVw6E4bdCrzsqloTjUYlSJcSpbJMs/gviz/tq?`;
    const sheetName = "List";
    const query = encodeURIComponent('Select *');
    const url = `${base}&sheet=${sheetName}&tq=${query}`;

    before(async() => {
        [owner, user1, user2, user3] = await ethers.getSigners();
        const Equal = await ethers.getContractFactory("Equal");
        equal = await upgrades.deployProxy(Equal, []);

        const VeArtProxy = await ethers.getContractFactory("VeArtProxy");
        const veArtProxy = await upgrades.deployProxy(VeArtProxy, []);
  
        const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
        ve = await upgrades.deployProxy(VotingEscrow, [equal.address, veArtProxy.address]);


        const { data: json } = await axios.get(url);

        // Remove additional text and extract only JSON:
        const jsonData = JSON.parse(json.substring(47).slice(0, -2));

        // extract row data:
        jsonData.table.rows.forEach((rowData) => {
            whitelisted.push({
                address: (rowData.c[0].v).toString().trim(),
                level: parseInt(rowData.c[1].v)
            });
        });

        whitelisted.unshift(
            { address: user1.address, level: 1 }
        );

        const leaves = whitelisted.map(item =>
            ethers.utils.keccak256(
                ethers.utils.solidityPack(['address', 'uint256'], [item.address, item.level])
            )
        );
        
        tree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
        let merkleRoot = tree.getHexRoot();
        console.log("MerkleRoot; ", merkleRoot);

        const MerkleClaim = await ethers.getContractFactory("MerkleClaim");
        merkleClaim = await upgrades.deployProxy(MerkleClaim, [
            ve.address, merkleRoot, claimDuration
        ]);
        await merkleClaim.deployed();

        console.log("MerkleClaim deployed at ", merkleClaim.address);
    });

    it("set startTime", async() => {
        const startTime = 1668988800; // Monday, Nov 21 2022 0:00:00
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

        await ethers.provider.send('evm_increaseTime', [7 * 24 * 3600]); // fast-forward 7 days
        await ethers.provider.send('evm_mine');
        
        const boostAmount = await merkleClaim.boostAmount(whitelisted[0].level);
        const leaf = ethers.utils.keccak256(
            ethers.utils.solidityPack(['address', 'uint256'], 
            [whitelisted[0].address, whitelisted[0].level])
        );
        const proof = tree.getHexProof(leaf);

        const veTokenId = 1; // will be first veEQUAL token mint so tokenId => 1

        expect(
            await merkleClaim.connect(user1).claim(user1.address, 1, proof)
        ).to.be.emit(merkleClaim, "Claim")
        .withArgs(user1.address, boostAmount, veTokenId);
    });

    it("revert if user1 claims again", async() => {
        const leaf = ethers.utils.keccak256(
            ethers.utils.solidityPack(['address', 'uint256'], 
            [whitelisted[0].address, whitelisted[0].level])
        );
        const proof = tree.getHexProof(leaf);
        await expect(
            merkleClaim.connect(user1).claim(
                whitelisted[0].address, whitelisted[0].level, proof
            )
        ).to.be.revertedWith("ALREADY_CLAIMED");
    });
});
