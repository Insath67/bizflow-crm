import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  StickyNote,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import API from "../api/axios";
import MainLayout from "../components/MainLayout";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
  status: "active",
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    setTableLoading(true);

    try {
      const res = await API.get("/customers");
      setCustomers(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const keyword = searchTerm.toLowerCase();

      return (
        customer.name?.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword) ||
        customer.company?.toLowerCase().includes(keyword)
      );
    });
  }, [customers, searchTerm]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "active"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "inactive"
  ).length;

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
      if (editingId) {
        await API.put(`/customers/${editingId}`, formData);
        setMessage("Customer updated successfully.");
      } else {
        await API.post("/customers", formData);
        setMessage("Customer created successfully.");
      }

      resetForm();
      fetchCustomers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      address: customer.address || "",
      notes: customer.notes || "",
      status: customer.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.log(error);
      alert("Failed to delete customer.");
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
                <Users size={16} />
                CRM Customer Workspace
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                Customer Management
              </h1>

              <p className="text-slate-300 mt-4 text-lg max-w-2xl">
                Add, update, search, and organize customer records for your
                business workflow.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black">{customers.length}</p>
                <p className="text-xs text-slate-300">Total</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-emerald-300">
                  {activeCustomers}
                </p>
                <p className="text-xs text-slate-300">Active</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-4 min-w-28">
                <p className="text-2xl font-black text-slate-300">
                  {inactiveCustomers}
                </p>
                <p className="text-xs text-slate-300">Inactive</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                {editingId ? <Edit size={22} /> : <UserPlus size={22} />}
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  {editingId ? "Edit Customer" : "Add Customer"}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingId
                    ? "Update selected customer details."
                    : "Create a new customer profile."}
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
                  Customer Name *
                </label>
                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Customer name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="0771234567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="customer@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Company
                </label>
                <div className="relative">
                  <Building2
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Address
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Customer address"
                    rows="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Notes
                </label>
                <div className="relative">
                  <StickyNote
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Additional notes"
                    rows="2"
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
                  ? "Update Customer"
                  : "Create Customer"}
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
                  Customer List
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Total customers: {customers.length}
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
                    placeholder="Search customers..."
                  />
                </div>

                <button
                  onClick={fetchCustomers}
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
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Contact</th>
                    <th className="py-4 px-5">Company</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {tableLoading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-slate-500"
                      >
                        Loading customers...
                      </td>
                    </tr>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-slate-50/80">
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                              {customer.name?.charAt(0)?.toUpperCase() || "C"}
                            </div>

                            <div>
                              <p className="font-black text-slate-950">
                                {customer.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {customer.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-5">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone size={16} className="text-slate-400" />
                            {customer.phone}
                          </div>
                        </td>

                        <td className="py-5 px-5 text-slate-700">
                          {customer.company || "-"}
                        </td>

                        <td className="py-5 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black capitalize ${
                              customer.status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <BadgeCheck size={14} />
                            {customer.status}
                          </span>
                        </td>

                        <td className="py-5 px-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit customer"
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete customer"
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
                        colSpan="5"
                        className="py-14 text-center text-slate-500"
                      >
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Use customer records later when creating quotations and
              invoices.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Customers;