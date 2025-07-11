"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, Trash2, Edit, Save, XCircle } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"

interface PersonalGoal {
  id: string
  title: string
  description: string
  dueDate: string
  status: "pending" | "in-progress" | "completed"
}

interface Contact {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  notes?: string
}

export default function PersonalDashboardPage() {
  const [goals, setGoals] = useState<PersonalGoal[]>([])
  const [newGoal, setNewGoal] = useState<Partial<PersonalGoal>>({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    status: "pending",
  })
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  const [contacts, setContacts] = useState<Contact[]>([])
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    company: "",
    email: "",
  })
  const [editingContactId, setEditingContactId] = useState<string | null>(null)

  useEffect(() => {
    // Load data from localStorage on mount
    const storedGoals = localStorage.getItem("personalGoals")
    if (storedGoals) setGoals(JSON.parse(storedGoals))

    const storedContacts = localStorage.getItem("personalContacts")
    if (storedContacts) setContacts(JSON.parse(storedContacts))
  }, [])

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem("personalGoals", JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem("personalContacts", JSON.stringify(contacts))
  }, [contacts])

  // Goal Management
  const handleAddGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.dueDate) {
      const goalToAdd: PersonalGoal = {
        id: Date.now().toString(),
        ...newGoal,
        status: newGoal.status || "pending",
      } as PersonalGoal
      setGoals((prev) => [...prev, goalToAdd])
      setNewGoal({
        title: "",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        status: "pending",
      })
      toast({ title: "Goal Added!", description: `"${goalToAdd.title}" has been added.` })
    } else {
      toast({ title: "Missing Info", description: "Please fill all goal fields.", variant: "destructive" })
    }
  }

  const handleEditGoal = (goal: PersonalGoal) => {
    setNewGoal(goal)
    setEditingGoalId(goal.id)
  }

  const handleSaveGoal = () => {
    if (editingGoalId && newGoal.title && newGoal.description && newGoal.dueDate) {
      setGoals((prev) => prev.map((goal) => (goal.id === editingGoalId ? (newGoal as PersonalGoal) : goal)))
      setNewGoal({
        title: "",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        status: "pending",
      })
      setEditingGoalId(null)
      toast({ title: "Goal Updated!", description: `Goal has been updated.` })
    } else {
      toast({ title: "Missing Info", description: "Please fill all goal fields.", variant: "destructive" })
    }
  }

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id))
    toast({ title: "Goal Deleted!", description: "Goal has been removed.", variant: "destructive" })
  }

  // Contact Management
  const handleAddContact = () => {
    if (newContact.name && newContact.company && newContact.email) {
      const contactToAdd: Contact = {
        id: Date.now().toString(),
        ...newContact,
      } as Contact
      setContacts((prev) => [...prev, contactToAdd])
      setNewContact({ name: "", company: "", email: "", phone: "", notes: "" })
      toast({ title: "Contact Added!", description: `"${contactToAdd.name}" has been added.` })
    } else {
      toast({ title: "Missing Info", description: "Please fill required contact fields.", variant: "destructive" })
    }
  }

  const handleEditContact = (contact: Contact) => {
    setNewContact(contact)
    setEditingContactId(contact.id)
  }

  const handleSaveContact = () => {
    if (editingContactId && newContact.name && newContact.company && newContact.email) {
      setContacts((prev) =>
        prev.map((contact) => (contact.id === editingContactId ? (newContact as Contact) : contact)),
      )
      setNewContact({ name: "", company: "", email: "", phone: "", notes: "" })
      setEditingContactId(null)
      toast({ title: "Contact Updated!", description: `Contact has been updated.` })
    } else {
      toast({ title: "Missing Info", description: "Please fill required contact fields.", variant: "destructive" })
    }
  }

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
    toast({ title: "Contact Deleted!", description: "Contact has been removed.", variant: "destructive" })
  }

  const pendingGoals = useMemo(() => goals.filter((goal) => goal.status === "pending"), [goals])
  const inProgressGoals = useMemo(() => goals.filter((goal) => goal.status === "in-progress"), [goals])
  const completedGoals = useMemo(() => goals.filter((goal) => goal.status === "completed"), [goals])

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-3xl font-bold mb-4">Personal Dashboard</h1>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pending ({pendingGoals.length})</h3>
              <div className="space-y-2">
                {pendingGoals.length > 0 ? (
                  pendingGoals.map((goal) => (
                    <div key={goal.id} className="border p-3 rounded-md bg-gray-50">
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
                      <p className="text-xs text-muted-foreground">Due: {goal.dueDate}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No pending goals.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">In Progress ({inProgressGoals.length})</h3>
              <div className="space-y-2">
                {inProgressGoals.length > 0 ? (
                  inProgressGoals.map((goal) => (
                    <div key={goal.id} className="border p-3 rounded-md bg-blue-50">
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
                      <p className="text-xs text-muted-foreground">Due: {goal.dueDate}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No goals in progress.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Completed ({completedGoals.length})</h3>
              <div className="space-y-2">
                {completedGoals.length > 0 ? (
                  completedGoals.map((goal) => (
                    <div key={goal.id} className="border p-3 rounded-md bg-green-50">
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
                      <p className="text-xs text-muted-foreground">Completed: {goal.dueDate}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No completed goals.</p>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">{editingGoalId ? "Edit Goal" : "Add New Goal"}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={newGoal.title || ""}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Learn Next.js"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={newGoal.description || ""}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of your goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newGoal.dueDate ? format(new Date(newGoal.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newGoal.dueDate ? new Date(newGoal.dueDate) : undefined}
                    onSelect={(date) =>
                      setNewGoal((prev) => ({ ...prev, dueDate: date ? format(date, "yyyy-MM-dd") : "" }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-status">Status</Label>
              <Select
                value={newGoal.status}
                onValueChange={(value) => setNewGoal((prev) => ({ ...prev, status: value as PersonalGoal["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {editingGoalId ? (
              <>
                <Button onClick={handleSaveGoal}>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingGoalId(null)
                    setNewGoal({
                      title: "",
                      description: "",
                      dueDate: format(new Date(), "yyyy-MM-dd"),
                      status: "pending",
                    })
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancel Edit
                </Button>
              </>
            ) : (
              <Button onClick={handleAddGoal}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Goal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contacts Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div key={contact.id} className="border p-4 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {contact.name} ({contact.company})
                    </p>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                    {contact.phone && <p className="text-sm text-muted-foreground">Phone: {contact.phone}</p>}
                    {contact.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-1">Notes: {contact.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditContact(contact)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No contacts added yet.</p>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-4">{editingContactId ? "Edit Contact" : "Add New Contact"}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={newContact.name || ""}
                onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Contact Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company</Label>
              <Input
                id="contact-company"
                value={newContact.company || ""}
                onChange={(e) => setNewContact((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Company Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={newContact.email || ""}
                onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="contact@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone (Optional)</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={newContact.phone || ""}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="123-456-7890"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="contact-notes">Notes (Optional)</Label>
              <Textarea
                id="contact-notes"
                value={newContact.notes || ""}
                onChange={(e) => setNewContact((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any relevant notes about this contact"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {editingContactId ? (
              <>
                <Button onClick={handleSaveContact}>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingContactId(null)
                    setNewContact({ name: "", company: "", email: "", phone: "", notes: "" })
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancel Edit
                </Button>
              </>
            ) : (
              <Button onClick={handleAddContact}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Contact
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
