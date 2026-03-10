"use client";

import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold">SalonCep</h2>

            <nav className="mt-8 space-y-3">
              <a
                href="/dashboard"
                className="block hover:bg-slate-800 rounded-xl px-4 py-3"
              >
                Dashboard
              </a>

              <a
                href="/appointments"
                className="block hover:bg-slate-800 rounded-xl px-4 py-3"
              >
                Randevular
              </a>

              <a
                href="/staff"
                className="block hover:bg-slate-800 rounded-xl px-4 py-3"
              >
                Personeller
              </a>
            <a
  href="/settings"
  className="block hover:bg-slate-800 rounded-xl px-4 py-3"
>
  Çalışma Saatleri
</a>
              <a
                href="/services"
                className="block hover:bg-slate-800 rounded-xl px-4 py-3"
              >
                Hizmetler
              </a>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="mt-8 bg-red-600 text-white rounded-xl px-4 py-3 font-medium hover:bg-red-700 transition"
          >
            Çıkış Yap
          </button>
        </aside>

        <section className="flex-1 p-8">{children}</section>
      </div>
    </main>
  );
}