"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { STATUS_LABELS_FR } from "@/lib/statusLabels";

const DURATIONS = [
  { value: 0.5, label: "30 minutes" },
  { value: 1, label: "1 heure" },
  { value: 2, label: "2 heures" },
  { value: 4, label: "4 heures" },
  { value: 8, label: "8 heures" },
];

function defaultStart() {
  const d = new Date(Date.now() + 15 * 60 * 1000);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReservePage() {
  const [spots, setSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [startTime, setStartTime] = useState(defaultStart());
  const [duration, setDuration] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [plate, setPlate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/spots", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setSpots(data.spots || []);
      } finally {
        if (!cancelled) setLoadingSpots(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.from(root.querySelectorAll(".reserve__head, .spot-grid, .form-card"), {
        y: 20,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.08,
      });
      return () => tween.kill();
    });
    return () => mm.revert();
  }, []);

  const endTime = useMemo(() => {
    if (!startTime) return "";
    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) return "";
    return new Date(start.getTime() + duration * 36e5).toISOString();
  }, [startTime, duration]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSpot) {
      setFeedback({ type: "error", message: "Choisissez une place sur le plan ci-contre." });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: selectedSpot,
          fullName,
          email,
          plate,
          notes,
          startTime: new Date(startTime).toISOString(),
          endTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Une erreur est survenue." });
        return;
      }
      setFeedback({
        type: "ok",
        message: `Réservation confirmée pour ${data.spotLabel}. Un récapitulatif a été noté pour ${email}.`,
      });
      setSelectedSpot(null);
      setFullName("");
      setEmail("");
      setPlate("");
      setNotes("");
    } catch {
      setFeedback({ type: "error", message: "Impossible de contacter le serveur. Réessayez." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main id="main" ref={rootRef}>
        <section className="reserve">
          <div className="reserve__head">
            <p className="reserve__eyebrow">Réservation en ligne</p>
            <h1 className="reserve__title">Réserver une place sur le prototype</h1>
            <p className="reserve__lede">
              Choisissez une place libre, indiquez le créneau souhaité, et confirmez. La place est
              bloquée immédiatement et apparaît dans l&apos;espace administration.
            </p>
          </div>

          <div className="reserve__layout">
            <div>
              <h2 style={{ fontFamily: "var(--display)", color: "var(--forest)", fontSize: "1.1rem", marginBottom: 16 }}>
                1. Choisissez une place
              </h2>
              {loadingSpots ? (
                <p>Chargement des places…</p>
              ) : (
                <div className="spot-grid">
                  {spots.map((spot) => {
                    const disabled = spot.effectiveStatus === "maintenance" || spot.effectiveStatus === "occupied";
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        disabled={disabled}
                        className={"spot-btn" + (selectedSpot === spot.id ? " is-selected" : "")}
                        onClick={() => setSelectedSpot(spot.id)}
                        title={disabled ? "Place indisponible pour le moment" : "Sélectionner cette place"}
                      >
                        <span className="spot-btn__num">{spot.num}</span>
                        <span className={"badge badge--" + spot.effectiveStatus}>
                          {STATUS_LABELS_FR[spot.effectiveStatus]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
              <h2 style={{ fontFamily: "var(--display)", color: "var(--forest)", fontSize: "1.1rem", marginBottom: 16 }}>
                2. Vos informations
              </h2>

              {feedback && (
                <div className={"form-feedback form-feedback--" + (feedback.type === "ok" ? "ok" : "error")}>
                  {feedback.message}
                </div>
              )}

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="startTime">Début du créneau *</label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="duration">Durée *</label>
                  <select id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                    {DURATIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="fullName">Nom complet *</label>
                <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="email">E-mail *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="plate">Plaque d&apos;immatriculation</label>
                  <input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="notes">Remarque (optionnel)</label>
                <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? "Envoi…" : "Confirmer la réservation"}
              </button>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
