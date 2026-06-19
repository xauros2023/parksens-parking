"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { ZONES } from "@/lib/zones";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(DIACRITICS_RE, "");
}

export default function ZonesExplorer({ activeMapKey, onMapKeyConsumed }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [pulseIds, setPulseIds] = useState([]);
  const gridRef = useRef(null);
  const lastFocusRef = useRef(null);

  const searchBlobs = useMemo(() => {
    const map = {};
    ZONES.forEach((z) => {
      map[z.id] = normalize(z.name + " " + z.short + " " + z.items.join(" "));
    });
    return map;
  }, []);

  const normalizedQuery = normalize(query.trim());
  const visibleIds = useMemo(() => {
    if (!normalizedQuery) return null;
    return ZONES.filter((z) => searchBlobs[z.id].includes(normalizedQuery)).map((z) => z.id);
  }, [normalizedQuery, searchBlobs]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.from(el.querySelectorAll(".zone-card"), {
        y: 20,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: { each: 0.04, from: "start" },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
      return () => tween.kill();
    });
    return () => mm.revert();
  }, []);

  // Open directly from a shared URL hash on first load.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (id && ZONES.find((z) => z.id === id)) setOpenId(id);

    const onPopState = () => {
      const next = window.location.hash.replace("#", "");
      setOpenId(ZONES.find((z) => z.id === next) ? next : null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!activeMapKey) return;
    const ids = ZONES.filter((z) => z.map === activeMapKey).map((z) => z.id);
    document.getElementById("zones")?.scrollIntoView({ behavior: "smooth" });
    const timeout = setTimeout(() => {
      setPulseIds(ids);
      setTimeout(() => setPulseIds([]), 1600);
      onMapKeyConsumed?.();
    }, 400);
    return () => clearTimeout(timeout);
  }, [activeMapKey, onMapKeyConsumed]);

  useEffect(() => {
    if (openId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (lastFocusRef.current) lastFocusRef.current.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openId]);

  useEffect(() => {
    const onKeydown = (e) => {
      if (e.key === "Escape" && openId) closeDetail();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [openId]);

  function openDetail(id, triggerEl) {
    lastFocusRef.current = triggerEl || null;
    setOpenId(id);
    history.pushState({ zoneId: id }, "", "#" + id);
  }

  function closeDetail() {
    setOpenId(null);
    if (location.hash) history.pushState({}, "", location.pathname + location.search);
  }

  const activeZone = ZONES.find((z) => z.id === openId);
  const visibleCount = visibleIds ? visibleIds.length : ZONES.length;

  return (
    <>
      <section className="zones" id="zones">
        <div className="zones__head">
          <div>
            <p className="zones__eyebrow">Les dix-neuf points</p>
            <h2 className="zones__title">Toutes les familles de fonctionnalités</h2>
          </div>
          <button type="button" className="zones__print" onClick={() => window.print()}>
            <span>Exporter en PDF</span>
          </button>
        </div>

        <div className="zones__search">
          <input
            type="search"
            className="zones__search-input"
            placeholder="Rechercher une fonctionnalité — ex. barrière, covoiturage, RGPD…"
            aria-label="Rechercher dans les 19 points du cahier des charges"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="zones__search-count">
            {normalizedQuery === ""
              ? ""
              : visibleCount === 0
              ? "Aucun résultat"
              : `${visibleCount} résultat${visibleCount > 1 ? "s" : ""} sur 19`}
          </p>
        </div>

        <div className="zones__grid" ref={gridRef}>
          {ZONES.map((zone) => {
            const hidden = visibleIds ? !visibleIds.includes(zone.id) : false;
            return (
              <motion.button
                type="button"
                key={zone.id}
                className={
                  "zone-card" +
                  (hidden ? " is-filtered-out" : "") +
                  (pulseIds.includes(zone.id) ? " zone-card--pulse" : "")
                }
                aria-label={`Voir le détail : ${zone.name}`}
                onClick={(e) => openDetail(zone.id, e.currentTarget)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="zone-card__num">{zone.num}</span>
                <span className="zone-card__name">{zone.name}</span>
                <span className="zone-card__short">{zone.short}</span>
                <span className="zone-card__count">
                  {zone.items.length} fonctionnalité{zone.items.length > 1 ? "s" : ""}
                </span>
              </motion.button>
            );
          })}
        </div>
        {visibleIds && visibleIds.length === 0 && (
          <p className="zones__empty">Aucun résultat pour cette recherche. Essayez un autre mot-clé.</p>
        )}
      </section>

      <AnimatePresence>
        {activeZone && (
          <motion.div
            className="detail-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDetail();
            }}
          >
            <motion.div
              className="detail__card"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <button className="detail__close" aria-label="Fermer la fiche" onClick={closeDetail}>
                retour
              </button>
              <p className="detail__num">{activeZone.num} / 19</p>
              <h2 className="detail__title">{activeZone.name}</h2>
              <p className="detail__short">{activeZone.short}</p>
              <ol className="detail__list">
                {activeZone.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="printable" aria-hidden="true">
        <div className="printable__cover">
          <p className="printable__eyebrow">ParkSens</p>
          <h1 className="printable__title">
            Cahier des charges
            <br />
            du parking intelligent
          </h1>
          <p className="printable__meta">
            Projet de fin d&apos;études · Faculté des Sciences de Kénitra · Université Ibn Tofail
          </p>
        </div>
        <div className="printable__body">
          {ZONES.map((zone) => (
            <div className="printable__section" key={zone.id}>
              <div className="printable__section-head">
                <span className="printable__num">{zone.num}</span>
                <h3 className="printable__name">{zone.name}</h3>
              </div>
              <p className="printable__short">{zone.short}</p>
              <ol className="printable__list">
                {zone.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
