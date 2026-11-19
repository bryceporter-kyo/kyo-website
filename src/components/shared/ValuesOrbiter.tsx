"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Value {
    title: string;
    description: string;
    icon: LucideIcon;
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
                setDimensions({ radiusX: 150, radiusY: 150, isMobile: true });
            } else if (width < 1024) {
                setDimensions({ radiusX: 340, radiusY: 190, isMobile: false });
            } else if (width < 1280) {
                setDimensions({ radiusX: 460, radiusY: 230, isMobile: false });
            } else {
                setDimensions({ radiusX: 540, radiusY: 260, isMobile: false });
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

    const ActiveIcon = values[activeIndex].icon;

    return (
        <div className="relative w-full max-w-7xl mx-auto min-h-[520px] md:min-h-[640px] flex items-center justify-center py-6 md:py-10">
            <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Center Stage Circle */}
                <motion.div 
                    className="relative z-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-white shadow-2xl border border-primary/10 flex flex-col items-center justify-center p-6 md:p-12 text-center"
                >
                    <div className="absolute inset-0 bg-white rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary/5 rounded-full" />
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.9 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="relative z-10 flex flex-col items-center justify-center"
                        >
                            {/* Animated Value Icon in the Center */}
                            <div className="p-3.5 md:p-4 bg-primary/10 rounded-full text-primary mb-3 md:mb-4">
                                <ActiveIcon className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
                            </div>
                            <h3 className="text-2xl md:text-4xl font-headline font-bold text-primary mb-2 md:mb-3">
                                {values[activeIndex].title}
                            </h3>
                            <p className="text-xs md:text-base text-muted-foreground leading-relaxed max-w-[220px] md:max-w-[300px] mx-auto">
                                {values[activeIndex].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Subtle pulse border matching current category color */}
                    <motion.div 
                        key={`pulse-${activeIndex}`}
                        animate={{ scale: [1, 1.04, 1], opacity: [0.15, 0.05, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`absolute inset-0 rounded-full border-2 ${values[activeIndex].color.replace('bg-', 'border-')} opacity-20`}
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
                                px-5 py-2.5 md:px-7 md:py-3.5 rounded-full border-2 shadow-md transition-all duration-300 flex items-center gap-2.5
                                ${isActive 
                                    ? `${value.color} text-white border-transparent shadow-xl shadow-${value.color.split('-')[1]}-500/30 scale-105` 
                                    : 'bg-white text-slate-700 border-primary/15 hover:border-primary/40 hover:text-primary hover:shadow-lg'}
                            `}>
                                <value.icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`} />
                                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.15em] whitespace-nowrap pl-0.5">
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
