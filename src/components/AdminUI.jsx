import React from "react";

// 관리자 화면 공통 조각 (카카오 개발자센터 스타일: 섹션 제목 + 항목명/입력칸 표)

// 한 덩어리 영역: 제목, 설명, 오른쪽 버튼(선택)
export function AdminSection({ title, desc, count, actions, children }) {
  return (
    <section className="hc-adm-section">
      {(title || actions) && (
        <div className="hc-adm-section-head">
          <h3 className="hc-adm-section-title">
            {title}
            {count !== undefined && count !== null && <span className="hc-adm-count">{count}</span>}
          </h3>
          {actions && <div className="hc-adm-section-actions">{actions}</div>}
        </div>
      )}
      {desc && <p className="hc-adm-section-desc">{desc}</p>}
      {children}
    </section>
  );
}

// 표 한 줄: 왼쪽 항목명, 오른쪽 입력칸 (폰에서는 위아래로 쌓임)
export function AdminField({ label, required, hint, children }) {
  return (
    <div className="hc-adm-field">
      <div className="hc-adm-field-label">
        {label}
        {required && <span className="hc-adm-required">필수</span>}
      </div>
      <div className="hc-adm-field-control">
        {children}
        {hint && <p className="hc-adm-field-hint">{hint}</p>}
      </div>
    </div>
  );
}

// 표 묶음
export function AdminFieldTable({ children }) {
  return <div className="hc-adm-table">{children}</div>;
}

// 폼 아래 버튼 줄
export function AdminFormActions({ children }) {
  return <div className="hc-adm-form-actions">{children}</div>;
}

// 결과 안내 (성공/실패)
export function AdminStatus({ status }) {
  if (!status) return null;
  return (
    <p className={`hc-adm-status ${status.ok ? "hc-adm-status--ok" : "hc-adm-status--err"}`} role="status">
      {status.msg}
    </p>
  );
}

// 목록 한 줄: 제목, 보조 정보, 오른쪽 버튼 (글자와 버튼이 겹치지 않게 분리)
export function AdminRow({ badge, title, meta, actions, highlight }) {
  return (
    <li className={`hc-adm-row ${highlight ? "hc-adm-row--highlight" : ""}`}>
      <div className="hc-adm-row-main">
        <div className="hc-adm-row-title">
          {badge}
          <span className="hc-adm-row-text">{title}</span>
        </div>
        {meta && <div className="hc-adm-row-meta">{meta}</div>}
      </div>
      {actions && <div className="hc-adm-row-actions">{actions}</div>}
    </li>
  );
}

export function AdminList({ loading, empty, emptyText, children }) {
  if (loading) return <p className="hc-adm-empty">불러오는 중…</p>;
  if (empty) return <p className="hc-adm-empty">{emptyText}</p>;
  return <ul className="hc-adm-list">{children}</ul>;
}

// "2026-11-04T10:00:00" → "2026.11.04"
export function formatDate(value) {
  if (!value) return null;
  return String(value).slice(0, 10).replaceAll("-", ".");
}
