"use client";

import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="admin-nav">
      <a href="/admin" className="is-active">
        Tableau de bord
      </a>
      <a href="/" target="_blank" rel="noreferrer">
        Voir le site public ↗
      </a>
      <button type="button" onClick={handleLogout}>
        Se déconnecter
      </button>
    </nav>
  );
}
