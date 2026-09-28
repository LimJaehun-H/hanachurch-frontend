// 일반 회원(교인) 로그인 세션 관리.
// 관리자 페이지(Admin.jsx)와 달리, 일반 회원은 새로고침해도 로그인이 풀리지 않도록
// localStorage에 토큰을 저장합니다.

const TOKEN_KEY = "hc_member_token";
const LOGIN_ID_KEY = "hc_member_login_id";
const NAME_KEY = "hc_member_name";
const AUTH_CHANGE_EVENT = "hc-member-auth-change";

export function getMemberToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getMemberLoginId() {
  return localStorage.getItem(LOGIN_ID_KEY);
}

export function getMemberName() {
  return localStorage.getItem(NAME_KEY);
}

export function setMemberSession(token, loginId, name) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LOGIN_ID_KEY, loginId);
  if (name) localStorage.setItem(NAME_KEY, name);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearMemberSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGIN_ID_KEY);
  localStorage.removeItem(NAME_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// Authorization 헤더가 필요한 회원 전용 API 호출용 fetch 래퍼
export async function memberAuthFetch(path, options = {}) {
  const token = getMemberToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(path, { ...options, headers });
}

// Header 등에서 로그인 상태 변화를 구독할 때 사용
export function subscribeMemberAuthChange(callback) {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback); // 다른 탭에서 로그인/로그아웃한 경우도 반영
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
