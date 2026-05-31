import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, downloadFile } from "../../api/client";
import { AuditTimeline, Badge, BlockchainProofCard, Button, Card, Field, PageHeader, Textarea } from "../../components/ui";
import type { Submission } from "../../types";

export const SubmissionReviewPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [message, setMessage] = useState("");

  const load = () => api.get(`/admin/submissions/${id}`).then((response) => setSubmission(response.data));
  useEffect(() => {
    load();
  }, [id]);

  const act = async (endpoint: string, event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const adminNotes = event ? String(new FormData(event.currentTarget).get("adminNotes")) : undefined;
    const response = await api.post(`/admin/submissions/${id}/${endpoint}`, { adminNotes });
    setSubmission(response.data);
    setMessage("Action completed.");
  };

  const generate = async () => {
    const response = await api.post(`/admin/submissions/${id}/generate-verification`);
    setMessage(`Verification generated: ${response.data.verificationCode}`);
    await load();
  };

  const revoke = async (verificationId: string) => {
    const response = await api.post(`/admin/verification/${verificationId}/revoke`);
    setMessage(`Certificate revoked on blockchain. Transaction: ${response.data.blockchainTxHash ?? "record updated"}`);
    await load();
  };

  if (!submission) return <Card>Loading submission...</Card>;
  const student = submission.student;
  const verification = submission.verificationRecords?.[0];

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="University certification review"
        title={student?.user.fullName ?? "Submission review"}
        description="Review uploaded documents, mark missing requirements, approve or reject the request, and generate verification proof."
      />

      <Card>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Student academic profile</h2>
            <p className="text-sm text-muted">{student?.studentRegistrationNumber} - {student?.university}</p>
          </div>
          <Badge status={submission.status} />
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["National ID", student?.nationalId],
            ["Faculty", student?.faculty],
            ["Department", student?.department],
            ["Specialty", student?.specialty],
            ["Graduation year", student?.graduationYear],
            ["Degree", student?.degreeType]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-border bg-slate-50 p-3">
              <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
              <dd className="mt-1 font-semibold text-ink">{value ?? "N/A"}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <h3 className="font-bold text-ink">Uploaded PDF files</h3>
        <div className="mt-4 grid gap-3">
          {submission.documents.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-slate-50 p-3">
              <div>
                <p className="font-semibold text-ink">{doc.documentType.replaceAll("_", " ")}</p>
                <p className="text-sm text-muted">{doc.fileName}</p>
              </div>
              <Button variant="secondary" onClick={() => downloadFile(`/admin/submissions/${submission.id}/documents/${doc.id}/download`, doc.fileName)}>
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-ink">Review decision</h3>
        <form onSubmit={(event) => act("mark-incomplete", event)} className="mt-4 grid gap-4">
          <Field label="Administrative notes">
            <Textarea name="adminNotes" defaultValue={submission.adminNotes ?? ""} />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => act("approve")} disabled={submission.status === "COMPLETED"}>
              Approve
            </Button>
            <Button type="button" variant="danger" onClick={() => act("reject")}>
              Reject
            </Button>
            <Button variant="secondary">Mark incomplete</Button>
            <Button type="button" variant="secondary" onClick={generate} disabled={!["APPROVED", "COMPLETED", "VERIFIED"].includes(submission.status)}>
              Digitally certify
            </Button>
          </div>
        </form>
        {message && <p className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-civic">{message}</p>}
      </Card>

      {verification && (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.55fr]">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Latest verification code</p>
                <p className="mt-1 text-xl font-bold text-ink">{verification.verificationCode}</p>
              </div>
              <Badge status={verification.isValid ? "VALID" : "REVOKED"} />
            </div>
            <Button
              type="button"
              variant="danger"
              className="mt-5 w-fit"
              onClick={() => revoke(verification.id)}
              disabled={!verification.isValid || !verification.verificationCodeHash}
            >
              Revoke certificate
            </Button>
          </Card>
          <BlockchainProofCard
            network={verification.blockchainNetwork}
            txHash={verification.blockchainTxHash}
            contractAddress={verification.contractAddress}
            status={verification.isValid ? "Valid certification proof" : "Revoked certification proof"}
          />
        </div>
      )}

      <AuditTimeline
        items={[
          { title: "Submission received", time: submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "Draft" },
          { title: "Administrative review", body: submission.adminNotes ?? "No notes recorded yet." },
          { title: "Certification proof", body: verification ? "Verification record generated." : "Awaiting certification." }
        ]}
      />
    </div>
  );
};
