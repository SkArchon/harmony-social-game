const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Pool = await hre.ethers.getContractFactory("Pool");

  const args = { 
    gasLimit: 25000000,
    gasPrice: 8000000000
  };

  const daoAddress = "0x2758e3bB32BcB882e9dfa5A23CAb10f137C4c218";
  const participantCount = 3;
  const winningPercentages = [50, 40, 10];
  const ticketPrice = 28;
  
  const pool = await Pool.deploy(
    daoAddress,
    participantCount,
    winningPercentages,
    ticketPrice,
    args
  );

  await pool.deployed();

  console.log("Pool deployed to:", pool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
