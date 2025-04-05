"use server"

import { cookies } from "next/headers"

// In a real app, you would use a proper authentication system
// This is a simplified version for demonstration purposes
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function login(username: string, password: string) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set a cookie to indicate the user is logged in
    (await cookies()).set("auth", "admin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    return { success: true }
  }
  return { success: false, error: "Invalid credentials" }
}

export async function logout() {
  (await cookies()).delete("auth")
  return { success: true }
}

export async function isAuthenticated() {
  const auth = (await cookies()).get("auth")
  return auth?.value === "admin"
}
