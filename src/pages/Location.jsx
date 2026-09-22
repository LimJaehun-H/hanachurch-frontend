import React, { useRef } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { CHURCH_INFO, MAP_CONFIG, LOCATION_HERO_IMAGE_URL } from "../config.js";
import { useKakaoMap } from "../hooks/useKakaoMap.js";

export default function Location() {
  const mapRef = useRef(null);
  const status = useKakaoMap(mapRef, MAP_CONFIG.address);

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="location_hero" fallbackImageUrl={LOCATION_HERO_IMAGE_URL} />

      <main className="hc-location-page">
        <div className="hc-location-heading">
          <h1 className="hc-location-title">오시는 길</h1>

          <div className="hc-location-divider">
            <span className="hc-location-divider-line" />
            <span className="hc-location-divider-label">Direction</span>
            <span className="hc-location-divider-line" />
          </div>

          <p className="hc-location-address-line">{CHURCH_INFO.address}</p>
        </div>

        <div className="hc-location-contacts">
          <a href={`tel:${CHURCH_INFO.phone}`} className="hc-location-contact">
            <span className="hc-location-contact-icon">
              <PhoneIcon />
            </span>
            <span className="hc-location-contact-text">{CHURCH_INFO.phone}</span>
          </a>

          {CHURCH_INFO.instagram && (
            <a
              href={`https://instagram.com/${CHURCH_INFO.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="hc-location-contact"
            >
              <span className="hc-location-contact-icon">
                <InstagramIcon />
              </span>
              <span className="hc-location-contact-text">{CHURCH_INFO.instagram}</span>
            </a>
          )}
        </div>

        <div className="hc-map-wrap">
          <div ref={mapRef} className="hc-map" />
          {status === "loading" && <div className="hc-map-status">지도를 불러오는 중…</div>}
          {status === "error" && (
            <div className="hc-map-status">
              지도를 불러오지 못했습니다. 주소 설정을 확인해주세요.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFFFFF" strokeWidth="2">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11 21 3 13 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFFFFF" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="#FFFFFF" stroke="none" />
    </svg>
  );
}