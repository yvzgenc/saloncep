"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      setMessage("E-posta ve şifre zorunlu.");
      return;
    }

    if (isRegisterMode) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setMessage("Kayıt başarısız: " + error.message);
        return;
      }

      setMessage(
        "Kayıt başarılı. Email onayı açıksa mail kutunu kontrol et."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Giriş başarısız: " + error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-800 text-center">
          {isRegisterMode ? "Kayıt Ol" : "Giriş Yap"}
        </h1>

        <p className="text-slate-500 text-center mt-2">
          {isRegisterMode
            ? "SalonCep için yönetici hesabı oluştur"
            : "SalonCep yönetim paneline giriş yap"}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div className="bg-slate-100 text-slate-700 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading
              ? "İşleniyor..."
              : isRegisterMode
              ? "Kayıt Ol"
              : "Giriş Yap"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setMessage("");
          }}
          className="w-full mt-4 text-sm text-blue-600 hover:underline"
        >
          {isRegisterMode
            ? "Zaten hesabım var, giriş yap"
            : "Hesabın yok mu? Kayıt ol"}
        </button>
      </div>
    </main>
  );
}