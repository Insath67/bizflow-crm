import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Download,
  Edit,
  FileText,
  Plus,
  Receipt,
  ReceiptText,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import API from "../api/axios";
import MainLayout from "../components/MainLayout";
import { generateInvoicePDF } from "../utils/invoicePdf";

const emptyForm = {
  customer: "",
  discount: "",
  tax: "",
  dueDate: "",
  status: "draft",
  notes: "",
};

const emptyLineItem = {
  item: "",
  name: "",
  description: "",
  quantity: 1,
  price: "",
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState(emptyForm);
  const [lineItems, setLineItems] = useState([emptyLineItem]);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setTableLoading(true);

    try {
      const [invoiceRes, customerRes, itemRes] = await Promise.all([
        API.get("/invoices"),
        API.get("/customers"),
        API.get("/items"),
      ]);

      setInvoices(invoiceRes.data.data);
      setCustomers(customerRes.data.data);
      setItems(itemRes.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const keyword = searchTerm.toLowerCase();

      return (
        invoice.invoiceNumber?.toLowerCase().includes(keyword) ||
        invoice.customer?.name?.toLowerCase().includes(keyword) ||
        invoice.customer?.company?.toLowerCase().includes(keyword) ||
        invoice.status?.toLowerCase().includes(keyword)
      );
    });
  }, [invoices, searchTerm]);

  const subtotal = lineItems.reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.price || 0);
  }, 0);

  const discount = Number(formData.discount || 0);
  const tax = Number(formData.tax || 0);
  const grandTotal = subtotal - discount + tax;

  const totalPaid = invoices.filter(
    (invoice) => invoice.status === "paid"
  ).length;

  const totalSent = invoices.filter(
    (invoice) => invoice.status === "sent"
  ).length;

  const totalOverdue = invoices.filter(
    (invoice) => invoice.status === "overdue"
  ).length;

  const formatMoney = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];

    if (field === "item") {
      const selectedItem = items.find((item) => item._id === value);

      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          item: selectedItem._id,
          name: selectedItem.name,
          description: selectedItem.description || "",
          quantity: updatedItems[index].quantity || 1,
          price: selectedItem.price,
        };
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          item: "",
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }

    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, emptyLineItem]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;

    setLineItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setLineItems([emptyLineItem]);
    setEditingId(null);
    setMessage("");
  };

  const buildPayload = () => {
    const cleanedItems = lineItems
      .filter((item) => item.name && item.price)
      .map((item) => ({
        item: item.item || undefined,
        name: item.name,
        description: item.description,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      }));

    return {
      customer: formData.customer,
      items: cleanedItems,
      discount: Number(formData.discount || 0),
      tax: Number(formData.tax || 0),
      dueDate: formData.dueDate || undefined,
      status: formData.status,
      notes: formData.notes,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = buildPayload();

      if (!payload.customer) {
        setMessage("Please select a customer.");
        setLoading(false);
        return;
      }

      if (payload.items.length === 0) {
        setMessage("Please add at least one invoice item.");
        setLoading(false);
        return;
      }

      if (editingId) {
        await API.put(`/invoices/${editingId}`, payload);
        setMessage("Invoice updated successfully.");
      } else {
        await API.post("/invoices", payload);
        setMessage("Invoice created successfully.");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice) => {
    setEditingId(invoice._id);

    setFormData({
      customer: invoice.customer?._id || invoice.customer || "",
      discount: invoice.discount || "",
      tax: invoice.tax || "",
      dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
      status: invoice.status || "draft",
      notes: invoice.notes || "",
    });

    setLineItems(
      invoice.items?.length > 0
        ? invoice.items.map((item) => ({
            item: item.item?._id || item.item || "",
            name: item.name || "",
            description: item.description || "",
            quantity: item.quantity || 1,
            price: item.price || "",
          }))
        : [emptyLineItem]
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/invoices/${id}`);
      fetchData();
    } catch (error) {
      console.log(error);
      alert("Failed to delete invoice.");
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-600";
      case "sent":
        return "bg-blue-50 text-blue-600";
      case "overdue":
        return "bg-red-50 text-red-600";
      case "cancelled":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-amber-50 text-amber-600";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 lg:p-10 mb-8 shadow-2xl shadow-slate-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_36%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-5">
                <ReceiptText size={16} />
                Invoice Workspace
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                Invoice Management
              </h1>

              <p className="text-slate-300 mt-4 text-lg max-w-2xl">
                Create invoices, manage billing status, track due dates, and
                prepare payment records for your customers.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black">{invoices.length}</p>
                <p className="text-xs text-slate-300">Total</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-blue-300">
                  {totalSent}
                </p>
                <p className="text-xs text-slate-300">Sent</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-emerald-300">
                  {totalPaid}
                </p>
                <p className="text-xs text-slate-300">Paid</p>
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
                  {editingId ? "Edit Invoice" : "Create Invoice"}
                </h2>
                <p className="text-sm text-slate-500">
                  Prepare a billing invoice for a customer.
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
                  Customer *
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}{" "}
                        {customer.company ? `- ${customer.company}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Invoice Items</h3>

                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-sm font-black text-emerald-600 hover:text-emerald-700"
                  >
                    + Add Item
                  </button>
                </div>

                {lineItems.map((lineItem, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-700">
                        Item #{index + 1}
                      </p>

                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    <select
                      value={lineItem.item}
                      onChange={(e) =>
                        handleLineItemChange(index, "item", e.target.value)
                      }
                      className="w-full border border-slate-200 bg-white rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                      <option value="">Select saved item or type manually</option>
                      {items.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} - {formatMoney(item.price)}
                        </option>
                      ))}
                    </select>

                    <input
                      value={lineItem.name}
                      onChange={(e) =>
                        handleLineItemChange(index, "name", e.target.value)
                      }
                      className="w-full border border-slate-200 bg-white rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      placeholder="Item name"
                      required
                    />

                    <textarea
                      value={lineItem.description}
                      onChange={(e) =>
                        handleLineItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full border border-slate-200 bg-white rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      placeholder="Description"
                      rows="2"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="1"
                        value={lineItem.quantity}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-full border border-slate-200 bg-white rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        placeholder="Qty"
                        required
                      />

                      <input
                        type="number"
                        min="0"
                        value={lineItem.price}
                        onChange={(e) =>
                          handleLineItemChange(index, "price", e.target.value)
                        }
                        className="w-full border border-slate-200 bg-white rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        placeholder="Price"
                        required
                      />
                    </div>

                    <div className="text-right text-sm font-black text-slate-700">
                      Line Total:{" "}
                      {formatMoney(
                        Number(lineItem.quantity || 0) *
                          Number(lineItem.price || 0)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">
                    Discount
                  </label>

                  <input
                    name="discount"
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">
                    Tax
                  </label>

                  <input
                    name="tax"
                    type="number"
                    min="0"
                    value={formData.tax}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Due Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
                    placeholder="Invoice notes"
                    rows="3"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950 text-white p-5 space-y-2">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-slate-300">
                  <span>Discount</span>
                  <span>- {formatMoney(discount)}</span>
                </div>

                <div className="flex justify-between text-sm text-slate-300">
                  <span>Tax</span>
                  <span>+ {formatMoney(tax)}</span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-black">
                  <span>Grand Total</span>
                  <span>{formatMoney(grandTotal)}</span>
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
                  ? "Update Invoice"
                  : "Create Invoice"}
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
                  Invoice List
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Total invoices: {invoices.length} / Overdue: {totalOverdue}
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
                    placeholder="Search invoices..."
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
                    <th className="py-4 px-5">Invoice</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Due Date</th>
                    <th className="py-4 px-5">Total</th>
                    <th className="py-4 px-5">Status</th>
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
                        Loading invoices...
                      </td>
                    </tr>
                  ) : filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-slate-50/80">
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Receipt size={20} />
                            </div>

                            <div>
                              <p className="font-black text-slate-950">
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-slate-500">
                                {invoice.items?.length || 0} item(s)
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          <p className="font-bold text-slate-900">
                            {invoice.customer?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {invoice.customer?.company || "-"}
                          </p>
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          {formatDate(invoice.dueDate)}
                        </td>

                        <td className="py-5 px-5 font-black text-slate-950">
                          {formatMoney(invoice.grandTotal)}
                        </td>

                        <td className="py-5 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black capitalize ${statusClass(
                              invoice.status
                            )}`}
                          >
                            <BadgeCheck size={14} />
                            {invoice.status}
                          </span>
                        </td>

                        <td className="py-5 px-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => generateInvoicePDF(invoice)}
                              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                              title="Download invoice PDF"
                            >
                              <Download size={17} />
                            </button>

                            <button
                              onClick={() => handleEdit(invoice)}
                              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit invoice"
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(invoice._id)}
                              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete invoice"
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
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Paid invoices will later be connected with payment records.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Invoices;