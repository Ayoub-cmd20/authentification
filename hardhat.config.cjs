require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

const privateKey = (process.env.BLOCKCHAIN_PRIVATE_KEY ?? "").replaceAll('"', "").trim();
const normalizedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
const accounts = /^0x[0-9a-fA-F]{64}$/.test(normalizedPrivateKey) ? [normalizedPrivateKey] : [];

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    localhost: {
      url: process.env.LOCAL_BLOCKCHAIN_RPC_URL ?? "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL ?? "",
      accounts
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL ?? "",
      accounts
    }
  }
};
