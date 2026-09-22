import React, { useEffect, useState } from "react";
import { API_BASE_URL, HOME_GALLERY_IMAGES } from "../config.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

export default function HomeGallery() {
  const [openIndex, setOpenIndex] = useState(null);
  const [ref, visible] = useScrollReveal(0.2, true);

  // API에서 등록된 사진이 있으면 그걸 쓰고, 없으면 기존 정적 이미지로 대체
  const [images, setImages] = useState(HOME_GALLERY_IMAGES || []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/home_gallery`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setImages(data.map((img) => `${API_BASE_URL}/uploads/site-images/${encodeURIComponent(img.fileUrl)}`));
        }
      })
      .catch(() => {
        // 실패하면 그냥 기존 정적 이미지 유지
      });
  }, []);

  if (!images || images.length === 0) return null;

  const close = () => setOpenIndex(null);

  return (
    <section className="hc-gallery-strip" ref={ref}>
      <div className={`hc-gallery-grid ${visible ? "hc-reveal-visible" : "hc-reveal"}`}>
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            className="hc-gallery-thumb"
            onClick={() => setOpenIndex(i)}
            aria-label="사진 크게 보기"
            style={{ transitionDelay: visible ? `${i * 60}ms` : "0ms" }}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
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
            src={images[openIndex]}
            alt=""
            className="hc-gallery-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}