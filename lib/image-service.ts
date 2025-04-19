/**
 * Image quality presets for different use cases
 */
export const imageQualities = {
  low: 60,
  medium: 80,
  high: 90,
  max: 100,
}

/**
 * Generate responsive image sizes string for Next.js Image component
 * @param sizes Object with breakpoint sizes
 * @returns A sizes string for the Next.js Image component
 */
export function generateSizes(sizes: {
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  "2xl"?: string
}): string {
  const breakpoints = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  }

  const sizeEntries = Object.entries(sizes)

  if (sizeEntries.length === 0) {
    return "100vw" // Default to full viewport width
  }

  return sizeEntries
    .map(([breakpoint, size]) => {
      if (breakpoint === "xs") {
        return `(max-width: ${breakpoints.sm - 1}px) ${size}`
      } else if (breakpoint === "2xl") {
        return `(min-width: ${breakpoints["2xl"]}px) ${size}`
      } else {
        const nextBreakpoint =
          breakpoint === "sm" ? "md" : breakpoint === "md" ? "lg" : breakpoint === "lg" ? "xl" : "2xl"

        return `(min-width: ${breakpoints[breakpoint as keyof typeof breakpoints]}px) and (max-width: ${breakpoints[nextBreakpoint as keyof typeof breakpoints] - 1}px) ${size}`
      }
    })
    .join(", ")
}

/**
 * Generate image URL with quality and size parameters
 * @param url Original image URL
 * @param width Desired width
 * @param quality Image quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(url: string, width?: number, quality?: number): string {
  if (!url) return ""

  // If URL is already optimized or is an SVG, return as is
  if (url.includes("?w=") || url.includes("?width=") || url.endsWith(".svg")) {
    return url
  }

  // Add width and quality parameters
  const params = new URLSearchParams()
  if (width) params.append("w", width.toString())
  if (quality) params.append("q", quality.toString())

  return `${url}${params.toString() ? `?${params.toString()}` : ""}`
}

/**
 * Calculate aspect ratio based on width and height
 * @param width Width of the image
 * @param height Height of the image
 * @returns Aspect ratio as a string (e.g., "16/9")
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  return `${width / divisor}/${height / divisor}`
}
