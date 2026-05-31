import crypto from "node:crypto";

export class DigitalSignatureService {
  generatePdfHash(buffer: Buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  async requestDigitalSignature(pdfHash: string) {
    return {
      provider: "MVP_PLACEHOLDER",
      signatureStatus: "SEALED_PLACEHOLDER",
      requestedAt: new Date().toISOString(),
      pdfHash
    };
  }

  embedDigitalSeal(buffer: Buffer) {
    return buffer;
  }

  async verifyDigitalSignature(pdfHash: string, expectedHash: string) {
    return pdfHash === expectedHash;
  }
}

export const digitalSignatureService = new DigitalSignatureService();
