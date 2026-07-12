import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Save,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import API from "../api/axios";

const CompanySettings = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    businessEmail: "",
    phone: "",
    address: "",
    website: "",
    taxNumber: "",
    currency: "LKR",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCompanySettings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/company");

      setFormData({
        businessName: res.data.data.businessName || "",
        businessEmail: res.data.data.businessEmail || "",
        phone: res.data.data.phone || "",
        address: res.data.data.address || "",
        website: res.data.data.website || "",
        taxNumber: res.data.data.taxNumber || "",
        currency: res.data.data.currency || "LKR",
      });
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load company settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      const res = await API.put("/company", formData);

      setFormData({
        businessName: res.data.data.businessName || "",
        businessEmail: res.data.data.businessEmail || "",
        phone: res.data.data.phone || "",
        address: res.data.data.address || "",
        website: res.data.data.website || "",
        taxNumber: res.data.data.taxNumber || "",
        currency: res.data.data.currency || "LKR",
      });

      setMessage("Company settings saved successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to save company settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold">
              Loading company settings...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <section className="rounded-[2rem] bg-slate-950 text-white p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_35%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-6 hover:bg-white/15 transition"
              >
                <ArrowLeft size={17} />
                Back to Profile
              </button>

              <h1 className="text-4xl lg:text-5xl font-black">
                Company Settings
              </h1>

              <p className="text-slate-300 mt-4 max-w-2xl">
                Manage your business details. These details will be used later
                for invoice and quotation PDF branding.
              </p>
            </div>

            <div className="w-28 h-28 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Building2 size={56} />
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Building2 size={23} />
            </div>
            <p className="text-sm text-slate-500 font-bold">Business Name</p>
            <h3 className="text-xl font-black text-slate-950 mt-1">
              {formData.businessName || "Not set"}
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Mail size={23} />
            </div>
            <p className="text-sm text-slate-500 font-bold">Business Email</p>
            <h3 className="text-sm font-black text-slate-950 mt-2 break-all">
              {formData.businessEmail || "Not set"}
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <ReceiptText size={23} />
            </div>
            <p className="text-sm text-slate-500 font-bold">Currency</p>
            <h3 className="text-xl font-black text-slate-950 mt-1">
              {formData.currency || "LKR"}
            </h3>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Settings size={23} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Business Information
              </h2>
              <p className="text-sm text-slate-500">
                Save your business contact and branding details.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 text-sm font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Business Name
                </label>

                <div className="relative">
                  <Building2
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Example: IHS Painters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Business Email
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="business@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Website
                </label>

                <div className="relative">
                  <Globe
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tax / VAT Number
                </label>

                <div className="relative">
                  <ReceiptText
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="VAT-123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Currency
                </label>

                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                >
                  <option value="LKR">LKR - Sri Lankan Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Business Address
              </label>

              <div className="relative">
                <MapPin
                  size={19}
                  className="absolute left-4 top-5 text-slate-400"
                />

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
                  placeholder="Enter business address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-4 font-black transition disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Company Settings"}
            </button>
          </form>
        </section>
      </div>
    </MainLayout>
  );
};

export default CompanySettings;