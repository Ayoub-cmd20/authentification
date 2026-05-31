// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AcademicVerification {
    address public owner;

    struct Certificate {
        bytes32 verificationCodeHash;
        bytes32 documentHash;
        bytes32 studentHash;
        bytes32 degreeHash;
        bool isValid;
        uint256 registeredAt;
        uint256 revokedAt;
        address registeredBy;
    }

    mapping(address => bool) public authorizedIssuers;
    mapping(bytes32 => Certificate) private certificates;

    event CertificateRegistered(
        bytes32 indexed verificationCodeHash,
        bytes32 documentHash,
        bytes32 studentHash,
        bytes32 degreeHash,
        address indexed registeredBy,
        uint256 registeredAt
    );

    event CertificateRevoked(
        bytes32 indexed verificationCodeHash,
        address indexed revokedBy,
        uint256 revokedAt
    );

    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(msg.sender == owner || authorizedIssuers[msg.sender], "Not authorized");
        _;
    }

    constructor(address[] memory initialAdmins) {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        emit IssuerAdded(msg.sender);

        for (uint256 i = 0; i < initialAdmins.length; i++) {
            authorizedIssuers[initialAdmins[i]] = true;
            emit IssuerAdded(initialAdmins[i]);
        }
    }

    function addIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    function removeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    function setAuthorizedAdmin(address admin, bool isAuthorized) external onlyOwner {
        authorizedIssuers[admin] = isAuthorized;
        if (isAuthorized) {
            emit IssuerAdded(admin);
        } else {
            emit IssuerRemoved(admin);
        }
    }

    function registerCertificate(
        bytes32 verificationCodeHash,
        bytes32 documentHash,
        bytes32 studentHash,
        bytes32 degreeHash
    ) external onlyAuthorizedIssuer {
        require(verificationCodeHash != bytes32(0), "Code hash required");
        require(documentHash != bytes32(0), "Document hash required");
        require(studentHash != bytes32(0), "Student hash required");
        require(degreeHash != bytes32(0), "Degree hash required");
        require(certificates[verificationCodeHash].registeredAt == 0, "Already registered");

        certificates[verificationCodeHash] = Certificate({
            verificationCodeHash: verificationCodeHash,
            documentHash: documentHash,
            studentHash: studentHash,
            degreeHash: degreeHash,
            isValid: true,
            registeredAt: block.timestamp,
            revokedAt: 0,
            registeredBy: msg.sender
        });

        emit CertificateRegistered(
            verificationCodeHash,
            documentHash,
            studentHash,
            degreeHash,
            msg.sender,
            block.timestamp
        );
    }

    function verifyCertificate(bytes32 verificationCodeHash) external view returns (Certificate memory) {
        return certificates[verificationCodeHash];
    }

    function revokeCertificate(bytes32 verificationCodeHash) external onlyAuthorizedIssuer {
        Certificate storage certificate = certificates[verificationCodeHash];
        require(certificate.registeredAt != 0, "Not registered");
        require(certificate.isValid, "Already revoked");

        certificate.isValid = false;
        certificate.revokedAt = block.timestamp;

        emit CertificateRevoked(verificationCodeHash, msg.sender, block.timestamp);
    }
}
