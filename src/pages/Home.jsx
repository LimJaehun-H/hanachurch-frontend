import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import IntroSection from "../components/IntroSection.jsx";
import HomeGallery from "../components/HomeGallery.jsx";
import HomeRecentBoards from "../components/HomeRecentBoards.jsx";
import HomeQuickLinks from "../components/HomeQuickLinks.jsx";
import HomeWorshipPreview from "../components/HomeWorshipPreview.jsx";
import HomeParallaxBanner from "../components/HomeParallaxBanner.jsx";
import { API_BASE_URL, HERO_IMAGE_URL, HERO_LOGO_IMAGE_URL } from "../config.js";

export default function Home() {
  const [homeVideo, setHomeVideo] = useState(undefined);
  const [heroImageUrl, setHeroImageUrl] = useState(HERO_IMAGE_URL || null);
  const [logoUrl, setLogoUrl] = useState(HERO_LOGO_IMAGE_URL || null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/home-video`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setHomeVideo(data || null))
      .catch(() => setHomeVideo(null));

    fetch(`${API_BASE_URL}/api/site-images/home_hero_image`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setHeroImageUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/site-images/home_logo`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setLogoUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {});
  }, []);

  const heroVideoUrl =
    homeVideo && homeVideo.fileUrl
      ? `${API_BASE_URL}/uploads/homevideo/${encodeURIComponent(homeVideo.fileUrl)}`
      : null;

  return (
    <div>
      <Header variant="overlay" />

      <div className="hc-hero">
        {heroVideoUrl ? (
          <video
            key={heroVideoUrl}
            className="hc-hero-video"
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={heroImageUrl || undefined}
          />
        ) : heroImageUrl ? (
          <div
            className="hc-hero-image-bg"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
            aria-hidden="true"
          />
        ) : (
          <div className="hc-hero-fallback-bg" aria-hidden="true" />
        )}

        <div className="hc-hero-overlay" aria-hidden="true" />

        {logoUrl && <img src={logoUrl} alt="" className="hc-hero-logo" />}
      </div>

      <IntroSection />
      <HomeGallery />
      <HomeRecentBoards />
      <HomeQuickLinks />
      <HomeParallaxBanner />
      <HomeWorshipPreview />

      <Footer />
    </div>
  );
}