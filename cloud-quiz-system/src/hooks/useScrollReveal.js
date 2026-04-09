import { useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer hook for scroll reveal animations
 * @param {object} options - threshold, rootMargin
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el); // fire once
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/**
 * Staggered reveal for a list of items
 * Returns array of [ref, visible] pairs
 */
export function useStaggerReveal(count, baseDelay = 80) {
  const refs = Array.from({ length: count }, () => useRef(null));
  const [visibles, setVisibles] = useState(Array(count).fill(false));

  useEffect(() => {
    const observers = refs.map((ref, i) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibles(prev => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * baseDelay);
            observer.unobserve(ref.current);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
      return observer;
    });

    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return refs.map((ref, i) => [ref, visibles[i]]);
}
