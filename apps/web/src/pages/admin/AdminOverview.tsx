import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { StatCard } from "../../components/StatCard";
import { AuditTimeline, Card, PageHeader } from "../../components/ui";

export const AdminOverview = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  useEffect(() => {
    api.get("/admin/stats").then((response) => setStats(response.data));
  }, []);
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="University admin dashboard"
        title="Review and certify academic documents"
        description="Review student requests, mark missing documents, approve or reject files, and generate blockchain-ready certification proof."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries({
          students: "Students",
          submitted: "Submitted files",
          approved: "Approved files",
          incomplete: "Incomplete files",
          rejected: "Rejected files",
          institutions: "Institutions",
          verifications: "Verifications"
        }).map(([key, label]) => (
          <StatCard key={key} label={label} value={stats[key] ?? 0} />
        ))}
      </div>
      <AuditTimeline
        items={[
          { title: "Validate submitted PDFs", body: "Review document checklist, student profile, and uploaded files." },
          { title: "Digitally certify document", body: "Generate verification code, QR metadata, and document hashes." },
          { title: "Publish verification proof", body: "Store blockchain transaction hash when enabled and notify the student." }
        ]}
      />
    </div>
  );
};
