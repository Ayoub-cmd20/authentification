import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Field, Input } from "../../components/ui";

export const ForgotPasswordPage = () => {
  const [submittedEmail, setSubmittedEmail] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setSubmittedEmail(String(email ?? ""));
  };

  return (
    <main className="min-h-[calc(100vh-12rem)] bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <aside className="flex flex-col justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-civic/10 text-civic">
            <KeyRound size={28} />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-navy">Recover account access</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Password recovery is handled through the platform administration team to keep academic records and role access protected.
          </p>
        </aside>

        <Card className="self-start shadow-xl">
          {submittedEmail ? (
            <div className="grid gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-algeria">
                <MailCheck size={25} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Recovery request prepared</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Share <span className="font-semibold text-ink">{submittedEmail}</span> with your university or platform administrator so they can verify your identity and reset access.
                </p>
              </div>
              <Link to="/login" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-civic hover:text-blue-700">
                <ArrowLeft size={17} />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5">
              <div>
                <h2 className="text-xl font-bold text-ink">Find your account</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Enter the email address used for Tawtheeq.dz access.
                </p>
              </div>
              <Field label="Email address">
                <Input name="email" type="email" required placeholder="name@example.com" />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-civic hover:text-blue-700">
                  <ArrowLeft size={17} />
                  Back to login
                </Link>
                <Button>Continue</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
};
