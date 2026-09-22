import { useEffect, useRef, useState } from "react";
import { MAP_CONFIG } from "../config.js";

const SCRIPT_ID = "kakao-map-sdk";

function loadKakaoScript() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("SCRIPT_LOAD_FAILED")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${MAP_CONFIG.kakaoJsKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("SCRIPT_LOAD_FAILED"));
    document.head.appendChild(script);
  });
}

// containerRef에 카카오맵을 그려주는 훅. status: "loading" | "ready" | "error"
export function useKakaoMap(containerRef, address) {
  const [status, setStatus] = useState("loading");
  const mapInstance = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadKakaoScript()
      .then(() => {
        if (cancelled) return;
        window.kakao.maps.load(() => {
          if (cancelled || !containerRef.current) return;

          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result, geoStatus) => {
            if (cancelled) return;

            if (geoStatus !== window.kakao.maps.services.Status.OK || !result[0]) {
              setStatus("error");
              return;
            }

            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            const map = new window.kakao.maps.Map(containerRef.current, {
              center: coords,
              level: MAP_CONFIG.level,
            });
            new window.kakao.maps.Marker({ position: coords, map });
            mapInstance.current = map;
            setStatus("ready");
          });
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [address, containerRef]);

  return status;
}
