"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StaffMember = {
  id: number;
  full_name: string;
  phone: string | null;
  title: string | null;
  status: string | null;
};

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Personeller alınamadı:", error.message);
      } else {
        setStaffList(data || []);
      }

      setLoading(false);
    }

    fetchStaff();
  }, []);

  async function updateStaffStatus(id: number, newStatus: string) {
    const { error } = await supabase
      .from("staff")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Personel durumu güncellenemedi: " + error.message);
      return;
    }

    setStaffList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Personeller</h1>
          <p className="text-slate-500 mt-2">Salon çalışanlarını yönetin</p>
        </div>

        <a
          href="/staff-new"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          + Yeni Personel
        </a>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-500">Yükleniyor...</p>
      ) : staffList.length === 0 ? (
        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500">Henüz personel yok.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {staffList.map((staff) => (
            <div key={staff.id} className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold text-slate-800">
                {staff.full_name}
              </h3>
              <p className="text-slate-500 mt-2">{staff.title || "-"}</p>
              <p className="text-slate-500 mt-1">{staff.phone || "-"}</p>

              <div className="mt-4">
                <span className="inline-block bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                  {staff.status || "Aktif"}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                {staff.status === "Aktif" ? (
                  <button
                    onClick={() => updateStaffStatus(staff.id, "Pasif")}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-xl hover:bg-red-200 transition"
                  >
                    Pasif Yap
                  </button>
                ) : (
                  <button
                    onClick={() => updateStaffStatus(staff.id, "Aktif")}
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