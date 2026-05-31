import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  KeyRound,
  Landmark,
  LockKeyhole,
  QrCode,
  SearchCheck,
  ShieldCheck,
  Signature
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card, FeatureCard, Field, Input, PricingCard, Textarea } from "../../components/ui";
import { useLanguage } from "../../contexts/LanguageContext";

const trust = [
  ["Blockchain Proof", ShieldCheck],
  ["Digital Signature", Signature],
  ["QR Verification", QrCode],
  ["Audit Logs", ClipboardCheck]
] as const;

const clientTypes = [
  ["clientUniversities", Landmark],
  ["clientPrivateSchools", GraduationCap],
  ["clientTrainingCenters", BadgeCheck],
  ["clientCompanies", Building2]
] as const;

export const LandingPage = () => {
  const { t } = useLanguage();

  return (
  <main>
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
        <div className="content-center">
          <p className="text-sm font-bold uppercase tracking-wide text-gold">{t("landing.ready")}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-ink lg:text-6xl">
            {t("landing.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            {t("landing.description")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register/student">
              <Button>{t("landing.startAsStudent")}</Button>
            </Link>
            <Link to="/verify">
              <Button variant="secondary">{t("landing.verifyDocument")}</Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-2 rounded-md border border-border bg-paper px-3 py-2 text-sm font-semibold text-ink">
                <Icon size={17} className="text-civic" />
                {label}
              </div>
            ))}
          </div>
        </div>
        <Card className="self-center p-0">
          <div className="border-b border-border bg-navy p-5 text-white">
            <p className="text-xs font-semibold uppercase text-white/60">Live verification summary</p>
            <h2 className="mt-2 text-2xl font-bold">Document authenticity confirmed</h2>
          </div>
          <div className="grid gap-4 p-5">
            {[
              ["Verification status", "VALID", "text-algeria"],
              ["Digital signature", "SEALED", "text-civic"],
              ["Blockchain proof", "HASH MATCH", "text-gold"],
              ["Audit trail", "COMPLETE", "text-algeria"]
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center justify-between rounded-md border border-border bg-slate-50 p-3">
                <span className="text-sm font-semibold text-muted">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-civic">{t("landing.clientTypesEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold text-ink">{t("landing.clientTypesTitle")}</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {clientTypes.map(([label, Icon]) => (
          <FeatureCard key={label} icon={Icon} title={t(`landing.${label}`)} body={t("landing.clientTypeBody")} />
        ))}
      </div>
    </section>

    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <p className="text-xs font-bold uppercase text-civic">{t("landing.howItWorks")}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {[
            ["1", t("landing.stepSubmit"), t("landing.stepSubmitDesc")],
            ["2", t("landing.stepReview"), t("landing.stepReviewDesc")],
            ["3", t("landing.stepProof"), t("landing.stepProofDesc")],
            ["4", t("landing.stepVerify"), t("landing.stepVerifyDesc")]
          ].map(([step, title, body]) => (
            <Card key={step}>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">{step}</div>
              <h3 className="mt-4 font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <p className="text-xs font-bold uppercase text-civic">{t("landing.pricingEyebrow")}</p>
      <h2 className="mt-2 text-3xl font-bold text-ink">{t("landing.pricingTitle")}</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <PricingCard name={t("landing.pricing.basic.tier")} price={t("landing.pricing.basic.name")} description={t("landing.pricing.basic.description")} features={[t("landing.pricing.basic.features.0"), t("landing.pricing.basic.features.1"), t("landing.pricing.basic.features.2")]} />
        <PricingCard highlighted name={t("landing.pricing.professional.tier")} price={t("landing.pricing.professional.name")} description={t("landing.pricing.professional.description")} features={[t("landing.pricing.professional.features.0"), t("landing.pricing.professional.features.1"), t("landing.pricing.professional.features.2"), t("landing.pricing.professional.features.3")]} />
        <PricingCard name={t("landing.pricing.enterprise.tier")} price={t("landing.pricing.enterprise.name")} description={t("landing.pricing.enterprise.description")} features={[t("landing.pricing.enterprise.features.0"), t("landing.pricing.enterprise.features.1"), t("landing.pricing.enterprise.features.2"), t("landing.pricing.enterprise.features.3")]} />
      </div>
    </section>

    <section className="border-y border-border bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase text-gold">{t("landing.securityEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold">{t("landing.securityTitle")}</h2>
          <p className="mt-4 text-sm leading-7 text-white/70">
            {t("landing.securityDesc")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["No private data on-chain", LockKeyhole],
            ["AES-ready document storage", KeyRound],
            ["Signed verification reports", FileCheck2],
            ["Full audit trail", ClipboardCheck]
          ] as const).map(([label, Icon]) => (
            <div key={label} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4">
              <Icon className="text-gold" size={20} />
              <span className="font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-bold uppercase text-civic">{t("landing.demoEyebrow")}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t("landing.demoTitle")}</h2>
          <form className="mt-6 grid gap-4">
            <Field label="Work email">
              <Input type="email" placeholder="name@university.dz" />
            </Field>
            <Field label="Organization">
              <Input placeholder="University, school, company, or institution" />
            </Field>
            <Field label="What do you need to verify?">
              <Textarea placeholder="Tell us about your certification or verification workflow." />
            </Field>
            <Button type="button">{t("landing.requestDemo")}</Button>
          </form>
        </Card>
        <div className="grid gap-4">
          <FeatureCard icon={CheckCircle2} title="Customer quote placeholder" body="tawthiq.dz gives academic institutions a credible way to present tamper-evident credentials to employers and public bodies." />
          <Card>
            <h3 className="font-bold text-ink">{t("landing.faq")}</h3>
            {[
              ["Does the platform store documents on blockchain?", "No. Only cryptographic hashes and verification metadata are stored on-chain."],
              ["Can companies verify without an account?", "Public-safe verification can be exposed by QR code, while full details remain role-gated."],
              ["Is it ready for official integrations?", "The architecture includes service boundaries for Progress, payment providers, signing authorities, and object storage."]
            ].map(([q, a]) => (
              <div key={q} className="border-t border-border py-3 first:mt-3">
                <p className="font-semibold text-ink">{q}</p>
                <p className="mt-1 text-sm text-muted">{a}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </section>

    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted lg:px-8">
        <p className="font-semibold text-ink">tawthiq.dz</p>
        <p>{t("landing.footer")}</p>
      </div>
    </footer>
  </main>
  );
};
