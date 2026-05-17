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
  questions: Question[];
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadExam = useCallback(async () => {
    const res = await fetch(`/api/exams/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      if (!data.isPublished) {
        setError("هذا الاختبار غير متاح حاليا");
      } else {
        setExam(data);
      }
    } else {
      setError("الاختبار غير موجود");
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadExam(); }, [loadExam]);

  function toggleOption(qId: number, oId: number) {
    setAnswers((p) => {
      const current = p[qId] || [];
      const next = current.includes(oId)
        ? current.filter((id) => id !== oId)
        : [...current, oId];
      return { ...p, [qId]: next };
    });
  }

  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;

  async function handleSubmit() {
    const unanswered = exam!.questions.filter((q) => !answers[q.id] || answers[q.id].length === 0);
    if (unanswered.length > 0) {
      if (!confirm(`لديك ${unanswered.length} اسئلة بدون اجابة. هل تريد المتابعة؟`)) return;
    }
    setSubmitting(true);
    const answerArray = Object.entries(answers).map(([qId, oIds]) => ({
      questionId: parseInt(qId),
      optionIds: oIds,
    }));
    const res = await fetch(`/api/exams/${exam!.id}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerArray }),
    });
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem(
        `result_${data.attempt.id}`,
        JSON.stringify(data)
      );
      router.push(`/exams/${exam!.id}/results?attempt=${data.attempt.id}`);
    } else {
      const d = await res.json();
      setError(d.error || "حدث خطا");
    }
    setSubmitting(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">جاري التحميل...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="card text-center text-red-500 py-8">{error}</div>
      <Link href="/" className="text-teal-600 hover:underline">العودة للرئيسية</Link>
    </div>
  );
  if (!exam) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{exam.title}</h1>
            <p className="text-teal-200 text-sm">{exam.questions.length} اسئلة</p>
          </div>
          <div className="text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {answeredCount}/{exam.questions.length} مجاب
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {exam.questions.map((q, qi) => {
          const selected = answers[q.id] || [];
          const hasCorrectAnswers = q.options.some((o) => o.isCorrect);
          return (
            <div key={q.id} className="card">
              <h3 className="font-bold text-slate-800 mb-4 flex items-start gap-2">
                <span className="bg-teal-100 text-teal-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {qi + 1}
                </span>
                <span>
                  {q.text}
                  {hasCorrectAnswers && q.options.filter((o) => o.isCorrect).length > 1 && (
                    <span className="text-xs text-amber-500 font-normal mr-2">(يمكن اختيار اكثر من اجابة)</span>
                  )}
                </span>
              </h3>
              <div className="space-y-2 pr-9">
                {q.options.map((o) => (
                  <label
                    key={o.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                      selected.includes(o.id)
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:border-teal-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(o.id)}
                      onChange={() => toggleOption(q.id, o.id)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-sm">{o.text}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <div className="sticky bottom-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full text-lg py-3 shadow-lg"
          >
            {submitting ? "جاري التصحيح..." : "تسليم الاختبار"}
          </button>
        </div>
      </main>
    </div>
  );
}
