"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import Logo from "../common/logo"
import { Menu, X } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Generator", path: "/newsletter-name-generator" },
    { name: "Tools", path: "/tools" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md border-b shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto p-2 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Mobile Menu Button */}
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden px-2 text-white hover:text-purple-100 cursor-pointer transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <Menu className="w-6 h-6 transition-transform duration-200" />
          )}
        </Button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.path ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white"
          >
            <Link href="/newsletter-name-generator">Generate Names</Link>
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/20 md:hidden transition-opacity duration-300",
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Menu */}
        <div 
          className={cn(
            "absolute top-full left-0 right-0 bg-background border-b shadow-lg md:hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
          )}
        >
          <div className="container mx-auto py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors hover:bg-muted rounded-md",
                    pathname === item.path ? "text-primary bg-muted/50" : "text-muted-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="border-t pt-4 px-4">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/newsletter-name-generator">Generate Names</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
