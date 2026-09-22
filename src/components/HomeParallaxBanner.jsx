import React, { useEffect, useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import {
  API_BASE_URL,
  HOME_BANNER_IMAGE_URL,
  HOME_BANNER_TITLE,
  HOME_BANNER_SUBTITLE,
} from "../config.js";

export default function HomeParallaxBanner() {
  const [ref, visible] = useScrollReveal(0.2, true);
  const [bgImageUrl, setBgImageUrl] = useState(HOME_BANNER_IMAGE_URL || null);
  const [badgeUrl, setBadgeUrl] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/home_banner`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setBgImageUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/site-images/home_banner_badge`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setBadgeUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
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
        {badgeUrl && (
          <img src={badgeUrl} alt="" className="hc-parallax-banner-badge" />
        )}
        {HOME_BANNER_TITLE && (
          <h2 className="hc-parallax-banner-title">{HOME_BANNER_TITLE}</h2>
        )}
        {HOME_BANNER_SUBTITLE && (
          <p className="hc-parallax-banner-subtitle">{HOME_BANNER_SUBTITLE}</p>
        )}
      </div>
    </section>
  );
}