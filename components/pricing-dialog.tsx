"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button-custom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PLAN_LIMITS } from "@/lib/usage-limits"
import { CheckCircle2, ChevronLeft, ChevronRight, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Update scroll arrows visibility
  useEffect(() => {
    const updateArrows = () => {
      if (!scrollContainerRef.current || !isMobile) return

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }

    const container = scrollContainerRef.current
    if (container && isMobile) {
      container.addEventListener("scroll", updateArrows)
      updateArrows()
    }

    return () => {
      if (container && isMobile) {
        container.removeEventListener("scroll", updateArrows)
      }
    }
  }, [open, isMobile])

  // Handle scroll to plan
  const scrollToPlan = (index: number) => {
    if (!scrollContainerRef.current || !isMobile) return

    const planCards = scrollContainerRef.current.querySelectorAll(".plan-card")
    if (planCards[index]) {
      const container = scrollContainerRef.current
      const cardLeft = planCards[index].getBoundingClientRect().left
      const containerLeft = container.getBoundingClientRect().left
      const offset = cardLeft - containerLeft + container.scrollLeft

      container.scrollTo({
        left: offset - 16, // 16px padding
        behavior: "smooth",
      })

      setActiveIndex(index)
    }
  }

  // Handle scroll arrows
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current || !isMobile) return

    const container = scrollContainerRef.current
    const scrollAmount = direction === "left" ? -300 : 300

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  }

  // Handle mouse/touch drag for scrolling
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return
    setIsDragging(true)

    // Get pageX from either mouse or touch event
    const pageX = "touches" in e ? e.touches[0].pageX : e.pageX

    setStartX(pageX)
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !isMobile) return

    // Prevent default to stop text selection during drag
    e.preventDefault()

    // Get pageX from either mouse or touch event
    const pageX = "touches" in e ? e.touches[0].pageX : e.pageX

    const x = pageX
    const walk = (x - startX) * 2 // Scroll speed multiplier

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSelectPlan = (plan: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan",
      })
      return
    }

    setSelectedPlan(plan)
  }

  const handleUpgrade = async () => {
    if (!selectedPlan) return

    setIsLoading(true)

    try {
      // In a real app, this would call your payment processing API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Plan upgraded",
        description: `You've successfully upgraded to the ${selectedPlan} plan`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upgrade failed",
        description: "There was an error upgrading your plan. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const plans = Object.entries(PLAN_LIMITS)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose the Right Plan for You</DialogTitle>
        </DialogHeader>

        <div className="relative mt-6">
          {/* Mobile scroll indicators */}
          <div className="flex justify-center gap-2 mb-4 md:hidden">
            {plans.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  activeIndex === index ? "bg-primary" : "bg-gray-300 dark:bg-gray-600",
                )}
                onClick={() => scrollToPlan(index)}
                aria-label={`View plan ${index + 1}`}
              />
            ))}
          </div>

          {/* Scroll arrows for mobile */}
          {isMobile && showLeftArrow && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-md"
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {isMobile && showRightArrow && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-md"
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Mobile scrollable container */}
          {isMobile ? (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              <div className="grid grid-flow-col auto-cols-[85%] gap-4 w-full">
                {plans.map(([key, plan], index) => (
                  <div key={key} className="snap-center plan-card" onMouseEnter={() => setActiveIndex(index)}>
                    <PlanCard
                      planKey={key}
                      plan={plan}
                      isSelected={selectedPlan === key}
                      isLoading={isLoading}
                      onSelect={handleSelectPlan}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Desktop layout
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-2">
              {plans.map(([key, plan]) => (
                <div
                  key={key}
                  className={cn(
                    "transition-all duration-300 transform",
                    key === "pro" && "lg:scale-105 lg:z-10 relative",
                  )}
                >
                  <PlanCard
                    planKey={key}
                    plan={plan}
                    isSelected={selectedPlan === key}
                    isLoading={isLoading}
                    onSelect={handleSelectPlan}
                    isPopular={key === "pro"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPlan && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleUpgrade} disabled={isLoading} size="lg">
              {isLoading
                ? "Processing..."
                : `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface PlanCardProps {
  planKey: string
  plan: any
  isSelected: boolean
  isLoading: boolean
  onSelect: (plan: string) => void
  isPopular?: boolean
}

function PlanCard({ planKey, plan, isSelected, isLoading, onSelect, isPopular }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "h-full transition-all duration-200 overflow-hidden",
        isSelected ? "ring-2 ring-primary" : "",
        isPopular ? "border-primary shadow-lg" : "",
      )}
    >
      {isPopular && (
        <div className="bg-primary text-primary-foreground text-xs font-medium py-1 text-center">MOST POPULAR</div>
      )}
      <CardHeader className={cn("pb-2", isPopular ? "bg-primary/5" : "")}>
        <div className="flex items-center gap-2">
          {planKey === "enterprise" && <Crown className="h-5 w-5 text-primary" />}
          <CardTitle>{plan.name}</CardTitle>
        </div>
        <CardDescription className="text-lg font-medium mt-1">
          {planKey === "free" ? (
            "Free forever"
          ) : (
            <>
              <span className="text-2xl font-bold">
                {planKey === "basic" ? "$9.99" : planKey === "pro" ? "$19.99" : "$49.99"}
              </span>
              <span className="text-sm font-normal">/month</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("pb-2", isPopular ? "bg-primary/5" : "")}>
        <ul className="space-y-3">
          <li className="text-sm flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{plan.logoGenerationsPerDay} logos per day</span>
          </li>
          <li className="text-sm flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{plan.logoGenerationsPerMonth} logos per month</span>
          </li>
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="text-sm flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className={cn(isPopular ? "bg-primary/5" : "")}>
        <Button
          className="w-full"
          variant={planKey === "free" ? "outline" : isPopular ? "default" : "outline"}
          onClick={() => onSelect(planKey)}
          disabled={isLoading}
          size="lg"
        >
          {planKey === "free" ? "Current Plan" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
