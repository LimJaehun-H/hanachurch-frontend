import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";

export default function RichContentEditor({ value, onChange, token, resetKey }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const resizeState = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const applyFontSize = (size) => {
    editorRef.current.focus();
    document.execCommand("fontSize", false, "7");
    const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
    fontElements.forEach((el) => {
      el.removeAttribute("size");
      el.style.fontSize = size;
    });
    onChange(editorRef.current.innerHTML);
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/notices/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
            // 도메인은 안 붙이고 상대경로만 저장 → 나중에 도메인 바뀌어도 깨지지 않음
      const imageUrl = `/uploads/notices/${data.url}`;

      editorRef.current.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${imageUrl}" style="max-width:100%;width:400px;" />`
      );
      onChange(editorRef.current.innerHTML);
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  // 에디터 안 이미지 클릭 → 선택
  const handleEditorClick = (e) => {
    if (e.target.tagName === "IMG") {
      setSelectedImg(e.target);
    } else {
      setSelectedImg(null);
    }
  };

  // 리사이즈 핸들 드래그 시작
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedImg) return;
    resizeState.current = {
      startX: e.clientX,
      startWidth: selectedImg.offsetWidth,
    };
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!resizeState.current || !selectedImg) return;
    const diff = e.clientX - resizeState.current.startX;
    const newWidth = Math.max(60, resizeState.current.startWidth + diff);
    selectedImg.style.width = `${newWidth}px`;
  };

  const handleResizeEnd = () => {
    resizeState.current = null;
    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
    onChange(editorRef.current.innerHTML);
  };

  // 선택된 이미지 위치 기준으로 핸들 좌표 계산
  const getHandleStyle = () => {
    if (!selectedImg || !editorRef.current) return null;
    const imgRect = selectedImg.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    return {
      position: "absolute",
      left: imgRect.right - editorRect.left + editorRef.current.scrollLeft - 8,
      top: imgRect.bottom - editorRect.top + editorRef.current.scrollTop - 8,
    };
  };

  const handleStyle = getHandleStyle();

  return (
    <div className="hc-rich-editor">
      <div className="hc-rich-editor-toolbar">
        <button type="button" onClick={handleImageButtonClick}>
          🖼 사진 삽입
        </button>
        <button type="button" onClick={() => applyFontSize("14px")}>작게</button>
        <button type="button" onClick={() => applyFontSize("18px")}>보통</button>
        <button type="button" onClick={() => applyFontSize("24px")}>크게</button>
        <button type="button" onClick={() => applyFontSize("32px")}>아주 크게</button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelected}
          style={{ display: "none" }}
        />
      </div>

      <div className="hc-rich-editor-wrap">
        <div
          ref={editorRef}
          className="hc-rich-editor-body"
          contentEditable
          onInput={handleInput}
          onClick={handleEditorClick}
        />
        {selectedImg && handleStyle && (
          <div
            className="hc-rich-editor-resize-handle"
            style={handleStyle}
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </div>
  );
}