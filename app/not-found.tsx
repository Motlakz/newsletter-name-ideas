"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

// Initial static particles for SSR
const initialParticles = Array(20).fill(null).map((_, i) => ({
    id: i,
    width: '6px',
    height: '6px',
    left: '50%',
    top: '50%',
    duration: 3,
    delay: 0
}));

export default function NotFound() {
    const [particles, setParticles] = useState(initialParticles);
    
    useEffect(() => {
        setParticles(
            initialParticles.map(particle => ({
                ...particle,
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 5
            }))
        );
    }, []);

    return (
        <div className="relative overflow-hidden min-h-screen flex items-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/40 dark:from-indigo-950/90 dark:via-purple-900/80 dark:to-pink-800/70" />

            {/* Animated particles */}
            <div className="absolute inset-0">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full bg-indigo-400/30 dark:bg-white/20"
                        style={{
                            width: particle.width,
                            height: particle.height,
                            left: particle.left,
                            top: particle.top,
                        }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-6 inline-block"
                    >
                        <motion.div
                            className="h-1 w-20 bg-gradient-to-r from-indigo-400 to-pink-400 mx-auto rounded-full mb-6"
                            initial={{ width: 0 }}
                            animate={{ width: 80 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        />
                    </motion.div>

                    <motion.h1
                        className="flex flex-col items-center text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-foreground mb-3">404</span>
                        <span 
                            className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300"
                            style={{ 
                                backgroundSize: "200% auto",
                                animation: "gradient 8s linear infinite alternate"
                            }}
                        >
                            Page Not Found
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl text-muted-foreground dark:text-white mb-10 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Button
                            asChild
                            size="lg"
                            className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 border-0 px-8 py-6 text-lg font-medium rounded-xl"
                            style={{ 
                                backgroundSize: "200% auto",
                                animation: "gradient 3s linear infinite alternate"
                            }}
                        >
                            <Link href="/">
                                Return Home
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}