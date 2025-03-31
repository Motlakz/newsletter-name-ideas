"use client"

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MockUp() {
    const [topic, setTopic] = useState("");
    const [audience, setAudience] = useState("");
    const [creativity, setCreativity] = useState(2);
    const [names, setNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Simulate demo content
    useEffect(() => {
        // Auto-fill demo content after initial render
        const timer = setTimeout(() => {
            setTopic("Technology");
            setAudience("Developers");
        }, 500);
        
        return () => clearTimeout(timer);
    }, []);

    // Auto-generate names when demo content is filled
    useEffect(() => {
        if (topic && audience) {
            const timer = setTimeout(() => {
                generateNames();
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [topic, audience]);

    const generateNames = () => {
        setIsLoading(true);
        const generatedNames = [
            `${topic} ${audience} Digest`,
            `The ${topic} Report`,
            `${audience} Weekly`,
            `NextGen ${topic}`,
            `${topic} Insider`
        ].filter(name => name.trim().length > 0);
        
        // Simulate API call delay
        setTimeout(() => {
            setNames(generatedNames.slice(0, 3));
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen p-6 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="aspect-[16/10] rounded-xl overflow-hidden relative shadow-2xl shadow-purple-500/20 dark:shadow-purple-500/10">
                    {/* Browser Chrome */}
                    <div className="absolute top-8 left-0 right-0 h-8 flex items-center px-3 border-b border-gray-200/20 dark:border-gray-700/20 bg-gray-100/50 dark:bg-slate-800/50">
                        <div className="flex items-center space-x-2 w-full">
                            <div className="flex items-center space-x-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="flex-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-md px-3 py-1 text-xs text-gray-600 dark:text-gray-300 ml-2">
                                https://yourdomain.com/newsletter-name-generator
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 pt-20 p-4 flex flex-col">
                        <div className="flex flex-1 min-h-0 shadow-md">
                            <div className="w-full flex flex-col overflow-y-auto">
                                {/* Animated Input Section */}
                                <div className="flex-1 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-gray-200/20 dark:border-gray-700/20 shadow-xl p-4">
                                    <div className="mb-4 border-b border-gray-200/20 dark:border-gray-700/20 pb-3">
                                        <h2 className="text-xl font-semibold mb-1">Newsletter Name Generator</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Enter basic information to get started</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Animated Input Fields */}
                                        <div className="relative">
                                            <label className="block text-sm mb-2 text-gray-600 dark:text-gray-300">Main Topic</label>
                                            <input
                                                type="text"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="w-full h-10 rounded-md px-3 bg-gray-100/50 dark:bg-slate-700/50 border border-gray-300/20 dark:border-gray-600/20 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="Technology"
                                            />
                                            {!topic && <div className="absolute inset-y-0 right-3 top-6 flex items-center pointer-events-none animate-pulse">⌨️</div>}
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm mb-2 text-gray-600 dark:text-gray-300">Target Audience</label>
                                            <input
                                                type="text"
                                                value={audience}
                                                onChange={(e) => setAudience(e.target.value)}
                                                className="w-full h-10 rounded-md px-3 bg-gray-100/50 dark:bg-slate-700/50 border border-gray-300/20 dark:border-gray-600/20 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="Developers"
                                            />
                                            {!audience && <div className="absolute inset-y-0 right-3 top-6 flex items-center pointer-events-none animate-pulse">👥</div>}
                                        </div>

                                        {/* Interactive Slider */}
                                        <div className="group">
                                            <label className="block text-sm mb-2 text-gray-600 dark:text-gray-300">Creativity Level</label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                value={creativity}
                                                onChange={(e) => setCreativity(parseInt(e.target.value))}
                                                className="w-full h-2 rounded-full appearance-none bg-gray-200/70 dark:bg-slate-600/70 transition-all duration-300 group-hover:bg-gray-300/50 dark:group-hover:bg-gray-500/50"
                                            />
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Low</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Medium</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">High</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animated Generate Button */}
                                    <div className="mt-6 flex justify-end">
                                        <button 
                                            onClick={generateNames}
                                            disabled={isLoading}
                                            className="w-48 h-10 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-purple-500/30 dark:shadow-purple-500/20 flex items-center justify-center text-white hover:opacity-90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Generating...</span>
                                                </div>
                                            ) : (
                                                <span>Generate Names</span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Results Section */}
                                <div className="mt-4 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-gray-200/20 dark:border-gray-700/20 shadow-xl p-4">
                                    <h3 className="text-lg font-semibold mb-4">Suggested Names</h3>
                                    <div className="space-y-3">
                                        {names.map((name, i) => (
                                            <div 
                                                key={i}
                                                className="p-3 rounded-lg border bg-white/50 dark:bg-slate-700/50 border-purple-200/50 dark:border-purple-400/30 flex justify-between items-center transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer"
                                                style={{
                                                    animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`,
                                                    boxShadow: `0 4px 6px -1px rgba(139, 92, 246, 0.1)`
                                                }}
                                            >
                                                <span>{name}</span>
                                                <button className="w-6 h-6 rounded-full bg-gray-200/70 dark:bg-slate-600/70 flex items-center justify-center transition-colors hover:bg-purple-500/20">
                                                    📋
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    <div className="mt-6 text-center">
                                        <Link
                                            href="/newsletter-name-generator"
                                            className="inline-flex items-center px-6 py-2.5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium hover:opacity-90 transition-opacity group"
                                        >
                                            Try out the real app
                                            <span className="ml-2 group-hover:translate-x-1 transition-transform">
                                                →
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
