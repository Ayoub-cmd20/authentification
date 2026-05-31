import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Field, Input } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { roleHome } from "../../layouts/DashboardLayout";

export const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const role = await login(String(data.get("email")), String(data.get("password")));
      if (rememberMe) {
        localStorage.setItem("remember_email", String(data.get("email")));
      }
      navigate(roleHome(role));
    } catch {
      setError(t("auth.unableToSignIn"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Modern Brand Section */}
        <section className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-civic shadow-lg">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy">Tawtheeq.dz</h1>
                <p className="text-sm text-slate-600">Academic Authentication Platform</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-navy">Multi-Role Access</h3>
                  <p className="text-sm text-slate-600 mt-1">Secure dashboards for students, universities, institutions, and ministry administrators</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-civic/10 text-civic flex-shrink-0">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-navy">Enterprise Security</h3>
                  <p className="text-sm text-slate-600 mt-1">JWT authentication with role-based access control and audit logging</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-navy">Verified Certificates</h3>
                  <p className="text-sm text-slate-600 mt-1">Blockchain-secured academic records with QR verification</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side - Login Form */}
        <section className="flex justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-civic shadow-lg mb-4">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-navy mb-2">Welcome Back</h1>
              <p className="text-slate-600">Sign in to access your secure dashboard</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <Field label="Email Address">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="Enter your email"
                    className="pl-11"
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="Enter your password"
                    className="pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-civic focus:ring-civic"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-civic hover:text-civic/80 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button 
                disabled={loading}
                className="w-full py-3 text-base font-semibold shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/register/student" className="text-civic hover:text-civic/80 font-medium">
                  Register as Student
                </Link>
                {" or "}
                <Link to="/register/institution" className="text-civic hover:text-civic/80 font-medium">
                  Register Institution
                </Link>
              </p>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
};
