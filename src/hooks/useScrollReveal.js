import { useEffect, useRef, useState } from "react";

// 요소가 화면에 들어오면 true를 반환하는 훅
// repeat=false(기본값): 한 번 나타나면 그걸로 끝
// repeat=true: 화면에서 사라졌다가 다시 들어올 때마다 매번 재생
export function useScrollReveal(threshold = 0.2, repeat = false) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
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
  }, [threshold, repeat]);

  return [ref, visible];
}