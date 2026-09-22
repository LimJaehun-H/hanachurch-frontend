import { useEffect, useRef, useState } from "react";

// 특정 영역이 화면에 들어오기 시작해서 다 지나갈 때까지를 0~1 진행률로 계산하는 훅
export function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const total = rect.height + viewportHeight;
      const scrolled = viewportHeight - rect.top;
      const p = Math.min(1, Math.max(0, scrolled / total));
      setProgress(p);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return [ref, progress];
}