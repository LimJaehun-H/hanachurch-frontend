import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { API_BASE_URL, ABOUT_HERO_IMAGE_URL, ABOUT_CONTENT_BG_IMAGE_URL } from "../config.js";

export default function About() {
  const [contentBgUrl, setContentBgUrl] = useState(ABOUT_CONTENT_BG_IMAGE_URL || null);
  const [bgRef, bgVisible] = useScrollReveal(0.05);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/about_content_bg`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setContentBgUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="about_hero" fallbackImageUrl={ABOUT_HERO_IMAGE_URL} />

      <div ref={bgRef} className="hc-about-content-bg">
        <div
          className={`hc-about-content-bg-layer ${bgVisible ? "is-visible" : ""}`}
          style={
            contentBgUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(248, 244, 236, 0.88), rgba(248, 244, 236, 0.88)), url(${contentBgUrl})`,
                }
              : undefined
          }
        />
        <main className="hc-inner-content" style={{ position: "relative", zIndex: 1 }}>
          <div className="hc-about-intro">
            <p className="hc-about-intro-line">사랑으로 하나되는</p>
            <p className="hc-about-intro-line">
              <span className="hc-about-intro-emphasis">하나교회</span>입니다
            </p>
          </div>

          <div className="hc-about-story">
            <p className="hc-about-story-line hc-about-story-quote">
              “풀이 자라 나무가 되매” (마 13:31–32)
            </p>

            <p className="hc-about-story-line">
              사람이 자기 밭에 겨자씨 한 알을 심었습니다.
              <br />
              눈에 잘 보이지도 않을 만큼 작고 연약한 씨앗이었지요.
              <br />
              그러나 하나님의 손길 아래 그 씨앗은 싹을 틔우고, 풀이 되어 자라나 마침내 나무가 되었습니다.
              <br />
              그리고 그 가지마다 새들이 날아와 깃들며, 쉼을 얻었습니다.
            </p>

            <p className="hc-about-story-line">
              하나교회는 바로 그 겨자씨의 길을 걷고자 합니다.
              <br />
              우리는 먼저, 한 영혼이 주님을 인격적으로 만나 구원의 기쁨을 누리기를 바랍니다.
              <br />
              그 만남이 삶의 뿌리가 되어, 믿음이 자라고 성숙하여, 세상 속에서 그리스도의 향기를 전하는 나무로 서기를 소망합니다.
            </p>

            <p className="hc-about-story-line">
              신앙은 멀리 있는 것이 아니라, 매일의 삶 속에서 자라나는 하루의 순종이며 하루의 사랑이라 믿습니다.
              <br />
              그래서 하나교회는 이렇게 세 방향으로 걸어갑니다.
            </p>

            <p className="hc-about-story-line">
              하나교회는 그렇게 누군가의 쉼이 되는 교회, 세상 속의 그늘이 되는 교회,
              <br />
              그리고 하나님의 사랑이 머무는 자리가 되기를 꿈꿉니다.
            </p>
          </div>

          <div className="hc-about-vision">
            <p className="hc-about-vision-eyebrow">CORE VISION</p>
            <h2 className="hc-about-vision-title">핵심 비전 3가지</h2>

            <div className="hc-about-vision-list">
              <div className="hc-about-vision-row">
                <span className="hc-about-vision-label">하나님을 향하여</span>
                <span className="hc-about-vision-dash">—</span>
                <span className="hc-about-vision-desc">예배를 통해 주님을 인격적으로 만나는 교회</span>
              </div>
              <div className="hc-about-vision-row">
                <span className="hc-about-vision-label">성도를 향하여</span>
                <span className="hc-about-vision-dash">—</span>
                <span className="hc-about-vision-desc">제자의 삶을 배우며 함께 성장하는 교회</span>
              </div>
              <div className="hc-about-vision-row">
                <span className="hc-about-vision-label">세상을 향하여</span>
                <span className="hc-about-vision-dash">—</span>
                <span className="hc-about-vision-desc">섬김과 선교로 세상을 품는 교회</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}