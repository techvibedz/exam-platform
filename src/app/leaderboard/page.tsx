import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [attempts, grouped] = await Promise.all([
    prisma.attempt.findMany({
      take: 50,
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        score: true,
        total: true,
        completedAt: true,
        user: { select: { name: true } },
        exam: { select: { title: true, id: true } },
      },
    }),
    prisma.attempt.groupBy({
      by: ["userId"],
      _sum: { score: true, total: true },
      _count: { _all: true },
    }),
  ]);

  const userIds = grouped.map((g) => g.userId);
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      })
    : [];
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  const userStats = grouped.map((g) => ({
    name: nameById.get(g.userId) ?? "",
    attempts: g._count._all,
    totalScore: g._sum.score ?? 0,
    totalPossible: g._sum.total ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة المتصدرين</h1>
          <Link href="/" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
            الرئيسية
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-slate-700 mb-4">ترتيب المستخدمين</h2>
        {userStats.length === 0 ? (
          <div className="card text-center text-slate-500 py-12">
            لا توجد نتائج بعد
          </div>
        ) : (
          <div className="card overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">#</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">الاسم</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">عدد المحاولات</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">مجموع النقاط</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">نسبة النجاح</th>
                </tr>
              </thead>
              <tbody>
                {userStats
                  .sort((a, b) => {
                    const pctA = a.totalPossible > 0 ? a.totalScore / a.totalPossible : 0;
                    const pctB = b.totalPossible > 0 ? b.totalScore / b.totalPossible : 0;
                    return pctB - pctA;
                  })
                  .map((u, i) => {
                    const pct = u.totalPossible > 0 ? Math.round((u.totalScore / u.totalPossible) * 100) : 0;
                    return (
                      <tr key={u.name} className="border-b last:border-0">
                        <td className="py-3 px-4 font-bold">{i + 1}</td>
                        <td className="py-3 px-4 font-medium">{u.name}</td>
                        <td className="py-3 px-4 text-slate-500">{u.attempts}</td>
                        <td className="py-3 px-4">
                          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded font-bold">
                            {u.totalScore}/{u.totalPossible}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-500"}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="text-lg font-bold text-slate-700 mb-4">اخر المحاولات</h2>
        {attempts.length === 0 ? (
          <div className="card text-center text-slate-500 py-8">لا توجد محاولات بعد</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">الاسم</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">الاختبار</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">النتيجة</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{a.user.name}</td>
                    <td className="py-3 px-4 text-slate-500">{a.exam.title}</td>
                    <td className="py-3 px-4">
                      <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded font-bold">
                        {a.score}/{a.total}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(a.completedAt).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
