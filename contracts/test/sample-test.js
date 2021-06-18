const { expect } = require("chai");

describe("Pool", function() {
  it("Should return the new greeting once it's changed", async function() {
    const Pool = await ethers.getContractFactory("Pool");
    const pool = await Pool.deploy();
    await pool.deployed();

    var tx = await pool.buyTicket(1, { value: "20000000000000000000"});
    await tx.wait();

    console.log("AA");



    var tx = await pool.buyTicket(1, { value: "20000000000000000000"});
    await tx.wait();
    

    // var tx = await pool.buyTicket(1, { value: "20000000000000000000"});
    // await tx.wait();

    console.log("EE");


    const results = await pool.getDetails();
    console.log(results.currentParticipants.toString());
    console.log(results.amount.toString());
    // expect(await pool.getDetails()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
    
    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
