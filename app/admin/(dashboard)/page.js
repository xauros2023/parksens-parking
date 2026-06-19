"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SPOT_STATUSES = ["free", "occupied", "maintenance"];

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const [spots, setSpots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const statRefs = useRef({});

  const load = useCallback(async () => {
    try {
      const [spotsRes, reservationsRes] = await Promise.all([
        fetch("/api/spots", { cache: "no-store" }),
        fetch("/api/reservations", { cache: "no-store" }),
      ]);
      if (reservationsRes.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const spotsData = await spotsRes.json();
      const reservationsData = await reservationsRes.json();
      setSpots(spotsData.spots || []);
      setReservations(reservationsData.reservations || []);
      setError(null);
    } catch {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const now = Date.now();
  const stats = {
    total: spots.length,
    free: spots.filter((s) => s.effectiveStatus === "free").length,
    occupied: spots.filter((s) => s.effectiveStatus === "occupied" || s.effectiveStatus === "reserved").length,
    upcoming: reservations.filter((r) => r.status === "confirmed" && new Date(r.start_time).getTime() > now).length,
  };

  useEffect(() => {
    if (loading) return;
    Object.entries(stats).forEach(([key, value]) => {
      const el = statRefs.current[key];
      if (!el) return;
      gsap.fromTo(el, { innerText: 0 }, { innerText: value, duration: 0.6, ease: "power2.out", snap: { innerText: 1 } });
    });
  }, [loading, stats.total, stats.free, stats.occupied, stats.upcoming]);

  async function updateSpotStatus(spotId, status) {
    setBusyId("spot-" + spotId);
    try {
      const res = await fetch(`/api/admin/spots/${spotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  }

  async function updateReservationStatus(id, status) {
    setBusyId("res-" + id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d&apos;ensemble du prototype à six places et des réservations en cours.</p>
        </div>
      </div>

      {error && <p className="form-feedback form-feedback--error">{error}</p>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Places totales</div>
          <div className="stat-card__value" ref={(el) => (statRefs.current.total = el)}>
            0
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Places libres</div>
          <div className="stat-card__value text-ok" ref={(el) => (statRefs.current.free = el)}>
            0
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Occupées / réservées</div>
          <div className="stat-card__value text-warn" ref={(el) => (statRefs.current.occupied = el)}>
            0
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Réservations à venir</div>
          <div className="stat-card__value" ref={(el) => (statRefs.current.upcoming = el)}>
            0
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2 className="admin-panel__title">Contrôle des places</h2>
        <div className="spot-control-grid">
          {spots.map((spot) => (
            <div className="spot-control" key={spot.id}>
              <span className="spot-control__num">{spot.num}</span>
              <span className={"badge badge--" + spot.effectiveStatus}>{spot.effectiveStatus}</span>
              <select
                value={spot.status}
                disabled={busyId === "spot-" + spot.id}
                onChange={(e) => updateSpotStatus(spot.id, e.target.value)}
              >
                {SPOT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <h2 className="admin-panel__title">Réservations</h2>
        {loading ? (
          <p>Chargement…</p>
        ) : reservations.length === 0 ? (
          <p className="admin-empty">Aucune réservation pour le moment.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Usager</th>
                  <th>Créneau</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.spot_num ?? r.spot_label}</td>
                    <td>
                      {r.full_name}
                      <br />
                      <span style={{ opacity: 0.6 }}>{r.email}</span>
                      {r.plate && (
                        <>
                          <br />
                          <span style={{ opacity: 0.6 }}>{r.plate}</span>
                        </>
                      )}
                    </td>
                    <td>
                      {formatDateTime(r.start_time)} → {formatDateTime(r.end_time)}
                    </td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (r.status === "confirmed"
                            ? "badge--reserved"
                            : r.status === "completed"
                            ? "badge--free"
                            : "badge--maintenance")
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {r.status === "confirmed" && (
                          <>
                            <button
                              className="btn btn--sm btn--ghost"
                              disabled={busyId === "res-" + r.id}
                              onClick={() => updateReservationStatus(r.id, "completed")}
                            >
                              Terminer
                            </button>
                            <button
                              className="btn btn--sm btn--danger"
                              disabled={busyId === "res-" + r.id}
                              onClick={() => updateReservationStatus(r.id, "cancelled")}
                            >
                              Annuler
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
