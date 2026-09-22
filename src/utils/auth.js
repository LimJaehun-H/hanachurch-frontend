import { API_BASE_URL } from "../config.js";

// 토큰을 localStorage에 저장하지 않습니다.
// Admin 페이지를 벗어났다가 다시 들어오면(=재로그인 필요) 항상 로그인 화면부터 시작합니다.

// Authorization 헤더가 필요한 요청용 fetch 래퍼. token은 호출하는 쪽(Admin 페이지)에서 전달합니다.
export async function authFetch(token, path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    throw new Error("AUTH_EXPIRED");
  }
  return res;
}
