import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdminRequest } from "@/lib/requireAdmin";

const ALLOWED_STATUSES = ["free", "occupied", "maintenance"];

// Admin-only: manually override a spot's physical status (e.g. mark it occupied
// after a sensor glitch, or pull it out of service for maintenance).
export async function PATCH(request, { params }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  try {
    await query("update spots set status = $1, updated_at = now() where id = $2", [status, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
