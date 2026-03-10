"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const availableTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

type StaffItem = {
  id: number;
  full_name: string;
};

type ServiceItem = {
  id: number;
  name: string;
};

export default function EditAppointmentPage() {
  const params = useParams();
  const appointmentId = params?.id as string;

  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [status, setStatus] = useState("Bekliyor");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id, full_name")
        .order("id", { ascending: true });

      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("id, name")
        .order("id", { ascending: true });

      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (staffError) {
        console.error("Staff alınamadı:", staffError.message);
      }

      if (serviceError) {
        console.error("Services alınamadı:", serviceError.message);
      }

      if (appointmentError || !appointmentData) {
        setMessage("Randevu bulunamadı.");
        setPageLoading(false);
        return;
      }

      const safeStaff = staffData || [];
      const safeServices = serviceData || [];

      setStaffList(safeStaff);
      setServicesList(safeServices);

      setCustomerName(appointmentData.customer_name || "");
      setCustomerPhone(appointmentData.customer_phone || "");
      setServiceName(appointmentData.service_name || "");
      setStaffName(appointmentData.staff_name || "");
      setAppointmentDate(appointmentData.appointment_date || "");
      setSelectedTime(appointmentData.appointment_time || "");
      setStatus(appointmentData.status || "Bekliyor");

      setPageLoading(false);
    }

    if (appointmentId) {
      fetchData();
    }
  }, [appointmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !customerName ||
      !customerPhone ||
      !serviceName ||
      !staffName ||
      !appointmentDate ||
      !selectedTime
    ) {
      setMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    const { data: existingAppointment, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("staff_name", staffName)
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", selectedTime)
      .neq("id", appointmentId)
      .maybeSingle();

    if (checkError) {
      setLoading(false);
      setMessage("Randevu kontrolünde hata oluştu: " + checkError.message);
      return;
    }

    if (existingAppointment) {
      setLoading(false);
      setMessage("Bu personel için bu saatte zaten başka randevu var.");
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({
        customer_name: customerName,
        customer_phone: customerPhone,
        service_name: serviceName,
        staff_name: staffName,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        status,
      })
      .eq("id", appointmentId);

    setLoading(false);

    if (error) {
      setMessage("Randevu güncellenemedi: " + error.message);
      return;
    }

    setMessage("Randevu başarıyla güncellendi.");
  }

  if (pageLoading) {
    return <p className="text-slate-500">Randevu yükleniyor...</p>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Randevu Düzenle</h1>
          <p className="text-slate-500 mt-2">Randevu bilgilerini güncelleyin</p>
        </div>

        <a
          href="/appointments"
          className="bg-slate-200 text-slate-800 px-5 py-3 rounded-xl font-medium hover:bg-slate-300 transition"
        >
          Geri Dön
        </a>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Müşteri Adı
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Telefon
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hizmet
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {servicesList.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Personel
            </label>
            <select
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.full_name}>
                  {staff.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tarih
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
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
              <option>Bekliyor</option>
              <option>Onaylandı</option>
              <option>Tamamlandı</option>
              <option>İptal</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Uygun Saatler
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-xl py-3 font-medium transition ${
                    selectedTime === time
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-blue-100 hover:text-blue-700"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Seçilen Saat
            </label>
            <input
              type="text"
              value={selectedTime}
              readOnly
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none bg-slate-50"
            />
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
              {loading ? "Güncelleniyor..." : "Randevuyu Güncelle"}
            </button>

            <a
              href="/appointments"
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