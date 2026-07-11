import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  ScrollText,
  Users,
  Wallet,
} from "lucide-react";

const AppHeader = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("bizflow_user") || "{}");

  const logout = () => {
    localStorage.removeItem("bizflow_token");
    localStorage.removeItem("bizflow_user");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-semibold transition ${
      isActive
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="max-w-[1500px] mx-auto px-5 lg:px-8 py-4 flex items-center justify-between gap-5">
        <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Building2 size={25} />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              BizFlow CRM
            </h1>
            <p className="text-xs text-slate-400">
              Business Management Suite
            </p>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-1 bg-white/5 border border-white/10 rounded-3xl p-1.5">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>

          <NavLink to="/customers" className={navLinkClass}>
            <Users size={16} />
            Customers
          </NavLink>

          <NavLink to="/items" className={navLinkClass}>
            <Package size={16} />
            Items
          </NavLink>

          <NavLink to="/quotations" className={navLinkClass}>
            <ScrollText size={16} />
            Quotations
          </NavLink>

          <NavLink to="/invoices" className={navLinkClass}>
            <ReceiptText size={16} />
            Invoices
          </NavLink>

          <NavLink to="/payments" className={navLinkClass}>
            <Wallet size={16} />
            Payments
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-white">
                {user.name || "Admin User"}
              </p>
              <p className="text-xs text-slate-400 capitalize flex items-center justify-end gap-1">
                {user.role || "admin"}
                <ChevronDown size={12} />
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white text-slate-950 hover:bg-slate-100 px-4 py-2.5 rounded-2xl text-sm font-bold transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;