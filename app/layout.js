import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata = {
  metadataBase: new URL("https://parksens-parking.vercel.app"),
  title: "ParkSens — Cahier des charges du parking intelligent",
  description:
    "ParkSens : cahier des charges en 19 points pour un parking intelligent de campus, à partir d'un prototype développé à l'Université Ibn Tofail de Kénitra.",
  openGraph: {
    title: "ParkSens — Cahier des charges du parking intelligent",
    description:
      "19 familles de fonctionnalités, un prototype à six places, une toiture solaire : le projet ParkSens expliqué point par point.",
    type: "website",
    images: ["/assets/campus.jpeg"],
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='14' fill='%231F3A28'/%3E%3Ctext x='50' y='66' font-family='Georgia,serif' font-size='52' font-weight='700' fill='%23F6F3EA' text-anchor='middle'%3EP%3C/text%3E%3C/svg%3E",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Aller au contenu principal
        </a>
        <div className="grain" aria-hidden="true" />
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
