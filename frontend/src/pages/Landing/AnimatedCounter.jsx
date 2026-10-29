import { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({ end, suffix = "" }) => {
  const [value, setValue] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return undefined;
    let frameId;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValue(end);
        return;
      }

      const startTime = performance.now();
      const duration = 900;
      const animate = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        setValue(Math.round(end * progress));
        if (progress < 1) frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    }, { threshold: 0.6 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [end]);

  return <span ref={counterRef}>{value.toLocaleString()}{suffix}</span>;
};

export default AnimatedCounter;
