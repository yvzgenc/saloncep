"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type BusinessSettings = {
  id: number;
  opening_time: string;
  closing_time: string;
  slot_minutes: number;
};

export default function SettingsPage() {
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("18:00");
  const [slotMinutes, setSlotMinutes] = useState("30");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        setMessage("Ayarlar alınamadı: " + error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const settings = data as BusinessSettings;
        setSettingsId(settings.id);
        setOpeningTime(settings.opening_time);
        setClosingTime(settings.closing_time);
        setSlotMinutes(String(settings.slot_minutes));
      }

      setLoading(false);
    }

    fetchSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!openingTime || !closingTime || !slotMinutes) {
      setMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    if (openingTime >= closingTime) {
      setMessage("Açılış saati kapanış saatinden önce olmalı.");
      return;
    }

    setSaving(true);

    if (settingsId) {
      const { error } = await supabase
        .from("business_settings")
        .update({
          opening_time: openingTime,
          closing_time: closingTime,
          slot_minutes: Number(slotMinutes),
        })
        .eq("id", settingsId);

      setSaving(false);

      if (error) {
        setMessage("Ayarlar güncellenemedi: " + error.message);
        return;
      }

      setMessage("Çalışma saatleri güncellendi.");
      return;
    }

    const { data, error } = await supabase
      .from("business_settings")
      .insert([
        {
          opening_time: openingTime,
          closing_time: closingTime,
          slot_minutes: Number(slotMinutes),
        },
      ])
      .select()
      .single();

    setSaving(false);

    if (error) {
      setMessage("Ayarlar kaydedilemedi: " + error.message);
      return;
    }

    if (data) {
      setSettingsId(data.id);
    }

    setMessage("Çalışma saatleri kaydedildi.");
  }

  if (loading) {
    return <p className="text-slate-500">Ayarlar yükleniyor...</p>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Çalışma Saatleri
          </h1>
          <p className="text-slate-500 mt-2">
            Rezervasyon saatlerini buradan yönetin
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Açılış Saati
            </label>
            <input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kapanış Saati
            </label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Slot Aralığı (dk)
            </label>
            <select
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </div>

          {message && (
            <div className="md:col-span-3">
              <div className="bg-slate-100 text-slate-700 rounded-xl px-4 py-3">
                {message}
              </div>
            </div>
          )}

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}