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
                setDimensions({ radiusX: 130, radiusY: 130, isMobile: true });
            } else if (width < 1024) {
                setDimensions({ radiusX: 300, radiusY: 160, isMobile: false });
            } else {
                setDimensions({ radiusX: 400, radiusY: 200, isMobile: false });
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
        <div className="relative w-full max-w-5xl mx-auto aspect-[1/1] md:aspect-[21/10] flex items-center justify-center py-12 md:py-20">
            <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Center Stage Circle */}
                <motion.div 
                    className="relative z-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-white shadow-2xl border border-primary/5 flex flex-col items-center justify-center p-6 md:p-10 text-center"
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
                            <div className="p-3 bg-primary/10 rounded-full text-primary mb-3">
                                <ActiveIcon className="w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-xl md:text-3xl font-headline font-bold text-primary mb-2 md:mb-4">
                                {values[activeIndex].title}
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[200px] md:max-w-[240px] mx-auto">
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
                                px-4 py-2 md:px-6 md:py-3 rounded-full border-2 shadow-sm transition-all duration-300 flex items-center gap-2
                                ${isActive 
                                    ? `${value.color} text-white border-transparent shadow-lg shadow-${value.color.split('-')[1]}-500/20` 
                                    : 'bg-white text-muted-foreground border-primary/10 hover:border-primary/30 hover:text-primary hover:shadow-md'}
                            `}>
                                <value.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap pl-0.5">
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
