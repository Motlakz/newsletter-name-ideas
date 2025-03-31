import type * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("rounded-lg border bg-background/60 dark:bg-background/80 backdrop-blur-lg shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassCardHeader({ children, className, ...props }: GlassCardProps) {
  return (
    <div className={cn("p-6 border-b", className)} {...props}>
      {children}
    </div>
  )
}

export function GlassCardContent({ children, className, ...props }: GlassCardProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
}

export function GlassCardFooter({ children, className, ...props }: GlassCardProps) {
  return (
    <div className={cn("p-6 border-t", className)} {...props}>
      {children}
    </div>
  )
}

