"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  orderNum: number;
  options: Option[];
}

interface Exam {
  id: number;
  title: string;
  description: string;
  isPublished: boolean;
  questions: Question[];
}

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState<Record<number, string>>({});
  const [editQuestionText, setEditQuestionText] = useState<Record<number, string>>({});
  const [editOptionText, setEditOptionText] = useState<Record<number, string>>({});

  const loadExam = useCallback(async () => {
    const res = await fetch(`/api/exams/${params.id}`);
    if (res.ok) setExam(await res.json());
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadExam(); }, [loadExam]);

  async function addQuestion() {
    if (!newQuestion.trim()) return;
    await fetch(`/api/exams/${exam!.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newQuestion.trim() }),
    });
    setNewQuestion("");
    loadExam();
  }

  async function deleteQuestion(qId: number) {
    if (!confirm("هل انت متاكد من حذف هذا السؤال؟")) return;
    await fetch(`/api/questions/${qId}`, { method: "DELETE" });
    loadExam();
  }

  async function addOption(qId: number) {
    const text = newOptions[qId]?.trim();
    if (!text) return;
    await fetch(`/api/questions/${qId}/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setNewOptions((p) => ({ ...p, [qId]: "" }));
    loadExam();
  }

  async function toggleCorrect(oId: number, qId: number, current: boolean) {
    await fetch(`/api/options/${oId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCorrect: !current }),
    });
    loadExam();
  }

  async function deleteOption(oId: number) {
    await fetch(`/api/options/${oId}`, { method: "DELETE" });
    loadExam();
  }

  async function saveQuestionText(qId: number) {
    const text = editQuestionText[qId];
    if (text === undefined) return;
    await fetch(`/api/questions/${qId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setEditQuestionText((p) => {
      const c = { ...p };
      delete c[qId];
      return c;
    });
  }

  async function saveOptionText(oId: number) {
    const text = editOptionText[oId];
    if (text === undefined) return;
    await fetch(`/api/options/${oId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setEditOptionText((p) => {
      const c = { ...p };
      delete c[oId];
      return c;
    });
  }

  async function togglePublish() {
    await fetch(`/api/exams/${exam!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !exam!.isPublished }),
    });
    loadExam();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">جاري التحميل...</div>;
  if (!exam) return <div className="min-h-screen flex items-center justify-center text-red-500">الاختبار غير موجود</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{exam.title}</h1>
            <p className="text-teal-200 text-sm">{exam.questions.length} اسئلة</p>
          </div>
          <div className="flex gap-2">
            <button onClick={togglePublish} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              {exam.isPublished ? "اخفاء" : "نشر"}
            </button>
            <Link href="/admin" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              رجوع
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <h2 className="font-bold text-slate-700 mb-3">اضافة سؤال جديد</h2>
          <div className="flex gap-2">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="اكتب السؤال هنا..."
              className="input-field flex-1"
              onKeyDown={(e) => e.key === "Enter" && addQuestion()}
            />
            <button onClick={addQuestion} className="btn-primary whitespace-nowrap">
              اضافة
            </button>
          </div>
        </div>

        {exam.questions.map((q, qi) => (
          <div key={q.id} className="card mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="bg-teal-100 text-teal-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {qi + 1}
                </span>
                {editQuestionText[q.id] !== undefined ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      value={editQuestionText[q.id]}
                      onChange={(e) => setEditQuestionText((p) => ({ ...p, [q.id]: e.target.value }))}
                      className="input-field flex-1"
                      onKeyDown={(e) => e.key === "Enter" && saveQuestionText(q.id)}
                    />
                    <button onClick={() => saveQuestionText(q.id)} className="btn-primary text-sm py-1">حفظ</button>
                  </div>
                ) : (
                  <strong
                    className="cursor-pointer hover:text-teal-600 flex-1"
                    onClick={() => setEditQuestionText((p) => ({ ...p, [q.id]: q.text }))}
                  >
                    {q.text}
                  </strong>
                )}
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="text-red-500 hover:text-red-700 text-sm mr-2 shrink-0">
                حذف السؤال
              </button>
            </div>

            <div className="space-y-2 pr-9">
              <p className="text-xs text-slate-400 mb-1">يمكن اختيار اكثر من اجابة صحيحة</p>
              {q.options.map((o) => (
                <div key={o.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCorrect(o.id, q.id, o.isCorrect)}
                    className={`w-5 h-5 rounded-md border-2 shrink-0 transition ${
                      o.isCorrect
                        ? "bg-green-500 border-green-500"
                        : "border-slate-300 hover:border-green-400"
                    }`}
                    title={o.isCorrect ? "الغاء التحديد" : "تحديد كاجابة صحيحة"}
                  />
                  {editOptionText[o.id] !== undefined ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        value={editOptionText[o.id]}
                        onChange={(e) => setEditOptionText((p) => ({ ...p, [o.id]: e.target.value }))}
                        className="input-field flex-1 text-sm py-1"
                        onKeyDown={(e) => e.key === "Enter" && saveOptionText(o.id)}
                      />
                      <button onClick={() => saveOptionText(o.id)} className="btn-primary text-xs py-1 px-2">حفظ</button>
                    </div>
                  ) : (
                    <span
                      className={`flex-1 cursor-pointer text-sm ${o.isCorrect ? "text-green-600 font-semibold" : ""}`}
                      onClick={() => setEditOptionText((p) => ({ ...p, [o.id]: o.text }))}
                    >
                      {o.text}
                    </span>
                  )}
                  {o.isCorrect && <span className="text-xs text-green-500 font-bold">✓ صحيحة</span>}
                  <button onClick={() => deleteOption(o.id)} className="text-red-400 hover:text-red-600 text-xs shrink-0">
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <input
                  value={newOptions[q.id] || ""}
                  onChange={(e) => setNewOptions((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="خيار جديد..."
                  className="input-field flex-1 text-sm py-1"
                  onKeyDown={(e) => e.key === "Enter" && addOption(q.id)}
                />
                <button onClick={() => addOption(q.id)} className="btn-secondary text-sm py-1 whitespace-nowrap">
                  + خيار
                </button>
              </div>
            </div>
          </div>
        ))}

        {exam.questions.length === 0 && (
          <div className="card text-center text-slate-500 py-12">
            لا توجد اسئلة بعد. اضف سؤالك الاول اعلاه.
          </div>
        )}
      </main>
    </div>
  );
}
