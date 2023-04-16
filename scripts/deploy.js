const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Contract deployer address : ", deployer.address);
  //Get the sfnMarket smart contract object and deploy it
  const sfnMarket = await ethers.getContractFactory("sfnMarket");
  console.log("Deploying...");
  const sfnmarket = await sfnMarket.deploy();
  console.log("Contract deployed!");
  await sfnmarket.deployed();
  console.log("Contract deployed successfully!");

  //Pull the address and ABI out while you deploy, since that will be key in interacting with the smart contract later
  const data = {
    address: sfnmarket.address,
    abi: JSON.parse(sfnmarket.interface.format("json")),
  };

  //This writes the ABI and address to the sfnMarket.json
  //This data is then used by frontend files to connect with the smart contract
  fs.writeFileSync("./pages/sfnMarket.json", JSON.stringify(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
