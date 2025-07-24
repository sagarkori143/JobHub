"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [name, setName] = useState("")
  const [experience, setExperience] = useState("")
  const [issues, setIssues] = useState("")
  const [suggestions, setSuggestions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!experience.trim()) {
      toast({ title: "Incomplete", description: "Please share your experience." })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, experience, issues, suggestions })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit review")
      toast({ title: "Thanks!", description: "Your review has been submitted." })
      onSuccess?.()
      setName("")
      setExperience("")
      setIssues("")
      setSuggestions("")
      onClose()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md pt-10">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Jo likhna hai bindass likho.. Need a feedback not a testimonial 😁</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea
            placeholder="How was it?"
            rows={3}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
          <Textarea
            placeholder="What issues did you face?"
            rows={3}
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
          />
          <Textarea
            placeholder="What else can we add?"
            rows={3}
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
          />
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 