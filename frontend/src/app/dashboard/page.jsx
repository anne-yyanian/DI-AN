"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, clearToken, getToken } from "../lib/api";

const CATEGORIES = ["Organisasi", "Kuliah", "Pribadi", "Lomba"];

export default function DashboardPage() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Organisasi");
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadActivities() {
    setError("");
    try {
      const data = await apiRequest("/activities");
      const list = Array.isArray(data) ? data : data.data || [];
      setActivities(list);
    } catch (err) {
      setError(err.message);
      if (
        err.message.toLowerCase().includes("unauthorized") ||
        err.message.includes("401")
      ) {
        clearToken();
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }
    loadActivities();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("Organisasi");
    setCompleted(false);
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setCategory(item.category || "Organisasi");
    setCompleted(Boolean(item.completed));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        ...(editingId ? { completed } : {}),
      };

      if (editingId) {
        await apiRequest(`/activities/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/activities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      await loadActivities();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(item) {
    setError("");
    try {
      await apiRequest(`/activities/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !item.completed }),
      });
      await loadActivities();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      await apiRequest(`/activities/${id}`, {
        method: "DELETE",
      });
      if (editingId === id) resetForm();
      await loadActivities();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  const totalCount = activities.length;
  const completedCount = activities.filter((a) => a.completed).length;
  const pendingCount = totalCount - completedCount;

  const filtered = activities.filter((item) => {
    const matchText =
      (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "ALL" || item.category === categoryFilter;
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DONE" && item.completed) ||
      (statusFilter === "ACTIVE" && !item.completed);
    return matchText && matchCat && matchStatus;
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600">Kelola aktivitasmu</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white text-sm font-medium hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-600">Total</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-600">Selesai</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {completedCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-600">Belum Selesai</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {pendingCount}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Aktivitas" : "Tambah Aktivitas"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Judul
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul aktivitas"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Deskripsi
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400"
            />
          </div>

          {editingId && (
            <label className="inline-flex items-center gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              Selesai
            </label>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white text-sm hover:bg-slate-50"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid md:grid-cols-3 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas..."
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
          >
            <option value="ALL">Semua Kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Belum Selesai</option>
            <option value="DONE">Selesai</option>
          </select>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Daftar Aktivitas ({filtered.length})
          </h2>

          {loading ? (
            <p className="text-sm text-slate-600">Memuat...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-600">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 p-3 rounded-lg border border-slate-200 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(item.completed)}
                      onChange={() => handleToggle(item)}
                      className="mt-1"
                    />
                    <div>
                      <p
                        className={`font-medium text-sm ${
                          item.completed
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category || "Organisasi"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-2.5 py-1 text-xs rounded border border-slate-300 text-slate-800 bg-white hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2.5 py-1 text-xs rounded border border-red-200 text-red-700 bg-white hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}