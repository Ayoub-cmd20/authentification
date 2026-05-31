# App Working Guide

This guide explains how to run and use the University Academic Path Authentication Platform.

## 1. Start the Database

The app uses PostgreSQL. Start it with Docker:

```bash
docker compose up -d
```

Check that PostgreSQL is reachable on port `5432`.

## 2. Prepare Environment Variables

Create `.env` from `.env.example` if it does not already exist:

```bash
cp .env.example .env
```

Important variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/university_auth_platform?schema=public"
JWT_SECRET="use-a-long-random-secret"
HASH_SECRET="use-a-different-long-random-secret"
WEB_APP_URL="http://localhost:5173"
BLOCKCHAIN_ENABLED=false
```

Keep `BLOCKCHAIN_ENABLED=false` until a smart contract is deployed and configured.

## 3. Install and Prepare the App

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

The seed command creates test accounts and a sample approved verification record.

## 4. Run the App

```bash
npm run dev
```

Open:

- Web app: http://localhost:5173
- API health check: http://localhost:4000/health

If the combined dev command has a process issue on Windows, run these in two terminals:

```bash
npm run dev:api
npm run dev:web
```

## 5. Test Accounts

Default password: `ChangeMe123!`

| Role | Email |
| --- | --- |
| Super Admin | `super.admin@uap.test` |
| University Admin | `university.admin@uap.test` |
| Student | `student@uap.test` |
| Institution | `institution@uap.test` |

## 6. Student Workflow

1. Log in as `student@uap.test`.
2. Open **Profile**.
3. Fill or review personal and academic information.
4. Open **Authentication file**.
5. Create a draft submission.
6. Upload required PDF documents:
   - Baccalaureate transcript
   - University transcripts
   - Graduation certificate
7. Submit the file.
8. Download the registration receipt.
9. Check notifications for status updates.

## 7. University Admin Workflow

1. Log in as `university.admin@uap.test`.
2. Open **Submissions**.
3. Review a student submission.
4. Download uploaded PDF documents.
5. Choose one action:
   - Approve
   - Reject
   - Mark incomplete
6. On approval, the backend generates:
   - verification code
   - QR code
   - verification hashes
   - blockchain transaction hash if blockchain is enabled
7. If blockchain is enabled, the admin can revoke a certificate from the same review page.

## 8. Institution Workflow

1. Log in as `institution@uap.test`.
2. Open **Verify graduate**.
3. Search by:
   - student registration number
   - national ID number
   - verification/certificate code
   - full name
4. View the verification result.
5. Print or download the verification PDF.
6. Open **Search history** to review previous searches.

## 9. Super Admin Workflow

1. Log in as `super.admin@uap.test`.
2. Open **Users** to activate or deactivate accounts.
3. Open **Institutions** to manage institution accounts.
4. Open **Requirements** to configure document requirements.
5. Open **Audit logs** to review security and workflow actions.

## 10. Public Verification Workflow

Open:

```text
http://localhost:5173/verify/:verificationCode
```

The page shows:

- student full name
- degree
- specialty
- graduation year
- university
- validity status
- blockchain network
- transaction hash
- contract address
- QR code

Possible statuses:

- `VALID`
- `INVALID`
- `REVOKED`
- `BLOCKCHAIN_MISMATCH`

## 11. Blockchain Local Development

Compile the contract:

```bash
npm run hardhat:compile
```

Start local blockchain:

```bash
npm run hardhat:node
```

Deploy contract:

```bash
npm run hardhat:deploy:local
```

Copy the deployed contract address into `.env`:

```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545"
BLOCKCHAIN_PRIVATE_KEY="one-local-hardhat-private-key"
BLOCKCHAIN_CONTRACT_ADDRESS="deployed-contract-address"
BLOCKCHAIN_NETWORK="hardhat"
```

Restart the API after changing blockchain environment variables.

## 12. Verification Commands

Use these commands to check the project:

```bash
npm run typecheck
npm run build
npm run hardhat:compile
npx prisma validate --schema apps/api/prisma/schema.prisma
```

Database check:

```bash
npx prisma migrate status --schema apps/api/prisma/schema.prisma
```

If this fails, PostgreSQL is probably not running or `DATABASE_URL` is wrong.

## 13. Common Problems

PostgreSQL is not reachable:

```bash
docker compose up -d
```

Prisma client is missing:

```bash
npm run prisma:generate
```

Database tables are missing:

```bash
npm run prisma:migrate
npm run db:seed
```

Blockchain verification says not configured:

Set `BLOCKCHAIN_ENABLED=true`, deploy the contract, set `BLOCKCHAIN_CONTRACT_ADDRESS`, and restart the API.

Never put private student data, PDFs, JWT secrets, hash secrets, or private keys in frontend code.
