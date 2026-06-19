import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdminRequest } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const MAX_DURATION_HOURS = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Admin-only: list every reservation, most recent first.
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const result = await query(
      `select r.id, r.spot_id, r.full_name, r.email, r.plate, r.start_time, r.end_time,
              r.status, r.notes, r.created_at, s.num as spot_num, s.label as spot_label
       from reservations r
       join spots s on s.id = r.spot_id
       order by r.start_time desc`
    );
    return NextResponse.json({ reservations: result.rows });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Public: create a reservation for the prototype. Validates the slot, checks the
// spot isn't under maintenance, and rejects overlapping confirmed bookings.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { spotId, fullName, email, plate, startTime, endTime, notes } = body;

  if (!spotId || !fullName?.trim() || !email?.trim() || !startTime || !endTime) {
    return NextResponse.json({ error: "Merci de remplir tous les champs obligatoires." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Le créneau choisi est invalide." }, { status: 400 });
  }
  if (start.getTime() < Date.now() - 5 * 60 * 1000) {
    return NextResponse.json({ error: "Le créneau doit être dans le futur." }, { status: 400 });
  }
  const durationHours = (end.getTime() - start.getTime()) / 36e5;
  if (durationHours > MAX_DURATION_HOURS) {
    return NextResponse.json(
      { error: `Une réservation ne peut pas dépasser ${MAX_DURATION_HOURS} heures.` },
      { status: 400 }
    );
  }

  try {
    const spotResult = await query("select id, status, label from spots where id = $1", [spotId]);
    const spot = spotResult.rows[0];
    if (!spot) {
      return NextResponse.json({ error: "Place introuvable." }, { status: 404 });
    }
    if (spot.status === "maintenance") {
      return NextResponse.json({ error: "Cette place est actuellement en maintenance." }, { status: 409 });
    }

    const overlapResult = await query(
      `select id from reservations
       where spot_id = $1 and status = 'confirmed' and start_time < $3 and end_time > $2
       limit 1`,
      [spotId, start.toISOString(), end.toISOString()]
    );
    if (overlapResult.rows.length) {
      return NextResponse.json(
        { error: "Cette place est déjà réservée sur ce créneau. Choisissez un autre horaire ou une autre place." },
        { status: 409 }
      );
    }

    const insertResult = await query(
      `insert into reservations (spot_id, full_name, email, plate, start_time, end_time, notes, status)
       values ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       returning *`,
      [spotId, fullName.trim(), email.trim(), plate?.trim() || null, start.toISOString(), end.toISOString(), notes?.trim() || null]
    );

    return NextResponse.json({ reservation: insertResult.rows[0], spotLabel: spot.label }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
