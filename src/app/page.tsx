import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import SignInForm from "./SignInForm";
import LogoutButton from "./LogoutButton";
import { getUserFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUserFromCookies();
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const leaderboard = await prisma.attempt.findMany({
    take: 10,
    orderBy: { score: "desc" },
    include: {
      user: { select: { name: true } },
      exam: { select: { title: true } },
    },
  });

  const myHistory = user
    ? await prisma.attempt.findMany({
        where: { userId: user.userId },
        orderBy: { completedAt: "desc" },
        include: {
          exam: { select: { id: true, title: true } },
        },
      })
    : [];

  const completedExamIds = new Set(myHistory.map((a) => a.examId));

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">منصة الاختبارات</h1>
          <div className="flex gap-3">
            <Link href="/leaderboard" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              المتصدرون
            </Link>
            <Link href="/admin/login" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              لوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!user && <SignInForm />}

        {user && (
          <div className="mb-6 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>مرحبا بك، <strong>{user.name}</strong></span>
            <LogoutButton />
          </div>
        )}

        {user && (
          <>
            <h2 className="text-xl font-bold mb-6 text-slate-700">الاختبارات المتاحة</h2>
            {exams.length === 0 ? (
              <div className="card text-center text-slate-500 py-12">
                لا توجد اختبارات متاحة حاليا
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => {
                  const completed = completedExamIds.has(exam.id);
                  const myAttempt = myHistory.find((a) => a.examId === exam.id);
                  return (
                    <div
                      key={exam.id}
                      className={`card hover:shadow-md transition group border ${
                        completed
                          ? "border-green-200 bg-green-50/50"
                          : "border-transparent hover:border-teal-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={completed && myAttempt ? `/exams/${exam.id}/results?attempt=${myAttempt.id}` : `/exams/${exam.id}`}
                          className="text-lg font-bold text-slate-800 mb-2 hover:text-teal-600"
                        >
                          {exam.title}
                        </Link>
                        {completed && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            تم
                          </span>
                        )}
                      </div>
                      {exam.description && (
                        <p className="text-slate-500 text-sm mb-4">{exam.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-slate-400 items-center">
                        <span>{exam._count.questions} اسئلة</span>
                        <span>{exam._count.attempts} محاولة</span>
                        <Link
                          href={`/exams/${exam.id}/leaderboard`}
                          className="text-teal-500 hover:text-teal-700 font-medium mr-auto"
                        >
                          المتصدرون
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {myHistory.length > 0 && (
              <>
                <h2 className="text-xl font-bold mb-6 mt-12 text-slate-700">سجل محاولاتي</h2>
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 text-slate-500 font-semibold">الاختبار</th>
                        <th className="text-right py-3 px-4 text-slate-500 font-semibold">النتيجة</th>
                        <th className="text-right py-3 px-4 text-slate-500 font-semibold">التاريخ</th>
                        <th className="text-right py-3 px-4 text-slate-500 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {myHistory.map((a) => (
                        <tr key={a.id} className="border-b last:border-0">
                          <td className="py-3 px-4 font-medium">{a.exam.title}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded font-bold text-sm ${
                              a.total > 0 && a.score / a.total >= 0.7
                                ? "bg-green-100 text-green-700"
                                : a.total > 0 && a.score / a.total >= 0.5
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {a.score}/{a.total}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-sm">
                            {new Date(a.completedAt).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href={`/exams/${a.exam.id}/results?attempt=${a.id}`}
                              className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                            >
                              عرض التفاصيل
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <h2 className="text-xl font-bold mb-6 mt-12 text-slate-700">لوحة المتصدرين</h2>
            {leaderboard.length === 0 ? (
              <div className="card text-center text-slate-500 py-8">
                لا توجد نتائج بعد
              </div>
            ) : (
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-slate-500 font-semibold">#</th>
                      <th className="text-right py-3 px-4 text-slate-500 font-semibold">الاسم</th>
                      <th className="text-right py-3 px-4 text-slate-500 font-semibold">الاختبار</th>
                      <th className="text-right py-3 px-4 text-slate-500 font-semibold">النتيجة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((a, i) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4 font-medium">{a.user.name}</td>
                        <td className="py-3 px-4 text-slate-500">{a.exam.title}</td>
                        <td className="py-3 px-4">
                          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded font-bold">
                            {a.score}/{a.total}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
