const { ethers, upgrades } = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const axios = require('axios');

async function main() {
    const base = `https://docs.google.com/spreadsheets/d/1KkY6sb7Bx7kUitiVw6E4bdCrzsqloTjUYlSJcSpbJMs/gviz/tq?`;
    const sheetName = "List";
    const query = encodeURIComponent('Select *');
    const url = `${base}&sheet=${sheetName}&tq=${query}`;

    const { data: json } = await axios.get(url);

    // Remove additional text and extract only JSON:
    const jsonData = JSON.parse(json.substring(47).slice(0, -2));

    let whitelisted = [];
    // extract row data:
    jsonData.table.rows.forEach((rowData) => {
        whitelisted.push({
            address: (rowData.c[0].v).toString().trim(),
            level: parseInt(rowData.c[1].v)
        });
    });

    const leaves = whitelisted.map(item =>
        ethers.utils.keccak256(
            ethers.utils.solidityPack(['address', 'uint256'], [item.address, item.level])
        )
    );
    
    tree = new MerkleTree(leaves, ethers.utils.keccak256);
    const merkleRoot = tree.getHexRoot();

    const votingEscrowAddr = "0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94";
    const duration = 21;

    const MerkleClaim = await ethers.getContractFactory("MerkleClaim");
    const merkleClaim = await upgrades.deployProxy(MerkleClaim, [
        votingEscrowAddr, merkleRoot, duration
    ]);

    await merkleClaim.deployed();

    console.log("MerkleClaim deployed to:", merkleClaim.address);

    const startTime = 1668384000; // Monday, Nov 14 2022 0:00:00
    await merkleClaim.setStartTime(startTime);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
