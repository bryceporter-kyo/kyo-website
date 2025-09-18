"use client";

import { useEffect, useState, useRef } from 'react';

type AnimatedCounterProps = {
  target: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
};

export default function AnimatedCounter({ target, prefix = '', suffix = '', className, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    const increment = end / (duration / 16); 

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [isInView, target, duration]);

  return (
    <p ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </p>
  );
}