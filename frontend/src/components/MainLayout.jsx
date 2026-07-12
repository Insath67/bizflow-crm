import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  UserCircle,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const navLinks = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    name: "Items",
    path: "/items",
    icon: Package,
  },
  {
    name: "Quotations",
    path: "/quotations",
    icon: ReceiptText,
  },
  {
    name: "Invoices",
    path: "/invoices",
    icon: FileText,
  },
  {
    name: "Payments",
    path: "/payments",
    icon: WalletCards,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: UserCircle,
  },
];

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem("bizflow_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserFromStorage();

    const handleStorageUpdate = () => {
      loadUserFromStorage();
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("bizflow-user-updated", handleStorageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("bizflow-user-updated", handleStorageUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bizflow_token");
    localStorage.removeItem("bizflow_user");
    navigate("/login");
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-white/10 shadow-xl shadow-slate-950/10">
        <div className="px-5 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-5">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 text-left shrink-0"
            >
              <div className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Building2 size={30} />
              </div>

              <div className="hidden sm:block">
                <h1 className="text-2xl font-black text-white leading-none">
                  BizFlow CRM
                </h1>
                <p className="text-sm text-slate-400 mt-2">
                  Business Management Suite
                </p>
              </div>
            </button>

            <nav className="hidden xl:flex items-center gap-2 bg-white/5 border border-white/10 rounded-[1.7rem] p-2">
              {navLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white hover:bg-white/10 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-lg">
                  {userInitial}
                </div>

                <div className="text-left">
                  <p className="font-black leading-none">
                    {user?.name || "BizFlow User"}
                  </p>
                  <p className="text-sm text-slate-400 mt-2 capitalize">
                    {user?.role || "user"}
                  </p>
                </div>

                <ChevronDown size={18} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 bg-white text-slate-950 rounded-2xl px-6 py-4 font-black hover:bg-slate-100 transition"
              >
                <LogOut size={19} />
                Logout
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="xl:hidden w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/10"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="xl:hidden mt-5 bg-white/5 border border-white/10 rounded-[1.7rem] p-3">
              <div className="md:hidden flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 mb-3 text-white">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-lg">
                  {userInitial}
                </div>

                <div>
                  <p className="font-black leading-none">
                    {user?.name || "BizFlow User"}
                  </p>
                  <p className="text-sm text-slate-400 mt-2 capitalize">
                    {user?.role || "user"}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                            : "text-slate-300 hover:text-white hover:bg-white/10"
                        }`
                      }
                    >
                      <Icon size={19} />
                      {link.name}
                    </NavLink>
                  );
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="md:hidden flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black bg-white text-slate-950"
                >
                  <LogOut size={19} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="px-5 lg:px-8 py-8">{children}</main>
    </div>
  );
};

export default MainLayout;