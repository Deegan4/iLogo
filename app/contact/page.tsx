import { ContactForm } from "@/components/contact/contact-form"

export const metadata = {
  title: "Contact Us | iLogo",
  description: "Get in touch with the iLogo team for questions, feedback, or support.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as
          soon as possible.
        </p>

        <ContactForm />
      </div>
    </div>
  )
}
