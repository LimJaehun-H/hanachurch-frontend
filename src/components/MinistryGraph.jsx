import React, { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceRadial } from "d3-force";
import { select } from "d3-selection";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import { drag as d3drag } from "d3-drag";
import "d3-transition";
import { CHURCH_ROOT, MINISTRY_INDEX, colorOf } from "../data/ministries.js";

// 교회부서 노드 화면
// - 처음엔 하나교회 + 큰 부서만 보이고, 노드를 누르면 하위 부서가 펼쳐짐
// - 손가락/마우스로 끌어서 이동, 두 손가락(또는 Ctrl+휠, +/- 버튼)으로 확대·축소
// - 노드를 끌면 연결된 노드들이 실처럼 따라옴 (d3-force 물리 시뮬레이션)

const RADIUS = [66, 50, 38, 30]; // 단계별 원 크기
const FONT = [21, 16, 13, 11.5]; // 단계별 글씨 크기
const LINK_DIST = [0, 165, 112, 78]; // 부모와의 거리
const RING = [0, 175, 320, 430]; // 가운데에서의 대략적인 거리 (방사형 배치 유지)

const depthOf = (id) => MINISTRY_INDEX[id].depth;
const radiusOf = (id) => RADIUS[Math.min(depthOf(id), 3)];

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

function styleOf(id) {
  const d = depthOf(id);
  const c = colorOf(id);
  if (d <= 1) return { fill: c, stroke: "none", text: "#FFFFFF" };
  if (d === 2) return { fill: mix(c, 0.82), stroke: c, text: darken(c, 0.35) };
  return { fill: "#FFFFFF", stroke: mix(c, 0.35), text: darken(c, 0.3) };
}

// 원 안에 들어가게 글자를 줄바꿈 (한글은 글자 폭 ≈ 글씨 크기)
function wrapLabel(name, fontSize, maxWidth) {
  const charW = (ch) => (/[ㄱ-힝]/.test(ch) ? fontSize * 0.98 : fontSize * 0.56);
  const width = (s) => [...s].reduce((w, ch) => w + charW(ch), 0);
  const lines = [];
  let line = "";
  const pushWord = (word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (width(candidate) <= maxWidth) {
      line = candidate;
      return;
    }
    if (line) lines.push(line);
    line = "";
    // 한 단어가 너무 길면 글자 단위로 자름
    let chunk = "";
    for (const ch of word) {
      if (width(chunk + ch) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else chunk += ch;
    }
    line = chunk;
  };
  name.split(" ").forEach(pushWord);
  if (line) lines.push(line);
  return lines;
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
      .force("charge", forceManyBody().strength((d) => (d.id === "root" ? -900 : -260 - (3 - depthOf(d.id)) * 90)))
      .force("collide", forceCollide().radius((d) => radiusOf(d.id) + 7).strength(1))
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
        const r = radiusOf(p.id);
        x0 = Math.min(x0, p.x - r);
        y0 = Math.min(y0, p.y - r);
        x1 = Math.max(x1, p.x + r);
        y1 = Math.max(y1, p.y + r);
      });
      const { w } = state.size;
      const top = 60; // 위쪽 버튼 줄
      const bottom = cardOpenRef.current ? (w < 760 ? 215 : 195) : 24;
      const h = state.size.h - top - bottom;
      const pad = 16;
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
      // 새로 보이는 노드는 부모 위치에서 시작해 퍼져 나감
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
        .selectAll("line")
        .data(links, (l) => l.id)
        .join("line")
        .attr("class", "hc-mg-link")
        .attr("stroke", (l) => mix(colorOf(l.id), depthOf(l.id) === 1 ? 0.35 : 0.45))
        .attr("stroke-width", (l) => [0, 9, 6, 4][depthOf(l.id)]);

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
          const bob = g
            .append("g")
            .attr("class", "hc-mg-bob")
            .style("animation-delay", () => `${(-Math.random() * 6).toFixed(2)}s`)
            .style("animation-duration", () => `${(5 + Math.random() * 3).toFixed(2)}s`);
          bob
            .append("circle")
            .attr("class", "hc-mg-circle")
            .attr("r", (d) => radiusOf(d.id))
            .attr("fill", (d) => styleOf(d.id).fill)
            .attr("stroke", (d) => styleOf(d.id).stroke)
            .attr("stroke-width", (d) => (depthOf(d.id) >= 2 ? 2 : 0));
          bob.each(function (d) {
            const depth = Math.min(depthOf(d.id), 3);
            const fs = FONT[depth];
            const lines = wrapLabel(MINISTRY_INDEX[d.id].node.name, fs, radiusOf(d.id) * 1.72);
            const lh = fs * 1.18;
            const text = select(this)
              .append("text")
              .attr("class", "hc-mg-label")
              .attr("fill", styleOf(d.id).text)
              .attr("font-size", fs)
              .attr("font-weight", depth <= 1 ? 700 : 600);
            lines.forEach((ln, i) =>
              text
                .append("tspan")
                .attr("x", 0)
                .attr("y", (i - (lines.length - 1) / 2) * lh)
                .attr("dy", "0.35em")
                .text(ln)
            );
          });
          // 접혀 있는 하위 부서 개수 배지
          bob
            .filter((d) => (MINISTRY_INDEX[d.id].node.children || []).length > 0 && d.id !== "root")
            .append("g")
            .attr("class", "hc-mg-badge")
            .attr("transform", (d) => {
              const r = radiusOf(d.id);
              return `translate(${r * 0.72},${-r * 0.72})`;
            })
            .call((b) => {
              b.append("circle").attr("r", 11);
              b.append("text").attr("dy", "0.35em");
            });
          g.call(dragger);
          g.on("click", (event, d) => handleTap(d.id));
          g.on("keydown", (event, d) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleTap(d.id);
            }
          });
          // 펼쳐질 때 살짝 커지며 나타남
          g.attr("opacity", 0).transition().duration(reduceMotion ? 0 : 450).attr("opacity", 1);
          return g;
        });

      node.select(".hc-mg-badge").each(function (d) {
        const count = (MINISTRY_INDEX[d.id].node.children || []).length;
        const open = state.expanded.has(d.id);
        select(this).classed("hc-mg-badge--open", open);
        select(this).select("text").text(open ? "−" : `+${count}`);
        select(this).select("circle").attr("r", open ? 10 : count >= 10 ? 13 : 11);
      });

      sim.nodes(nodes);
      sim.force("link").links(links);
      sim.alpha(0.7).restart();

      sim.on("tick", () => {
        link
          .attr("x1", (l) => l.source.x)
          .attr("y1", (l) => l.source.y)
          .attr("x2", (l) => l.target.x)
          .attr("y2", (l) => l.target.y);
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

  // 선택된 노드 강조
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
