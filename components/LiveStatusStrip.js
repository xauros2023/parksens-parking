"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

const LABELS = {
  free: "libres",
  reserved: "réservées",
  occupied: "occupées",
  maintenance: "en maintenance",
};

export default function LiveStatusStrip() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(false);
  const numRefs = useRef({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/spots", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (cancelled) return;
        const next = { free: 0, reserved: 0, occupied: 0, maintenance: 0 };
        data.spots.forEach((s) => {
          next[s.effectiveStatus] = (next[s.effectiveStatus] || 0) + 1;
        });
        setCounts(next);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const interval = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!counts) return;
    Object.entries(counts).forEach(([key, value]) => {
      const el = numRefs.current[key];
      if (!el) return;
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: value,
          duration: 0.8,
          ease: "power2.out",
          snap: { innerText: 1 },
        }
      );
    });
  }, [counts]);

  return (
    <section className="live" aria-label="État en direct du prototype">
      <div className="live__head">
        <div>
          <h2 className="live__title">État du prototype, en direct</h2>
          <p className="live__sub">
            {error
              ? "Connexion au prototype indisponible pour le moment."
              : "Mis à jour automatiquement toutes les 20 secondes."}
          </p>
        </div>
        <Link href="/reserver" className="btn btn--primary">
          Réserver une place
        </Link>
      </div>
      <div className="live__grid">
        {["free", "reserved", "occupied", "maintenance"].map((key) => (
          <div className="live-card" key={key}>
            <span
              className="live-card__num"
              ref={(el) => {
                numRefs.current[key] = el;
              }}
            >
              {counts ? counts[key] || 0 : "–"}
            </span>
            <span className="live-card__label">{LABELS[key]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
