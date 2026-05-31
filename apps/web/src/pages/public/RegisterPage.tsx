import { Building2, GraduationCap } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Field, Input, Select } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { roleHome } from "../../layouts/DashboardLayout";

export const RegisterPage = ({ type }: { type: "student" | "institution" }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const Icon = type === "student" ? GraduationCap : Building2;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    try {
      const role = type === "student" ? await auth.registerStudent(form) : await auth.registerInstitution(form);
      navigate(roleHome(role));
    } catch {
      setError("Registration failed. Check required fields and use a strong password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-civic/10 text-civic">
          <Icon size={22} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-navy">
          {type === "student" ? "Student registration" : "Institution annual subscription"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {type === "student"
            ? "Create a temporary account to submit academic authentication documents and receive a smart receipt."
            : "Register an organization account for controlled certificate searches and official verification reports."}
        </p>
        <div className="mt-6 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          Data is collected only for academic authentication, access control, audit logging, and certificate verification.
        </div>
      </aside>
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input name="fullName" required />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required />
          </Field>
          <Field label="Phone">
            <Input name="phone" />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" required placeholder="ChangeMe123!" />
          </Field>
          {type === "student" ? (
            <>
              <Field label="National identification number">
                <Input name="nationalId" />
              </Field>
              <Field label="Student registration number">
                <Input name="studentRegistrationNumber" />
              </Field>
            </>
          ) : (
            <>
              <Field label="Institution name">
                <Input name="institutionName" required />
              </Field>
              <Field label="Institution type">
                <Select name="institutionType" required>
                  <option>Public Institution</option>
                  <option>Economic Company</option>
                  <option>University Partner</option>
                </Select>
              </Field>
              <Field label="Commercial register or license">
                <Input name="licenseNumber" />
              </Field>
              <Field label="Tax ID">
                <Input name="taxId" />
              </Field>
              <Field label="Contact person">
                <Input name="contactPerson" />
              </Field>
              <Field label="Address">
                <Input name="address" />
              </Field>
            </>
          )}
          {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{error}</p>}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 md:col-span-2">
            <Link to="/login" className="text-sm font-semibold text-civic">
              Already registered?
            </Link>
            <Button disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
          </div>
        </form>
      </Card>
    </main>
  );
};
