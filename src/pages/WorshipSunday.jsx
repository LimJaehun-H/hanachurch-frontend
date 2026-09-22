import React from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import SermonList from "../components/SermonList.jsx";
import { SUNDAY_WORSHIP_HERO_IMAGE_URL } from "../config.js";

export default function WorshipSunday() {
  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="sunday_worship_hero" fallbackImageUrl={SUNDAY_WORSHIP_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <p className="hc-eyebrow">sunday worship</p>
        <h1 className="hc-h1">주일예배</h1>

        <SermonList category="SUNDAY" />
      </main>
      <Footer />
    </div>
  );
}