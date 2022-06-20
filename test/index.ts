import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { DAWHouse } from "../src/types/typechain/DAWHouse";

const ONE_DAY = 1000 * 60 * 60 * 24;
describe("DAW_house", () => {
  let contract: DAWHouse;
  let signer1: Signer;
  let condition = [
    1, //daw balance
    19, //supply
    0, //price
    0, //wlprice
    1, //max per wallet
    Date.now() + ONE_DAY, //not holders mint after
  ];
  it("Deploy DAW_house", async () => {
    signer1 = (await ethers.getSigners())[0];
    const Contract = await ethers.getContractFactory("DAW_house");
    contract = (await Contract.deploy()) as DAWHouse;
    await contract.deployed();
  });
  it("Set condition", async () => {
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
    console.log(
      await contract.mintConditions((await contract.mintId()).sub(1))
    );
  });
  it("Mint", async () => {
    let tx = await contract.mint(1);
    await tx.wait();
    expect(
      (
        await contract.accounts(
          (await contract.mintId()).sub(1),
          await signer1.getAddress()
        )
      ).balance.toNumber()
    ).to.equal(1);
  });
});
// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });
