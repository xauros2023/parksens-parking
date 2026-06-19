import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdminRequest } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

// Public read endpoint: returns each spot plus an "effectiveStatus" that folds in
// any currently-active confirmed reservation, so the homepage/reservation page
// reflect live occupancy without needing admin access.
export async function GET() {
  try {
    const spotsResult = await query(
      "select id, num, label, zone, status, updated_at from spots order by num asc"
    );

    const activeResult = await query(
      `select distinct spot_id from reservations
       where status = 'confirmed' and start_time <= now() and end_time >= now()`
    );
    const reservedSpotIds = new Set(activeResult.rows.map((r) => r.spot_id));

    const spots = spotsResult.rows.map((spot) => ({
      ...spot,
      effectiveStatus:
        spot.status === "maintenance"
          ? "maintenance"
          : spot.status === "occupied"
          ? "occupied"
          : reservedSpotIds.has(spot.id)
          ? "reserved"
          : "free",
    }));

    return NextResponse.json({ spots, isAdmin: await isAdminRequest() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
