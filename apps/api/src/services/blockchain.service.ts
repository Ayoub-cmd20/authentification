import { Contract, JsonRpcProvider, Wallet, isAddress } from "ethers";
import { env } from "../config/env.js";
import { academicVerificationAbi } from "../contracts/AcademicVerification.abi.js";
import { AppError } from "../utils/errors.js";
import { sha256Hex } from "./hash.service.js";

type CertificateHashes = {
  verificationCodeHash: string;
  documentHash: string;
  studentHash: string;
  degreeHash: string;
};

const ensureBlockchainConfig = () => {
  if (!env.BLOCKCHAIN_ENABLED) {
    throw new AppError(503, "Blockchain integration is disabled");
  }
  if (!env.BLOCKCHAIN_PRIVATE_KEY) {
    throw new AppError(500, "BLOCKCHAIN_PRIVATE_KEY is not configured");
  }
  if (!env.BLOCKCHAIN_CONTRACT_ADDRESS || !isAddress(env.BLOCKCHAIN_CONTRACT_ADDRESS)) {
    throw new AppError(500, "BLOCKCHAIN_CONTRACT_ADDRESS is not configured");
  }
};

const getContract = () => {
  ensureBlockchainConfig();
  const provider = new JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
  const wallet = new Wallet(env.BLOCKCHAIN_PRIVATE_KEY!, provider);
  return new Contract(env.BLOCKCHAIN_CONTRACT_ADDRESS!, academicVerificationAbi, wallet);
};

export const registerCertificateOnChain = async (hashes: CertificateHashes) => {
  const contract = getContract();
  try {
    const tx = await contract.registerCertificate(
      hashes.verificationCodeHash,
      hashes.documentHash,
      hashes.studentHash,
      hashes.degreeHash
    );
    const receipt = await tx.wait(1);
    return receipt?.hash ?? tx.hash;
  } catch (error) {
    throw new AppError(502, `Blockchain registration failed: ${(error as Error).message}`);
  }
};

export const revokeCertificateOnChain = async (verificationCodeHash: string) => {
  const contract = getContract();
  try {
    const tx = await contract.revokeCertificate(verificationCodeHash);
    const receipt = await tx.wait(1);
    return receipt?.hash ?? tx.hash;
  } catch (error) {
    throw new AppError(502, `Blockchain revocation failed: ${(error as Error).message}`);
  }
};

export const verifyCertificateOnChain = async (verificationCodeHash: string) => {
  const contract = getContract();
  try {
    const certificate = await contract.verifyCertificate(verificationCodeHash);
    return {
      verificationCodeHash: certificate.verificationCodeHash as string,
      documentHash: certificate.documentHash as string,
      studentHash: certificate.studentHash as string,
      degreeHash: certificate.degreeHash as string,
      isValid: Boolean(certificate.isValid),
      registeredAt: Number(certificate.registeredAt),
      revokedAt: Number(certificate.revokedAt),
      registeredBy: certificate.registeredBy as string
    };
  } catch (error) {
    throw new AppError(502, `Blockchain verification failed: ${(error as Error).message}`);
  }
};

export const generateHash = (value: string | Buffer) => sha256Hex(value);

export const compareBlockchainRecord = (
  database: CertificateHashes,
  chain: CertificateHashes & { isValid?: boolean; registeredAt?: number }
) =>
  database.verificationCodeHash.toLowerCase() === chain.verificationCodeHash.toLowerCase() &&
  database.documentHash.toLowerCase() === chain.documentHash.toLowerCase() &&
  database.studentHash.toLowerCase() === chain.studentHash.toLowerCase() &&
  database.degreeHash.toLowerCase() === chain.degreeHash.toLowerCase();

export const blockchainMetadata = () => ({
  blockchainNetwork: env.BLOCKCHAIN_NETWORK,
  contractAddress: env.BLOCKCHAIN_CONTRACT_ADDRESS
});

export const isBlockchainEnabled = () => env.BLOCKCHAIN_ENABLED;
