"use client";

import Toast from "@/components/Toast";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StaffItem = {
  id: number;
  full_name: string;
};

type ServiceItem = {
  id: number;
  name: string;
};

type BusyAppointment = {
  appointment_time: string;
  status: string;
};

type BusinessSettings = {
  opening_time: string;
  closing_time: string;
  slot_minutes: number;
};

function generateTimeSlots(
  openingTime: string,
  closingTime: string,
  slotMinutes: number
) {
  const slots: string[] = [];

  const [openHour, openMinute] = openingTime.split(":").map(Number);
  const [closeHour, closeMinute] = closingTime.split(":").map(Number);

  const start = new Date();
  start.setHours(openHour, openMinute, 0, 0);

  const end = new Date();
  end.setHours(closeHour, closeMinute, 0, 0);

  const current = new Date(start);

  while (current < end) {
    const hours = String(current.getHours()).padStart(2, "0");
    const minutes = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + slotMinutes);
  }

  return slots;
}

export default function BookingPage() {
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  const [successData, setSuccessData] = useState<{
    customerName: string;
    serviceName: string;
    staffName: string;
    appointmentDate: string;
    selectedTime: string;
  } | null>(null);

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [allTimes, setAllTimes] = useState<string[]>([]);
  const [filteredTimes, setFilteredTimes] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function fetchFormData() {
      const { data: staffData } = await supabase
        .from("staff")
        .select("id, full_name")
        .eq("status", "Aktif")
        .order("id", { ascending: true });

      const { data: serviceData } = await supabase
        .from("services")
        .select("id, name")
        .eq("status", "Aktif")
        .order("id", { ascending: true });

      const { data: settingsData } = await supabase
        .from("business_settings")
        .select("opening_time, closing_time, slot_minutes")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      const safeStaff = staffData || [];
      const safeServices = serviceData || [];

      setStaffList(safeStaff);
      setServicesList(safeServices);

      if (safeStaff.length > 0) {
        setStaffName(safeStaff[0].full_name);
      }

      if (safeServices.length > 0) {
        setServiceName(safeServices[0].name);
      }

      const settings: BusinessSettings = settingsData || {
        opening_time: "09:00",
        closing_time: "18:00",
        slot_minutes: 30,
      };

      const generatedSlots = generateTimeSlots(
        settings.opening_time,
        settings.closing_time,
        settings.slot_minutes
      );

      setAllTimes(generatedSlots);
      setFilteredTimes(generatedSlots);
      setPageLoading(false);
    }

    fetchFormData();
  }, []);

  useEffect(() => {
    async function filterAvailableTimes() {
      if (!staffName || !appointmentDate || allTimes.length === 0) {
        setFilteredTimes(allTimes);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time, status")
        .eq("staff_name", staffName)
        .eq("appointment_date", appointmentDate);

      if (error) {
        console.error("Saatler alınamadı:", error.message);
        setFilteredTimes(allTimes);
        return;
      }

      const busyData = (data || []) as BusyAppointment[];

      const busyTimes = busyData
        .filter((item) => item.status !== "İptal")
        .map((item) => item.appointment_time);

      const emptyTimes = allTimes.filter((time) => !busyTimes.includes(time));

      setFilteredTimes(emptyTimes);

      if (selectedTime && busyTimes.includes(selectedTime)) {
        setSelectedTime("");
      }
    }

    filterAvailableTimes();
  }, [staffName, appointmentDate, selectedTime, allTimes]);

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
      setToastType("success");
    setMessage("Lütfen tüm alanları doldurun.");
    setTimeout(() => setMessage(""), 3000);
      return;
    }

    const cleanedPhone = customerPhone.replace(/\D/g, "");

    if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
      setToastType("success");
    setMessage("Geçerli telefon numarası girin");
    setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!filteredTimes.includes(selectedTime)) {
      setToastType("success");
    setMessage("Lütfen geçerli boş saat seçin");
    setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);

    const { data: existingAppointment, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("staff_name", staffName)
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", selectedTime)
      .maybeSingle();

    if (checkError) {
      setLoading(false);
      setToastType("success");
    setMessage("Randevu kontrol edilirken hata oluştu.");
    setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (existingAppointment) {
      setLoading(false);
      setToastType("success");
    setMessage("Seçtiğiniz personel için bu saatte başka randevu var.");
    setTimeout(() => setMessage(""), 3000);
      return;
    }

    const { error } = await supabase.from("appointments").insert([
      {
        customer_name: customerName,
        customer_phone: cleanedPhone,
        service_name: serviceName,
        staff_name: staffName,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        status: "Bekliyor",
      },
    ]);

    setLoading(false);

    if (error) {
      setToastType("success");
    setMessage("Randevu oluşturulamadı");
    setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSuccessData({
      customerName,
      serviceName,
      staffName,
      appointmentDate,
      selectedTime,
    });

    setToastType("success");
    setMessage("Randevunuz başarıyla oluşturuldu.");
    setTimeout(() => setMessage(""), 3000);
    setCustomerName("");
    setCustomerPhone("");
    setAppointmentDate("");
    setSelectedTime("");

    if (staffList.length > 0) {
      setStaffName(staffList[0].full_name);
    }

    if (servicesList.length > 0) {
      setServiceName(servicesList[0].name);
    }

    setFilteredTimes(allTimes);
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Rezervasyon formu yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
        {message && <Toast message={message} type={toastType} />}
        
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">SalonCep</h1>
            <p className="text-slate-500 mt-3">
              Online randevunuzu kolayca oluşturun
            </p>
          </div>

          {successData && (
            <div className="mt-10 mb-2 bg-green-50 border border-green-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-green-700">
                Randevunuz Oluşturuldu
              </h2>

              <p className="text-slate-600 mt-2">
                Rezervasyon bilgileriniz aşağıdadır.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-slate-500">Ad Soyad</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {successData.customerName}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-slate-500">Hizmet</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {successData.serviceName}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-slate-500">Personel</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {successData.staffName}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-slate-500">Tarih</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {successData.appointmentDate}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-green-100 md:col-span-2">
                  <p className="text-sm text-slate-500">Saat</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {successData.selectedTime}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="mt-6 bg-green-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Yeni Randevu Oluştur
              </button>
            </div>
          )}

          {!successData && (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 mt-10">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ali Demir"
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
                  placeholder="0555 123 45 67"
                  inputMode="numeric"
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

              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Uygun Saatler
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredTimes.map((time) => (
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

                {filteredTimes.length === 0 && (
                  <p className="text-sm text-red-600 mt-3">
                    Seçilen personel için bu tarihte boş saat kalmadı.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seçilen Saat
                </label>
                <input
                  type="text"
                  value={selectedTime}
                  readOnly
                  placeholder="Bir saat seçin"
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

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {loading ? "Oluşturuluyor..." : "Randevu Oluştur"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}