"use client";

import { useCallback, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/Hero";
import PrototypeSection from "@/components/PrototypeSection";
import ParkingMap from "@/components/ParkingMap";
import LiveStatusStrip from "@/components/LiveStatusStrip";
import ZonesExplorer from "@/components/ZonesExplorer";

export default function HomePage() {
  const [activeMapKey, setActiveMapKey] = useState(null);
  const handleZoneActivate = useCallback((key) => setActiveMapKey(key), []);
  const handleConsumed = useCallback(() => setActiveMapKey(null), []);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <PrototypeSection />
        <ParkingMap onZoneActivate={handleZoneActivate} />
        <LiveStatusStrip />
        <ZonesExplorer activeMapKey={activeMapKey} onMapKeyConsumed={handleConsumed} />
      </main>
      <SiteFooter />
    </>
  );
}
