import { useCallback, useEffect, useState } from "react";

// 요소가 화면에 들어오면 true를 반환하는 훅
// repeat=false(기본값): 한 번 나타나면 그걸로 끝
// repeat=true: 화면에서 사라졌다가 다시 들어올 때마다 매번 재생
//
// ref는 "콜백 ref"라서, 요소가 처음엔 없다가 나중에 생겨도(사진을 서버에서 받아온 뒤 그리는 경우)
// 그때 감시를 시작한다. 사용법은 그대로 ref={ref}.
export function useScrollReveal(threshold = 0.2, repeat = false) {
  const [el, setEl] = useState(null);
  const [visible, setVisible] = useState(false);
  const ref = useCallback((node) => setEl(node), []);

  useEffect(() => {
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (!repeat) observer.unobserve(el);
        } else if (repeat) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [el, threshold, repeat]);

  return [ref, visible];
}
