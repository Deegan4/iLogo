"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { generateSizes } from "@/lib/image-service"

interface LogoImageProps {
  svgContent: string
  className?: string
  onLoad?: () => void
  priority?: boolean
  sizes?: string
}

export function LogoImage({ svgContent, className, onLoad, priority = false, sizes }: LogoImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Default sizes attribute for logos
  const defaultSizes =
    sizes ||
    generateSizes({
      sm: "100vw",
      md: "50vw",
      lg: "33vw",
      xl: "25vw",
    })

  // Handle SVG load
  useEffect(() => {
    if (svgContent && containerRef.current) {
      setIsLoaded(true)
      if (onLoad) onLoad()
    }
  }, [svgContent, onLoad])

  // For SVG content, we render it directly
  if (svgContent) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    )
  }

  // Fallback for when SVG content is not available
  return <div className={cn("w-full h-full bg-muted animate-pulse rounded-md", className)} />
}
