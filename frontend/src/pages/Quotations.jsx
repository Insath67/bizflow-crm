import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Download,
  Edit,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ScrollText,
  Trash2,
  User,
  X,
} from "lucide-react";
import API from "../api/axios";
import MainLayout from "../components/MainLayout";
import { generateQuotationPDF } from "../utils/quotationPdf";

const emptyForm = {
  customer: "",
  discount: "",
  tax: "",
  validUntil: "",
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

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
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
      const [quotationRes, customerRes, itemRes] = await Promise.all([
        API.get("/quotations"),
        API.get("/customers"),
        API.get("/items"),
      ]);

      setQuotations(quotationRes.data.data);
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

  const filteredQuotations = useMemo(() => {
    return quotations.filter((quotation) => {
      const keyword = searchTerm.toLowerCase();

      return (
        quotation.quotationNumber?.toLowerCase().includes(keyword) ||
        quotation.customer?.name?.toLowerCase().includes(keyword) ||
        quotation.customer?.company?.toLowerCase().includes(keyword) ||
        quotation.status?.toLowerCase().includes(keyword)
      );
    });
  }, [quotations, searchTerm]);

  const subtotal = lineItems.reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.price || 0);
  }, 0);

  const discount = Number(formData.discount || 0);
  const tax = Number(formData.tax || 0);
  const grandTotal = subtotal - discount + tax;

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
          price: selectedItem.price,
          quantity: updatedItems[index].quantity || 1,
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
      validUntil: formData.validUntil || undefined,
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
        setMessage("Please add at least one quotation item.");
        setLoading(false);
        return;
      }

      if (editingId) {
        await API.put(`/quotations/${editingId}`, payload);
        setMessage("Quotation updated successfully.");
      } else {
        await API.post("/quotations", payload);
        setMessage("Quotation created successfully.");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quotation) => {
    setEditingId(quotation._id);

    setFormData({
      customer: quotation.customer?._id || quotation.customer || "",
      discount: quotation.discount || "",
      tax: quotation.tax || "",
      validUntil: quotation.validUntil
        ? quotation.validUntil.split("T")[0]
        : "",
      status: quotation.status || "draft",
      notes: quotation.notes || "",
    });

    setLineItems(
      quotation.items?.length > 0
        ? quotation.items.map((item) => ({
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
      "Are you sure you want to delete this quotation?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/quotations/${id}`);
      fetchData();
    } catch (error) {
      console.log(error);
      alert("Failed to delete quotation.");
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-50 text-emerald-600";
      case "sent":
        return "bg-blue-50 text-blue-600";
      case "rejected":
        return "bg-red-50 text-red-600";
      case "expired":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-amber-50 text-amber-600";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 lg:p-10 mb-8 shadow-2xl shadow-slate-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.25),transparent_36%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-5">
                <ScrollText size={16} />
                Quotation Workspace
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                Quotation Management
              </h1>

              <p className="text-slate-300 mt-4 text-lg max-w-2xl">
                Create professional quotations by selecting customers, adding
                services or products, and calculating totals automatically.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black">{quotations.length}</p>
                <p className="text-xs text-slate-300">Total</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-blue-300">
                  {
                    quotations.filter(
                      (quotation) => quotation.status === "sent"
                    ).length
                  }
                </p>
                <p className="text-xs text-slate-300">Sent</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-emerald-300">
                  {
                    quotations.filter(
                      (quotation) => quotation.status === "accepted"
                    ).length
                  }
                </p>
                <p className="text-xs text-slate-300">Accepted</p>
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
                  {editingId ? "Edit Quotation" : "Create Quotation"}
                </h2>
                <p className="text-sm text-slate-500">
                  Prepare a quotation for a customer.
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
                  <h3 className="font-black text-slate-900">
                    Quotation Items
                  </h3>

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
                  Valid Until
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="validUntil"
                    type="date"
                    value={formData.validUntil}
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
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  placeholder="Quotation notes"
                  rows="3"
                />
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
                  ? "Update Quotation"
                  : "Create Quotation"}
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
                  Quotation List
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Total quotations: {quotations.length}
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
                    placeholder="Search quotations..."
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
                    <th className="py-4 px-5">Quotation</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Valid Until</th>
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
                        Loading quotations...
                      </td>
                    </tr>
                  ) : filteredQuotations.length > 0 ? (
                    filteredQuotations.map((quotation) => (
                      <tr
                        key={quotation._id}
                        className="hover:bg-slate-50/80"
                      >
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                              <ReceiptText size={20} />
                            </div>

                            <div>
                              <p className="font-black text-slate-950">
                                {quotation.quotationNumber}
                              </p>
                              <p className="text-sm text-slate-500">
                                {quotation.items?.length || 0} item(s)
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          <p className="font-bold text-slate-900">
                            {quotation.customer?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {quotation.customer?.company || "-"}
                          </p>
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          {formatDate(quotation.validUntil)}
                        </td>

                        <td className="py-5 px-5 font-black text-slate-950">
                          {formatMoney(quotation.grandTotal)}
                        </td>

                        <td className="py-5 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black capitalize ${statusClass(
                              quotation.status
                            )}`}
                          >
                            <BadgeCheck size={14} />
                            {quotation.status}
                          </span>
                        </td>

                        <td className="py-5 px-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => generateQuotationPDF(quotation)}
                              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                              title="Download quotation PDF"
                            >
                              <Download size={17} />
                            </button>

                            <button
                              onClick={() => handleEdit(quotation)}
                              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit quotation"
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(quotation._id)}
                              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete quotation"
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
                        No quotations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Accepted quotations can later be converted into invoices.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Quotations;