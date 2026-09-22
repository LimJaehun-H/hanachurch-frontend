import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import {
  API_BASE_URL,
  WORSHIP_SCHEDULE,
  WORSHIP_HERO_IMAGE_URL,
  WORSHIP_PAGE_BG_IMAGE_URL,
  WORSHIP_GALLERY_IMAGES,
  CHURCH_SCHOOL_SCHEDULE,
  CHURCH_SCHOOL_GALLERY_IMAGES,
} from "../config.js";

export default function Worship() {
  const [lightbox, setLightbox] = useState(null); // { images, index } | null
  const close = () => setLightbox(null);

  const [bgImageUrl, setBgImageUrl] = useState(WORSHIP_PAGE_BG_IMAGE_URL || null);
  const [worshipGallery, setWorshipGallery] = useState(WORSHIP_GALLERY_IMAGES || []);
  const [churchSchoolGallery, setChurchSchoolGallery] = useState(CHURCH_SCHOOL_GALLERY_IMAGES || []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/worship_page_bg`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setBgImageUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/site-images/worship_gallery`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setWorshipGallery(data.map((img) => `${API_BASE_URL}/uploads/site-images/${encodeURIComponent(img.fileUrl)}`));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/site-images/church_school_gallery`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setChurchSchoolGallery(data.map((img) => `${API_BASE_URL}/uploads/site-images/${encodeURIComponent(img.fileUrl)}`));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="worship_hero" fallbackImageUrl={WORSHIP_HERO_IMAGE_URL} />

      <section className="hc-worship-section">
        {bgImageUrl && (
          <div
            className="hc-worship-bg"
            style={{ backgroundImage: `url(${bgImageUrl})` }}
            aria-hidden="true"
          />
        )}

        <div className="hc-worship-heading">
          <p className="hc-eyebrow">worship</p>
          <h1 className="hc-h1">예배안내</h1>
          <div className="hc-worship-heading-line" />
        </div>

        <div className="hc-worship-inner">
          <div className="hc-worship-gallery">
            {worshipGallery.map((src, i) => (
              <button
                key={i}
                type="button"
                className="hc-worship-gallery-thumb"
                onClick={() => setLightbox({ images: worshipGallery, index: i })}
                aria-label="사진 크게 보기"
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>

          <div className="hc-worship-info">
            {WORSHIP_SCHEDULE.map((group) => (
              <div key={group.group} className="hc-worship-group">
                <p className="hc-worship-group-title">{group.group}</p>
                {group.parts.map((p, i) => (
                  <p key={i} className="hc-worship-item">
                    {p.part && <span className="hc-worship-item-part">{p.part}</span>}
                    <span>{p.time}</span>
                    <span className="hc-worship-item-sep">|</span>
                    <span>{p.location}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hc-worship-section hc-worship-section--plain">
        <div className="hc-worship-heading">
          <p className="hc-eyebrow">worship</p>
          <h1 className="hc-h1">교회학교 예배</h1>
          <div className="hc-worship-heading-line" />
        </div>

        <div className="hc-worship-inner">
          <div className="hc-worship-gallery hc-worship-gallery--2x2">
            {churchSchoolGallery.map((src, i) => (
              <button
                key={i}
                type="button"
                className="hc-worship-gallery-thumb"
                onClick={() => setLightbox({ images: churchSchoolGallery, index: i })}
                aria-label="사진 크게 보기"
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>

          <div className="hc-worship-info">
            {CHURCH_SCHOOL_SCHEDULE.map((group) => (
              <div key={group.group} className="hc-worship-group">
                <p className="hc-worship-group-title">{group.group}</p>
                {group.parts.map((p, i) => (
                  <p key={i} className="hc-worship-item">
                    {p.part && <span className="hc-worship-item-part">{p.part}</span>}
                    <span>{p.time}</span>
                    <span className="hc-worship-item-sep">|</span>
                    <span>{p.location}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="hc-gallery-lightbox" onClick={close}>
          <button
            type="button"
            className="hc-gallery-lightbox-close"
            onClick={close}
            aria-label="닫기"
          >
            ✕
          </button>
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            className="hc-gallery-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}