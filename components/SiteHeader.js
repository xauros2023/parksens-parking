"use client";

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="topbar">
      <Link href="/" className="topbar__mark">
        <span className="topbar__mark-name">ParkSens</span>
        <span className="topbar__mark-text">
          19 points
          <br />
          du cahier des charges
        </span>
      </Link>
      <div className="topbar__uni">
        <img src="/assets/logo-uit.png" alt="Université Ibn Tofail" className="topbar__uni-logo" />
      </div>
      <nav className="topbar__nav">
        <Link href="/#plan">Le plan</Link>
        <Link href="/#zones">Les 19 points</Link>
        <Link href="/reserver" className="btn-reserve">
          Réserver une place
        </Link>
      </nav>
    </header>
  );
}
