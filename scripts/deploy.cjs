const { ethers, network } = require("hardhat");

async function main() {
  const initialAdmins = (process.env.BLOCKCHAIN_INITIAL_ADMIN_WALLETS ?? "")
    .split(",")
    .map((wallet) => wallet.trim())
    .filter(Boolean);

  const AcademicVerification = await ethers.getContractFactory("AcademicVerification");
  const contract = await AcademicVerification.deploy(initialAdmins);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`AcademicVerification deployed to ${address} on ${network.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
