import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, CHURCH_INFO, FOOTER_INFO, FOOTER_LOGO_WHITE_IMAGE_URL } from "../config.js";

export default function Footer() {
  const instagramHandle = CHURCH_INFO.instagram || "";
  const instagramUrl = `https://instagram.com/${instagramHandle.replace(/^@/, "")}`;
  const [logoUrl, setLogoUrl] = useState(FOOTER_LOGO_WHITE_IMAGE_URL || null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/footer_logo_white`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setLogoUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {
        // 실패하면 텍스트 유지
      });
  }, []);

  return (
    <footer className="hc-home-footer">
      <div className="hc-home-footer-inner">
        <Link className="hc-home-footer-link" to="/location">
          오시는 길
        </Link>

        <div className="hc-home-footer-row">
          <button
            type="button"
            className="hc-home-footer-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={CHURCH_INFO.name} className="hc-home-footer-logo" />
            ) : (
              CHURCH_INFO.name
            )}
          </button>

          <div className="hc-home-footer-address">
            <p className="hc-home-footer-line hc-home-footer-denomination">{CHURCH_INFO.denomination}</p>
            {FOOTER_INFO.addressLines.map((line) => (
              <p className="hc-home-footer-line" key={line}>
                {line}
              </p>
            ))}
            {instagramHandle && (
              <p className="hc-home-footer-line">
                <a href={instagramUrl} target="_blank" rel="noreferrer">
                  인스타그램 : {instagramHandle}
                </a>
              </p>
            )}
          </div>
        </div>

        <p className="hc-home-footer-copyright">
          Copyright © {CHURCH_INFO.name}. All rights reserved.
        </p>

        <Link to="/admin" className="hc-home-footer-admin">
          관리자
        </Link>
      </div>
    </footer>
  );
}