import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Boxes,
  Edit,
  FileText,
  Layers3,
  Package,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";
import API from "../api/axios";
import MainLayout from "../components/MainLayout";

const emptyForm = {
  name: "",
  type: "service",
  category: "",
  description: "",
  price: "",
  stockQuantity: "",
  unit: "unit",
  status: "active",
};

const Items = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchItems = async () => {
    setTableLoading(true);

    try {
      const res = await API.get("/items");
      setItems(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = searchTerm.toLowerCase();

      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.type?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
      );
    });
  }, [items, searchTerm]);

  const totalProducts = items.filter((item) => item.type === "product").length;
  const totalServices = items.filter((item) => item.type === "service").length;
  const activeItems = items.filter((item) => item.status === "active").length;

  const formatMoney = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity || 0),
      };

      if (editingId) {
        await API.put(`/items/${editingId}`, payload);
        setMessage("Item updated successfully.");
      } else {
        await API.post("/items", payload);
        setMessage("Item created successfully.");
      }

      resetForm();
      fetchItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      name: item.name || "",
      type: item.type || "service",
      category: item.category || "",
      description: item.description || "",
      price: item.price || "",
      stockQuantity: item.stockQuantity || "",
      unit: item.unit || "unit",
      status: item.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/items/${id}`);
      fetchItems();
    } catch (error) {
      console.log(error);
      alert("Failed to delete item.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 lg:p-10 mb-8 shadow-2xl shadow-slate-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.25),transparent_36%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 mb-5">
                <Package size={16} />
                Products & Services Workspace
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                Items Management
              </h1>

              <p className="text-slate-300 mt-4 text-lg max-w-2xl">
                Manage products, services, pricing, units, and stock details for
                quotations and invoices.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black">{items.length}</p>
                <p className="text-xs text-slate-300">Total</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-blue-300">
                  {totalProducts}
                </p>
                <p className="text-xs text-slate-300">Products</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-emerald-300">
                  {totalServices}
                </p>
                <p className="text-xs text-slate-300">Services</p>
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
                  {editingId ? "Edit Item" : "Add Item"}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingId
                    ? "Update selected item details."
                    : "Create a product or service."}
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
                  Item Name *
                </label>

                <div className="relative">
                  <Boxes
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Interior Wall Painting"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Type *
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                >
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Category
                </label>

                <div className="relative">
                  <Tag
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Painting Service"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Price *
                </label>

                <div className="relative">
                  <Wallet
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="25000"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">
                    Stock Quantity
                  </label>

                  <input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">
                    Unit
                  </label>

                  <input
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="unit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Description
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Short item description"
                    rows="3"
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
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black transition shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Item"
                  : "Create Item"}
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
                  Product & Service List
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Active items: {activeItems} / Total items: {items.length}
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
                    placeholder="Search items..."
                  />
                </div>

                <button
                  onClick={fetchItems}
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
                    <th className="py-4 px-5">Item</th>
                    <th className="py-4 px-5">Type</th>
                    <th className="py-4 px-5">Price</th>
                    <th className="py-4 px-5">Stock / Unit</th>
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
                        Loading items...
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80">
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              {item.type === "product" ? (
                                <Package size={20} />
                              ) : (
                                <Layers3 size={20} />
                              )}
                            </div>

                            <div>
                              <p className="font-black text-slate-950">
                                {item.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {item.category || "No category"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-5">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-black capitalize ${
                              item.type === "product"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-purple-50 text-purple-600"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>

                        <td className="py-5 px-5 font-bold text-slate-900">
                          {formatMoney(item.price)}
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          {item.stockQuantity || 0} / {item.unit || "unit"}
                        </td>

                        <td className="py-5 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black capitalize ${
                              item.status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <BadgeCheck size={14} />
                            {item.status}
                          </span>
                        </td>

                        <td className="py-5 px-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit item"
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete item"
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
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Items can be reused later when creating quotations and
              invoices.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Items;