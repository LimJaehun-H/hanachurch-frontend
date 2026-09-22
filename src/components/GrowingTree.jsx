import React from "react";
import { useScrollProgress } from "../hooks/useScrollProgress.js";

const STAGE_IMAGES = [
  "images/about-tree-1.png",
  "images/about-tree-2.png",
  "images/about-tree-3.png",
  "images/about-tree-4.png",
];

// progress(0~1)를 4단계 구간으로 나눠서, 현재 몇 번째 이미지에서 몇 번째 이미지로
// 얼마나 전환됐는지(0~1)를 계산
function getStageBlend(progress) {
  const stageCount = STAGE_IMAGES.length;
  const scaled = progress * (stageCount - 1); // 0 ~ 3
  const fromIndex = Math.min(stageCount - 2, Math.floor(scaled));
  const toIndex = fromIndex + 1;
  const localProgress = Math.min(1, Math.max(0, scaled - fromIndex));
  return { fromIndex, toIndex, localProgress };
}

export default function GrowingTree() {
  const [wrapRef, progress] = useScrollProgress();
  const { fromIndex, toIndex, localProgress } = getStageBlend(progress);

  return (
    <div className="hc-growing-tree" ref={wrapRef} aria-hidden="true">
      <div className="hc-growing-tree-stack">
        {STAGE_IMAGES.map((src, i) => {
          let opacity = 0;
          if (i === fromIndex) opacity = 1 - localProgress;
          else if (i === toIndex) opacity = localProgress;
          return (
            <img
              key={src}
              src={src}
              alt=""
              className="hc-growing-tree-img"
              style={{ opacity }}
            />
          );
        })}
      </div>
    </div>
  );
}