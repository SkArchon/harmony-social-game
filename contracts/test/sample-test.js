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

describe("Pool", function() {

  it("Should return the new greeting once it's changed", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Pool = await ethers.getContractFactory("Pool");
    const pool = await Pool.deploy(addr2.address);
    await pool.deployed();

    var tx = await pool.buyTicket(1, { value: "20000000000000000000"});
    await tx.wait();

    console.log("AA");

    var tx = await pool.connect(addr1).buyTicket(1, { value: "20000000000000000000"});
    await tx.wait();
    

    // var tx = await pool.buyTicket(1, { value: "20000000000000000000"});
    // await tx.wait();

    console.log("EE");


    const results = await pool.getDetails(addr1.address);
    console.log(results.currentParticipants.toString());
    console.log(results.amount.toString());
    // expect(await pool.getDetails()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
    
    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
