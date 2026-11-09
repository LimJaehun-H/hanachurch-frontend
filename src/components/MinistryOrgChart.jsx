import React from "react";
import { Link } from "react-router-dom";

// 가로 조직도: 하나교회 → 부 → 묶음 → 팀이 왼쪽에서 오른쪽으로 칸과 선으로 이어짐
// PC: 하나교회부터 한 나무로
// 폰: 하나교회는 맨 위, 부마다 "부 → 묶음 → 팀" 가로 나무 (옆으로 밀 필요 없음)
// 소개 페이지가 있는 이름만 링크 (백엔드 hasPage)

export default function MinistryOrgChart({ tree }) {
  const { root, colorOf, hasPage } = tree;

  return (
    <div className="org">
      <div className="ht-row ht-row--root">
        <div className="ht-box ht-box--root">
          <img src="/icon-512.png" alt="" />
          {root.name}
        </div>
        <ul className="ht-kids ht-kids--depts">
          {root.children.map((dept) => (
            <li key={dept.id} style={{ "--mc": colorOf(dept.id) }}>
              <Node node={dept} level={1} hasPage={hasPage} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const LEVEL = { 1: "dept", 2: "group", 3: "team" };

function Node({ node, level, hasPage }) {
  const kids = node.children || [];
  // 부 바로 아래 팀(묶음 없이)은 팀 모양으로
  const kind = level === 1 ? "dept" : kids.length ? "group" : "team";
  const cls = `ht-box ht-box--${kind}`;
  const label =
    level === 1 && hasPage(node.id) ? (
      <>
        <span>{node.name}</span>
        <small>소개</small>
      </>
    ) : (
      node.name
    );

  return (
    <div className={`ht-row ht-row--${LEVEL[level] || "team"}`}>
      {hasPage(node.id) ? (
        <Link to={`/ministry/${node.id}`} className={`${cls} ht-box--link`}>
          {label}
        </Link>
      ) : (
        <span className={`${cls} ${kind === "team" ? "ht-box--plain" : ""}`}>{label}</span>
      )}
      {kids.length > 0 && (
        <ul className="ht-kids">
          {kids.map((c) => (
            <li key={c.id}>
              <Node node={c} level={level + 1} hasPage={hasPage} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
