"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewStaffPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!fullName) {
      setMessage("Personel adı zorunludur.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("staff").insert([
      {
        full_name: fullName,
        phone,
        title,
        status,
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage("Personel eklenemedi: " + error.message);
      return;
    }

    setMessage("Personel başarıyla eklendi.");
    setFullName("");
    setPhone("");
    setTitle("");
    setStatus("Aktif");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Yeni Personel</h1>
          <p className="text-slate-500 mt-2">Yeni çalışan ekleyin</p>
        </div>

        <a
          href="/staff"
          className="bg-slate-200 text-slate-800 px-5 py-3 rounded-xl font-medium hover:bg-slate-300 transition"
        >
          Geri Dön
        </a>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmet Usta"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Telefon
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0555 111 11 11"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ünvan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Berber"
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
              {loading ? "Kaydediliyor..." : "Personel Ekle"}
            </button>

            <a
              href="/staff"
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