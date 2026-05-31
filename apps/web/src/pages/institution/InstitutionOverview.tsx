import { Link } from "react-router-dom";
import { SearchCheck } from "lucide-react";
import { Button, Card, FeatureCard, PageHeader } from "../../components/ui";

export const InstitutionOverview = () => (
  <div className="grid gap-5">
    <PageHeader
      eyebrow="Institution verifier dashboard"
      title="Verify credentials with confidence"
      description="Search approved graduate records, confirm authenticity, generate official PDF reports, and view blockchain proof."
      actions={
        <Link to="/institution/search">
          <Button>
            <SearchCheck size={16} />
            Verify Document
          </Button>
        </Link>
      }
    />
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Controlled access", "Only verified records are returned to subscribed institutions."],
        ["Official PDF reports", "Generate printable certificate validity confirmation reports."],
        ["Audit protection", "Each query is logged with masked values and result metadata."]
      ].map(([title, body]) => (
        <FeatureCard key={title} title={title} body={body} />
      ))}
    </div>
    <Card>
      <h3 className="font-bold text-ink">Verification readiness</h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        Use the search workspace to enter a verification code or data from a QR scan. Sensitive data is masked by default and every search is logged.
      </p>
    </Card>
  </div>
);
