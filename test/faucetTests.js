const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { utils } = require("ethers");
const { ethers } = require('hardhat');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy();
    
    const [owner] = await ethers.getSigners();
    const providoooor = await ethers.getDefaultProvider();
    // let withdrawAmount = ethers.utils.parseUnits("1", "ether");
    let testAmount = ethers.parseEther("1");
    let withdrawAmount = ethers.parseUnits("1", "ether");
    let testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92265";

    console.log('Signer 1 address: ', owner.address);
    console.log('Amount to be withdrawn: ', withdrawAmount);
    return { faucet, owner, withdrawAmount, testAddress, providoooor };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });


  it('should check that only the owner can call #withdrawAll', async function () {
    const { faucet, testAddress } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.withdrawAll()).to.be.reverted;
  });

  it('should check that only the owner can call #destroyFaucet', async function () {
    const { faucet, testAddress } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.destroyFaucet()).to.be.reverted;
  });

  it('should check that #destroyFaucet actually destroys our contract', async function () {
    const { faucet, owner, providoooor } = await loadFixture(deployContractAndSetVariables);

    console.log('Deployed faucet contract address:', faucet.target);

    await faucet.destroyFaucet();

    expect(await providoooor.getCode(faucet.target)).to.equal('0x');
  });

  it('should check that #withdrawAll actually empties our contract', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);
    console.log('Deployed faucet contract address:', faucet.target);

    const balanceBeforeWithdraw = await ethers.provider.getBalance(faucet.target);

    await faucet.withdrawAll();
    const balanceAfterWithdraw = await ethers.provider.getBalance(faucet.target);

    expect(balanceBeforeWithdraw).to.be.equal(balanceAfterWithdraw);
  });
});