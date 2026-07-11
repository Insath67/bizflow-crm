import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import API from "../api/axios";

const Login = ({ defaultMode = "login" }) => {
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(
    defaultMode === "register"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;

      if (isRegisterMode) {
        if (!formData.name.trim()) {
          setError("Name is required to create an account.");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Password and confirm password do not match.");
          setLoading(false);
          return;
        }

        res = await API.post("/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "admin",
        });
      } else {
        res = await API.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
      }

      localStorage.setItem("bizflow_token", res.data.data.token);
      localStorage.setItem("bizflow_user", JSON.stringify(res.data.data));

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          (isRegisterMode
            ? "Account creation failed. Try again."
            : "Login failed. Try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const switchMode = () => {
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsRegisterMode((prev) => !prev);

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_35%)]" />
      <div className="absolute top-10 left-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-52 h-52 bg-blue-500/20 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 bg-white/10 border border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-2xl shadow-black/30">
        <div className="p-8 lg:p-12 text-white bg-slate-950/60">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Building2 size={30} />
            </div>

            <div>
              <h1 className="text-2xl font-black">BizFlow CRM</h1>
              <p className="text-sm text-slate-400">
                Business Management Suite
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-6">
            <Sparkles size={16} />
            All-in-One CRM & Invoice Platform
          </div>

          <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-5">
            Manage customers, invoices, and payments smarter.
          </h2>

          <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
            BizFlow CRM helps small businesses manage customers, services,
            quotations, invoices, payments, and reports from one clean dashboard.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
              <ShieldCheck className="text-emerald-300 mb-4" size={26} />
              <h3 className="font-bold">Secure Auth</h3>
              <p className="text-sm text-slate-400 mt-1">
                JWT protected dashboard
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
              <ReceiptText className="text-blue-300 mb-4" size={26} />
              <h3 className="font-bold">Invoices</h3>
              <p className="text-sm text-slate-400 mt-1">
                Billing and payment flow
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
              <BarChart3 className="text-amber-300 mb-4" size={26} />
              <h3 className="font-bold">Reports</h3>
              <p className="text-sm text-slate-400 mt-1">
                Business summary view
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8"
            >
              ← Back to home
            </Link>

            <div className="mb-8">
              <p className="text-sm font-bold text-emerald-600 mb-2">
                {isRegisterMode ? "Create your account" : "Welcome back"}
              </p>

              <h2 className="text-4xl font-black text-slate-950">
                {isRegisterMode ? "Create account" : "Login to dashboard"}
              </h2>

              <p className="text-slate-500 mt-3">
                {isRegisterMode
                  ? "Create an account to start managing your business."
                  : "Enter your account details to continue managing your business."}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <UserPlus
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      placeholder="Enter your name"
                      required={isRegisterMode}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Password
                  </label>

                  {!isRegisterMode && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder={
                      isRegisterMode ? "Create password" : "Enter password"
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      placeholder="Confirm password"
                      required={isRegisterMode}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-black transition shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {loading
                  ? isRegisterMode
                    ? "Creating account..."
                    : "Logging in..."
                  : isRegisterMode
                  ? "Create Account"
                  : "Login to BizFlow"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                {isRegisterMode
                  ? "Already have an account?"
                  : "Don’t have an account?"}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-black text-emerald-600 hover:text-emerald-700"
                >
                  {isRegisterMode ? "Login here" : "Create account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;