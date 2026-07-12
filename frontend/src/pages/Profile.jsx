import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
  UserCircle,
} from "lucide-react";
import MainLayout from "../components/MainLayout";
import API from "../api/axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await API.get("/auth/profile");

      setProfile(res.data.data);
      setName(res.data.data.name);
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");
    setSavingProfile(true);

    try {
      const res = await API.put("/auth/profile", {
        name,
      });

      setProfile(res.data.data);

      localStorage.setItem("bizflow_user", JSON.stringify(res.data.data));
      localStorage.setItem("bizflow_token", res.data.data.token);

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");
    setChangingPassword(true);

    try {
      await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password changed successfully.");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Loading profile...</p>
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
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-6">
                <UserCircle size={17} />
                User Profile
              </div>

              <h1 className="text-4xl lg:text-5xl font-black">
                My Profile
              </h1>

              <p className="text-slate-300 mt-4 max-w-2xl">
                Manage your account details, security, and BizFlow CRM login
                information.
              </p>
            </div>

            <div className="w-28 h-28 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-5xl font-black shadow-2xl shadow-emerald-500/30">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <User size={23} />
            </div>

            <p className="text-sm text-slate-500 font-bold">Name</p>
            <h3 className="text-xl font-black text-slate-950 mt-1">
              {profile?.name}
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Mail size={23} />
            </div>

            <p className="text-sm text-slate-500 font-bold">Email</p>
            <h3 className="text-sm font-black text-slate-950 mt-2 break-all">
              {profile?.email}
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <ShieldCheck size={23} />
            </div>

            <p className="text-sm text-slate-500 font-bold">Role</p>
            <h3 className="text-xl font-black text-slate-950 mt-1 capitalize">
              {profile?.role}
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <CalendarDays size={23} />
            </div>

            <p className="text-sm text-slate-500 font-bold">Joined</p>
            <h3 className="text-sm font-black text-slate-950 mt-2">
              {formatDate(profile?.createdAt)}
            </h3>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BadgeCheck size={23} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Account Details
                </h2>
                <p className="text-sm text-slate-500">
                  Update your visible profile name.
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-semibold">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 text-sm font-semibold">
                {profileMessage}
              </div>
            )}

            <form onSubmit={updateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-slate-500 cursor-not-allowed"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Email changing is disabled because your account is email
                  verified.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 font-black transition disabled:opacity-60"
              >
                <Save size={18} />
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Lock size={23} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Security
                </h2>
                <p className="text-sm text-slate-500">
                  Change your account password.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-semibold">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 text-sm font-semibold">
                {passwordMessage}
              </div>
            )}

            <form onSubmit={changePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Current Password
                </label>

                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Enter current password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Enter new password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white px-6 py-4 font-black transition disabled:opacity-60"
              >
                <Lock size={18} />
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Profile;