"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateExamPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description.trim() }),
    });
    if (res.ok) {
      const exam = await res.json();
      router.push(`/admin/exams/${exam.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">انشاء اختبار جديد</h1>
          <Link href="/admin" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            رجوع
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">عنوان الاختبار</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="مثال: اختبار الرياضيات - الفصل الاول"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">وصف الاختبار (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="وصف قصير عن الاختبار..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "جاري الانشاء..." : "انشاء الاختبار"}
          </button>
        </form>
      </main>
    </div>
  );
}
