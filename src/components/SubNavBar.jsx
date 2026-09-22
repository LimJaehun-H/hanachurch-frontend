import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_GROUPS } from "../config.js";

// 현재 경로(pathname)와 가장 길게(구체적으로) 일치하는 메뉴 항목을 찾는다.
// 예: "/worship/sunday"가 "/worship"보다 더 구체적이므로 우선함.
function findActiveMatch(pathname) {
  let best = null; // { group, item, prefixLength }

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      const prefixes = item.matchPrefixes || [item.to];
      for (const prefix of prefixes) {
        const isMatch = pathname === prefix || pathname.startsWith(prefix + "/");
        if (isMatch && (!best || prefix.length > best.prefixLength)) {
          best = { group, item, prefixLength: prefix.length };
        }
      }
    }
  }

  return best;
}

export default function SubNavBar() {
  const { pathname } = useLocation();
  const match = findActiveMatch(pathname);

  if (!match) return null;

  const { group, item: activeItem } = match;

  return (
    <nav className="hc-subnav" aria-label={`${group.label} 하위 메뉴`}>
      <div className="hc-subnav-inner">
        {group.items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`hc-subnav-pill ${
              item.to === activeItem.to ? "hc-subnav-pill--active" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}