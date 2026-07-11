import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Clock,
  CreditCard,
  FileText,
  Receipt,
  ScrollText,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import API from "../api/axios";
import MainLayout from "../components/MainLayout";

const Dashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("bizflow_user") || "{}");

  const getDashboardData = async () => {
    setLoading(true);

    try {
      const [summaryRes, quotationRes, paymentRes] = await Promise.allSettled([
        API.get("/dashboard/summary"),
        API.get("/quotations"),
        API.get("/payments"),
      ]);

      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value.data.data);
      }

      if (quotationRes.status === "fulfilled") {
        setQuotations(quotationRes.value.data.data || []);
      }

      if (paymentRes.status === "fulfilled") {
        setPayments(paymentRes.value.data.data || []);
      }
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("bizflow_token");
        localStorage.removeItem("bizflow_user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const formatMoney = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const totals = summary?.totals || {};
  const financial = summary?.financial || {};

  const totalPaymentAmount = payments.reduce((sum, payment) => {
    return sum + Number(payment.amount || 0);
  }, 0);

  const recentQuotations = useMemo(() => {
    return [...quotations].slice(0, 4);
  }, [quotations]);

  const recentPayments = summary?.recentPayments?.length
    ? summary.recentPayments
    : payments.slice(0, 4);

  const recentInvoices = summary?.recentInvoices || [];

  const stats = [
    {
      title: "Customers",
      value: totals.customers || 0,
      icon: Users,
      subtitle: "Active customer records",
      bg: "bg-blue-50",
      text: "text-blue-600",
      route: "/customers",
    },
    {
      title: "Items",
      value: totals.items || 0,
      icon: Boxes,
      subtitle: "Products and services",
      bg: "bg-purple-50",
      text: "text-purple-600",
      route: "/items",
    },
    {
      title: "Quotations",
      value: totals.quotations || quotations.length || 0,
      icon: ScrollText,
      subtitle: "Prepared quotations",
      bg: "bg-amber-50",
      text: "text-amber-600",
      route: "/quotations",
    },
    {
      title: "Invoices",
      value: totals.invoices || 0,
      icon: Receipt,
      subtitle: "Generated invoices",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      route: "/invoices",
    },
    {
      title: "Payments",
      value: totals.payments || payments.length || 0,
      icon: Wallet,
      subtitle: "Recorded payments",
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      route: "/payments",
    },
  ];

  const quickActions = [
    {
      title: "Add Customer",
      description: "Create a customer profile",
      route: "/customers",
      icon: Users,
    },
    {
      title: "Add Item",
      description: "Create product or service",
      route: "/items",
      icon: Boxes,
    },
    {
      title: "Create Quotation",
      description: "Prepare quotation PDF",
      route: "/quotations",
      icon: ScrollText,
    },
    {
      title: "Create Invoice",
      description: "Generate invoice PDF",
      route: "/invoices",
      icon: Receipt,
    },
    {
      title: "Record Payment",
      description: "Track received money",
      route: "/payments",
      icon: CreditCard,
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <div className="bg-white/90 border border-slate-200 rounded-[2rem] p-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock size={22} />
              </div>

              <div>
                <p className="text-lg font-black text-slate-950">
                  Loading dashboard...
                </p>
                <p className="text-sm text-slate-500">
                  Preparing your business summary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-[1500px] mx-auto p-5 lg:p-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 lg:p-10 mb-8 shadow-2xl shadow-slate-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_36%)]" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-5">
                <Sparkles size={16} />
                Business Overview Dashboard
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                Welcome back, {user.name || "Admin"}.
              </h1>

              <p className="text-slate-300 mt-4 text-lg leading-relaxed">
                Track customers, items, quotations, invoices, payments, revenue,
                and pending balances from one clean business workspace.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/10 rounded-3xl p-5 min-w-40">
                <p className="text-xs text-slate-300">Invoice Value</p>
                <h2 className="text-2xl font-black mt-1">
                  {formatMoney(financial.totalInvoiceAmount)}
                </h2>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-5 min-w-40">
                <p className="text-xs text-slate-300">Received</p>
                <h2 className="text-2xl font-black text-emerald-300 mt-1">
                  {formatMoney(
                    financial.totalPaymentsReceived || totalPaymentAmount
                  )}
                </h2>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-5 min-w-40">
                <p className="text-xs text-slate-300">Balance Due</p>
                <h2 className="text-2xl font-black text-red-300 mt-1">
                  {formatMoney(financial.totalBalanceDue)}
                </h2>
              </div>
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.title}
                onClick={() => navigate(stat.route)}
                className="text-left group bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center`}
                  >
                    <Icon size={24} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-slate-600 transition"
                  />
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  {stat.title}
                </p>

                <h2 className="text-4xl font-black text-slate-950 mt-1">
                  {stat.value}
                </h2>

                <p className="text-xs text-slate-400 mt-3">{stat.subtitle}</p>
              </button>
            );
          })}
        </section>

        <section className="grid xl:grid-cols-3 gap-5 mb-8">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total Invoice Amount
                </p>
                <h2 className="text-3xl font-black text-slate-950 mt-2">
                  {formatMoney(financial.totalInvoiceAmount)}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BadgeDollarSign size={24} />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-5">
              Total value generated from all invoices.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Payments Received
                </p>
                <h2 className="text-3xl font-black text-emerald-600 mt-2">
                  {formatMoney(
                    financial.totalPaymentsReceived || totalPaymentAmount
                  )}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet size={24} />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-5">
              Total payments recorded from customers.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Outstanding Balance
                </p>
                <h2 className="text-3xl font-black text-red-500 mt-2">
                  {formatMoney(financial.totalBalanceDue)}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Receipt size={24} />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-5">
              Amount still pending from customers.
            </p>
          </div>
        </section>

        <section className="grid xl:grid-cols-5 gap-5 mb-8">
          <div className="xl:col-span-2 bg-slate-950 text-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">Quick Actions</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Continue your business workflow.
                </p>
              </div>

              <TrendingUp size={24} className="text-emerald-300" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.route)}
                    className="text-left bg-white/10 hover:bg-white/15 border border-white/10 rounded-3xl p-4 transition"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>

                    <p className="font-black">{action.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Recent Quotations
                </h2>
                <p className="text-sm text-slate-500">
                  Latest quotation records.
                </p>
              </div>

              <button
                onClick={() => navigate("/quotations")}
                className="text-sm font-black text-emerald-600 hover:text-emerald-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {recentQuotations.length > 0 ? (
                recentQuotations.map((quotation) => (
                  <div
                    key={quotation._id}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <ScrollText size={20} />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">
                          {quotation.quotationNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {quotation.customer?.name || "Unknown Customer"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-slate-950">
                        {formatMoney(quotation.grandTotal)}
                      </p>
                      <span className="inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-600 capitalize">
                        {quotation.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No quotations found.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid xl:grid-cols-2 gap-5">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Recent Invoices
                </h2>
                <p className="text-sm text-slate-500">
                  Latest billing records.
                </p>
              </div>

              <button
                onClick={() => navigate("/invoices")}
                className="text-sm font-black text-emerald-600 hover:text-emerald-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {invoice.customer?.name || "Unknown Customer"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-slate-950">
                        {formatMoney(invoice.grandTotal)}
                      </p>
                      <span className="inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-600 capitalize">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No invoices found.</p>
              )}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Recent Payments
                </h2>
                <p className="text-sm text-slate-500">
                  Latest received payment records.
                </p>
              </div>

              <button
                onClick={() => navigate("/payments")}
                className="text-sm font-black text-emerald-600 hover:text-emerald-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Wallet size={20} />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">
                          {payment.paymentNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {payment.customer?.name || "Unknown Customer"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-emerald-600">
                        {formatMoney(payment.amount)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(payment.paymentDate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No payments found.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;