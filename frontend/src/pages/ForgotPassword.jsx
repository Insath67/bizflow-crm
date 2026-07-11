import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Mail, ShieldCheck } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setMessage(
      "Password reset feature will be connected soon. For now, please use the demo account: admin@bizflow.com / admin123"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_35%)]" />

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

        <p className="text-sm font-bold text-emerald-600 mb-2">
          Account Recovery
        </p>

        <h1 className="text-4xl font-black text-slate-950">
          Forgot password?
        </h1>

        <p className="text-slate-500 mt-3 mb-8">
          Enter your email address and we will help you recover access to your
          BizFlow CRM account.
        </p>

        {message && (
          <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 text-sm font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-black transition shadow-lg shadow-emerald-600/20"
          >
            Send Reset Instructions
          </button>
        </form>

        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
          <ShieldCheck size={22} className="text-emerald-600 shrink-0" />

          <p className="text-sm text-slate-500">
            For this portfolio version, password reset is shown as a demo flow.
            Real reset email/OTP can be added later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;