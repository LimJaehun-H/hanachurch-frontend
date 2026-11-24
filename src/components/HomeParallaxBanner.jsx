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
  const [bgImageUrl, setBgImageUrl] = useState(null); // 기본 사진은 서버에 없을 때만 (깜빡임 방지)
  const [badgeUrl, setBadgeUrl] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/home_banner`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setBgImageUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        } else {
          setBgImageUrl(HOME_BANNER_IMAGE_URL || null);
        }
      })
      .catch(() => setBgImageUrl(HOME_BANNER_IMAGE_URL || null));

    fetch(`${API_BASE_URL}/api/site-images/home_banner_badge`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setBadgeUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {});
  }, []);

  // 사진이 없어도 문구는 검은 배경 위에 보여줌
  return (
    <section
      className="hc-parallax-banner"
      style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : undefined}
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