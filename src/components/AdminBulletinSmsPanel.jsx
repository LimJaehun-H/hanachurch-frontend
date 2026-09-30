import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/auth.js";
import { API_BASE_URL } from "../config.js";

const MAX_IMAGES = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

// 다가오는(또는 오늘) 일요일
function upcomingSunday() {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return d;
}

// Date → "2026-10-05" (서버 LocalDate 형식)
function toIsoDate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultText(isoDate) {
  const [, m, d] = isoDate.split("-").map(Number);
  return `[하나교회] ${m}월 ${d}일 주보입니다.\n이번 주도 평안한 한 주 보내세요.`;
}

function formatBulletinDate(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function formatDateTime(value) {
  if (!value) return "";
  const [date, time = ""] = value.split("T");
  return `${date.replaceAll("-", ".")} ${time.slice(0, 5)}`;
}

async function readError(res, fallback) {
  const data = await res.json().catch(() => null);
  return data?.message || fallback;
}

export default function AdminBulletinSmsPanel({ token, onAuthExpired }) {
  const [images, setImages] = useState([]); // [{ file, url }]
  const [bulletinDate, setBulletinDate] = useState(() => toIsoDate(upcomingSunday()));
  const [text, setText] = useState(() => defaultText(toIsoDate(upcomingSunday())));
  const [textEdited, setTextEdited] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [testPhone, setTestPhone] = useState("");
  const [logs, setLogs] = useState([]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [lastBulletinId, setLastBulletinId] = useState(null);
  const [preview, setPreview] = useState(null); // 이력 미리보기 모달: { bulletinDate, images }

  // 발송 이력 미리보기: 그때 보낸 주보 사진 불러와서 모달로 표시 (관리자 토큰 필요)
  const openPreview = async (smsBulletinId) => {
    try {
      const res = await authFetch(token, `/api/admin/bulletin-sms/bulletins/${smsBulletinId}`);
      if (!res.ok) throw new Error(await readError(res, "보낸 주보를 불러오지 못했습니다."));
      setPreview(await res.json());
    } catch (err) {
      handleError(err);
    }
  };

  // 날짜를 바꾸면, 관리자가 문구를 직접 고치지 않은 경우에만 기본 문구도 같이 바꿈
  const handleDateChange = (value) => {
    setBulletinDate(value);
    if (!textEdited && value) setText(defaultText(value));
  };

  const handleError = (err) => {
    if (err.message === "AUTH_EXPIRED") return onAuthExpired();
    setStatus({ ok: false, msg: err.message });
  };

  const loadRecipients = async () => {
    try {
      const res = await authFetch(token, "/api/admin/bulletin-sms/recipients");
      if (!res.ok) throw new Error(await readError(res, "수신자 목록을 불러오지 못했습니다."));
      const data = await res.json();
      setRecipients(data);
      // 기본값: 동의한 회원 전체 선택
      setSelectedIds(new Set(data.map((r) => r.memberId)));
    } catch (err) {
      handleError(err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await authFetch(token, "/api/admin/bulletin-sms/logs");
      if (!res.ok) return;
      setLogs(await res.json());
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") onAuthExpired();
    }
  };

  useEffect(() => {
    loadRecipients();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 발송 중에 새로고침/창 닫기를 하면 브라우저 경고창 표시
  // (새로고침해도 서버 발송은 취소되지 않아서, 결과를 못 보고 다시 발송하면 중복으로 나감)
  useEffect(() => {
    if (!sending) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // 크롬 등은 이 값을 넣어야 경고창이 뜸 (문구는 브라우저 기본 문구로 표시)
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sending]);

  // 미리보기용 object URL 정리
  useEffect(() => () => images.forEach((img) => URL.revokeObjectURL(img.url)), [images]);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // 같은 파일 다시 선택 가능하게
    setStatus(null);

    const invalid = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalid) {
      setStatus({ ok: false, msg: `JPG, PNG만 가능합니다: ${invalid.name}` });
      return;
    }
    const next = [...images, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))];
    if (next.length > MAX_IMAGES) {
      setStatus({ ok: false, msg: `이미지는 최대 ${MAX_IMAGES}장까지 선택할 수 있습니다.` });
      return;
    }
    setImages(next);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index, dir) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const allSelected = recipients.length > 0 && selectedIds.size === recipients.length;

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(recipients.map((r) => r.memberId)));
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const messageCount = useMemo(() => selectedIds.size * images.length, [selectedIds, images]);

  const validateCommon = () => {
    if (images.length === 0) return "발송할 주보 이미지를 선택해주세요.";
    if (!bulletinDate) return "주보 날짜를 선택해주세요.";
    if (!text.trim()) return "문구를 입력해주세요.";
    return null;
  };

  const buildFormData = () => {
    const form = new FormData();
    images.forEach((img) => form.append("images", img.file));
    form.append("text", text.trim());
    form.append("bulletinDate", bulletinDate);
    return form;
  };

  const handleTestSend = async () => {
    const error = validateCommon() || (!/^01[0-9]{8,9}$/.test(testPhone) && "테스트 받을 번호를 숫자만 입력해주세요.");
    if (error) return setStatus({ ok: false, msg: error });
    if (!window.confirm(`${testPhone} 번호로 테스트 문자 ${images.length}건을 보냅니다.`)) return;

    const form = buildFormData();
    form.append("phoneNumber", testPhone);
    await submit("/api/admin/bulletin-sms/test", form, "테스트");
  };

  const handleSend = async () => {
    const error = validateCommon() || (selectedIds.size === 0 && "받을 회원을 한 명 이상 선택해주세요.");
    if (error) return setStatus({ ok: false, msg: error });
    const ok = window.confirm(
      `${selectedIds.size}명에게 주보 문자를 발송합니다.\n` +
        `이미지 ${images.length}장 → 총 ${messageCount}건 (MMS)\n\n` +
        `발송 후에는 취소할 수 없습니다. 진행할까요?`
    );
    if (!ok) return;

    const form = buildFormData();
    selectedIds.forEach((id) => form.append("memberIds", id));
    await submit("/api/admin/bulletin-sms/send", form, "발송");
  };

  const submit = async (path, form, label) => {
    setSending(true);
    setStatus(null);
    setLastBulletinId(null);
    try {
      // FormData는 Content-Type을 직접 지정하지 않아야 브라우저가 boundary를 붙여줌
      const res = await authFetch(token, path, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readError(res, `${label}에 실패했습니다.`));
      const data = await res.json();
      setStatus({
        ok: data.failCount === 0,
        msg:
          `${label} 완료: ${data.targetCount}명 × 이미지 ${data.imageCount}장 → ` +
          `접수 성공 ${data.successCount}건 / 실패 ${data.failCount}건`,
      });
      setLastBulletinId(data.smsBulletinId);
      loadLogs();
    } catch (err) {
      handleError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="hc-sms">
      <h2 className="hc-admin-panel-title">주보 문자 발송</h2>
      <p className="hc-admin-panel-hint">
        주보 사진(최대 2장)을 골라 수신 동의한 회원에게 문자(MMS)로 보냅니다. 사진은 자동으로 문자 규격(JPG, 200KB 이하)에 맞게 줄여집니다.
      </p>

      {/* 1. 이미지 */}
      <div className="hc-sms-block">
        <h3 className="hc-sms-subtitle">1. 주보 이미지 ({images.length}/{MAX_IMAGES})</h3>
        <div className="hc-sms-images">
          {images.map((img, i) => (
            <div key={img.url} className="hc-sms-thumb">
              <span className="hc-sms-thumb-order">{i + 1}</span>
              <img src={img.url} alt={`주보 ${i + 1}`} />
              <div className="hc-sms-thumb-actions">
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}>◀</button>
                <button type="button" onClick={() => removeImage(i)}>삭제</button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>▶</button>
              </div>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <label className="hc-sms-add">
              <input type="file" accept=".jpg,.jpeg,.png" multiple onChange={handleFilesChange} hidden />
              + 사진 선택
            </label>
          )}
        </div>
      </div>

      {/* 2. 날짜 + 문구 */}
      <div className="hc-sms-block">
        <h3 className="hc-sms-subtitle">2. 주보 날짜 · 문구</h3>
        <div className="hc-admin-form">
          <input
            type="date"
            className="hc-sms-date"
            value={bulletinDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setTextEdited(true);
            }}
            maxLength={500}
          />
        </div>
        <p className="hc-sms-note">
          {images.length > 1 ? "사진이 2장이면 각 문자 끝에 (1/2), (2/2)가 자동으로 붙습니다. " : ""}
          {text.length}/500자
        </p>
      </div>

      {/* 3. 수신자 */}
      <div className="hc-sms-block">
        <h3 className="hc-sms-subtitle">
          3. 받는 사람 (수신 동의 {recipients.length}명 중 {selectedIds.size}명 선택)
        </h3>
        {recipients.length === 0 ? (
          <p className="hc-sms-note">아직 문자 수신에 동의한 회원이 없습니다.</p>
        ) : (
          <div className="hc-sms-recipients">
            <label className="hc-sms-recipient hc-sms-recipient--all">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>전체 선택</span>
            </label>
            {recipients.map((r) => (
              <label key={r.memberId} className="hc-sms-recipient">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.memberId)}
                  onChange={() => toggleOne(r.memberId)}
                />
                <span>{r.name}</span>
                <span className="hc-sms-phone">{r.maskedPhone}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. 발송 */}
      <div className="hc-sms-block">
        <h3 className="hc-sms-subtitle">4. 발송</h3>
        <div className="hc-sms-test">
          <input
            type="text"
            inputMode="numeric"
            placeholder="테스트 받을 번호 (숫자만)"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value.replace(/[^0-9]/g, ""))}
            maxLength={11}
          />
          <button type="button" className="hc-admin-btn hc-sms-btn-outline" onClick={handleTestSend} disabled={sending}>
            테스트 발송
          </button>
        </div>
        <button type="button" className="hc-admin-btn hc-sms-send" onClick={handleSend} disabled={sending}>
          {sending ? "발송 중..." : `${selectedIds.size}명에게 발송 (총 ${messageCount}건)`}
        </button>
        {sending && (
          <p className="hc-sms-warning">
            발송 중입니다. 새로고침하거나 창을 닫지 마세요.
            <br />
            (새로고침해도 발송은 취소되지 않습니다. 결과가 안 보이면 다시 보내기 전에 아래 발송 이력을 먼저 확인하세요.)
          </p>
        )}
        {status && <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>}
        {lastBulletinId && (
          <button type="button" className="hc-sms-link" onClick={() => openPreview(lastBulletinId)}>
            방금 보낸 주보 보기
          </button>
        )}
      </div>

      {/* 최근 발송 이력 */}
      <div className="hc-sms-block">
        <h3 className="hc-sms-subtitle">최근 발송 이력</h3>
        {logs.length === 0 ? (
          <p className="hc-sms-note">발송 이력이 없습니다.</p>
        ) : (
          <ul className="hc-admin-list">
            {logs.map((log) => (
              <li key={log.id} className="hc-admin-list-row">
                <span>
                  {formatDateTime(log.sentAt)} {log.test && <em className="hc-sms-badge">테스트</em>}
                </span>
                <span className="hc-sms-note">
                  {log.targetCount}명 × {log.imageCount}장 · 성공 {log.successCount} / 실패 {log.failCount}
                  {log.smsBulletinId && (
                    <>
                      {" · "}
                      <button type="button" className="hc-sms-link" onClick={() => openPreview(log.smsBulletinId)}>
                        주보 보기
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 발송 이력 미리보기 모달 */}
      {preview && (
        <div className="hc-sms-modal" onClick={() => setPreview(null)}>
          <div className="hc-sms-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="hc-sms-modal-head">
              <strong>{formatBulletinDate(preview.bulletinDate)} 발송 주보</strong>
              <button type="button" onClick={() => setPreview(null)}>닫기</button>
            </div>
            <div className="hc-sms-modal-images">
              {preview.images.map((fileName, i) => {
                const src = `${API_BASE_URL}/uploads/bulletin-sms/${encodeURIComponent(fileName)}`;
                return (
                  <a key={fileName} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt={`보낸 주보 ${i + 1}`} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
