import { useEffect, useState } from "react";
import { ClipboardCheck, FileText, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { api, downloadFile } from "../../api/client";
import { AuditTimeline, Badge, Button, Card, EmptyState, FeatureCard, PageHeader } from "../../components/ui";
import type { Submission } from "../../types";

export const StudentOverview = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  useEffect(() => {
    api.get("/student/submissions").then((response) => setSubmissions(response.data));
  }, []);
  const latest = submissions[0];

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Student dashboard"
        title="Request document certification"
        description="Upload academic PDFs, track review status, complete payment, and download your AcadVerify DZ receipt."
        actions={
          <Link to="/student/submission">
            <Button>
              <ClipboardCheck size={16} />
              Request Certification
            </Button>
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard icon={FileText} title="Upload PDF documents" body="Submit transcripts, graduation certificates, and supporting documents." />
        <FeatureCard icon={ShieldCheck} title="Track certification" body="Follow status from draft to university review and verified certification." />
        <FeatureCard icon={QrCode} title="Use QR verification" body="Share verification codes and QR-ready proof after approval." />
      </div>
      {latest ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Latest submission</p>
              <p className="font-semibold">{latest.id}</p>
            </div>
            <Badge status={latest.status} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-muted">Documents</p>
              <p className="mt-1 font-bold text-ink">{latest.documents.length}</p>
            </div>
            <div className="rounded-md border border-border bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-muted">Missing</p>
              <p className="mt-1 font-bold text-ink">{latest.missingDocuments?.length ?? 0}</p>
            </div>
            <div className="rounded-md border border-border bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-muted">Payment</p>
              <p className="mt-1 font-bold text-ink">{latest.payment?.status ?? "PENDING"}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => downloadFile(`/student/submissions/${latest.id}/receipt`, `receipt-${latest.id}.pdf`)}
          >
            <FileText size={16} />
            Download receipt
          </Button>
        </Card>
      ) : (
        <EmptyState title="No submission yet" body="Create your first authentication file from the submission page." />
      )}
      <AuditTimeline
        items={[
          { title: "Create certification request", body: "Start a secure document certification request." },
          { title: "University review", body: "University admins review uploaded PDFs and missing document notes." },
          { title: "Verification code issued", body: "Approved requests receive QR and verification code metadata." }
        ]}
      />
    </div>
  );
};
