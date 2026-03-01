"use client"

import Image from 'next/image';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
    // Size multipliers
    const sizes = {
        xs: 'scale-50',
        sm: 'scale-75',
        md: 'scale-100',
        lg: 'scale-125',
        xl: 'scale-150'
    };

    // Get the appropriate scale class or default to md
    const sizeClass = sizes[size] || sizes.md;

    return (
        <div className={`inline-flex items-center ${sizeClass} ${className}`}>
            <div className="relative flex items-center gap-3 transform hover:scale-105 transition-all duration-300">
                {/* Logo image */}
                <div className="shrink-0">
                    <Image src="/logo.png" alt="Newsletter Name Ideas Logo" width={40} height={48} className="object-contain" />
                </div>

                {/* Logo text */}
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 leading-tight">
                        Newsletter
                    </h1>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</span>
                        <div className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-[8px] font-bold leading-none">+</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Ideas</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logo
