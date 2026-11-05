import React, { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceRadial } from "d3-force";
import { select } from "d3-selection";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import { drag as d3drag } from "d3-drag";
import "d3-transition";
import { CHURCH_ROOT, MINISTRY_INDEX, colorOf } from "../data/ministries.js";
import { iconPath } from "../data/ministryIcons.js";

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

const depthOf = (id) => MINISTRY_INDEX[id].depth;
const specOf = (id) => SPEC[Math.min(depthOf(id), 3)];

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
  const lines = wrapLabel(MINISTRY_INDEX[id].node.name, sp.fs, sp.maxW);
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
  const c = colorOf(id);
  if (d <= 1) return { fill: c, stroke: "none", text: "#FFFFFF", iconBg: "rgba(255,255,255,0.22)", icon: "#FFFFFF" };
  if (d === 2) return { fill: mix(c, 0.9), stroke: mix(c, 0.45), text: darken(c, 0.38), iconBg: mix(c, 0.72), icon: darken(c, 0.2) };
  return { fill: "#FFFFFF", stroke: mix(c, 0.6), text: darken(c, 0.35), iconBg: c, icon: c };
}

function visibleIds(expanded) {
  const ids = [];
  (function walk(node) {
    ids.push(node.id);
    if (expanded.has(node.id)) (node.children || []).forEach(walk);
  })(CHURCH_ROOT);
  return ids;
}

function descendantsOf(id, expanded) {
  const out = [];
  (function walk(node) {
    out.push(node.id);
    if (expanded.has(node.id)) (node.children || []).forEach(walk);
  })(MINISTRY_INDEX[id].node);
  return out;
}

// 부모→자식 곡선 (살짝 휘어 덩굴처럼)
function curve(l) {
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
    if ((MINISTRY_INDEX[d.id].node.children || []).length && d.id !== "root") {
      const b = g
        .append("g")
        .attr("class", "hc-mg-badge")
        .attr("transform", `translate(${w / 2 - 3},${-h / 2 + 3})`);
      b.append("circle").attr("r", 10.5);
      b.append("text").attr("dy", "0.35em");
    }
  });
}

const MinistryGraph = forwardRef(function MinistryGraph({ selectedId, onSelect }, ref) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const st = useRef(null); // d3 상태 (렌더 사이에 유지)
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const cardOpenRef = useRef(false); // 아래 카드가 떠 있으면 그만큼 비우고 화면을 맞춤
  cardOpenRef.current = Boolean(selectedId && selectedId !== "root");

  useEffect(() => {
    const svg = select(svgRef.current);
    const scene = svg.append("g").attr("class", "hc-mg-scene");
    const linkLayer = scene.append("g").attr("class", "hc-mg-links");
    const nodeLayer = scene.append("g").attr("class", "hc-mg-nodes");
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const state = {
      expanded: new Set(["root"]),
      nodes: new Map(), // id -> 시뮬레이션 노드 (위치 유지)
      size: { w: 800, h: 600 },
      fitTimer: null,
    };
    st.current = state;

    const sim = forceSimulation()
      .force("link", forceLink().id((d) => d.id).distance((l) => LINK_DIST[depthOf(l.target.id)]).strength(0.9))
      .force("charge", forceManyBody().strength((d) => (d.id === "root" ? -1000 : -300 - (3 - depthOf(d.id)) * 110)))
      .force("collide", forceCollide().radius((d) => collideOf(d.id)).strength(1))
      .force("radial", forceRadial((d) => RING[depthOf(d.id)], 0, 0).strength(0.06))
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
      const bottom = cardOpenRef.current ? (w < 760 ? 215 : 195) : 24;
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
          const parent = MINISTRY_INDEX[id].parent;
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
        .map((id) => ({ id, source: MINISTRY_INDEX[id].parent.id, target: id }));

      const link = linkLayer
        .selectAll("path")
        .data(links, (l) => l.id)
        .join("path")
        .attr("class", "hc-mg-link")
        .attr("fill", "none")
        .attr("stroke", (l) => mix(colorOf(l.id), depthOf(l.id) === 1 ? 0.3 : 0.5))
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
            .attr("aria-label", (d) => MINISTRY_INDEX[d.id].node.name);
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
        const count = (MINISTRY_INDEX[d.id].node.children || []).length;
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
      const hasChildren = (MINISTRY_INDEX[id].node.children || []).length > 0;
      if (hasChildren && id !== "root") {
        if (state.expanded.has(id)) {
          // 접기: 이 가지 아래 펼친 것도 모두 접음
          descendantsOf(id, state.expanded).forEach((x) => state.expanded.delete(x));
          render();
          fitLater(() => visibleIds(state.expanded));
        } else {
          state.expanded.add(id);
          render();
          // 펼친 가지와 그 부모 쪽으로 화면을 맞춤
          const parentId = MINISTRY_INDEX[id].parent.id;
          fitLater(() => [parentId, ...descendantsOf(id, state.expanded)]);
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
      Object.values(MINISTRY_INDEX).forEach(({ node }) => {
        if ((node.children || []).length) s.expanded.add(node.id);
      });
      s.render();
      s.fitLater(() => visibleIds(s.expanded), 1200);
    },
    collapseAll() {
      const s = st.current;
      s.expanded = new Set(["root"]);
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
