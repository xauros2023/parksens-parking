"use client";

import { useEffect, useRef } from "react";
import ScrollReveal from "./ScrollReveal";

export default function ParkingMap({ onZoneActivate }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const zoneEls = Array.from(svg.querySelectorAll("[data-zone]"));
    zoneEls.forEach((el) => {
      el.style.cursor = "pointer";
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
    });

    const handlers = [];
    zoneEls.forEach((el) => {
      const mapKey = el.getAttribute("data-zone");
      const activate = () => onZoneActivate?.(mapKey);
      const onKeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      };
      el.addEventListener("click", activate);
      el.addEventListener("keydown", onKeydown);
      handlers.push(() => {
        el.removeEventListener("click", activate);
        el.removeEventListener("keydown", onKeydown);
      });
    });

    return () => handlers.forEach((off) => off());
  }, [onZoneActivate]);

  return (
    <ScrollReveal as="section" className="plan" id="plan">
      <div className="plan__intro">
        <p className="plan__eyebrow">Le prototype ParkSens</p>
        <h2 className="plan__title">Un parking se lit comme une carte</h2>
        <p className="plan__text">
          Le schéma ci-dessous reprend la maquette réelle : six places numérotées, une allée centrale
          balisée par des panneaux de circulation, deux barrières automatisées à servomoteur, des passages
          piétons et une toiture équipée de panneaux solaires. Chaque zone renvoie vers les points du
          cahier des charges qui s&apos;y rattachent — touchez une zone pour les ouvrir.
        </p>
      </div>

      <svg
        ref={svgRef}
        className="plan__map"
        id="parkingMap"
        viewBox="0 0 960 640"
        role="img"
        aria-label="Schéma du prototype ParkSens : six places numérotées, deux barrières automatiques et une toiture solaire"
      >
        <g className="map__roof" data-zone="energy">
          <rect x="40" y="14" width="270" height="34" rx="2" />
          <rect x="345" y="14" width="270" height="34" rx="2" />
          <rect x="650" y="14" width="270" height="34" rx="2" />
          <text x="480" y="36" textAnchor="middle" className="map__roof-label">
            toiture solaire
          </text>
        </g>

        <rect x="40" y="70" width="880" height="520" rx="4" className="map__perimeter" data-zone="perimeter" />
        <text x="60" y="98" className="map__zone-label">
          Périmètre — sécurité &amp; conformité
        </text>

        <g data-zone="entrance" className="map__slot-group">
          <rect x="80" y="130" width="110" height="150" rx="3" className="map__slot" />
          <text x="135" y="215" textAnchor="middle" className="map__slot-num">
            1
          </text>
          <rect x="205" y="130" width="110" height="150" rx="3" className="map__slot" />
          <text x="260" y="215" textAnchor="middle" className="map__slot-num">
            2
          </text>
        </g>
        <g data-zone="core" className="map__slot-group">
          <rect x="330" y="130" width="110" height="150" rx="3" className="map__slot" />
          <text x="385" y="215" textAnchor="middle" className="map__slot-num">
            3
          </text>
        </g>

        <g className="map__sign" data-zone="core">
          <circle cx="480" cy="155" r="19" />
          <text x="480" y="161" textAnchor="middle" className="map__sign-glyph">
            ↓↑
          </text>
          <line x1="469" y1="144" x2="491" y2="166" className="map__sign-bar" />
        </g>
        <text x="480" y="192" textAnchor="middle" className="map__zone-sub">
          sens interdit
        </text>

        <g data-zone="entrance" className="map__slot-group">
          <rect x="520" y="130" width="110" height="150" rx="3" className="map__slot" />
          <polygon points="575,168 565,188 585,188" className="map__slot-flag" />
          <text x="575" y="222" textAnchor="middle" className="map__slot-num">
            4
          </text>
        </g>

        <g data-zone="core" className="map__slot-group">
          <rect x="645" y="130" width="110" height="150" rx="3" className="map__slot" />
          <text x="700" y="215" textAnchor="middle" className="map__slot-num">
            5
          </text>
        </g>

        <g data-zone="core" className="map__slot-group">
          <rect x="770" y="130" width="110" height="150" rx="3" className="map__slot" />
          <text x="825" y="215" textAnchor="middle" className="map__slot-num">
            6
          </text>
        </g>

        <line x1="480" y1="295" x2="480" y2="590" className="map__lane" />

        <g className="map__crosswalk" data-zone="path">
          <rect x="540" y="330" width="14" height="110" />
          <rect x="566" y="330" width="14" height="110" />
          <rect x="592" y="330" width="14" height="110" />
          <rect x="618" y="330" width="14" height="110" />
        </g>
        <text x="580" y="320" textAnchor="middle" className="map__zone-sub">
          cheminement piéton
        </text>

        <g className="map__crosswalk" data-zone="path">
          <rect x="190" y="460" width="110" height="14" />
          <rect x="190" y="484" width="110" height="14" />
          <rect x="190" y="508" width="110" height="14" />
          <rect x="190" y="532" width="110" height="14" />
        </g>

        <g className="map__gate" data-zone="entrance">
          <rect x="70" y="330" width="170" height="44" rx="3" className="map__gate-box" />
          <line x1="80" y1="352" x2="220" y2="352" className="map__gate-arm" />
          <text x="155" y="392" textAnchor="middle" className="map__zone-sub">
            barrière d&apos;entrée
          </text>
        </g>

        <g className="map__gate" data-zone="core">
          <rect x="700" y="420" width="170" height="44" rx="3" className="map__gate-box" />
          <line x1="710" y1="442" x2="850" y2="442" className="map__gate-arm" />
          <text x="785" y="482" textAnchor="middle" className="map__zone-sub">
            barrière de sortie
          </text>
        </g>

        <g className="map__zone" data-zone="energy">
          <rect x="700" y="500" width="170" height="100" rx="4" className="map__totem" />
          <rect x="730" y="518" width="110" height="34" rx="2" className="map__totem-screen" />
          <text x="785" y="575" textAnchor="middle" className="map__zone-title-sm">
            Écran ParkSens
          </text>
        </g>

        <g className="map__arrow" data-zone="path">
          <path d="M150 460 L150 560 M138 545 L150 565 L162 545" />
        </g>
      </svg>

      <p className="plan__hint">Touchez une zone de la carte, ou parcourez directement la liste ci-dessous.</p>
    </ScrollReveal>
  );
}
