export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/50 py-8 sm:py:12 mt-8 backdrop-blur-xl">
      <div className="container flex flex-col items-center gap-4 px-4">
        <nav className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm items-center">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>
        <p className="text-sm text-muted-foreground text-center">© 2024 iLogo. All rights reserved.</p>
      </div>
    </footer>
  )
}
