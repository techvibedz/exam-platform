"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("الرجاء إدخال اسمك (حرفين على الاقل)");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "حدث خطا");
    }
    setLoading(false);
  }

  return (
    <div className="card max-w-md mx-auto mb-8 text-center">
      <h2 className="text-xl font-bold text-slate-700 mb-2">تسجيل الدخول</h2>
      <p className="text-slate-500 mb-4">ادخل اسمك للمشاركة في الاختبارات</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ادخل اسمك هنا..."
          className="input-field text-center"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
