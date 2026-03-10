"use client";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
};

export default function Toast({
  message,
  type = "info",
}: ToastProps) {
  const colorClass =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-slate-800";

  return (
    <div
      className={`fixed top-5 right-5 z-50 text-white px-5 py-3 rounded-2xl shadow-xl ${colorClass}`}
    >
      {message}
    </div>
  );
}