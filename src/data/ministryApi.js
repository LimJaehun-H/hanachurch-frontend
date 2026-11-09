import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { makeTree } from "./ministries.js";
import { GOOD_WORKS_TREE } from "./goodWorks.js";

// 교회부서 데이터는 백엔드(/api/ministries)가 원본
// API를 못 불러오면(서버 점검, 배포 전 등) 프론트에 있는 구성(goodWorks.js)으로 대신 보여 줌

const TIMEOUT_MS = 5000;

async function getJson(path) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { signal: ctrl.signal });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// API 나무 → 부서 맵이 쓰는 모양 (빈 children은 없애고, hasPage는 따로 모음)
function toTree(apiRoot) {
  const pages = new Set();
  const conv = (n) => {
    if (n.hasPage) pages.add(n.id);
    const node = { id: n.id, name: n.name };
    if (n.children?.length) node.children = n.children.map(conv);
    return node;
  };
  const root = conv(apiRoot);
  return makeTree(root, { hasPage: (id) => pages.has(id) });
}

let treeCache = null; // 페이지를 오가도 한 번만 불러오게

export function useMinistryTree() {
  const [tree, setTree] = useState(treeCache);
  useEffect(() => {
    if (treeCache) return;
    let alive = true;
    getJson("/api/ministries/tree")
      .then((data) => {
        treeCache = toTree(data);
      })
      .catch(() => {
        treeCache = GOOD_WORKS_TREE;
      })
      .finally(() => {
        if (alive) setTree(treeCache);
      });
    return () => {
      alive = false;
    };
  }, []);
  return tree;
}

// 소개 페이지 하나: { status: "loading" | "ok" | "notfound" | "error", data }
export function useMinistry(slug) {
  const [state, setState] = useState({ status: "loading", data: null });
  useEffect(() => {
    let alive = true;
    setState({ status: "loading", data: null });
    getJson(`/api/ministries/${encodeURIComponent(slug)}`)
      .then((data) => alive && setState({ status: "ok", data }))
      .catch((e) => alive && setState({ status: e.status === 404 ? "notfound" : "error", data: null }));
    return () => {
      alive = false;
    };
  }, [slug]);
  return state;
}
