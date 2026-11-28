import { API_BASE_URL } from "../config.js";

// 카카오 로그인 도우미
// 버튼을 보여줄지(enabled)와 앱 키는 백엔드 설정(kakao.enabled)에서 받아 옴 → 심사 전에는 꺼 둠

const STATE_KEY = "hc_kakao_state";
export const KAKAO_SIGNUP_KEY = "hc_kakao_signup"; // 처음 온 사람의 가입 토큰·이름·전화번호 (가입 화면으로 전달)

let configPromise = null;

export function getKakaoConfig() {
  if (!configPromise) {
    configPromise = fetch(`${API_BASE_URL}/api/auth/kakao/config`)
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .catch(() => ({ enabled: false }));
  }
  return configPromise;
}

export function kakaoRedirectUri() {
  return `${window.location.origin}/login/kakao`;
}

// 카카오 동의 화면으로 이동 (state: 다른 사이트가 만든 요청이 아닌지 돌아왔을 때 확인하는 값)
export function startKakaoLogin(clientId) {
  const state = crypto.getRandomValues(new Uint32Array(4)).join("-");
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: kakaoRedirectUri(),
    response_type: "code",
    state,
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
}

export function checkKakaoState(state) {
  const saved = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return Boolean(saved) && saved === state;
}
