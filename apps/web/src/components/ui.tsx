import { CheckCircle2, FileSearch, ShieldCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import type React from "react";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const Button = ({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) => (
  <button
    className={cn(
      "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic/25 disabled:cursor-not-allowed disabled:opacity-60",
      variant === "primary" && "bg-civic text-white hover:bg-blue-700",
      variant === "secondary" && "border border-border bg-white text-ink hover:border-slate-300 hover:bg-slate-50",
      variant === "danger" && "bg-danger text-white hover:bg-red-800",
      variant === "ghost" && "shadow-none text-muted hover:bg-slate-100 hover:text-ink",
      className
    )}
    {...props}
  />
);

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <section className={cn("rounded-lg border border-border bg-white p-5 shadow-panel", className)} {...props} />
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "min-h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-civic focus:ring-2 focus:ring-civic/15",
      props.className
    )}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={cn(
      "min-h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-civic focus:ring-2 focus:ring-civic/15",
      props.className
    )}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={cn(
      "min-h-24 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-civic focus:ring-2 focus:ring-civic/15",
      props.className
    )}
  />
);

export const Badge = ({ status }: { status: string }) => {
  const palette: Record<string, string> = {
    DRAFT: "border-border bg-slate-50 text-muted",
    SUBMITTED: "border-blue-200 bg-blue-50 text-blue-800",
    UNDER_REVIEW: "border-indigo-200 bg-indigo-50 text-indigo-800",
    INCOMPLETE: "border-amber-200 bg-amber-50 text-warning",
    APPROVED: "border-emerald-200 bg-emerald-50 text-algeria",
    VERIFIED: "border-emerald-200 bg-emerald-50 text-algeria",
    ARCHIVED: "border-border bg-slate-100 text-slate-800",
    COMPLETED: "border-cyan-200 bg-cyan-50 text-cyan-900",
    REJECTED: "border-red-200 bg-red-50 text-danger",
    VALID: "border-emerald-200 bg-emerald-50 text-algeria",
    INVALID: "border-red-200 bg-red-50 text-danger",
    REVOKED: "border-red-200 bg-red-50 text-danger",
    BLOCKCHAIN_MISMATCH: "border-orange-200 bg-orange-50 text-warning",
    PENDING: "border-amber-200 bg-amber-50 text-warning",
    PAID: "border-emerald-200 bg-emerald-50 text-algeria",
    FAILED: "border-red-200 bg-red-50 text-danger",
    REFUNDED: "border-border bg-slate-100 text-slate-800",
    NOT_CONFIGURED: "border-border bg-slate-50 text-muted"
  };
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", palette[status] ?? palette.DRAFT)}>{status}</span>;
};

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
    {label}
    {children}
  </label>
);

export const EmptyState = ({ title, body }: { title: string; body?: string }) => (
  <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center shadow-sm">
    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-muted">
      <FileSearch size={22} />
    </div>
    <p className="font-semibold text-ink">{title}</p>
    {body && <p className="mt-1 text-sm text-slate-500">{body}</p>}
  </div>
);

export const StatusBadge = Badge;

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-civic">{eyebrow}</p>}
      <h1 className="mt-1 text-2xl font-bold text-ink">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const LoadingState = ({ label = "Loading secure workspace..." }: { label?: string }) => (
  <Card className="flex items-center gap-3">
    <span className="h-3 w-3 animate-pulse rounded-full bg-civic" />
    <p className="text-sm font-semibold text-muted">{label}</p>
  </Card>
);

export const ErrorState = ({ title = "Something went wrong", body }: { title?: string; body?: string }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-danger">
    <p className="font-bold">{title}</p>
    {body && <p className="mt-1">{body}</p>}
  </div>
);

export const FeatureCard = ({
  icon: Icon = ShieldCheck,
  title,
  body
}: {
  icon?: React.ElementType;
  title: string;
  body: string;
}) => (
  <Card>
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-civic">
      <Icon size={21} />
    </div>
    <h3 className="mt-4 font-bold text-ink">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
  </Card>
);

export const PricingCard = ({
  name,
  price,
  description,
  features,
  highlighted
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) => (
  <Card className={cn("flex flex-col", highlighted && "border-civic shadow-soft")}>
    <p className="text-sm font-bold text-civic">{name}</p>
    <p className="mt-3 text-3xl font-bold text-ink">{price}</p>
    <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    <ul className="mt-5 grid gap-3 text-sm text-slate-700">
      {features.map((feature) => (
        <li key={feature} className="flex gap-2">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-algeria" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </Card>
);

export const DataTable = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-lg border border-border bg-white">
    <table className="w-full text-left text-sm">{children}</table>
  </div>
);

export const VerificationCard = ({
  code,
  status,
  rows,
  qrCodeUrl
}: {
  code: string;
  status: string;
  rows: [string, React.ReactNode][];
  qrCodeUrl?: string | null;
}) => (
  <Card>
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
      <div>
        <p className="text-xs font-semibold uppercase text-muted">Verification code</p>
        <h3 className="mt-1 text-xl font-bold text-ink">{code}</h3>
      </div>
      <StatusBadge status={status} />
    </div>
    <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
          <dd className="mt-1 break-all font-semibold text-ink">{value ?? "N/A"}</dd>
        </div>
      ))}
    </dl>
    {qrCodeUrl && <img src={qrCodeUrl} alt="Verification QR code" className="mt-5 h-32 w-32 rounded-md border border-border bg-white p-2" />}
  </Card>
);

export const BlockchainProofCard = ({
  network,
  txHash,
  contractAddress,
  status = "Hash proof"
}: {
  network?: string | null;
  txHash?: string | null;
  contractAddress?: string | null;
  status?: string;
}) => (
  <Card>
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase text-civic">Blockchain proof</p>
        <h3 className="mt-1 font-bold text-ink">{status}</h3>
      </div>
      <ShieldCheck className="text-gold" size={24} />
    </div>
    <dl className="mt-4 grid gap-3 text-sm">
      {[
        ["Network", network || "Not configured"],
        ["Transaction hash", txHash || "Not registered on-chain"],
        ["Contract address", contractAddress || "Not configured"]
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
          <dd className="mt-1 break-all font-semibold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  </Card>
);

export const AuditTimeline = ({ items }: { items: { title: string; body?: string; time?: string }[] }) => (
  <Card>
    <h3 className="font-bold text-ink">Audit timeline</h3>
    <div className="mt-4 grid gap-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-3">
          <span className="mt-1 h-3 w-3 rounded-full bg-civic" />
          <div>
            <p className="text-sm font-semibold text-ink">{item.title}</p>
            {item.body && <p className="mt-1 text-sm text-muted">{item.body}</p>}
            {item.time && <p className="mt-1 text-xs text-muted">{item.time}</p>}
          </div>
        </div>
      ))}
    </div>
  </Card>
);
