"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  todayAppointments: number;
  totalAppointments: number;
  totalStaff: number;
  totalServices: number;
};

type RecentAppointment = {
  id: number;
  customer_name: string;
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalAppointments: 0,
    totalStaff: 0,
    totalServices: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState<
    RecentAppointment[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const [
        todayAppointmentsResult,
        totalAppointmentsResult,
        totalStaffResult,
        totalServicesResult,
        recentAppointmentsResult,
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("appointment_date", today),

        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("staff")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("services")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("appointments")
          .select("*")
          .order("id", { ascending: false })
          .limit(5),
      ]);

      setStats({
        todayAppointments: todayAppointmentsResult.count || 0,
        totalAppointments: totalAppointmentsResult.count || 0,
        totalStaff: totalStaffResult.count || 0,
        totalServices: totalServicesResult.count || 0,
      });

      setRecentAppointments(recentAppointmentsResult.data || []);
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Dashboard yükleniyor...</p>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      <p className="text-slate-500 mt-2">
        Salon yönetim paneline hoş geldiniz
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-slate-500 text-sm">Bugünkü Randevu</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {stats.todayAppointments}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-slate-500 text-sm">Toplam Randevu</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {stats.totalAppointments}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-slate-500 text-sm">Toplam Personel</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {stats.totalStaff}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-slate-500 text-sm">Toplam Hizmet</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {stats.totalServices}
          </p>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Son Randevular</h2>
          <a
            href="/appointments"
            className="text-blue-600 font-medium hover:underline"
          >
            Tümünü Gör
          </a>
        </div>

        {recentAppointments.length === 0 ? (
          <p className="text-slate-500 mt-6">Henüz randevu yok.</p>
        ) : (
          <div className="grid gap-4 mt-6">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-slate-200 rounded-2xl p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {appointment.customer_name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {appointment.service_name} • {appointment.staff_name}
                    </p>
                  </div>

                  <div className="flex flex-col lg:items-end gap-2">
                    <p className="text-sm text-slate-600">
                      {appointment.appointment_date} - {appointment.appointment_time}
                    </p>

                    <span
                      className={`inline-block text-sm px-3 py-1 rounded-full ${getStatusStyle(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}