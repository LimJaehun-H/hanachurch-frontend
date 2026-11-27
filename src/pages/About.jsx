import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { API_BASE_URL, ABOUT_HERO_IMAGE_URL, ABOUT_CONTENT_BG_IMAGE_URL } from "../config.js";

// 십자가 선을 스크롤에 맞춰 그리기
// --h: 좌우 팔·위 팔 (교차점이 화면 아래쪽에 들어오면서 금방 다 뻗음)
// --v: 아래 기둥 (화면 아래쪽 75% 지점을 따라 내려가며 길어짐)
// 스크롤을 올리면 반대로 줄어듦. 움직임 줄이기 설정을 켠 사용자에게는 처음부터 다 그려서 보여 줌.
function useCrossDraw() {
  const sectionRef = useRef(null);
  const pillarRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pillar = pillarRef.current;
    if (!section || !pillar) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const clamp = (n) => Math.min(1, Math.max(0, n));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const p = pillar.getBoundingClientRect(); // 교차점 = 기둥 칸의 맨 위
      const h = clamp((vh * 0.9 - p.top) / (vh * 0.3));
      const v = p.height > 0 ? clamp((vh * 0.75 - p.top) / p.height) : 0;
      section.style.setProperty("--h", h.toFixed(4));
      section.style.setProperty("--v", v.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return [sectionRef, pillarRef];
}

export default function About() {
  const [crossRef, pillarRef] = useCrossDraw();
  const [contentBgUrl, setContentBgUrl] = useState(null); // 기본 사진은 서버에 없을 때만 (깜빡임 방지)
  const [bgRef, bgVisible] = useScrollReveal(0.05);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/about_content_bg`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setContentBgUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        } else {
          setContentBgUrl(ABOUT_CONTENT_BG_IMAGE_URL || null);
        }
      })
      .catch(() => setContentBgUrl(ABOUT_CONTENT_BG_IMAGE_URL || null));
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
          {/* 목사님 시안: 십자 모양 레이아웃
              2사분면(왼쪽 위) "하나교회는" / 4사분면(오른쪽 아래) 말씀·본문·핵심 비전
              1·3사분면은 비워 두고, 가로선과 세로선이 교차함 */}
          <section className="hc-about-cross" ref={crossRef}>
            <div className="hc-about-cross-q2">
              <span className="hc-about-cross-dot" aria-hidden="true" />
              <h2 className="hc-about-cross-title">하나교회는</h2>
            </div>
            <div className="hc-about-cross-q1" aria-hidden="true" />
            <div className="hc-about-cross-q3" ref={pillarRef} aria-hidden="true" />
            <div className="hc-about-cross-q4">
              <blockquote className="hc-about-verse">
                <p className="hc-about-verse-text">풀이 자라 나무가 되매</p>
                <cite className="hc-about-verse-ref">마 13:31–32</cite>
              </blockquote>

              <div className="hc-about-story">
                <p>
                  사람이 자기 밭에 겨자씨 한 알을 심었습니다.
                  <br />
                  눈에 잘 보이지도 않을 만큼 작고 연약한 씨앗이었지요.
                  <br />
                  그러나 하나님의 손길 아래 그 씨앗은 싹을 틔우고, 풀이 되어 자라나 마침내 나무가 되었습니다.
                  <br />
                  그리고 그 가지마다 새들이 날아와 깃들며, 쉼을 얻었습니다.
                </p>

                <p>
                  하나교회는 바로 그 겨자씨의 길을 걷고자 합니다.
                  <br />
                  우리는 먼저, 한 영혼이 주님을 인격적으로 만나 구원의 기쁨을 누리기를 바랍니다.
                  <br />
                  그 만남이 삶의 뿌리가 되어, 믿음이 자라고 성숙하여, 세상 속에서 그리스도의 향기를 전하는 나무로 서기를 소망합니다.
                </p>

                <p>
                  신앙은 멀리 있는 것이 아니라, 매일의 삶 속에서 자라나는 하루의 순종이며 하루의 사랑이라 믿습니다.
                  <br />
                  그래서 하나교회는 이렇게 세 방향으로 걸어갑니다.
                </p>

                <p>
                  하나교회는 그렇게 누군가의 쉼이 되는 교회, 세상 속의 그늘이 되는 교회,
                  <br />
                  그리고 하나님의 사랑이 머무는 자리가 되기를 꿈꿉니다.
                </p>
              </div>

              <div className="hc-about-core">
                <p className="hc-about-core-eyebrow">CORE VISION</p>
                <h3 className="hc-about-core-title">핵심 비전</h3>
                <ol className="hc-about-core-list">
                  <li>
                    <span className="hc-about-core-num">01</span>
                    <strong className="hc-about-core-label">하나님을 향하여</strong>
                    <span className="hc-about-core-desc">예배를 통해 주님을 인격적으로 만나는 교회</span>
                  </li>
                  <li>
                    <span className="hc-about-core-num">02</span>
                    <strong className="hc-about-core-label">성도를 향하여</strong>
                    <span className="hc-about-core-desc">제자의 삶을 배우며 함께 성장하는 교회</span>
                  </li>
                  <li>
                    <span className="hc-about-core-num">03</span>
                    <strong className="hc-about-core-label">세상을 향하여</strong>
                    <span className="hc-about-core-desc">섬김과 선교로 세상을 품는 교회</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}