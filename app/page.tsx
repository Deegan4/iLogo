"use client"

import { useState, useEffect, useRef } from "react"
import { LogoGeneratorWithAuth } from "@/components/logo-generator-with-auth"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  const [demoMode, setDemoMode] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Add this useEffect for the cyber background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mouse position tracking
    let mouseX = 0
    let mouseY = 0
    const mouseRadius = 150
    // Add cursor glow effect variables
    let glowIntensity = 0
    let glowDirection = 0.02
    const maxGlowIntensity = 0.4
    const minGlowIntensity = 0.2

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Mouse move event listener
    canvas.addEventListener("mousemove", (e) => {
      mouseX = e.x
      mouseY = e.y
    })

    // Touch event listener for mobile
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault()
      mouseX = e.touches[0].clientX
      mouseY = e.touches[0].clientY
    })

    // Mouse leave event
    canvas.addEventListener("mouseleave", () => {
      mouseX = undefined
      mouseY = undefined
    })

    // Particles configuration
    const particlesArray: Particle[] = []
    const numberOfParticles = 100

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      baseSize: number
      speedX: number
      speedY: number
      color: string
      baseColor: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.baseSize = Math.random() * 3 + 1
        this.size = this.baseSize
        this.speedX = (Math.random() - 0.5) * 1
        this.speedY = (Math.random() - 0.5) * 1
        this.baseColor = `rgba(120, 79, 255, ${Math.random() * 0.5 + 0.2})`
        this.color = this.baseColor
      }

      update() {
        // Normal movement
        this.x += this.speedX
        this.y += this.speedY

        // Screen boundaries
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height

        // Mouse interaction
        if (mouseX !== undefined && mouseY !== undefined) {
          const dx = this.x - mouseX
          const dy = this.y - mouseY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < mouseRadius) {
            // Calculate force (closer = stronger)
            const force = (mouseRadius - distance) / mouseRadius

            // Move particles away from mouse
            const angle = Math.atan2(dy, dx)
            this.x += Math.cos(angle) * force * 2
            this.y += Math.sin(angle) * force * 2

            // Increase size and change color when near mouse
            this.size = this.baseSize + force * 3
            this.color = `rgba(160, 120, 255, ${Math.min(0.8, force + 0.2)})`
          } else {
            // Return to normal size and color when away from mouse
            this.size = this.baseSize
            this.color = this.baseColor
          }
        }
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }
    init()

    // Connect particles with lines
    function connect() {
      const maxDistance = 150
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x
          const dy = particlesArray[a].y - particlesArray[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            // Base connection opacity
            let opacity = 1 - distance / maxDistance

            // Enhance connections near mouse
            if (mouseX !== undefined && mouseY !== undefined) {
              const mdx = (particlesArray[a].x + particlesArray[b].x) / 2 - mouseX
              const mdy = (particlesArray[a].y + particlesArray[b].y) / 2 - mouseY
              const mouseDistance = Math.sqrt(mdx * mdx + mdy * mdy)

              if (mouseDistance < mouseRadius) {
                opacity = Math.min(0.8, opacity + ((mouseRadius - mouseDistance) / mouseRadius) * 0.5)
              }
            }

            ctx.strokeStyle = `rgba(120, 79, 255, ${opacity * 0.2})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }
      }
    }

    // Draw cursor glow effect
    function drawCursorGlow() {
      if (mouseX === undefined || mouseY === undefined) return

      // Update glow intensity for pulsing effect
      if (glowIntensity >= maxGlowIntensity || glowIntensity <= minGlowIntensity) {
        glowDirection *= -1
      }
      glowIntensity += glowDirection

      // Create radial gradient for glow effect
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 5, mouseX, mouseY, mouseRadius)

      gradient.addColorStop(0, `rgba(160, 120, 255, ${glowIntensity})`)
      gradient.addColorStop(0.5, `rgba(120, 79, 255, ${glowIntensity * 0.5})`)
      gradient.addColorStop(1, "rgba(120, 79, 255, 0)")

      ctx.beginPath()
      ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw cursor glow first (behind particles)
      drawCursorGlow()

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }
      connect()

      requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", () => {})
      canvas.removeEventListener("touchmove", () => {})
      canvas.removeEventListener("mouseleave", () => {})
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Custom background gradient overlay */}
      <div className="fixed inset-0 -z-10 bg-background">
        {/* Dark mode gradient */}
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,79,255,0.3),rgba(255,255,255,0))] dark:opacity-100 opacity-0 transition-opacity duration-300" />

        {/* Light mode gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(192,168,255,0.15),rgba(255,255,255,0))] dark:opacity-0 opacity-100 transition-opacity duration-300" />

        {/* Secondary accent gradients */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-purple-500/[0.02] to-transparent dark:from-purple-500/[0.05]" />
        <div className="absolute top-0 left-0 w-[30vw] h-[30vh] bg-gradient-to-br from-indigo-500/[0.03] to-transparent dark:from-indigo-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[40vw] h-[40vh] bg-gradient-to-bl from-purple-600/[0.03] to-transparent dark:from-purple-600/[0.07] rounded-full blur-3xl" />
      </div>

      <SiteHeader demoMode={demoMode} setDemoMode={setDemoMode} />
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 pt-24 relative z-10">
        {/* Cyber animated background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 -z-10 w-full h-full cursor-none"
          style={{ pointerEvents: "auto" }}
        />

        {/* Digital grid overlay */}
        <div
          className="absolute inset-0 -z-10 bg-grid-pattern opacity-10 dark:opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(120, 79, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(120, 79, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          }}
        />

        <LogoGeneratorWithAuth demoMode={demoMode} />
      </main>
      <SiteFooter />
    </div>
  )
}
