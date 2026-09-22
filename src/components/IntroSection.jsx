import React from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { CHURCH_INFO } from "../config.js";

export default function IntroSection() {
  const [ref, visible] = useScrollReveal(0.2, true);

  return (
    <section className="hc-intro" ref={ref}>
      <div className={`hc-intro-inner ${visible ? "hc-reveal-visible" : "hc-reveal"}`}>
        <p className="hc-eyebrow">about us</p>
        <h2 className="hc-intro-title">
          함께 예배하고
          <br />
          함께 살아갑니다
        </h2>
        <div className="hc-hero-divider" />
        <p className="hc-intro-sub">
          {CHURCH_INFO.name}는 크지 않지만, 서로를 알고 서로를 위해 기도하는 공동체입니다.
        </p>
      </div>
    </section>
  );
}