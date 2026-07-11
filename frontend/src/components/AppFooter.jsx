import { Sparkles } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="mt-10 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            © {new Date().getFullYear()} BizFlow CRM
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Customer, quotation, invoice, and payment management system.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Sparkles size={16} className="text-emerald-500" />
          Built as a Smart Business Management System.
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;