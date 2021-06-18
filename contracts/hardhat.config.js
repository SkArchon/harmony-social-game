require("@nomiclabs/hardhat-waffle");

// const privateKeyTest = '0xd1f3cba686a684dac926890ec3553103112d8a7ebce335c4eaabb1d7378b104f';
const HARMONY_PRIVATE_KEY = "0xd1f3cba686a684dac926890ec3553103112d8a7ebce335c4eaabb1d7378b104f";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.1",
  defaultNetwork: "testnet",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true
    },
    testnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: [HARMONY_PRIVATE_KEY]
    },
    // mainnet: {
    //   url: `https://api.s0.t.hmny.io`,
    //   accounts: [HARMONY_PRIVATE_KEY]
    // }
  },
};

