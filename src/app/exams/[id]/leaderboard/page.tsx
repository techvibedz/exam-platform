import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ExamLeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const examId = parseInt(id);

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      _count: { select: { questions: true } },
    },
  });

  if (!exam) notFound();

  const attempts = await prisma.attempt.findMany({
    where: { examId },
    orderBy: { score: "desc" },
    include: {
      user: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">المتصدرون: {exam.title}</h1>
            <p className="text-teal-200 text-sm">{attempts.length} محاولة</p>
          </div>
          <Link href="/" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            الرئيسية
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {attempts.length === 0 ? (
          <div className="card text-center text-slate-500 py-12">
            لا توجد محاولات لهذا الاختبار بعد
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">#</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">الاسم</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">النتيجة</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">النسبة</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => {
                  const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
                  return (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        {i === 0 ? (
                          <span className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            1
                          </span>
                        ) : i === 1 ? (
                          <span className="bg-slate-200 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            2
                          </span>
                        ) : i === 2 ? (
                          <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400">{i + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{a.user.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded font-bold text-xs ${
                          pct >= 70 ? "bg-green-100 text-green-700" :
                          pct >= 50 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {a.score}/{a.total}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold text-sm ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-500"}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {new Date(a.completedAt).toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href={`/exams/${exam.id}`} className="text-teal-600 hover:underline text-sm">
            العودة للاختبار
          </Link>
        </div>
      </main>
    </div>
  );
}
