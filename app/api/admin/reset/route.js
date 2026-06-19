import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdminRequest } from "@/lib/requireAdmin";

// Admin-only, destructive: wipes every reservation and puts all spots back to
// "free". Requires the client to send { confirm: "RESET" } so this can't be
// triggered by an accidental request replay.
export async function POST(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (body?.confirm !== "RESET") {
    return NextResponse.json({ error: "Confirmation manquante." }, { status: 400 });
  }

  try {
    await query("delete from reservations");
    await query("update spots set status = 'free', updated_at = now()");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
