import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminId = await getAdminFromCookies();
  if (!adminId) redirect("/admin/login");

  const exams = await prisma.exam.findMany({
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const attempts = await prisma.attempt.findMany({
    take: 20,
    orderBy: { completedAt: "desc" },
    include: {
      user: { select: { name: true } },
      exam: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة التحكم - المشرف</h1>
          <div className="flex gap-3">
            <Link href="/admin/exams/create" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              اختبار جديد +
            </Link>
            <Link href="/" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-teal-600">{exams.length}</div>
            <div className="text-slate-500 text-sm mt-1">الاختبارات</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-amber-500">
              {exams.reduce((sum, e) => sum + e._count.questions, 0)}
            </div>
            <div className="text-slate-500 text-sm mt-1">الاسئلة</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-500">
              {exams.reduce((sum, e) => sum + e._count.attempts, 0)}
            </div>
            <div className="text-slate-500 text-sm mt-1">المحاولات</div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-700 mb-4">الاختبارات</h2>
        {exams.length === 0 ? (
          <div className="card text-center text-slate-500 py-8">
            لا توجد اختبارات بعد.{" "}
            <Link href="/admin/exams/create" className="text-teal-600 hover:underline">
              انشئ اول اختبار
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 mb-8">
            {exams.map((exam) => (
              <div key={exam.id} className="card flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800">{exam.title}</h3>
                  <div className="flex gap-4 text-sm text-slate-400 mt-1">
                    <span>{exam._count.questions} اسئلة</span>
                    <span>{exam._count.attempts} محاولات</span>
                    <span className={exam.isPublished ? "text-green-500" : "text-amber-500"}>
                      {exam.isPublished ? "منشور" : "مسودة"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/exams/${exam.id}`} className="btn-secondary text-sm">
                    تعديل
                  </Link>
                  <AdminClient examId={exam.id} isPublished={exam.isPublished} />
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold text-slate-700 mb-4">اخر المحاولات</h2>
        {attempts.length === 0 ? (
          <div className="card text-center text-slate-500 py-6">لا توجد محاولات بعد</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 text-slate-500">المستخدم</th>
                  <th className="text-right py-3 px-4 text-slate-500">الاختبار</th>
                  <th className="text-right py-3 px-4 text-slate-500">النتيجة</th>
                  <th className="text-right py-3 px-4 text-slate-500">التاريخ</th>
                  <th className="text-right py-3 px-4 text-slate-500"></th>
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
                    <td className="py-3 px-4">
                      <Link
                        href={`/exams/${a.exam.id}/results?attempt=${a.id}`}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                      >
                        عرض الاجابات
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
