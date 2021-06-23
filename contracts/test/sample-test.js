const { expect } = require("chai");

describe("Transactions", function () {

  it("Should transfer tokens between accounts", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // const Token = await ethers.getContractFactory("Token");

    // const hardhatToken = await Token.deploy();
   
    // // Transfer 50 tokens from owner to addr1
    // await hardhatToken.transfer(addr1.address, 50);
    // expect(await hardhatToken.balanceOf(addr1.address)).to.equal(50);
    
    // // Transfer 50 tokens from addr1 to addr2
    // await hardhatToken.connect(addr1).transfer(addr2.address, 50);
    // expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
  });
});

describe("SetWinningPercentages", function() {

  it("Should return the new greeting once it's changed", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Pool = await ethers.getContractFactory("Pool");
    const args = { 
      gasLimit: 250000,
      gasPrice: 8000000000
    };

    console.log("E");
    const pool = await Pool.deploy(addr2.address, 3, [50, 40, 10], 28);
    console.log("E");
    await pool.deployed();

    // const value = 18;
    // var tx = await pool.connect(owner).setNextParticipantsForRound(value);
    // await tx.wait();

    // const percentageDistribution = [30, 50, 10, 10];
    // var tx = await pool.connect(owner).setWinningPercentages(percentageDistribution);
    // await tx.wait();
    
    const results = await pool.getWinningPercentages();
    console.log(results.winningList);
    console.log(results.participants.toString());
    console.log(results.ticketPrice.toString());

    // var tx = await pool.buyTicket(1, { value: "20000000000000000000"});
    // await tx.wait();


    // var tx = await pool.connect(addr1).buyTicket(1, { value: "20000000000000000000"});
    // await tx.wait();
    
    // const results = await pool.setWinningPercentages(addr1.address);
  });
});
