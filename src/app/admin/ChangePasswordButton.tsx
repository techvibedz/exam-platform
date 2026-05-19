"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPass !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (newPass.length < 4) {
      setError("كلمة المرور الجديدة قصيرة جدا");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    });

    if (res.ok) {
      setSuccess("تم تغيير كلمة المرور بنجاح");
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } else {
      const d = await res.json();
      setError(d.error || "حدث خطا");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
      >
        تغيير كلمة المرور
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()} dir="rtl">
            <h2 className="text-lg font-bold text-slate-700 mb-4">تغيير كلمة المرور</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="input-field"
                  required
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="input-field"
                  required
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">تاكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input-field"
                  required
                  dir="ltr"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "جاري..." : "حفظ"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                  الغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
