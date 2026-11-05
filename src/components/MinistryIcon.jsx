import React from "react";
import { iconPath } from "../data/ministryIcons.js";

// 부서 아이콘 (동그란 배경 + 선 아이콘)
export default function MinistryIcon({ id, name, size = 48, color, bg, className = "" }) {
  return (
    <span
      className={`hc-ministry-icon ${className}`}
      style={{ width: size, height: size, background: bg, color }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.52} height={size * 0.52} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={iconPath(id, { any: true, name })} />
      </svg>
    </span>
  );
}
