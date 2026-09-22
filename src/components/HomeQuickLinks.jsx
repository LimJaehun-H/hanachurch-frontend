import React from "react";
import { Link } from "react-router-dom";
import { CHURCH_INFO } from "../config.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

const LINKS = [
  { label: "교회소개", to: "/about", icon: <AboutIcon /> },
  { label: "인스타그램", href: `https://instagram.com/${CHURCH_INFO.instagram.replace("@", "")}`, icon: <InstagramIcon /> },
  { label: "예배안내", to: "/worship", icon: <WorshipIcon /> },
  { label: "오시는 길", to: "/location", icon: <LocationIcon /> },
];

const SPACING = 200;
function centerOffset(index, total) {
  const center = (total - 1) / 2;
  return (index - center) * SPACING;
}

function QuickLinkItem({ link, index }) {
  const style = {
    "--hc-ql-offset": `${centerOffset(index, LINKS.length)}px`,
    transitionDelay: `${index * 90}ms`,
  };

  const content = (
    <React.Fragment>
      <span className="hc-quicklink-icon">{link.icon}</span>
      <span className="hc-quicklink-label">{link.label}</span>
    </React.Fragment>
  );

  const isExternal = Boolean(link.href);

  if (isExternal) {
    return React.createElement(
      "a",
      {
        href: link.href,
        target: "_blank",
        rel: "noreferrer",
        className: "hc-quicklink",
        style: style,
      },
      content
    );
  }

  return (
    <Link to={link.to} className="hc-quicklink" style={style}>
      {content}
    </Link>
  );
}

export default function HomeQuickLinks() {
  const [ref, visible] = useScrollReveal(0.2, true);

  return (
    <section className="hc-quicklinks">
      <div
        className={`hc-quicklinks-grid ${visible ? "hc-reveal-visible" : "hc-reveal"}`}
        ref={ref}
      >
        {LINKS.map((link, i) => (
          <QuickLinkItem key={link.label} link={link} index={i} />
        ))}
      </div>
    </section>
  );
}

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#B8860B" strokeWidth="2">
      <path d="M12 21s-7-4.35-9.5-8.5C0.8 8.8 2.5 5 6.2 5c2 0 3.4 1.1 4.2 2.4C11.2 6.1 12.6 5 14.6 5c3.7 0 5.4 3.8 3.7 7.5C15.8 16.65 12 21 12 21z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#B8860B" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="#B8860B" stroke="none" />
    </svg>
  );
}
function WorshipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#B8860B" strokeWidth="2">
      <path d="M12 2v20M6 6h12M4 12h16" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#B8860B" strokeWidth="2">
      <path d="M12 21s-7-7.58-7-12a7 7 0 0 1 14 0c0 4.42-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}