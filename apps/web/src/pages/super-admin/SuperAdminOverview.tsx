import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { StatCard } from "../../components/StatCard";
import { Card, FeatureCard, PageHeader, PricingCard } from "../../components/ui";

export const SuperAdminOverview = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  useEffect(() => {
    api.get("/super-admin/stats").then((response) => setStats(response.data));
  }, []);
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Super admin dashboard"
        title="Platform operations and SaaS management"
        description="Manage users, universities, subscription plans, document requirements, audit logs, and global AcadVerify DZ settings."
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
      <div className="grid gap-4 lg:grid-cols-3">
        <FeatureCard title="Manage universities" body="Configure university records, admin accounts, and certification permissions." />
        <FeatureCard title="Subscription plans" body="Prepare Basic, Professional, and Enterprise access for institution verifiers." />
        <FeatureCard title="Platform analytics" body="Monitor submissions, verifications, institution searches, and audit activity." />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PricingCard name="Basic" price="Limited" description="Starter verification access." features={["Monthly search cap", "Basic results", "Audit logs"]} />
        <PricingCard highlighted name="Professional" price="Popular" description="Reports and verification history." features={["PDF reports", "Search history", "Higher limits"]} />
        <PricingCard name="Enterprise" price="Custom" description="Full institution-scale configuration." features={["Unlimited searches", "Priority support", "API-ready"]} />
      </div>
    </div>
  );
};
