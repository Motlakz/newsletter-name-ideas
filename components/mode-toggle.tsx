"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const [nextTheme, setNextTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    if (!isAnimating) {
      const newTheme = theme === "light" ? "dark" : "light"
      setNextTheme(newTheme)
      setIsAnimating(true)
      
      // Change theme at animation midpoint
      setTimeout(() => {
        setTheme(newTheme)
      }, 250)
    }
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="border-none relative overflow-hidden"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {isAnimating && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div 
            className={`absolute inset-0 backdrop-blur-[2px] ${
              nextTheme === 'dark' 
                ? 'animate-square-in-dark' 
                : 'animate-square-in-light'
            }`}
          />
        </div>
      )}
    </>
  )
}
