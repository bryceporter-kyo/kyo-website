"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
  amount?: "some" | "all" | number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  delayChildren = 0,
  staggerChildren = 0.15,
  className = "",
  amount = 0.2,
  once = true,
  ...props
}: StaggerContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type Direction = "up" | "down" | "left" | "right";

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  duration?: number;
  className?: string;
}

export function StaggerItem({
  children,
  direction = "up",
  distance = 30,
  duration = 0.8,
  className = "",
  ...props
}: StaggerItemProps) {
  const getVariants = () => {
    const transition = { duration: duration, ease: "easeOut" };
    switch (direction) {
      case "up":
        return { 
          hidden: { y: distance, opacity: 0 }, 
          visible: { y: 0, opacity: 1, transition } 
        };
      case "down":
        return { 
          hidden: { y: -distance, opacity: 0 }, 
          visible: { y: 0, opacity: 1, transition } 
        };
      case "left":
        return { 
          hidden: { x: distance, opacity: 0 }, 
          visible: { x: 0, opacity: 1, transition } 
        };
      case "right":
        return { 
          hidden: { x: -distance, opacity: 0 }, 
          visible: { x: 0, opacity: 1, transition } 
        };
      default:
        return { 
          hidden: { y: distance, opacity: 0 }, 
          visible: { y: 0, opacity: 1, transition } 
        };
    }
  };

  return (
    <motion.div variants={getVariants() as any} className={className} {...props}>
      {children}
    </motion.div>
  );
}
