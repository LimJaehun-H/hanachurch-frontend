import React, { useEffect, useState } from "react";
import SubNavBar from "./SubNavBar.jsx";
import { API_BASE_URL } from "../config.js";

export default function SubHero({ groupKey, fallbackImageUrl }) {
  const [imageUrl, setImageUrl] = useState(fallbackImageUrl || null);

  useEffect(() => {
    if (!groupKey) return;
    fetch(`${API_BASE_URL}/api/site-images/${groupKey}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setImageUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {
        // 실패하면 그냥 fallback 이미지 유지
      });
  }, [groupKey]);

  return (
    <>
      <div
        className="hc-subhero"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      >
        <div className="hc-subhero-overlay" aria-hidden="true" />
      </div>
      <SubNavBar />
    </>
  );
}