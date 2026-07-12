import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import API from "../api/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sendResetCode = async (e) => {
    e?.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!email.trim()) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
      }

      const res = await API.post("/auth/forgot-password", {
        email,
      });

      setEmail(res.data.data.email);
      setStep("reset");
      setMessage("Password reset code sent to your email.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send password reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendResetCode = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await API.post("/auth/forgot-password", {
        email,
      });

      setMessage("New reset code sent to your email.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to resend password reset code."
      );
    } finally {
      setResending(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!code.trim()) {
        setError("Please enter the reset code.");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match.");
        setLoading(false);
        return;
      }

      await API.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });

      setStep("success");
      setMessage("Password reset successfully. You can now login.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_35%)]" />
      <div className="absolute top-10 left-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-52 h-52 bg-blue-500/20 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 lg:p-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8"
        >
          <ArrowLeft size={18} />
          Back to login
        </Link>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
          <Building2 size={30} />
        </div>

        {step === "email" && (
          <>
            <p className="text-sm font-bold text-emerald-600 mb-2">
              Account Recovery
            </p>

            <h1 className="text-4xl font-black text-slate-950">
              Forgot password?
            </h1>

            <p className="text-slate-500 mt-3 mb-8">
              Enter your registered email address. We will send a 6-digit reset
              code to your email.
            </p>

            {error && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={sendResetCode} className="space-y-5">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-black transition shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {loading ? "Sending code..." : "Send Reset Code"}
              </button>
            </form>

            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
              <ShieldCheck size={22} className="text-emerald-600 shrink-0" />

              <p className="text-sm text-slate-500">
                For security, the reset code will expire in 10 minutes.
              </p>
            </div>
          </>
        )}

        {step === "reset" && (
          <>
            <p className="text-sm font-bold text-emerald-600 mb-2">
              Reset Password
            </p>

            <h1 className="text-4xl font-black text-slate-950">
              Enter reset code
            </h1>

            <p className="text-slate-500 mt-3 mb-8">
              Enter the 6-digit code sent to{" "}
              <span className="font-bold text-slate-800">{email}</span> and
              create your new password.
            </p>

            {error && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 text-sm font-semibold flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reset Code
                </label>

                <div className="relative">
                  <KeyRound
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength="6"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition tracking-[0.4em] font-black text-center text-xl"
                    placeholder="000000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Create new password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Confirm New Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Confirm new password"
                    required
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-black transition shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {loading ? "Resetting password..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button
                type="button"
                onClick={resendResetCode}
                disabled={resending}
                className="font-black text-emerald-600 hover:text-emerald-700 disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend reset code"}
              </button>

              <br />

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                  setMessage("");
                }}
                className="text-sm font-bold text-slate-500 hover:text-slate-900"
              >
                Use different email
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>

            <p className="text-sm font-bold text-emerald-600 mb-2">
              Password Updated
            </p>

            <h1 className="text-4xl font-black text-slate-950">
              Reset successful
            </h1>

            <p className="text-slate-500 mt-3 mb-8">
              Your password has been reset successfully. You can now login using
              your new password.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-black transition shadow-lg shadow-emerald-600/20"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;