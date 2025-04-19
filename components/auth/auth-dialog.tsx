"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "sign-in" | "sign-up"
}

export function AuthDialog({ open, onOpenChange, defaultTab = "sign-in" }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">(defaultTab)

  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to iLogo</DialogTitle>
          <DialogDescription>
            {activeTab === "sign-in"
              ? "Sign in to your account to save and manage your logos."
              : "Create an account to save and manage your logos."}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="sign-in"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "sign-in" | "sign-up")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in" className="mt-4">
            <SignInForm onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="sign-up" className="mt-4">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
