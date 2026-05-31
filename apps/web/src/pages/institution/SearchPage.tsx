import { FormEvent, useState } from "react";
import { api, downloadFile } from "../../api/client";
import { BlockchainProofCard, Button, Card, EmptyState, Field, Input, PageHeader, VerificationCard } from "../../components/ui";
import type { VerificationRecord } from "../../types";

export const SearchPage = () => {
  const [results, setResults] = useState<VerificationRecord[]>([]);
  const [searched, setSearched] = useState(false);

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q"));
    const response = await api.get("/institution/search", { params: { q } });
    setResults(response.data);
    setSearched(true);
  };

  const generateReport = async (verificationRecordId: string) => {
    const response = await api.post(`/institution/reports/${verificationRecordId}`);
    await downloadFile(`/institution/reports/${response.data.id}/download`, `${response.data.reportNumber}.pdf`);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Institution verifier dashboard"
        title="Verify document authenticity"
        description="Search by verification code, national ID, registration number, or graduate name. Results show certification status, blockchain proof, and digital report actions."
      />
      <Card>
        <h2 className="text-xl font-bold text-ink">Search verification record</h2>
        <p className="mt-1 text-sm text-muted">Scan a QR code externally or paste the verification code into this search field.</p>
        <form onSubmit={onSearch} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Field label="Search query">
            <Input name="q" placeholder="Registration number, national ID, certificate code, or name" required />
          </Field>
          <Button className="self-end">Search</Button>
        </form>
      </Card>
      {searched && !results.length && <EmptyState title="No valid record found" />}
      {results.map((record) => (
        <div key={record.id} className="grid gap-5 xl:grid-cols-[1fr_0.42fr]">
          <VerificationCard
            code={record.verificationCode}
            status={record.isValid ? "VALID" : "INVALID"}
            qrCodeUrl={record.qrCodeUrl}
            rows={[
              ["Student full name", record.student?.user.fullName],
              ["Degree", record.student?.degreeType],
              ["Specialty", record.student?.specialty],
              ["Graduation year", record.student?.graduationYear],
              ["University", record.student?.university],
              ["Verification date", new Date(record.generatedAt).toLocaleString()]
            ]}
          />
          <div className="grid gap-5">
            <BlockchainProofCard network={record.blockchainNetwork} txHash={record.blockchainTxHash} contractAddress={record.contractAddress} />
            <Card>
              <h3 className="font-bold text-ink">Report actions</h3>
              <div className="mt-4 grid gap-3">
                <Button variant="secondary" onClick={() => window.print()}>
                  Print result
                </Button>
                <Button variant="secondary" onClick={() => downloadFile(`/institution/verification/${record.id}/pdf`, `verification-${record.verificationCode}.pdf`)}>
                  Download PDF
                </Button>
                <Button onClick={() => generateReport(record.id)}>Generate official report</Button>
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};
