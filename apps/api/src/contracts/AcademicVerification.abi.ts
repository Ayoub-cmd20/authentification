export const academicVerificationAbi = [
  {
    inputs: [{ internalType: "address[]", name: "initialAdmins", type: "address[]" }],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "verificationCodeHash", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "studentHash", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "degreeHash", type: "bytes32" },
      { indexed: true, internalType: "address", name: "registeredBy", type: "address" },
      { indexed: false, internalType: "uint256", name: "registeredAt", type: "uint256" }
    ],
    name: "CertificateRegistered",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "verificationCodeHash", type: "bytes32" },
      { indexed: true, internalType: "address", name: "revokedBy", type: "address" },
      { indexed: false, internalType: "uint256", name: "revokedAt", type: "uint256" }
    ],
    name: "CertificateRevoked",
    type: "event"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "verificationCodeHash", type: "bytes32" },
      { internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { internalType: "bytes32", name: "studentHash", type: "bytes32" },
      { internalType: "bytes32", name: "degreeHash", type: "bytes32" }
    ],
    name: "registerCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "verificationCodeHash", type: "bytes32" }],
    name: "revokeCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "verificationCodeHash", type: "bytes32" }],
    name: "verifyCertificate",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "verificationCodeHash", type: "bytes32" },
          { internalType: "bytes32", name: "documentHash", type: "bytes32" },
          { internalType: "bytes32", name: "studentHash", type: "bytes32" },
          { internalType: "bytes32", name: "degreeHash", type: "bytes32" },
          { internalType: "bool", name: "isValid", type: "bool" },
          { internalType: "uint256", name: "registeredAt", type: "uint256" },
          { internalType: "uint256", name: "revokedAt", type: "uint256" },
          { internalType: "address", name: "registeredBy", type: "address" }
        ],
        internalType: "struct AcademicVerification.Certificate",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;
