import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة الاختبارات | Exam Platform",
  description: "منصة لإنشاء وإجراء الاختبارات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-slate-800 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
