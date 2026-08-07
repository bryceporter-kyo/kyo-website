"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  value: string;
}

export default function CountUp({ value }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) {
      // Initialize with 0 formatted
      const numberMatch = value.match(/\d+/);
      if (numberMatch) {
        const prefix = value.substring(0, numberMatch.index || 0);
        const suffix = value.substring((numberMatch.index || 0) + numberMatch[0].length);
        setDisplayValue(`${prefix}0${suffix}`);
      } else {
        setDisplayValue(value);
      }
      return;
    }

    const numberMatch = value.match(/\d+/);
    if (!numberMatch) {
      setDisplayValue(value);
      return;
    }

    const target = parseInt(numberMatch[0], 10);
    const prefix = value.substring(0, numberMatch.index || 0);
    const suffix = value.substring((numberMatch.index || 0) + numberMatch[0].length);

    let startTimestamp: number | null = null;
    const duration = 1000; // Count up takes exactly 1 second

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Quadratic ease-out formula
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * target);
      
      setDisplayValue(`${prefix}${current}${suffix}`);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}</span>;
}
