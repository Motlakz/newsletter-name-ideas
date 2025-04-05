"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/glass-card"
import { login } from "@/lib/admin-auth"
import { Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(username, password)

      if (result.success) {
        router.push("/admin/dashboard")
      } else {
        setError(result.error || "Invalid credentials")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">Admin Login</h1>
            <p className="text-muted-foreground text-center">Sign in to access the admin dashboard</p>
          </GlassCardHeader>
          <GlassCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </form>
          </GlassCardContent>
          <GlassCardFooter>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </GlassCardFooter>
        </GlassCard>
      </div>
    </div>
  )
}
