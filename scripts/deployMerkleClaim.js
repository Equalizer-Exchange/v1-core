const hre = require("hardhat");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs');

async function main() {
    const whitelisted = [
        { address: "0x488177c42bD58104618cA771A674Ba7e4D5A2FBB", level: 1},
        { address: "0xa064B34DC0aEeF23e48B400DC4b0A3f940B55865", level: 2},
        { address: "0x87682fEE6dbC7A4475b5E1352c7C663306B2e028", level: 3}
    ];

    const leaves = whitelisted.map(item =>
        ethers.utils.keccak256(
            ethers.utils.solidityPack(['address', 'uint256'], [item.address, item.level])
        )
    );
    
    tree = new MerkleTree(leaves, ethers.utils.keccak256);
    const merkleRoot = tree.getHexRoot();
    console.log("MerkleRoot; ", merkleRoot);

    const votingEscrowAddr = "0x416ad61485bfA706f6E45fB3C4a996F3B1c4F942";
    const duration = 21;

    const MerkleClaim = await hre.ethers.getContractFactory("MerkleClaim");
    const merkleClaim = await MerkleClaim.deploy(votingEscrowAddr, merkleRoot, duration);

    await merkleClaim.deployed();

    console.log("MerkleClaim deployed to:", merkleClaim.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
