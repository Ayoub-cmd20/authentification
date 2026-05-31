import { FileCheck2, SearchCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { Badge, Button, Card, EmptyState, Field, Input } from "../../components/ui";

export const PublicVerificationPage = () => {
  const { verificationCode } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(verificationCode));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!verificationCode) return;
    setLoading(true);
    setError("");
    api
      .get(`/public/verify/${verificationCode}`)
      .then((response) => setResult(response.data))
      .catch(() => setError("Verification code was not found."))
      .finally(() => setLoading(false));
  }, [verificationCode]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code"));
    navigate(`/verify/${code}`);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-civic/10 text-civic">
            <SearchCheck size={22} />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold text-navy">Public certificate verification</h1>
            <p className="mt-1 text-sm text-slate-500">Enter a Tawtheeq.dz verification code to confirm public-safe academic data.</p>
            <form onSubmit={onSubmit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field label="Verification code">
                <Input name="code" defaultValue={verificationCode} placeholder="TWQ-2026-XXXXXXXX" required />
              </Field>
              <Button className="self-end">Verify</Button>
            </form>
          </div>
        </div>
      </Card>
      <div className="mt-6">
        {loading && <Card>Checking verification record...</Card>}
        {error && !loading && <EmptyState title={error} />}
        {result && !loading && (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-algeria/10 text-algeria">
                  <FileCheck2 size={22} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Verification code</p>
                  <h2 className="text-xl font-bold text-navy">{result.verificationCode}</h2>
                </div>
              </div>
              <Badge status={result.certificateValidityStatus} />
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Student full name", result.studentFullName],
                ["Degree", result.degree],
                ["Specialty", result.specialty],
                ["Graduation year", result.graduationYear],
                ["University", result.university],
                ["Verification date", new Date(result.verificationDate).toLocaleString()],
                ["Blockchain network", result.blockchainNetwork ?? "Not configured"],
                ["Blockchain result", result.blockchainResult],
                ["Transaction hash", result.blockchainTxHash ?? "Not available"],
                ["Contract address", result.contractAddress ?? "Not available"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
                  <dd className="mt-1 break-all font-semibold text-slate-900">{value ?? "N/A"}</dd>
                </div>
              ))}
            </dl>
            {result.certificateValidityStatus === "BLOCKCHAIN_MISMATCH" && (
              <p className="mt-5 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-900">
                The database record and on-chain hashes do not match. Treat this certificate as invalid until reviewed.
              </p>
            )}
            {result.certificateValidityStatus === "REVOKED" && (
              <p className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                This certificate was revoked and is no longer valid.
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              {result.qrCodeUrl && <img src={result.qrCodeUrl} alt="Verification QR code" className="h-32 w-32 rounded-md border border-slate-200 bg-white p-2" />}
              <Button variant="secondary" className="no-print" onClick={() => window.print()}>
                Print result
              </Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
};
