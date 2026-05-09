"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

interface SlideInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  amount?: "some" | "all" | number;
  once?: boolean;
}

export default function SlideIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 30,
  className = "",
  amount = 0.2,
  once = true,
  ...props
}: SlideInProps) {
  const getVariants = () => {
    switch (direction) {
      case "up":
        return { hidden: { y: distance, opacity: 0 }, visible: { y: 0, opacity: 1 } };
      case "down":
        return { hidden: { y: -distance, opacity: 0 }, visible: { y: 0, opacity: 1 } };
      case "left":
        return { hidden: { x: distance, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      case "right":
        return { hidden: { x: -distance, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      default:
        return { hidden: { y: distance, opacity: 0 }, visible: { y: 0, opacity: 1 } };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut",
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
