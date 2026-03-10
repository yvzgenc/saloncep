"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: number;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  staff_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
};

function getStatusStyle(status: string) {
  switch (status) {
    case "Onaylandı":
      return "bg-blue-100 text-blue-700";
    case "Bekliyor":
      return "bg-yellow-100 text-yellow-700";
    case "Tamamlandı":
      return "bg-green-100 text-green-700";
    case "İptal":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [dateFilter, setDateFilter] = useState("");

  async function fetchAppointments() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Randevular alınamadı:", error.message);
    } else {
      setAppointments(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function updateStatus(id: number, newStatus: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Durum güncellenemedi: " + error.message);
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch =
        appointment.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.customer_phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === "Tümü" || appointment.status === statusFilter;

      const matchesDate =
        !dateFilter || appointment.appointment_date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Randevular</h1>
          <p className="text-slate-500 mt-2">Tüm randevuları yönetin</p>
        </div>

        <a
          href="/appointments-new"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          + Yeni Randevu
        </a>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Müşteri Ara
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ad veya telefon"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Tümü</option>
              <option>Bekliyor</option>
              <option>Onaylandı</option>
              <option>Tamamlandı</option>
              <option>İptal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tarih
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-500">Yükleniyor...</p>
      ) : filteredAppointments.length === 0 ? (
        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500">Filtreye uygun randevu bulunamadı.</p>
        </div>
      ) : (
        <div className="grid gap-4 mt-8">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-2xl shadow p-6 border border-slate-100"
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {appointment.customer_name}
                    </h3>
                    <p className="text-slate-500 mt-1">
                      {appointment.customer_phone}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 lg:px-8">
                    <div>
                      <p className="text-sm text-slate-500">Hizmet</p>
                      <p className="font-medium text-slate-800">
                        {appointment.service_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Personel</p>
                      <p className="font-medium text-slate-800">
                        {appointment.staff_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Tarih</p>
                      <p className="font-medium text-slate-800">
                        {appointment.appointment_date}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Saat</p>
                      <p className="font-medium text-slate-800">
                        {appointment.appointment_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <span
                      className={`inline-block text-sm px-3 py-1 rounded-full ${getStatusStyle(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/appointments-edit/${appointment.id}`}
                    className="bg-slate-200 text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-300 transition"
                  >
                    Düzenle
                  </a>

                  <button
                    onClick={() => updateStatus(appointment.id, "Onaylandı")}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition"
                  >
                    Onayla
                  </button>

                  <button
                    onClick={() => updateStatus(appointment.id, "Tamamlandı")}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-xl hover:bg-green-200 transition"
                  >
                    Tamamlandı
                  </button>

                  <button
                    onClick={() => updateStatus(appointment.id, "İptal")}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition"
                  >
                    İptal Et
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}