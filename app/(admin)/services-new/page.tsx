"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewServicePage() {
  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
      }
    }

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name || !durationMinutes || !price) {
      setMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("services").insert([
      {
        name,
        duration_minutes: Number(durationMinutes),
        price: Number(price),
        status,
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage("Hizmet eklenemedi: " + error.message);
      return;
    }

    setMessage("Hizmet başarıyla eklendi.");
    setName("");
    setDurationMinutes("");
    setPrice("");
    setStatus("Aktif");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Yeni Hizmet</h1>
          <p className="text-slate-500 mt-2">Yeni salon hizmeti ekleyin</p>
        </div>

        <a
          href="/services"
          className="bg-slate-200 text-slate-800 px-5 py-3 rounded-xl font-medium hover:bg-slate-300 transition"
        >
          Geri Dön
        </a>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hizmet Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Saç Kesimi"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Süre (dakika)
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="30"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fiyat (TL)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="300"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Durum
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Aktif</option>
              <option>Pasif</option>
            </select>
          </div>

          {message && (
            <div className="md:col-span-2">
              <div className="bg-slate-100 text-slate-700 rounded-xl px-4 py-3">
                {message}
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Kaydediliyor..." : "Hizmet Ekle"}
            </button>

            <a
              href="/services"
              className="bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-medium hover:bg-slate-300 transition"
            >
              İptal
            </a>
          </div>
        </form>
      </div>
    </>
  );
}