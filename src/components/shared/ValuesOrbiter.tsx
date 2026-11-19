"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Value {
    title: string;
    description: string;
    color: string;
}

interface ValuesOrbiterProps {
    values: Value[];
}

export default function ValuesOrbiter({ values }: ValuesOrbiterProps) {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isHovering, setIsHovering] = useState(false);
    const [dimensions, setDimensions] = useState({ radiusX: 400, radiusY: 200, isMobile: false });

    // Handle responsiveness safely on client-side to prevent hydration mismatch
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDimensions({ radiusX: 160, radiusY: 170, isMobile: true });
            } else if (width < 1024) {
                setDimensions({ radiusX: 380, radiusY: 200, isMobile: false });
            } else if (width < 1280) {
                setDimensions({ radiusX: 480, radiusY: 220, isMobile: false });
            } else {
                setDimensions({ radiusX: 560, radiusY: 240, isMobile: false });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-rotate if not hovering
    useEffect(() => {
        if (isHovering) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % values.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isHovering, values.length]);

    return (
        <div className="relative w-full max-w-7xl mx-auto min-h-[480px] md:min-h-[580px] flex items-center justify-center py-6 md:py-10">
            <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Center Stage Card — Horizontally Oblong Rounded Rectangle */}
                <motion.div 
                    className="relative z-20 w-[90vw] max-w-[340px] md:max-w-[560px] lg:max-w-[620px] rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-2xl border border-primary/10 flex flex-col items-center justify-center px-6 py-8 md:px-12 md:py-10 text-center"
                >
                    <div className="absolute inset-0 bg-white rounded-[2.5rem] md:rounded-[3rem]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary/5 rounded-[2.5rem] md:rounded-[3rem]" />
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.95 }}
                            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                            className="relative z-10 flex flex-col items-center justify-center w-full"
                        >
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">
                                Core Value
                            </span>
                            <h3 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-3 md:mb-4">
                                {values[activeIndex].title}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-[280px] md:max-w-[480px] mx-auto font-normal">
                                {values[activeIndex].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Subtle pulse border matching current category color */}
                    <motion.div 
                        key={`pulse-${activeIndex}`}
                        animate={{ scale: [1, 1.025, 1], opacity: [0.2, 0.05, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`absolute inset-0 rounded-[2.5rem] md:rounded-[3rem] border-2 ${values[activeIndex].color.replace('bg-', 'border-')} opacity-20 pointer-events-none`}
                    />
                </motion.div>

                {/* Orbiting Text Rectangles */}
                {values.map((value, idx) => {
                    const angle = (idx * (360 / values.length) - 90) * (Math.PI / 180);
                    
                    const x = Math.cos(angle) * dimensions.radiusX;
                    const y = Math.sin(angle) * dimensions.radiusY;

                    const isActive = activeIndex === idx;

                    return (
                        <motion.button
                            key={value.title}
                            className="absolute z-30 group"
                            style={{ x, y }}
                            onMouseEnter={() => {
                                setActiveIndex(idx);
                                setIsHovering(true);
                            }}
                            onMouseLeave={() => setIsHovering(false)}
                            whileHover={{ scale: 1.05 }}
                            animate={{ 
                                scale: isActive ? 1.08 : 1,
                                opacity: isActive || !isHovering ? 1 : 0.65
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <div className={`
                                px-6 py-2.5 md:px-8 md:py-3.5 rounded-full border-2 shadow-md transition-all duration-300 flex items-center justify-center
                                ${isActive 
                                    ? `${value.color} text-white border-transparent shadow-xl shadow-${value.color.split('-')[1]}-500/30 scale-105` 
                                    : 'bg-white text-slate-700 border-primary/15 hover:border-primary/40 hover:text-primary hover:shadow-lg'}
                            `}>
                                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.18em] whitespace-nowrap">
                                    {value.title}
                                </span>
                            </div>

                            {/* Glow effect */}
                            {isActive && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 -z-10 bg-primary/5 blur-xl rounded-full scale-150"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
