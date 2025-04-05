"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function MockUp() {
    const [topic, setTopic] = useState<string>("");
    const [audience, setAudience] = useState<string>("");
    const [creativity, setCreativity] = useState<number>(2);
    const [names, setNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setTopic("Technology");
        setAudience("Developers");
      }, 500);
      return () => clearTimeout(timer);
    }, []);
  
    useEffect(() => {
      if (topic && audience) {
        const timer = setTimeout(() => {
          generateNames();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [topic, audience]);
  
    const generateNames = (): void => {
      setIsLoading(true);
      const generatedNames: string[] = [
        `${topic} ${audience} Digest`,
        `The ${topic} Report`,
        `${audience} Weekly`,
        `NextGen ${topic}`,
        `${topic} Insider`
      ].filter(name => name.trim().length > 0);
      
      setTimeout(() => {
        setNames(generatedNames.slice(0, 3));
        setIsLoading(false);
      }, 800);
    };
  
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950 dark:to-pink-950 p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-violet-500/10 overflow-hidden">
            {/* Browser Chrome */}
            <div className="h-12 flex items-center px-4 bg-white/50 dark:bg-slate-800/50 border-b border-violet-100/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-md px-3 py-1 text-xs text-gray-600 dark:text-gray-300 ml-2">
                  https://newsletternameideas.com/
                </div>
              </div>
            </div>
  
            {/* Content Area */}
            <div className="p-4">
              <div className="space-y-6">
                {/* Input Section */}
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 shadow-md border">
                  <h2 className="text-xl font-semibold text-violet-900 dark:text-violet-100 mb-1">
                    Newsletter Name Generator
                  </h2>
                  <p className="text-sm text-violet-600 dark:text-violet-300 mb-6">
                    Enter basic information to get started
                  </p>
  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-2">
                        Main Topic
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-700/50 border border-violet-200 dark:border-violet-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Technology"
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={audience}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudience(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-700/50 border border-violet-200 dark:border-violet-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Developers"
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-2">
                        Creativity Level
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        value={creativity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreativity(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full bg-violet-200 dark:bg-violet-700"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-violet-600 dark:text-violet-300">Conservative</span>
                        <span className="text-xs text-violet-600 dark:text-violet-300">Balanced</span>
                        <span className="text-xs text-violet-600 dark:text-violet-300">Creative</span>
                      </div>
                    </div>
                  </div>
  
                  <button
                    onClick={generateNames}
                    disabled={isLoading}
                    className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium shadow-md border shadow-violet-500/25 hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      "Generate Names"
                    )}
                  </button>
                </div>
  
                {/* Results Section */}
                {names.length > 0 && (
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 shadow-md border">
                    <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 mb-4">
                      Suggested Names
                    </h3>
                    <div className="space-y-3">
                      {names.map((name: string, i: number) => (
                        <div
                          key={i}
                          className="group p-4 rounded-xl bg-white/50 dark:bg-slate-700/50 border border-violet-200/50 dark:border-violet-700/50 flex justify-between items-center hover:shadow-md transition-all duration-300"
                        >
                          <span className="text-violet-800 dark:text-violet-200">{name}</span>
                          <button className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-600 text-violet-600 dark:text-violet-100 flex items-center justify-center transition-all duration-300">
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
                              <ArrowRight />
                          </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
