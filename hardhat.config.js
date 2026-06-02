import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const privateKey = (process.env.BLOCKCHAIN_PRIVATE_KEY ?? "").replaceAll('"', "").trim();
const normalizedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
const accounts = /^0x[0-9a-fA-F]{64}$/.test(normalizedPrivateKey) ? [normalizedPrivateKey] : [];
const sepoliaUrl = (process.env.SEPOLIA_RPC_URL ?? "").trim();
const amoyUrl = (process.env.POLYGON_AMOY_RPC_URL ?? "").trim();

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
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
    hardhat: {
      type: "edr-simulated",
      chainType: "l1"
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: process.env.LOCAL_BLOCKCHAIN_RPC_URL ?? "http://127.0.0.1:8545"
    },
    ...(sepoliaUrl
      ? {
          sepolia: {
            type: "http",
            chainType: "l1",
            url: sepoliaUrl,
            accounts
          }
        }
      : {}),
    ...(amoyUrl
      ? {
          amoy: {
            type: "http",
            chainType: "l1",
            url: amoyUrl,
            accounts
          }
        }
      : {})
  }
};

export default config;
