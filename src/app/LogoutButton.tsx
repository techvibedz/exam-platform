"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-sm text-red-400 hover:text-red-600 transition">
      خروج
    </button>
  );
}
