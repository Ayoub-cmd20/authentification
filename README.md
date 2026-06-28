# Tawtheeq.dz - منصة توثيق

Tawtheeq.dz is a production-ready MVP for Algerian digital university authentication. It connects students, university administrators, public/private institutions, ministry administrators, and super administrators to digitize academic path authentication, diploma verification, secure archiving, PDF receipts, QR verification, and hash-only blockchain proof.

Slogan: `الجسر الرقمي بين الجامعة، الخريج، وعالم الشغل`

## Features

- Role-based dashboards for Student, University Admin, Institution/Company, Ministry Admin, and Super Admin.
- Student registration with unique email/NIN, profile management, PDF upload, document checklist validation, missing document tracking, smart receipt PDF, notifications, and mock payment.
- University workflow for review, incomplete/reject/approve/archive actions, mock Progress validation, verification code generation, QR metadata, blockchain registration, and secure file download.
- Institution workflow for annual subscription tiers, rate-limited search, masked sensitive data, search history, PDF verification reports, and placeholder digital seal metadata.
- Ministry dashboard for national statistics, university performance, audit logs, and CSV export.
- Super admin tools for users, roles, account status, institutions, subscriptions, document requirements, settings, and audit logs.
- Public `/verify/:verificationCode` page and API with database/blockchain comparison states: `VALID`, `INVALID`, `REVOKED`, `BLOCKCHAIN_MISMATCH`, `NOT_FOUND`.

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, Axios, Tailwind CSS, shadcn-style UI primitives, i18n-ready locale files.
- Backend: Node.js, Express.js, TypeScript, Prisma ORM, Zod validation.
- Database: PostgreSQL.
- Files: AES-256-GCM encrypted local storage for development, service boundary ready for MinIO/cloud object storage.
- PDF/QR: PDFKit and QRCode.
- Blockchain: Solidity, Hardhat, Ethers.js, local Hardhat network, Sepolia/Polygon Amoy-ready config.
- Security: JWT, bcrypt, RBAC middleware, rate limiting, secure headers, CORS, PDF-only validation, audit logs, environment secrets, hash-only on-chain data.

## Project Structure

```text
apps/api
  prisma/schema.prisma
  prisma/seed.ts
  src/config
  src/middleware
  src/routes
  src/services
apps/web
  src/api
  src/components
  src/contexts
  src/layouts
  src/locales
  src/pages
contracts/AcademicVerification.sol
scripts/deploy.cjs
```

## Installation

```bash
npm install
cp .env.example .env
npm run prisma:generate
```

## Environment

Set strong server-only secrets in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/university_auth_platform?schema=public"
JWT_SECRET="replace-with-a-long-random-secret-at-least-32-chars"
HASH_SECRET="replace-with-a-long-random-hash-secret"
FILE_ENCRYPTION_KEY="replace-with-a-long-random-file-encryption-secret"
WEB_APP_URL="http://localhost:5173"
BLOCKCHAIN_ENABLED=false
BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545"
BLOCKCHAIN_PRIVATE_KEY=""
BLOCKCHAIN_CONTRACT_ADDRESS=""
BLOCKCHAIN_NETWORK="hardhat"
```

Never place private keys in frontend code. Tawtheeq stores only cryptographic hashes and verification metadata on-chain.

## Database

```bash
docker compose up -d
npm run prisma:migrate
npm run db:seed
```

Seed accounts use `Tawtheeq2026!Secure` unless overridden:

| Role | Email |
| --- | --- |
| Super Admin | `super.admin@tawtheeq.example` |
| Ministry Admin | `ministry.admin@tawtheeq.example` |
| University Admin | `university.admin@tawtheeq.example` |
| Student | `student@tawtheeq.example` |
| Institution | `institution@tawtheeq.example` |

## Run

```bash
npm run dev
```

- Web: http://localhost:5173
- API health: http://localhost:4000/health

## Blockchain

Compile:

```bash
npm run hardhat:compile
```

Run local chain and deploy:

```bash
npm run hardhat:node
npm run hardhat:deploy:local
```

For Sepolia or Polygon Amoy, configure RPC URLs and a funded issuer wallet, then run:

```bash
npm run hardhat:deploy:sepolia
npm run hardhat:deploy:amoy
```

`AcademicVerification.sol` supports owner, authorized issuers, `registerCertificate`, `verifyCertificate`, `revokeCertificate`, `addIssuer`, and `removeIssuer`.

## Key API Routes

- Auth: `/api/auth/register/student`, `/api/auth/register/institution`, `/api/auth/login`, `/api/auth/me`
- Student: `/api/student/profile`, `/api/student/submissions`, `/api/student/submissions/:id/documents`, `/api/student/submissions/:id/submit`, `/api/student/submissions/:id/receipt`, `/api/student/payments`
- Payments: `/api/payments/create`, `/api/payments/mock-success`, `/api/payments/:id`
- University Admin: `/api/admin/submissions`, `/api/admin/submissions/:id/approve`, `/api/admin/submissions/:id/reject`, `/api/admin/submissions/:id/mark-incomplete`, `/api/admin/submissions/:id/archive`
- Institution: `/api/institution/subscription`, `/api/institution/search`, `/api/institution/verification-history`, `/api/institution/reports/:verificationRecordId`
- Ministry: `/api/ministry/stats`, `/api/ministry/stats/universities`, `/api/ministry/audit-logs`, `/api/ministry/export`
- Super Admin: `/api/super-admin/users`, `/api/super-admin/users/:id/status`, `/api/super-admin/users/:id/role`, `/api/super-admin/institutions`, `/api/super-admin/settings`
- Public: `/api/public/verify/:verificationCode`, `/api/public/verify/:verificationCode/report`
- Blockchain: `/api/blockchain/verify/:verificationCode`, `/api/blockchain/revoke/:verificationCode`

## Future Integrations

- Progress API via `ProgressIntegrationService`.
- GIE Monétique, Edahabia, and CIB via the payment service boundary.
- Algerian electronic certification authority via `DigitalSignatureService`.
- MinIO encrypted object storage via the storage service boundary.
- Mobile QR scanner app that consumes public verification endpoints.

## Verification Commands

These passed locally:

```bash
npm run typecheck
npm run build
npm run hardhat:compile
```
