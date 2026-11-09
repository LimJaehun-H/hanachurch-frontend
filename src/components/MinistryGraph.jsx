import React, { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceRadial } from "d3-force";
import { select } from "d3-selection";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import { drag as d3drag } from "d3-drag";
import "d3-transition";
import { MINISTRY_TREE } from "../data/ministries.js";

// 지금 그리는 부서 트리 (한 화면에 조직도는 하나뿐이라 모듈 변수로 둠, 트리가 바뀌면 컴포넌트를 다시 만듦)
let T = MINISTRY_TREE;

// 교회부서 노드 화면 (아이콘 카드형)
// - 처음엔 하나교회 + 큰 부서만 보이고, 카드를 누르면 하위 부서가 펼쳐짐
// - 손가락/마우스로 끌어서 이동, 두 손가락(또는 Ctrl+휠, +/- 버튼)으로 확대·축소
// - 카드를 끌면 연결된 카드들이 실처럼 따라옴 (d3-force 물리 시뮬레이션)

const LINK_DIST = [0, 190, 140, 104]; // 부모와의 거리
const RING = [0, 205, 375, 505]; // 가운데에서의 대략적인 거리 (방사형 배치 유지)

// 단계별 카드 규격
const SPEC = [
  { fs: 19, weight: 800, maxW: 120, minH: 66, padX: 14, icon: 21, gap: 10, radius: 20 },
  { fs: 16, weight: 700, maxW: 104, minH: 50, padX: 10, icon: 16, gap: 8, radius: 16 },
  { fs: 14, weight: 600, maxW: 98, minH: 44, padX: 9, icon: 13, gap: 7, radius: 13 },
  { fs: 12.5, weight: 600, maxW: 92, minH: 34, padX: 11, icon: 4, gap: 7, radius: 17 },
];

// 큰 부서 아이콘 (24×24 선 그림)
const ICONS = {
  root: null, // 가운데는 교회 로고
  finance: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 9l2 6 2-5 2 5 2-6M7.5 12h9",
  "admin-planning": "M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M8.5 11h7M8.5 15h5",
  worship: "M12 3v18M7 8.5h10",
  education: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5v-15M9 7.5h7",
  social: "M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z",
  mission: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3.2 3.6 3.2 14.4 0 18M12 3c-3.2 3.6-3.2 14.4 0 18",
  facility: "M3 11.5 12 4l9 7.5M5.5 10v10.5h13V10M10 20.5v-6h4v6",
};
// 중간 단계 중 이름으로 알아볼 수 있는 것은 전용 아이콘
const SUB_ICONS = [
  [/찬양|음악/, "M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"],
  [/청소/, "M14 3l7 7M4 20l7-7M12 9l3 3-6 6-4 1 1-4z"],
  [/주방|급식/, "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10"],
  [/도서관|교육/, "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5v-15"],
  [/전도|선교/, "M3 11l18-8-8 18-2-8z"],
  [/사진|기록|홍보|미디어/, "M4 7h3l2-3h6l2 3h3v13H4zM12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"],
  [/창고/, "M3 8l9-5 9 5v12H3zM3 8h18M9 20v-7h6v7"],
  [/에너지|전기/, "M13 2 4 14h7l-1 8 9-12h-7z"],
];

const depthOf = (id) => T.index[id].depth;
const specOf = (id) => SPEC[Math.min(depthOf(id), 3)];

function iconPath(id) {
  const info = T.index[id];
  if (info.depth === 2) {
    const hit = SUB_ICONS.find(([re]) => re.test(info.node.name));
    if (hit) return hit[1];
  }
  return ICONS[info.branch] || ICONS.worship;
}

// 색 섞기 (t=1이면 흰색)
function mix(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (255 - c) * t));
  return `rgb(${ch.join(",")})`;
}
function darken(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c * (1 - t)));
  return `rgb(${ch.join(",")})`;
}

// 카드 너비에 맞게 글자를 줄바꿈 (한글은 글자 폭 ≈ 글씨 크기)
const charW = (ch, fs) => (/[ㄱ-힝]/.test(ch) ? fs * 0.98 : fs * 0.56);
const textW = (s, fs) => [...s].reduce((w, ch) => w + charW(ch, fs), 0);
function wrapLabel(name, fs, maxWidth) {
  const lines = [];
  let line = "";
  name.split(" ").forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (textW(candidate, fs) <= maxWidth) {
      line = candidate;
      return;
    }
    if (line) lines.push(line);
    line = "";
    let chunk = "";
    for (const ch of word) {
      if (textW(chunk + ch, fs) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else chunk += ch;
    }
    line = chunk;
  });
  if (line) lines.push(line);
  return lines;
}

// 카드 크기·내용 계산 (한 번만)
const CARD = new Map();
function cardOf(id) {
  if (CARD.has(id)) return CARD.get(id);
  const sp = specOf(id);
  const lines = wrapLabel(T.index[id].node.name, sp.fs, sp.maxW);
  const lh = sp.fs * 1.22;
  const tw = Math.max(...lines.map((l) => textW(l, sp.fs)));
  const iconBox = sp.icon * 2;
  const w = Math.round(sp.padX * 2 + iconBox + sp.gap + tw + 4);
  const h = Math.round(Math.max(sp.minH, lines.length * lh + 18));
  const card = { w, h, lines, lh, sp, iconBox };
  CARD.set(id, card);
  return card;
}
const collideOf = (id) => {
  const { w, h } = cardOf(id);
  return Math.max(w * 0.44, h * 0.62) + 8;
};

function styleOf(id) {
  const d = depthOf(id);
  const c = T.colorOf(id);
  if (d <= 1) return { fill: c, stroke: "none", text: "#FFFFFF", iconBg: "rgba(255,255,255,0.22)", icon: "#FFFFFF" };
  if (d === 2) return { fill: mix(c, 0.9), stroke: mix(c, 0.45), text: darken(c, 0.38), iconBg: mix(c, 0.72), icon: darken(c, 0.2) };
  return { fill: "#FFFFFF", stroke: mix(c, 0.6), text: darken(c, 0.35), iconBg: c, icon: c };
}

function visibleIds(expanded) {
  const ids = [];
  (function walk(node) {
    ids.push(node.id);
    if (expanded.has(node.id)) (node.children || []).forEach(walk);
  })(T.root);
  return ids;
}

function descendantsOf(id, expanded) {
  const out = [];
  (function walk(node) {
    out.push(node.id);
    if (expanded.has(node.id)) (node.children || []).forEach(walk);
  })(T.index[id].node);
  return out;
}

// 부모→자식 곡선 (살짝 휘어 덩굴처럼)
// 부를 펼치면: 부 카드 바깥쪽(하나교회 반대편)에 세로 기둥이 서고, 기둥에서 팀들이 가지처럼 뻗음
const LIST_INDENT = 18; // 묶음 안 팀의 한 단계 들여쓰기
const LIST_GAP = 8; // 팀 카드 사이 간격
const SPINE_GAP = 36; // 부 카드와 기둥 사이
const TICK = 16; // 기둥에서 팀 카드까지
const SPINES = new Map(); // 부 id → { x: 기둥 x, dir: 1(오른쪽)|-1(왼쪽) }
function elbow(l) {
  const c = l.target;
  const cc = cardOf(c.id);
  const dept = T.index[c.id].path[1];
  const sp = SPINES.get(dept.id);
  if (!sp) return "";
  const { dir } = sp;
  const inner = c.x - dir * (cc.w / 2); // 팀 카드의 기둥 쪽 끝
  if (depthOf(c.id) === 2) {
    const p = l.source;
    const pc = cardOf(p.id);
    return `M${p.x + dir * (pc.w / 2)},${p.y}H${sp.x}V${c.y}H${inner}`;
  }
  // 묶음 안 팀: 묶음 카드 아래에서 내려오는 작은 기둥
  const g = l.source;
  const gc = cardOf(g.id);
  const sub = sp.x + dir * (TICK + LIST_INDENT / 2);
  return `M${sub},${g.y + gc.h / 2}V${c.y}H${inner}`;
}

function curve(l) {
  if (depthOf(l.id) >= 2) return elbow(l);
  const { x: sx, y: sy } = l.source;
  const { x: tx, y: ty } = l.target;
  const dx = tx - sx;
  const dy = ty - sy;
  const mx = (sx + tx) / 2 - dy * 0.14;
  const my = (sy + ty) / 2 + dx * 0.14;
  return `M${sx},${sy}Q${mx},${my} ${tx},${ty}`;
}

function drawCard(sel) {
  sel.each(function (d) {
    const g = select(this);
    const card = cardOf(d.id);
    const { w, h, lines, lh, sp, iconBox } = card;
    const st = styleOf(d.id);
    const depth = depthOf(d.id);

    g.append("rect")
      .attr("class", "hc-mg-rect")
      .attr("x", -w / 2)
      .attr("y", -h / 2)
      .attr("width", w)
      .attr("height", h)
      .attr("rx", Math.min(sp.radius, h / 2))
      .attr("fill", st.fill)
      .attr("stroke", st.stroke)
      .attr("stroke-width", depth >= 2 ? 1.5 : 0);

    const iconCx = -w / 2 + sp.padX + iconBox / 2;
    if (depth === 0) {
      g.append("circle").attr("cx", iconCx).attr("cy", 0).attr("r", sp.icon).attr("fill", "#FFFFFF");
      g.append("image")
        .attr("href", "/icon-512.png")
        .attr("x", iconCx - sp.icon * 0.78)
        .attr("y", -sp.icon * 0.78)
        .attr("width", sp.icon * 1.56)
        .attr("height", sp.icon * 1.56);
    } else if (depth === 3) {
      g.append("circle").attr("cx", iconCx).attr("cy", 0).attr("r", sp.icon).attr("fill", st.icon);
    } else {
      g.append("circle").attr("cx", iconCx).attr("cy", 0).attr("r", sp.icon).attr("fill", st.iconBg);
      const s = (sp.icon * 1.25) / 24;
      g.append("path")
        .attr("d", iconPath(d.id))
        .attr("transform", `translate(${iconCx - 12 * s},${-12 * s}) scale(${s})`)
        .attr("fill", "none")
        .attr("stroke", st.icon)
        .attr("stroke-width", 2.2)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
    }

    const textX = -w / 2 + sp.padX + iconBox + sp.gap;
    const text = g
      .append("text")
      .attr("class", "hc-mg-label")
      .attr("fill", st.text)
      .attr("font-size", sp.fs)
      .attr("font-weight", sp.weight);
    lines.forEach((ln, i) =>
      text
        .append("tspan")
        .attr("x", textX)
        .attr("y", (i - (lines.length - 1) / 2) * lh)
        .attr("dy", "0.35em")
        .text(ln)
    );

    // 하위 부서 개수 배지 (오른쪽 위)
    if ((T.index[d.id].node.children || []).length) {
      const b = g
        .append("g")
        .attr("class", "hc-mg-badge")
        .attr("transform", `translate(${w / 2 - 3},${-h / 2 + 3})`);
      b.append("circle").attr("r", 10.5);
      b.append("text").attr("dy", "0.35em");
    }
  });
}

const MinistryGraph = forwardRef(function MinistryGraph({ selectedId, onSelect, tree = MINISTRY_TREE }, ref) {
  if (T !== tree) {
    T = tree;
    CARD.clear(); // 카드 크기 계산은 트리마다 다름
  }
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const st = useRef(null); // d3 상태 (렌더 사이에 유지)
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const svg = select(svgRef.current);
    const scene = svg.append("g").attr("class", "hc-mg-scene");
    const linkLayer = scene.append("g").attr("class", "hc-mg-links");
    const nodeLayer = scene.append("g").attr("class", "hc-mg-nodes");
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const state = {
      expanded: new Set(), // 처음엔 하나교회만 보이고, 누르면 부서들이 펼쳐짐
      nodes: new Map(), // id -> 시뮬레이션 노드 (위치 유지)
      size: { w: 800, h: 600 },
      fitTimer: null,
    };
    st.current = state;

    // 펼친 부 옆 기둥에 팀들이 놓일 자리 (부를 가운데 두고 위아래로, 묶음을 펼치면 한 칸 들여서 이어짐)
    const listTargets = () => {
      const targets = new Map();
      const boxes = []; // 펼친 부 + 목록이 차지하는 영역 (다른 부가 겹치지 않게)
      const root = state.nodes.get("root");
      SPINES.clear();
      T.root.children.forEach((dept) => {
        const d = state.nodes.get(dept.id);
        if (!d || !state.expanded.has(dept.id)) return;
        const dc = cardOf(dept.id);
        const dir = !root || d.x >= root.x ? 1 : -1;
        const spineX = d.x + dir * (dc.w / 2 + SPINE_GAP);
        SPINES.set(dept.id, { x: spineX, dir });
        // 보이는 팀들을 위에서 아래 순서로
        const items = [];
        (function walk(children, level) {
          children.forEach((c) => {
            items.push({ c, level });
            if (state.expanded.has(c.id)) walk(c.children || [], level + 1);
          });
        })(dept.children || [], 1);
        const total = items.reduce((sum, it) => sum + cardOf(it.c.id).h, 0) + LIST_GAP * Math.max(items.length - 1, 0);
        let y = d.y - total / 2;
        let outer = spineX;
        items.forEach(({ c, level }) => {
          const cc = cardOf(c.id);
          const edge = spineX + dir * (TICK + (level - 1) * LIST_INDENT);
          const x = edge + dir * (cc.w / 2);
          targets.set(c.id, { x, y: y + cc.h / 2 });
          outer = dir > 0 ? Math.max(outer, x + cc.w / 2) : Math.min(outer, x - cc.w / 2);
          y += cc.h + LIST_GAP;
        });
        const near = d.x - dir * (dc.w / 2);
        boxes.push({
          id: dept.id,
          x0: Math.min(near, outer) - 10,
          x1: Math.max(near, outer) + 10,
          y0: Math.min(d.y - dc.h / 2, d.y - total / 2) - 10,
          y1: Math.max(d.y + dc.h / 2, d.y + total / 2) + 10,
        });
      });
      return { targets, boxes };
    };

    const listForce = () => {
      let nodes = [];
      const overlap = (a, b) => [
        Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0),
        Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0),
      ];
      const force = () => {
        const { targets, boxes } = listTargets();
        // 펼친 목록이 하나교회나 다른 부의 목록과 겹치면, 그 부를 옆으로 비켜 세움
        const root = state.nodes.get("root");
        if (root) {
          const rc = cardOf("root");
          const rb = { x0: root.x - rc.w / 2 - 12, x1: root.x + rc.w / 2 + 12, y0: root.y - rc.h / 2 - 12, y1: root.y + rc.h / 2 + 12 };
          boxes.forEach((b) => {
            const [ox, oy] = overlap(b, rb);
            const owner = state.nodes.get(b.id);
            if (ox > 0 && oy > 0 && owner) owner.vx += (owner.x < root.x ? -1 : 1) * ox * 0.25;
          });
        }
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const [ox, oy] = overlap(boxes[i], boxes[j]);
            if (ox <= 0 || oy <= 0) continue;
            const a = state.nodes.get(boxes[i].id);
            const b2 = state.nodes.get(boxes[j].id);
            const dir = a.x <= b2.x ? 1 : -1;
            a.vx -= dir * ox * 0.12;
            b2.vx += dir * ox * 0.12;
          }
        }
        nodes.forEach((n) => {
          const t = targets.get(n.id);
          if (t) {
            // 팀: 목록 자리로 부드럽게 따라감 (부를 끌면 목록도 같이 따라옴)
            n.x += (t.x - n.x) * 0.2;
            n.y += (t.y - n.y) * 0.2;
            n.vx = 0;
            n.vy = 0;
            return;
          }
          // 부·하나교회: 다른 부의 목록 영역과 겹치면 밖으로 밀어냄
          if (depthOf(n.id) > 1) return;
          const nc = cardOf(n.id);
          boxes.forEach((b) => {
            if (b.id === n.id) return;
            const ox = Math.min(n.x + nc.w / 2, b.x1) - Math.max(n.x - nc.w / 2, b.x0);
            const oy = Math.min(n.y + nc.h / 2, b.y1) - Math.max(n.y - nc.h / 2, b.y0);
            if (ox > 0 && oy > 0) {
              if (n.id === "root") return;
              if (ox < oy) n.vx += (n.x < (b.x0 + b.x1) / 2 ? -ox : ox) * 0.2;
              else n.vy += (n.y < (b.y0 + b.y1) / 2 ? -oy : oy) * 0.2;
            }
          });
        });
      };
      force.initialize = (ns) => { nodes = ns; };
      return force;
    };

    const inList = (d) => depthOf(d.id) >= 2;
    const sim = forceSimulation()
      .force("link", forceLink().id((d) => d.id).distance((l) => LINK_DIST[depthOf(l.target.id)]).strength((l) => (depthOf(l.target.id) === 1 ? 0.9 : 0)))
      .force("charge", forceManyBody().strength((d) => (inList(d) ? 0 : d.id === "root" ? -1000 : -300 - (3 - depthOf(d.id)) * 110)))
      .force("collide", forceCollide().radius((d) => (inList(d) ? 0 : collideOf(d.id))).strength(1))
      .force("radial", forceRadial((d) => RING[depthOf(d.id)], 0, 0).strength((d) => (inList(d) ? 0 : 0.06)))
      .force("list", listForce())
      .alphaDecay(0.035);
    state.sim = sim;

    // 확대·축소: 폰은 두 손가락, PC는 Ctrl/⌘+휠 또는 버튼 (그냥 휠은 페이지 스크롤)
    const zoomer = d3zoom()
      .scaleExtent([0.3, 3])
      .filter((event) => {
        if (event.type === "wheel") return event.ctrlKey || event.metaKey;
        return !event.button;
      })
      .on("zoom", (event) => scene.attr("transform", event.transform));
    svg.call(zoomer).on("dblclick.zoom", null);
    state.zoomer = zoomer;

    const dragger = d3drag()
      .clickDistance(6)
      .on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.25).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        if (d.id !== "root") {
          d.fx = null;
          d.fy = null;
        }
      });

    const fitTo = (ids, duration = 650) => {
      const pts = ids.map((id) => state.nodes.get(id)).filter(Boolean);
      if (!pts.length) return;
      let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
      pts.forEach((p) => {
        const { w: cw, h: ch } = cardOf(p.id);
        x0 = Math.min(x0, p.x - cw / 2);
        y0 = Math.min(y0, p.y - ch / 2);
        x1 = Math.max(x1, p.x + cw / 2);
        y1 = Math.max(y1, p.y + ch / 2);
      });
      const { w } = state.size;
      const top = 60; // 위쪽 버튼 줄
      const bottom = 24;
      const h = state.size.h - top - bottom;
      const pad = 14;
      const k = Math.min(1.5, (w - pad * 2) / (x1 - x0), (h - pad * 2) / (y1 - y0));
      const t = zoomIdentity
        .translate(w / 2, top + h / 2)
        .scale(k)
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
      svg.transition().duration(reduceMotion ? 0 : duration).call(zoomer.transform, t);
    };
    state.fitTo = fitTo;
    const fitLater = (ids, delay = 700) => {
      clearTimeout(state.fitTimer);
      state.fitTimer = setTimeout(() => fitTo(ids()), delay);
    };
    state.fitLater = fitLater;

    const render = () => {
      const ids = visibleIds(state.expanded);
      const idSet = new Set(ids);
      // 새로 보이는 카드는 부모 위치에서 시작해 퍼져 나감
      ids.forEach((id) => {
        if (!state.nodes.has(id)) {
          const parent = T.index[id].parent;
          const p = parent && state.nodes.get(parent.id);
          const jitter = () => (Math.random() - 0.5) * 30;
          state.nodes.set(id, { id, x: (p?.x ?? 0) + jitter(), y: (p?.y ?? 0) + jitter() });
        }
      });
      for (const id of [...state.nodes.keys()]) if (!idSet.has(id)) state.nodes.delete(id);
      const root = state.nodes.get("root");
      root.fx = 0;
      root.fy = 0;

      const nodes = ids.map((id) => state.nodes.get(id));
      const links = ids
        .filter((id) => id !== "root")
        .map((id) => ({ id, source: T.index[id].parent.id, target: id }));

      const link = linkLayer
        .selectAll("path")
        .data(links, (l) => l.id)
        .join("path")
        .attr("class", "hc-mg-link")
        .attr("fill", "none")
        .attr("stroke", (l) => mix(T.colorOf(l.id), depthOf(l.id) === 1 ? 0.3 : 0.5))
        .attr("stroke-width", (l) => [0, 6, 4, 2.5][depthOf(l.id)]);

      const node = nodeLayer
        .selectAll("g.hc-mg-node")
        .data(nodes, (d) => d.id)
        .join((enter) => {
          const g = enter
            .append("g")
            .attr("class", (d) => `hc-mg-node hc-mg-node--d${depthOf(d.id)}`)
            .attr("tabindex", 0)
            .attr("role", "button")
            .attr("aria-label", (d) => T.index[d.id].node.name);
          g.append("g")
            .attr("class", "hc-mg-bob")
            .style("animation-delay", () => `${(-Math.random() * 6).toFixed(2)}s`)
            .style("animation-duration", () => `${(5 + Math.random() * 3).toFixed(2)}s`)
            .append("g")
            .attr("class", "hc-mg-card")
            .call(drawCard);
          g.call(dragger);
          g.on("click", (event, d) => handleTap(d.id));
          g.on("keydown", (event, d) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleTap(d.id);
            }
          });
          g.attr("opacity", 0).transition().duration(reduceMotion ? 0 : 450).attr("opacity", 1);
          return g;
        });

      node.select(".hc-mg-badge").each(function (d) {
        const count = (T.index[d.id].node.children || []).length;
        const open = state.expanded.has(d.id);
        select(this).classed("hc-mg-badge--open", open);
        select(this).select("text").text(open ? "−" : `+${count}`);
      });

      sim.nodes(nodes);
      sim.force("link").links(links);
      sim.alpha(0.7).restart();

      sim.on("tick", () => {
        link.attr("d", curve);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });
    };
    state.render = render;

    const handleTap = (id) => {
      const hasChildren = (T.index[id].node.children || []).length > 0;
      if (hasChildren) {
        if (state.expanded.has(id)) {
          // 접기: 이 가지 아래 펼친 것도 모두 접음
          descendantsOf(id, state.expanded).forEach((x) => state.expanded.delete(x));
          render();
          fitLater(() => visibleIds(state.expanded));
        } else {
          state.expanded.add(id);
          // 부를 펼치면 그 아래 묶음까지 한 번에 다 펼침
          if (T.index[id].depth === 1) {
            (function openAll(node) {
              (node.children || []).forEach((c) => {
                if ((c.children || []).length) {
                  state.expanded.add(c.id);
                  openAll(c);
                }
              });
            })(T.index[id].node);
          }
          render();
          // 펼친 가지와 그 부모 쪽으로 화면을 맞춤
          const parentId = T.index[id].parent?.id;
          fitLater(() => [...(parentId ? [parentId] : []), ...descendantsOf(id, state.expanded)]);
        }
      }
      onSelectRef.current?.(id);
    };

    // 크기 변화에 맞춤
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      state.size = { w: width, h: height };
      svg.attr("viewBox", `0 0 ${width} ${height}`);
    });
    ro.observe(wrapRef.current);

    render();
    fitLater(() => visibleIds(state.expanded), 900);

    return () => {
      ro.disconnect();
      clearTimeout(state.fitTimer);
      sim.stop();
      svg.on(".zoom", null);
      svg.selectAll("*").remove();
    };
  }, []);

  // 선택된 카드 강조
  useEffect(() => {
    select(svgRef.current)
      .selectAll("g.hc-mg-node")
      .classed("hc-mg-node--selected", (d) => d.id === selectedId);
  }, [selectedId]);

  useImperativeHandle(ref, () => ({
    zoomBy(k) {
      const s = st.current;
      select(svgRef.current).transition().duration(250).call(s.zoomer.scaleBy, k);
    },
    fitAll() {
      const s = st.current;
      s.fitTo(visibleIds(s.expanded));
    },
    expandAll() {
      const s = st.current;
      Object.values(T.index).forEach(({ node }) => {
        if ((node.children || []).length) s.expanded.add(node.id);
      });
      s.render();
      s.fitLater(() => visibleIds(s.expanded), 1200);
    },
    collapseAll() {
      const s = st.current;
      s.expanded = new Set();
      s.render();
      s.fitLater(() => visibleIds(s.expanded));
    },
  }));

  return (
    <div ref={wrapRef} className="hc-mg">
      <svg ref={svgRef} className="hc-mg-svg" role="img" aria-label="하나교회 부서 조직도" />
    </div>
  );
});

export default MinistryGraph;
