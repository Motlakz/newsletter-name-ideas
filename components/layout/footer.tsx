import Link from "next/link"
import Logo from "../logo"

export function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground">
              Generate creative, engaging, and memorable newsletter names for your audience
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/generator" className="text-muted-foreground hover:text-primary transition-colors">
                  Name Generator
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-primary transition-colors">
                  Domain Checker
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-muted-foreground hover:text-primary transition-colors">
                  Trend Analysis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog?category=learning"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Learning Center
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=best-practices"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Best Practices
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=templates"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Newsletter Name Ideas. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
