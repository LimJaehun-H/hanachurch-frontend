import React, { useEffect, useState } from "react";
import SubNavBar from "./SubNavBar.jsx";
import { API_BASE_URL } from "../config.js";

// 페이지 상단 배너.
// 처음엔 어두운 배경만 보여주고, 관리자가 올린 사진이 다 받아지면 부드럽게 나타남.
// (예전에는 기본 사진이 먼저 잠깐 보였다가 바뀌어서 깜빡였음)
// 기본 사진(fallbackImageUrl)은 서버에서 사진을 못 받아왔거나 등록된 사진이 없을 때만 사용.
export default function SubHero({ groupKey, fallbackImageUrl }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const show = (url) => {
      if (!url) return;
      const img = new Image();
      img.onload = img.onerror = () => {
        if (cancelled) return;
        setImageUrl(url);
        setLoaded(true);
      };
      img.src = url;
    };

    if (!groupKey) {
      show(fallbackImageUrl);
      return () => { cancelled = true; };
    }
    fetch(`${API_BASE_URL}/api/site-images/${groupKey}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          show(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        } else {
          show(fallbackImageUrl);
        }
      })
      .catch(() => show(fallbackImageUrl));
    return () => { cancelled = true; };
  }, [groupKey, fallbackImageUrl]);

  return (
    <>
      <div className="hc-subhero">
        <div
          className={`hc-subhero-img${loaded ? " is-loaded" : ""}`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          aria-hidden="true"
        />
        <div className="hc-subhero-overlay" aria-hidden="true" />
      </div>
      <SubNavBar />
    </>
  );
}
