"use client";

import { useRouter } from "next/navigation";

export default function AdminClient({
  examId,
  isPublished,
}: {
  examId: number;
  isPublished: boolean;
}) {
  const router = useRouter();

  async function togglePublish() {
    await fetch(`/api/exams/${examId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    router.refresh();
  }

  async function deleteExam() {
    if (!confirm("هل انت متاكد من حذف هذا الاختبار؟")) return;
    await fetch(`/api/exams/${examId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <button onClick={togglePublish} className="btn-secondary text-sm">
        {isPublished ? "اخفاء" : "نشر"}
      </button>
      <button onClick={deleteExam} className="btn-danger text-sm">
        حذف
      </button>
    </>
  );
}
