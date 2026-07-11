import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  ReceiptText,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Boxes,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      title: "Customer Management",
      description: "Store, search, update, and manage customer records easily.",
      icon: Users,
    },
    {
      title: "Items & Services",
      description: "Manage products, services, pricing, stock, and categories.",
      icon: Boxes,
    },
    {
      title: "Quotation PDF",
      description: "Create professional quotations and download them as PDF.",
      icon: ScrollText,
    },
    {
      title: "Invoice PDF",
      description:
        "Generate clean invoices with totals, tax, discounts, and due dates.",
      icon: ReceiptText,
    },
    {
      title: "Payment Tracking",
      description: "Record customer payments and track received amounts.",
      icon: Wallet,
    },
    {
      title: "Business Dashboard",
      description:
        "View revenue, balance due, recent records, and business summary.",
      icon: BarChart3,
    },
  ];

  const workflow = [
    "Create customer profile",
    "Add products or services",
    "Prepare quotation",
    "Generate invoice",
    "Record payment",
    "Track business summary",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <main>
        <section className="relative min-h-screen">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_36%)]" />
          <div className="absolute top-10 left-10 w-56 h-56 bg-emerald-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 max-w-[1500px] mx-auto px-5 lg:px-8 pt-8 pb-14 lg:pt-10 lg:pb-16">
            <div className="flex items-center justify-between gap-5 mb-12 lg:mb-14">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Building2 size={30} />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight">
                    BizFlow CRM
                  </h1>
                  <p className="text-sm text-slate-400">
                    Business Management Suite
                  </p>
                </div>
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-6 py-3 rounded-2xl font-black transition"
              >
                Login
              </Link>
            </div>

            <div className="grid xl:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-6">
                  <Sparkles size={16} />
                  All-in-One CRM & Invoice Platform
                </div>

                <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">
                  Manage your business flow smarter.
                </h1>

                <p className="text-slate-300 text-lg lg:text-xl leading-relaxed mt-6 max-w-2xl">
                  BizFlow CRM helps small businesses manage customers, products,
                  quotations, invoices, payments, and reports from one modern
                  dashboard.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-7 py-4 rounded-2xl font-black transition shadow-xl shadow-emerald-500/20"
                  >
                    Start Managing
                    <ArrowRight size={19} />
                  </Link>

                  <a
                    href="#features"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-7 py-4 rounded-2xl font-black transition"
                  >
                    Explore Features
                  </a>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-10 max-w-2xl">
                  <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
                    <ShieldCheck className="text-emerald-300 mb-4" size={26} />
                    <h3 className="font-black">Secure</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      JWT protected dashboard
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
                    <FileText className="text-blue-300 mb-4" size={26} />
                    <h3 className="font-black">PDF Ready</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Invoice & quotation PDFs
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
                    <BadgeDollarSign
                      className="text-amber-300 mb-4"
                      size={26}
                    />
                    <h3 className="font-black">Finance</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Payments and balance tracking
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 bg-emerald-500/20 blur-3xl rounded-full" />

                <div className="relative bg-white/10 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-5 shadow-2xl shadow-black/30">
                  <div className="bg-slate-900 rounded-[1.5rem] p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm text-slate-400">
                          Business Overview
                        </p>
                        <h2 className="text-2xl font-black">
                          Dashboard Preview
                        </h2>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                        <BarChart3 size={24} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 mb-5">
                      <div className="bg-white/10 rounded-2xl p-4">
                        <p className="text-xs text-slate-400">Invoice Value</p>
                        <h3 className="text-xl font-black mt-1">
                          Rs. 125,000
                        </h3>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4">
                        <p className="text-xs text-slate-400">Received</p>
                        <h3 className="text-xl font-black text-emerald-300 mt-1">
                          Rs. 75,000
                        </h3>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4">
                        <p className="text-xs text-slate-400">Balance</p>
                        <h3 className="text-xl font-black text-red-300 mt-1">
                          Rs. 50,000
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white rounded-2xl p-4 text-slate-950 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <ScrollText size={20} />
                          </div>
                          <div>
                            <p className="font-black">QUO-00001</p>
                            <p className="text-sm text-slate-500">
                              Interior Painting Service
                            </p>
                          </div>
                        </div>

                        <p className="font-black">Rs. 45,000</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 text-slate-950 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ReceiptText size={20} />
                          </div>
                          <div>
                            <p className="font-black">INV-00001</p>
                            <p className="text-sm text-slate-500">
                              Customer billing record
                            </p>
                          </div>
                        </div>

                        <p className="font-black">PDF Ready</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 text-slate-950 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Wallet size={20} />
                          </div>
                          <div>
                            <p className="font-black">PAY-00001</p>
                            <p className="text-sm text-slate-500">
                              Payment received
                            </p>
                          </div>
                        </div>

                        <p className="font-black text-emerald-600">
                          Rs. 25,000
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white text-slate-950 py-20">
          <div className="max-w-[1500px] mx-auto px-5 lg:px-8">
            <div className="max-w-3xl mb-12">
              <p className="text-sm font-black text-emerald-600 mb-3">
                Core Features
              </p>

              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                Everything needed to manage daily business operations.
              </h2>

              <p className="text-slate-500 text-lg mt-4">
                From customer records to PDF invoices, BizFlow brings the full
                business workflow into one connected system.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 transition"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                      <Icon size={24} />
                    </div>

                    <h3 className="text-xl font-black">{feature.title}</h3>
                    <p className="text-slate-500 mt-3 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 text-slate-950 py-20">
          <div className="max-w-[1500px] mx-auto px-5 lg:px-8 grid xl:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-black text-emerald-600 mb-3">
                Business Workflow
              </p>

              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                One smooth flow from customer to payment.
              </h2>

              <p className="text-slate-500 text-lg mt-4 leading-relaxed">
                BizFlow CRM is designed around the real small business process:
                create customer records, add services, send quotations, generate
                invoices, and record payments.
              </p>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-black transition mt-8"
              >
                Open CRM
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
              <div className="space-y-4">
                {workflow.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 rounded-3xl bg-slate-50 border border-slate-100 p-4"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-black text-slate-950">{item}</p>
                      <p className="text-sm text-slate-500">
                        Step {index + 1} in the business process
                      </p>
                    </div>

                    <CheckCircle2
                      size={22}
                      className="text-emerald-500 ml-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white py-20">
          <div className="max-w-[1500px] mx-auto px-5 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-700 p-8 lg:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_35%)]" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                    Ready to manage your business smarter?
                  </h2>

                  <p className="text-emerald-50 text-lg mt-4 max-w-2xl">
                    Start using BizFlow CRM and control customers, quotations,
                    invoices, payments, and reports from one place.
                  </p>
                </div>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-7 py-4 rounded-2xl font-black hover:bg-slate-100 transition shrink-0"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="max-w-[1500px] mx-auto px-5 lg:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} BizFlow CRM. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            Secure business management system
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;