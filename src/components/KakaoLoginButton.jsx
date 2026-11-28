import React, { useEffect, useState } from "react";
import { getKakaoConfig, startKakaoLogin } from "../utils/kakao.js";

// 카카오 로그인 버튼 (백엔드에서 카카오 로그인이 켜져 있을 때만 보임)
export default function KakaoLoginButton({ label = "카카오로 시작하기" }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let alive = true;
    getKakaoConfig().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);

  if (!config?.enabled) return null;

  return (
    <div className="hc-kakao">
      <button type="button" className="hc-kakao-btn" onClick={() => startKakaoLogin(config.clientId)}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3C6.48 3 2 6.48 2 10.78c0 2.74 1.82 5.15 4.57 6.53l-.93 3.43c-.08.3.26.54.52.37l4.07-2.69c.58.08 1.17.12 1.77.12 5.52 0 10-3.48 10-7.76S17.52 3 12 3z"
          />
        </svg>
        {label}
      </button>
      <div className="hc-kakao-or">
        <span>또는</span>
      </div>
    </div>
  );
}
