import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="text-center text-xs sm:text-sm leading-loose text-muted-foreground md:text-left">
          Built with{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Next.js
          </a>{" "}
          and{" "}
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            shadcn/ui
          </a>
          .
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <Link href="/privacy" className="font-medium underline underline-offset-4">
            Privacy
          </Link>
          <Link href="/terms" className="font-medium underline underline-offset-4">
            Terms
          </Link>
          <Link href="/contact" className="font-medium underline underline-offset-4">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
