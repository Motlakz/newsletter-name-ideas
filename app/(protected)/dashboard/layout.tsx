import { Header } from "@/components/layout/header"
import { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-12">
                {children}
            </main>
        </div>
    )
}