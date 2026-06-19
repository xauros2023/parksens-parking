import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__left">
        <p>ParkSens — cahier des charges du parking intelligent.</p>
        <p className="footer__muted">
          Projet de fin d&apos;études · Faculté des Sciences de Kénitra · Université Ibn Tofail.
        </p>
      </div>
      <p className="footer__muted">
        <Link href="/admin">Espace administration</Link>
      </p>
    </footer>
  );
}
