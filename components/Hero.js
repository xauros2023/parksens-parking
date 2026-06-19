"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { motion } from "framer-motion";

export default function Hero() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(root.querySelector(".hero__eyebrow"), { y: 16, autoAlpha: 0, duration: 0.5 })
        .from(root.querySelector(".hero__title"), { y: 28, autoAlpha: 0, duration: 0.7 }, "<0.05")
        .from(root.querySelector(".hero__lede"), { y: 18, autoAlpha: 0, duration: 0.6 }, "<0.1")
        .from(root.querySelector(".hero__cta"), { y: 14, autoAlpha: 0, duration: 0.5 }, "<0.1")
        .from(
          root.querySelectorAll(".hero__stat"),
          { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.1 },
          "<0.05"
        )
        .from(root.querySelector(".hero__image"), { scale: 1.04, autoAlpha: 0, duration: 0.8 }, 0.15);

      return () => tl.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="hero" ref={rootRef}>
      <div className="hero__text">
        <p className="hero__eyebrow">ParkSens — projet de fin d&apos;études, parking intelligent</p>
        <h1 className="hero__title">
          Le parking n&apos;attend plus
          <br />
          qu&apos;on le cherche.
        </h1>
        <p className="hero__lede">
          Un prototype à six places, une toiture solaire, deux barrières automatisées et un cahier des
          charges en dix-neuf volets — pensé pour le campus de la Faculté des Sciences de Kénitra, où
          étudiants, enseignants et visiteurs partagent les mêmes places, et où chaque place libérée doit
          retrouver un usager avant même qu&apos;il n&apos;ait eu à la chercher.
        </p>
        <div className="hero__cta">
          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            <Link href="/reserver" className="btn btn--primary">
              Réserver une place
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link href="#zones" className="btn btn--ghost">
              Voir les 19 points
            </Link>
          </motion.div>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-num">19</span>
            <span className="hero__stat-label">familles de fonctionnalités</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-num">70+</span>
            <span className="hero__stat-label">comportements automatisés</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-num">6</span>
            <span className="hero__stat-label">places sur le prototype</span>
          </div>
        </div>
      </div>
      <figure className="hero__image">
        <img src="/assets/campus.jpeg" alt="Vue aérienne du campus de l'Université Ibn Tofail" />
        <figcaption>Campus de l&apos;Université Ibn Tofail — Kénitra</figcaption>
      </figure>
    </section>
  );
}
