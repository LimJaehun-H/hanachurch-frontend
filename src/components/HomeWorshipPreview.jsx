import React, { useEffect, useState } from "react";
import { API_BASE_URL, WORSHIP_SCHEDULE, WORSHIP_PREVIEW_IMAGES, WORSHIP_PREVIEW_VERSE } from "../config.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

export default function HomeWorshipPreview() {
  const [photos, setPhotos] = useState((WORSHIP_PREVIEW_IMAGES || []).slice(0, 4));
  const [ref, visible] = useScrollReveal(0.2, true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/worship_preview`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setPhotos(data.map((img) => `${API_BASE_URL}/uploads/site-images/${encodeURIComponent(img.fileUrl)}`).slice(0, 4));
        }
      })
      .catch(() => {
        // 실패하면 그냥 기존 정적 이미지 유지
      });
  }, []);

  return (
    <section className="hc-worship-preview">
      <div className="hc-worship-preview-header">
        <div className="hc-worship-preview-divider" />
        <p className="hc-eyebrow">worship</p>
        <h2 className="hc-worship-preview-title">예배안내</h2>
        {WORSHIP_PREVIEW_VERSE && (
          <p className="hc-worship-preview-verse">{WORSHIP_PREVIEW_VERSE}</p>
        )}
      </div>

      <div
        className={`hc-worship-preview-gallery ${visible ? "hc-reveal-visible" : "hc-reveal"}`}
        ref={ref}
      >
        {photos.map((src, i) => (
          <div
            key={i}
            className="hc-worship-preview-photo"
            style={{ transitionDelay: visible ? `${i * 60}ms` : "0ms" }}
          >
            <img src={src} alt="" />
          </div>
        ))}
      </div>

      <div className="hc-worship-preview-boxes">
        {WORSHIP_SCHEDULE.map((group) => (
          <div key={group.group} className="hc-worship-preview-box">
            <span className="hc-worship-preview-box-label">{group.group}</span>
            <span className="hc-worship-preview-box-times">
              {group.parts.map((p, i) => (
                <React.Fragment key={i}>
                  {p.part && <strong>{p.part}</strong>}{" "}
                  {p.time}
                  {i < group.parts.length - 1 && (
                    <span className="hc-worship-preview-sep">|</span>
                  )}
                </React.Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
} 