export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
          SalonCep
        </h1>

        <p className="text-slate-600 mt-4 text-lg">
          Berber ve kuaförler için randevu ve müşteri yönetim sistemi
        </p>

        <div className="mt-8 grid gap-3">
          <a
            href="/login"
            className="bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition block"
          >
            Yönetim Paneli Girişi
          </a>

          <a
            href="/book"
            className="bg-slate-200 text-slate-800 rounded-xl py-3 font-medium hover:bg-slate-300 transition block"
          >
            Online Randevu Al
          </a>
        </div>
      </div>
    </main>
  );
}