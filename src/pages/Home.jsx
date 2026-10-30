import React, { useEffect, useRef, useState } from "react";
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

  // 맨 위에서는 사진만, 내릴수록 사진이 서서히 투명해지며 영상이 드러남
  // 히어로 높이의 이 비율만큼 내리면 사진이 완전히 사라지고 영상만 남음 (0.2 = 20%)
  const HERO_FADE_FRACTION = 0.2;
  const heroRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroImageRef = useRef(null);

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

  // 스크롤 양에 따라 사진 투명도를 조절하고, 내리기 시작하면 영상을 재생
  useEffect(() => {
    let ticking = false;
    const apply = () => {
      ticking = false;
      const heroHeight = heroRef.current ? heroRef.current.offsetHeight : window.innerHeight;
      const range = heroHeight * HERO_FADE_FRACTION || 1;
      // progress: 0(맨 위) → 1(사진 완전히 사라짐)
      const progress = Math.min(Math.max(window.scrollY / range, 0), 1);

      if (heroImageRef.current) {
        heroImageRef.current.style.opacity = String(1 - progress);
      }
      // 한번 내려서 재생이 시작되면, 맨 위로 올라와도 멈추지 않고 계속 재생
      const video = heroVideoRef.current;
      if (video && progress > 0) video.play().catch(() => {});
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    };
    apply(); // 새로고침 시 현재 스크롤 위치 즉시 반영
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [homeVideo]);

  const heroVideoUrl =
    homeVideo && homeVideo.fileUrl
      ? `${API_BASE_URL}/uploads/homevideo/${encodeURIComponent(homeVideo.fileUrl)}`
      : null;

  return (
    <div>
      <Header variant="overlay" />

      <div className="hc-hero" ref={heroRef}>
        {heroVideoUrl ? (
          <>
            {/* 영상 (아래 깔려 있고, 위의 사진이 투명해지면서 드러남) */}
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
            {/* 맨 위에서 보이는 사진 (스크롤하면 서서히 투명해짐) */}
            {heroImageUrl && (
              <div
                ref={heroImageRef}
                className="hc-hero-image-bg hc-hero-image-fade"
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