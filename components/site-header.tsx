"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface SiteHeaderProps {
  demoMode: boolean
  setDemoMode: (demoMode: boolean) => void
}

export function SiteHeader({ demoMode, setDemoMode }: SiteHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const isMobile = useMobile()

  // Close mobile menu when pathname changes (navigation occurs)
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Animation variants for menu container
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
        staggerDirection: 1,
      },
    },
  }

  // Animation variants for individual menu items
  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-block font-bold">iLogo</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-foreground",
                pathname === "/" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Home
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground",
                  pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                Dashboard
              </Link>
            )}
            {user && (
              <Link
                href="/profile"
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground",
                  pathname === "/profile" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                Profile
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle for demo mode */}
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" onClick={() => setDemoMode(!demoMode)} className="text-sm font-medium">
              {demoMode ? "Pro Mode" : "Demo Mode"}
            </Button>
          </div>

          <ThemeToggle />

          {!isLoading && <UserMenu />}

          {/* Mobile menu button with animation */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Animated mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu container */}
            <motion.div
              className="absolute left-0 right-0 z-50 mt-1 overflow-hidden border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <nav className="container flex flex-col gap-4 py-6">
                <motion.div variants={itemVariants}>
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center text-sm font-medium transition-colors hover:text-foreground py-2",
                      pathname === "/" ? "text-foreground" : "text-muted-foreground",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </motion.div>

                {user && (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex items-center text-sm font-medium transition-colors hover:text-foreground py-2",
                        pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center text-sm font-medium transition-colors hover:text-foreground py-2",
                        pathname === "/profile" ? "text-foreground" : "text-muted-foreground",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDemoMode(!demoMode)
                      setMobileMenuOpen(false)
                    }}
                    className="justify-start p-0 text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                  >
                    {demoMode ? "Pro Mode" : "Demo Mode"}
                  </Button>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
