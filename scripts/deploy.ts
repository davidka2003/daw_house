// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { writeFileSync } from "fs";
import { ethers } from "hardhat";
import path from "path";
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Contract = await ethers.getContractFactory("DAW_house");
  const contract = await Contract.deploy();

  await contract.deployed();
  const address = contract.address;
  writeFileSync(
    path.join(__dirname, "../src/.env/contract-address.json"),
    JSON.stringify({ address })
  );
  console.log("deployed");
  let tx = await contract.setCondition({
    minDawBalance: 2,
    remainingSupply: 19,
    price: ethers.utils.parseEther("0"),
    wlPrice: ethers.utils.parseEther("0"),
    maxPerWallet: 1,
    notHoldersMintTimestamp: ~~((Date.now() - 1000) / 1000) /* + ONE_DAY */,
  });
  await tx.wait();
  tx = await contract.startMint();
  await tx.wait();
  console.log("Mint started");
  // console.log("Greeter deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
