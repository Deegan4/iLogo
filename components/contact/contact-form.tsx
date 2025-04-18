"use client"

import type React from "react"

import { useFormState } from "react-dom"
import { useEffect, useState } from "react"
import { submitContactForm, type ContactFormState } from "@/app/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

const initialState: ContactFormState = {}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Handle form submission state
  useEffect(() => {
    if (state.success) {
      setShowSuccessMessage(true)
      setIsSubmitting(false)

      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    } else if (state.errors) {
      setIsSubmitting(false)
    }
  }, [state])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    // The actual submission is handled by the form action
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      {showSuccessMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Thank you for your message! We'll get back to you soon.</AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {state.errors?._form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.errors._form}</AlertDescription>
        </Alert>
      )}

      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            disabled={isSubmitting || showSuccessMessage}
            aria-invalid={!!state.errors?.name}
            aria-describedby={state.errors?.name ? "name-error" : undefined}
          />
          {state.errors?.name && (
            <p id="name-error" className="text-sm text-red-500">
              {state.errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            disabled={isSubmitting || showSuccessMessage}
            aria-invalid={!!state.errors?.email}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
          />
          {state.errors?.email && (
            <p id="email-error" className="text-sm text-red-500">
              {state.errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Your message"
            rows={5}
            disabled={isSubmitting || showSuccessMessage}
            aria-invalid={!!state.errors?.message}
            aria-describedby={state.errors?.message ? "message-error" : undefined}
          />
          {state.errors?.message && (
            <p id="message-error" className="text-sm text-red-500">
              {state.errors.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || showSuccessMessage}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </div>
  )
}
