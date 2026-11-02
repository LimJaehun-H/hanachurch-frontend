import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import IntroSection from "../components/IntroSection.jsx";
import HomeGallery from "../components/HomeGallery.jsx";
import HomeRecentBoards from "../components/HomeRecentBoards.jsx";
import HomeQuickLinks from "../components/HomeQuickLinks.jsx";
import HomeWorshipPreview from "../components/HomeWorshipPreview.jsx";
import HomeParallaxBanner from "../components/HomeParallaxBanner.jsx";
import { API_BASE_URL, HERO_IMAGE_URL, HERO_IMAGE_SOURCE_ID, HERO_LOGO_IMAGE_URL } from "../config.js";

export default function Home() {
  const [homeVideo, setHomeVideo] = useState(undefined);
  const [heroImageUrl, setHeroImageUrl] = useState(HERO_IMAGE_URL || null);
  const [logoUrl, setLogoUrl] = useState(HERO_LOGO_IMAGE_URL || null);

  // 처음엔 사진을 보여주고, 영상이 로딩되면 2초 뒤 영상 재생(사진은 서서히 사라짐)
  const HERO_VIDEO_START_DELAY = 2000; // ms
  const heroVideoRef = useRef(null);
  const [heroVideoStarted, setHeroVideoStarted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/home-video`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setHomeVideo(data || null))
      .catch(() => setHomeVideo(null));

    fetch(`${API_BASE_URL}/api/site-images/home_hero_image`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0 && data[0].id !== HERO_IMAGE_SOURCE_ID) {
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

  // 영상이 재생 가능한 상태가 되면, 2초 뒤에 재생 시작 + 사진 서서히 사라짐
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    let timer;
    const startAfterDelay = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        video.play().catch(() => {}); // 자동재생 차단 등 실패는 무시
        setHeroVideoStarted(true);    // 사진 페이드아웃
      }, HERO_VIDEO_START_DELAY);
    };

    if (video.readyState >= 3) {
      startAfterDelay(); // 이미 로딩이 충분히 된 경우
    } else {
      video.addEventListener("canplay", startAfterDelay, { once: true });
    }

    return () => {
      clearTimeout(timer);
      video.removeEventListener("canplay", startAfterDelay);
    };
  }, [homeVideo]);

  const heroVideoUrl =
    homeVideo && homeVideo.fileUrl
      ? `${API_BASE_URL}/uploads/homevideo/${encodeURIComponent(homeVideo.fileUrl)}`
      : null;

  return (
    <div>
      <Header variant="overlay" />

      <div className="hc-hero">
        {heroVideoUrl ? (
          <>
            {/* 영상 (아래 깔려 있고, 2초 뒤 재생되며 위의 사진이 사라지면 드러남) */}
            <video
              key={heroVideoUrl}
              ref={heroVideoRef}
              className="hc-hero-video"
              src={heroVideoUrl}
              muted
              loop
              playsInline
              preload="auto"
              poster={heroImageUrl || undefined}
            />
            {/* 처음 보이는 사진 (영상 시작되면 서서히 사라짐) */}
            {heroImageUrl && (
              <div
                className={`hc-hero-image-bg hc-hero-image-fade${heroVideoStarted ? " is-hidden" : ""}`}
                style={{ backgroundImage: `url(${heroImageUrl})` }}
                aria-hidden="true"
              />
            )}
          </>
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