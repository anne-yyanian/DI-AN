"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, setToken } from "./lib/api";

export default function HomePage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { name, email, password }
        : { email, password };

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const token = data.access_token || data.token || data.data?.access_token;
      if (!token) {
        throw new Error("Token tidak ditemukan pada response.");
      }

      setToken(token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-5 border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Study Activities
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isRegister ? "Daftar akun baru" : "Masuk ke akunmu"}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Nama
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Memproses..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="w-full text-center text-sm text-slate-700 hover:text-slate-900 hover:underline"
        >
          {isRegister
            ? "Sudah punya akun? Login"
            : "Belum punya akun? Register"}
        </button>
      </div>
    </main>
  );
}