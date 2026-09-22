import React from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import SermonList from "../components/SermonList.jsx";
import { DAWN_WORSHIP_HERO_IMAGE_URL } from "../config.js";

export default function WorshipDawn() {
  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="dawn_worship_hero" fallbackImageUrl={DAWN_WORSHIP_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <p className="hc-eyebrow">dawn worship</p>
        <h1 className="hc-h1">새벽예배</h1>

        <SermonList category="DAWN" />
      </main>
      <Footer />
    </div>
  );
}