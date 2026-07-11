import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Edit,
  FileText,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import API from "../api/axios";
import MainLayout from "../components/MainLayout";

const emptyForm = {
  invoice: "",
  customer: "",
  amount: "",
  paymentDate: "",
  paymentMethod: "cash",
  referenceNumber: "",
  notes: "",
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [formData, setFormData] = useState(emptyForm);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setTableLoading(true);

    try {
      const [paymentRes, invoiceRes] = await Promise.all([
        API.get("/payments"),
        API.get("/invoices"),
      ]);

      setPayments(paymentRes.data.data);
      setInvoices(invoiceRes.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const keyword = searchTerm.toLowerCase();

      return (
        payment.paymentNumber?.toLowerCase().includes(keyword) ||
        payment.invoice?.invoiceNumber?.toLowerCase().includes(keyword) ||
        payment.customer?.name?.toLowerCase().includes(keyword) ||
        payment.customer?.company?.toLowerCase().includes(keyword) ||
        payment.paymentMethod?.toLowerCase().includes(keyword) ||
        payment.referenceNumber?.toLowerCase().includes(keyword)
      );
    });
  }, [payments, searchTerm]);

  const totalAmountReceived = payments.reduce((sum, payment) => {
    return sum + Number(payment.amount || 0);
  }, 0);

  const cashPayments = payments.filter(
    (payment) => payment.paymentMethod === "cash"
  ).length;

  const bankPayments = payments.filter(
    (payment) =>
      payment.paymentMethod === "bank_transfer" ||
      payment.paymentMethod === "bank"
  ).length;

  const formatMoney = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatMethod = (method) => {
    if (!method) return "-";

    return method
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const calculateInvoicePaidAmount = (invoiceId) => {
    return payments
      .filter((payment) => {
        const paymentInvoiceId =
          payment.invoice?._id || payment.invoice || payment.invoiceId;

        return paymentInvoiceId === invoiceId && payment._id !== editingId;
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  };

  const invoiceBalance = selectedInvoice
    ? Number(selectedInvoice.grandTotal || 0) -
      calculateInvoicePaidAmount(selectedInvoice._id)
    : 0;

  const handleInvoiceSelect = (invoiceId) => {
    const invoice = invoices.find((item) => item._id === invoiceId);

    setSelectedInvoice(invoice || null);

    setFormData((prev) => ({
      ...prev,
      invoice: invoiceId,
      customer: invoice?.customer?._id || invoice?.customer || "",
      amount: invoice
        ? Math.max(
            Number(invoice.grandTotal || 0) -
              calculateInvoicePaidAmount(invoice._id),
            0
          )
        : "",
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "invoice") {
      handleInvoiceSelect(value);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedInvoice(null);
    setEditingId(null);
    setMessage("");
  };

  const buildPayload = () => {
    return {
      invoice: formData.invoice,
      customer: formData.customer,
      amount: Number(formData.amount || 0),
      paymentDate: formData.paymentDate || undefined,
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = buildPayload();

      if (!payload.invoice) {
        setMessage("Please select an invoice.");
        setLoading(false);
        return;
      }

      if (!payload.customer) {
        setMessage("Customer not found for selected invoice.");
        setLoading(false);
        return;
      }

      if (!payload.amount || payload.amount <= 0) {
        setMessage("Please enter a valid payment amount.");
        setLoading(false);
        return;
      }

      if (editingId) {
        await API.put(`/payments/${editingId}`, payload);
        setMessage("Payment updated successfully.");
      } else {
        await API.post("/payments", payload);
        setMessage("Payment recorded successfully.");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    const invoiceId = payment.invoice?._id || payment.invoice || "";
    const invoice = invoices.find((item) => item._id === invoiceId);

    setEditingId(payment._id);
    setSelectedInvoice(invoice || payment.invoice || null);

    setFormData({
      invoice: invoiceId,
      customer:
        payment.customer?._id ||
        payment.customer ||
        invoice?.customer?._id ||
        invoice?.customer ||
        "",
      amount: payment.amount || "",
      paymentDate: payment.paymentDate
        ? payment.paymentDate.split("T")[0]
        : "",
      paymentMethod: payment.paymentMethod || "cash",
      referenceNumber: payment.referenceNumber || "",
      notes: payment.notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/payments/${id}`);
      fetchData();
    } catch (error) {
      console.log(error);
      alert("Failed to delete payment.");
    }
  };

  const methodClass = (method) => {
    switch (method) {
      case "cash":
        return "bg-emerald-50 text-emerald-600";
      case "bank_transfer":
      case "bank":
        return "bg-blue-50 text-blue-600";
      case "card":
        return "bg-purple-50 text-purple-600";
      case "online":
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 lg:p-10 mb-8 shadow-2xl shadow-slate-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_36%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-5">
                <Wallet size={16} />
                Payment Workspace
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                Payment Management
              </h1>

              <p className="text-slate-300 mt-4 text-lg max-w-2xl">
                Record customer payments, connect them with invoices, and track
                received amounts across your business.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black">{payments.length}</p>
                <p className="text-xs text-slate-300">Payments</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-emerald-300">
                  {cashPayments}
                </p>
                <p className="text-xs text-slate-300">Cash</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-blue-300">
                  {bankPayments}
                </p>
                <p className="text-xs text-slate-300">Bank</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                {editingId ? <Edit size={22} /> : <Plus size={22} />}
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  {editingId ? "Edit Payment" : "Record Payment"}
                </h2>
                <p className="text-sm text-slate-500">
                  Connect payment details with an invoice.
                </p>
              </div>
            </div>

            {message && (
              <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 text-sm font-semibold">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Invoice *
                </label>

                <div className="relative">
                  <ReceiptText
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="invoice"
                    value={formData.invoice}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  >
                    <option value="">Select invoice</option>
                    {invoices.map((invoice) => (
                      <option key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber} -{" "}
                        {invoice.customer?.name || "Unknown"} -{" "}
                        {formatMoney(invoice.grandTotal)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedInvoice && (
                <div className="rounded-3xl bg-slate-950 text-white p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                      <User size={18} />
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Customer</p>
                      <p className="font-black">
                        {selectedInvoice.customer?.name || "Unknown Customer"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/10 rounded-2xl p-3">
                      <p className="text-slate-400">Invoice Total</p>
                      <p className="font-black">
                        {formatMoney(selectedInvoice.grandTotal)}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-3">
                      <p className="text-slate-400">Balance</p>
                      <p className="font-black text-emerald-300">
                        {formatMoney(invoiceBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Payment Amount *
                </label>

                <div className="relative">
                  <Wallet
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="amount"
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="25000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Payment Method
                </label>

                <div className="relative">
                  <CreditCard
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Payment Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Reference Number
                </label>

                <input
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  placeholder="TXN-12345 / Bank Ref"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Notes
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Payment notes"
                    rows="3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black transition shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Payment"
                  : "Record Payment"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-4 font-black transition"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Payment List
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Total received: {formatMoney(totalAmountReceived)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-72 border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Search payments..."
                  />
                </div>

                <button
                  onClick={fetchData}
                  className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-3 rounded-2xl font-bold transition"
                >
                  <RefreshCw size={17} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-sm text-slate-500">
                    <th className="py-4 px-5">Payment</th>
                    <th className="py-4 px-5">Invoice</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Method</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {tableLoading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-12 text-center text-slate-500"
                      >
                        Loading payments...
                      </td>
                    </tr>
                  ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-slate-50/80">
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Wallet size={20} />
                            </div>

                            <div>
                              <p className="font-black text-slate-950">
                                {payment.paymentNumber}
                              </p>
                              <p className="text-sm text-slate-500">
                                {formatDate(payment.paymentDate)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          <p className="font-bold text-slate-900">
                            {payment.invoice?.invoiceNumber || "-"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {payment.referenceNumber || "No reference"}
                          </p>
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          <p className="font-bold text-slate-900">
                            {payment.customer?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {payment.customer?.company || "-"}
                          </p>
                        </td>

                        <td className="py-5 px-5 font-black text-emerald-600">
                          {formatMoney(payment.amount)}
                        </td>

                        <td className="py-5 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black capitalize ${methodClass(
                              payment.paymentMethod
                            )}`}
                          >
                            <BadgeCheck size={14} />
                            {formatMethod(payment.paymentMethod)}
                          </span>
                        </td>

                        <td className="py-5 px-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(payment)}
                              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit payment"
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(payment._id)}
                              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete payment"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-14 text-center text-slate-500"
                      >
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Payments are linked with invoices to track received amount
              and balance due.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payments;