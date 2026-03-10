"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ServiceItem = {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
  status: string | null;
};

export default function ServicesPage() {
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Hizmetler alınamadı:", error.message);
      } else {
        setServicesList(data || []);
      }

      setLoading(false);
    }

    fetchServices();
  }, []);

  async function updateServiceStatus(id: number, newStatus: string) {
    const { error } = await supabase
      .from("services")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Hizmet durumu güncellenemedi: " + error.message);
      return;
    }

    setServicesList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Hizmetler</h1>
          <p className="text-slate-500 mt-2">Salon hizmetlerini yönetin</p>
        </div>

        <a
          href="/services-new"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          + Yeni Hizmet
        </a>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-500">Yükleniyor...</p>
      ) : servicesList.length === 0 ? (
        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500">Henüz hizmet yok.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {servicesList.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold text-slate-800">
                {service.name}
              </h3>
              <p className="text-slate-500 mt-2">
                Süre: {service.duration_minutes} dk
              </p>
              <p className="text-slate-500 mt-1">
                Fiyat: {service.price} TL
              </p>

              <div className="mt-4">
                <span className="inline-block bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                  {service.status || "Aktif"}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                {service.status === "Aktif" ? (
                  <button
                    onClick={() => updateServiceStatus(service.id, "Pasif")}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-xl hover:bg-red-200 transition"
                  >
                    Pasif Yap
                  </button>
                ) : (
                  <button
                    onClick={() => updateServiceStatus(service.id, "Aktif")}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-xl hover:bg-green-200 transition"
                  >
                    Aktif Yap
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}