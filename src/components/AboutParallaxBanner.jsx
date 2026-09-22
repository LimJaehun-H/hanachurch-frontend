import React, { useEffect, useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import {
  API_BASE_URL,
  ABOUT_PARALLAX_IMAGE_URL,
  ABOUT_PARALLAX_TITLE,
  ABOUT_PARALLAX_SUBTITLE,
} from "../config.js";

export default function AboutParallaxBanner() {
  const [ref, visible] = useScrollReveal(0.2, true);
  const [bgImageUrl, setBgImageUrl] = useState(ABOUT_PARALLAX_IMAGE_URL || null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/about_parallax_bg`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setBgImageUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {});
  }, []);

  if (!bgImageUrl) return null;

  return (
    <section
      className="hc-parallax-banner"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
      ref={ref}
    >
      <div className="hc-parallax-banner-overlay" />

      <div
        className={`hc-parallax-banner-content ${
          visible ? "hc-reveal-visible" : "hc-reveal"
        }`}
      >
        {ABOUT_PARALLAX_TITLE && (
          <h2 className="hc-parallax-banner-title">{ABOUT_PARALLAX_TITLE}</h2>
        )}
        {ABOUT_PARALLAX_SUBTITLE && (
          <p className="hc-parallax-banner-subtitle">{ABOUT_PARALLAX_SUBTITLE}</p>
        )}
      </div>
    </section>
  );
}