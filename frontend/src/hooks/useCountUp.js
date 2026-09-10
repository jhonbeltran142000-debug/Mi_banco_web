import { useEffect, useRef, useState } from 'react';

export default function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = Number(target) || 0;

    if (from === to) {
      setValue(to);
      return;
    }

    let raf;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(from + (to - from) * easeOut(progress));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prev.current = to;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
