"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ResultData {
  attempt: { id: number; score: number; total: number };
  exam: {
    id: number;
    title: string;
    questions: {
      id: number;
      text: string;
      orderNum: number;
      options: { id: number; text: string; isCorrect: boolean }[];
    }[];
  };
  userAnswers: { questionId: number; optionId: number }[];
}

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${attemptId}`);
    if (stored) {
      setData(JSON.parse(stored));
      setLoading(false);
    }
  }, [attemptId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">جاري التحميل...</div>;
  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="card text-center text-red-500 py-8">النتيجة غير متوفرة</div>
      <Link href="/" className="text-teal-600 hover:underline">العودة للرئيسية</Link>
    </div>
  );

  const { attempt, exam, userAnswers } = data;
  const percentage = Math.round((attempt.score / attempt.total) * 100);
  const grade = percentage >= 90 ? "ممتاز" : percentage >= 70 ? "جيد جدا" : percentage >= 50 ? "جيد" : "ضعيف";
  const gradeColors: Record<string, string> = {
    "ممتاز": "text-green-600",
    "جيد جدا": "text-teal-600",
    "جيد": "text-amber-600",
    "ضعيف": "text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">نتيجة الاختبار</h1>
          <Link href="/" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            الرئيسية
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center mb-8">
          <h2 className="text-xl font-bold text-slate-700 mb-2">{exam.title}</h2>
          <div className="text-5xl font-extrabold text-teal-600 my-4">
            {attempt.score}/{attempt.total}
          </div>
          <div className="text-lg font-bold mb-1">
            <span className={gradeColors[grade]}>{grade}</span>
          </div>
          <div className="text-slate-400 text-sm">{percentage}%</div>
          <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                percentage >= 70 ? "bg-teal-500" : percentage >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-700 mb-4">مراجعة الاجابات</h2>
        {exam.questions.map((q) => {
          const userAnswerIds = userAnswers
            .filter((a) => a.questionId === q.id)
            .map((a) => a.optionId);
          const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
          const userSelected = userAnswerIds.sort().join(",");
          const correctSelected = correctIds.sort().join(",");
          const isCorrect = correctIds.length > 0 && userSelected === correctSelected;

          return (
            <div
              key={q.id}
              className={`card mb-4 border-r-4 ${
                isCorrect ? "border-r-green-500" : "border-r-red-500"
              }`}
            >
              <h3 className="font-bold text-slate-800 mb-3 flex items-start gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white ${
                    isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {isCorrect ? "✓" : "✕"}
                </span>
                <span>{q.text}</span>
              </h3>
              <div className="pr-9 space-y-1">
                {q.options.map((o) => {
                  const isSelected = userAnswerIds.includes(o.id);
                  const isRight = o.isCorrect;
                  let cls = "p-2 rounded-lg text-sm ";
                  if (isRight && isSelected) cls += "bg-green-100 text-green-800 font-semibold ";
                  else if (isRight && !isSelected) cls += "bg-amber-100 text-amber-800 ";
                  else if (isSelected && !isRight) cls += "bg-red-100 text-red-800 ";
                  else cls += "text-slate-500 ";

                  let label = "";
                  if (isSelected && isRight) label = " ✓ اجابتك";
                  else if (isRight && !isSelected) label = " ← الاجابة الصحيحة";
                  else if (isSelected && !isRight) label = " ← اجابتك";

                  return (
                    <div key={o.id} className={cls}>
                      {o.text}
                      <span className="text-xs">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="text-center mt-8 pb-8">
          <Link href="/" className="btn-primary inline-block">
            العودة للرئيسية
          </Link>
        </div>
      </main>
    </div>
  );
}
