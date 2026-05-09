
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

    // Auto-rotate if not hovering
    useEffect(() => {
        if (isHovering) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % values.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isHovering, values.length]);

    return (
        <div className="relative w-full max-w-5xl mx-auto aspect-square md:aspect-[21/10] flex items-center justify-center py-12 md:py-20">
            <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Center Stage Circle */}
                <motion.div 
                    className="relative z-20 w-64 h-64 md:w-80 md:h-80 rounded-full bg-white shadow-2xl border border-primary/5 flex items-center justify-center p-10 text-center"
                >
                    <div className="absolute inset-0 bg-white rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary/5 rounded-full" />
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.9 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="relative z-10"
                        >
                            <h3 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-4">
                                {values[activeIndex].title}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                                {values[activeIndex].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Subtle pulse border */}
                    <motion.div 
                        animate={{ scale: [1, 1.03, 1], opacity: [0.2, 0.05, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`absolute inset-0 rounded-full border-2 ${values[activeIndex].color.replace('bg-', 'border-')} opacity-20`}
                    />
                </motion.div>

                {/* Orbiting Text Rectangles */}
                {values.map((value, idx) => {
                    const angle = (idx * (360 / values.length) - 90) * (Math.PI / 180);
                    const radiusX = typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 400;
                    const radiusY = typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 200;
                    
                    const x = Math.cos(angle) * radiusX;
                    const y = Math.sin(angle) * radiusY;

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
                                scale: isActive ? 1.1 : 1,
                                opacity: isActive || !isHovering ? 1 : 0.6
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <div className={`
                                px-6 py-3 rounded-full border-2 shadow-sm transition-all duration-300
                                ${isActive 
                                    ? `${value.color} text-white border-transparent shadow-lg shadow-${value.color.split('-')[1]}-500/20` 
                                    : 'bg-white text-muted-foreground border-primary/10 hover:border-primary/30 hover:text-primary hover:shadow-md'}
                            `}>
                                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap pl-1">
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
