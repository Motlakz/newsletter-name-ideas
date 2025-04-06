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
        <div className={`inline-flex ${sizeClass} ${className}`}>
            <div className="logo-container transform hover:scale-110 transition-all duration-300">
                <div className="relative flex items-center">
                    {/* Logo icon */}
                    <div className="relative">
                        {/* Paper/newsletter base */}
                        <div className="w-10 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg shadow-md flex items-center justify-center relative overflow-hidden border border-purple-200">
                        {/* Lines on paper */}
                        <div className="absolute top-3 left-2 right-2 h-0.5 bg-indigo-200 rounded"></div>
                        <div className="absolute top-5 left-2 right-2 h-0.5 bg-indigo-200 rounded"></div>
                        <div className="absolute top-7 left-2 right-2 h-0.5 bg-indigo-200 rounded"></div>
                        <div className="absolute top-9 left-2 right-2 h-0.5 bg-indigo-200 rounded"></div>
                        
                        {/* Sparkle effect */}
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-70 animate-pulse"></div>
                        </div>
                        
                        {/* Pencil */}
                        <div className="absolute -top-1 -right-2 transform rotate-45">
                        <div className="w-8 h-1.5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-l-sm"></div>
                        <div className="w-1.5 h-1.5 bg-yellow-900 rounded-r-sm"></div>
                        </div>
                        
                        {/* Idea bulb */}
                        <div className="absolute -top-2 -left-2">
                        <div className="w-5 h-5 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full shadow-md flex items-center justify-center animate-pulse">
                            <div className="w-2.5 h-2.5 bg-yellow-100 rounded-full opacity-70"></div>
                        </div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full absolute -bottom-0.5 -right-0.5"></div>
                        </div>
                    </div>
                    
                    {/* Logo text */}
                    <div className="ml-3">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 leading-tight">
                        Newsletter
                        </h1>
                        <div className="flex items-center">
                        <span className="text-xs font-semibold text-gray-500">Name</span>
                        <div className="w-3 h-3 mx-1 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">+</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">Ideas</span>
                        </div>
                    </div>
                    
                    {/* Additional animated element */}
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-indigo-400 rounded-full flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: "0.3s" }}>
                        <span className="text-white text-[8px]">✨</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logo
