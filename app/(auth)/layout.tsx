import React, { ReactNode } from 'react'

function layout({ children }: { children: ReactNode}){
    return (
        <div className="min-h-screen flex items-center justify-center gap-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950">
            {children}
        </div>
    )
}

export default layout