"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Bell, Mail, MessageSquare, Smartphone, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface JobPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

// Comprehensive suggestion data
const suggestions = {
  keywords: [
    "React", "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
    "Node.js", "Express", "Django", "Flask", "Spring", "Laravel", "Rails", "ASP.NET", "FastAPI",
    "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt.js", "Gatsby", "Remix",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "DynamoDB", "Firebase",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitLab CI",
    "Machine Learning", "AI", "Data Science", "Deep Learning", "NLP", "Computer Vision",
    "DevOps", "CI/CD", "Microservices", "REST API", "GraphQL", "WebSocket", "gRPC",
    "HTML", "CSS", "Sass", "Less", "Tailwind CSS", "Bootstrap", "Material-UI", "Ant Design",
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Slack", "Discord",
    "Agile", "Scrum", "Kanban", "TDD", "BDD", "Unit Testing", "Integration Testing",
    "Product Management", "Project Management", "Business Analysis", "UX Design", "UI Design",
    "Marketing", "SEO", "SEM", "Content Marketing", "Social Media", "Email Marketing",
    "Sales", "Customer Success", "Support", "Analytics", "Data Analysis", "Business Intelligence"
  ],
  industries: [
    "Technology", "Healthcare", "Finance", "Education", "Marketing", "Design", "Retail", "E-commerce",
    "Manufacturing", "Transportation", "Logistics", "Real Estate", "Insurance", "Legal", "Consulting",
    "Entertainment", "Media", "Gaming", "Sports", "Fitness", "Food & Beverage", "Hospitality",
    "Non-profit", "Government", "Energy", "Utilities", "Telecommunications", "Aerospace", "Automotive",
    "Biotechnology", "Pharmaceuticals", "Research", "Science", "Engineering", "Architecture",
    "Construction", "Agriculture", "Environmental", "Sustainability", "Clean Energy", "Fintech",
    "Edtech", "Healthtech", "PropTech", "InsurTech", "LegalTech", "RegTech", "Cybersecurity"
  ],
  companies: [
    "Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix", "Uber", "Airbnb", "Spotify", "Twitter",
    "LinkedIn", "Salesforce", "Adobe", "Oracle", "IBM", "Intel", "NVIDIA", "AMD", "Cisco", "Dell",
    "HP", "Sony", "Samsung", "LG", "Panasonic", "Philips", "GE", "Siemens", "Bosch", "BMW",
    "Mercedes", "Volkswagen", "Toyota", "Honda", "Ford", "GM", "Tesla", "SpaceX", "Boeing", "Airbus",
    "McDonald's", "Starbucks", "Coca-Cola", "Pepsi", "Nike", "Adidas", "Zara", "H&M", "IKEA", "Walmart",
    "Target", "Costco", "Home Depot", "Lowe's", "Best Buy", "Macy's", "Nordstrom", "Saks", "Neiman Marcus",
    "JPMorgan Chase", "Bank of America", "Wells Fargo", "Goldman Sachs", "Morgan Stanley", "Citigroup",
    "American Express", "Visa", "Mastercard", "PayPal", "Stripe", "Square", "Coinbase", "Robinhood",
    "McKinsey", "BCG", "Bain", "Deloitte", "PwC", "EY", "KPMG", "Accenture", "IBM Consulting",
    "Pfizer", "Johnson & Johnson", "Merck", "Novartis", "Roche", "AstraZeneca", "Moderna", "BioNTech"
  ],
  locations: [
    "Remote", "San Francisco", "New York", "Los Angeles", "Seattle", "Austin", "Boston", "Chicago",
    "Denver", "Portland", "Miami", "Atlanta", "Dallas", "Houston", "Phoenix", "Las Vegas",
    "San Diego", "San Jose", "Oakland", "Sacramento", "Fresno", "Bakersfield", "Stockton",
    "New York City", "Brooklyn", "Queens", "Manhattan", "Bronx", "Staten Island",
    "Los Angeles", "Hollywood", "Beverly Hills", "Santa Monica", "Venice", "Culver City",
    "Seattle", "Bellevue", "Redmond", "Kirkland", "Sammamish", "Mercer Island",
    "Austin", "Round Rock", "Cedar Park", "Leander", "Pflugerville", "Georgetown",
    "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Waltham",
    "Chicago", "Evanston", "Oak Park", "Naperville", "Arlington Heights", "Schaumburg",
    "Denver", "Boulder", "Aurora", "Lakewood", "Littleton", "Englewood",
    "Portland", "Beaverton", "Hillsboro", "Gresham", "Tigard", "Lake Oswego",
    "Miami", "Fort Lauderdale", "West Palm Beach", "Boca Raton", "Hollywood FL", "Coral Gables",
    "Atlanta", "Sandy Springs", "Roswell", "Alpharetta", "Marietta", "Smyrna",
    "Dallas", "Fort Worth", "Arlington", "Plano", "Irving", "Frisco",
    "Houston", "Sugar Land", "The Woodlands", "Katy", "Pearland", "Spring",
    "Phoenix", "Scottsdale", "Mesa", "Tempe", "Chandler", "Gilbert",
    "Las Vegas", "Henderson", "North Las Vegas", "Summerlin", "Green Valley", "Anthem",
    "London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Sheffield",
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes",
    "Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart",
    "Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa",
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra",
    "Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo",
    "Singapore", "Hong Kong", "Seoul", "Bangkok", "Kuala Lumpur", "Jakarta"
  ],
  jobTypes: ["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary", "Seasonal"],
  experienceLevels: ["Entry", "Junior", "Mid", "Senior", "Lead", "Principal", "Executive", "Director", "VP", "C-Level"]
}

export function JobPreferencesModal({ isOpen, onClose }: JobPreferencesModalProps) {
  const { jobPreferences, updateJobPreferences } = useAuth()
  const { toast } = useToast()

  const [localPreferences, setLocalPreferences] = useState(jobPreferences)
  const [searchInputs, setSearchInputs] = useState({
    keywords: "",
    industries: "",
    companies: "",
    locations: "",
    jobTypes: "",
    experienceLevels: ""
  })
  const [openPopovers, setOpenPopovers] = useState({
    keywords: false,
    industries: false,
    companies: false,
    locations: false,
    jobTypes: false,
    experienceLevels: false
  })

  // Filter suggestions based on search input
  const getFilteredSuggestions = (type: keyof typeof suggestions, searchValue: string) => {
    const searchLower = searchValue.toLowerCase()
    return suggestions[type].filter(item => 
      item.toLowerCase().includes(searchLower) && 
      !localPreferences[type as keyof typeof localPreferences]?.includes(item)
    )
  }

  const addItem = (type: keyof typeof localPreferences, value: string) => {
    if (value.trim() && !localPreferences[type]?.includes(value.trim())) {
      setLocalPreferences({
        ...localPreferences,
        [type]: [...(localPreferences[type] || []), value.trim()]
      })
      setSearchInputs(prev => ({ ...prev, [type]: "" }))
      setOpenPopovers(prev => ({ ...prev, [type]: false }))
    }
  }

  const removeItem = (type: keyof typeof localPreferences, value: string) => {
    setLocalPreferences({
      ...localPreferences,
      [type]: localPreferences[type]?.filter(item => item !== value) || []
    })
  }

  const handleSave = async () => {
    await updateJobPreferences(localPreferences)
    toast({
      title: "Preferences Updated!",
      description: "Your job preferences have been saved. You'll receive notifications for matching jobs.",
    })
    onClose()
  }

      const SearchableInput = ({ 
    type, 
    label, 
    placeholder, 
    description 
  }: { 
    type: keyof typeof localPreferences
    label: string
    placeholder: string
    description?: string
  }) => {
    const [localSearchValue, setLocalSearchValue] = useState("")
    
    // Sync local search value with global state when popover opens
    useEffect(() => {
      if (openPopovers[type]) {
        setLocalSearchValue(searchInputs[type])
      }
    }, [openPopovers[type], type])

    const handleInputChange = (value: string) => {
      setLocalSearchValue(value)
      setSearchInputs(prev => ({ ...prev, [type]: value }))
    }

    return (
      <div className="space-y-3 relative">
        <div>
          <Label className="text-base font-semibold">{label}</Label>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        
        <div className="relative">
          <Popover open={openPopovers[type]} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [type]: open }))}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPopovers[type]}
                className="w-full justify-between"
              >
                <Search className="mr-2 h-4 w-4" />
                {searchInputs[type] || placeholder}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[200px] z-[9999] bg-white border shadow-lg" 
              align="start" 
              side="bottom" 
              sideOffset={4}
              style={{ position: 'fixed' }}
            >
              <div className="p-2">
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={localSearchValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="mb-2"
                  autoFocus
                />
                <div className="max-h-[150px] overflow-y-auto">
                  {getFilteredSuggestions(type as keyof typeof suggestions, localSearchValue).length === 0 ? (
                    <div className="space-y-1">
                      {localSearchValue.trim() && (
                        <button
                          onClick={() => addItem(type, localSearchValue.trim())}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-green-100 bg-green-50 text-green-700 rounded-md transition-colors border border-green-200"
                        >
                          <Plus className="w-3 h-3 inline mr-2" />
                          Add "{localSearchValue.trim()}" as custom {label.toLowerCase().slice(0, -1)}
                        </button>
                      )}
                      <div className="text-sm text-gray-500 p-2 text-center">
                        No {label.toLowerCase()} found.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {getFilteredSuggestions(type as keyof typeof suggestions, localSearchValue).map((item) => (
                        <button
                          key={item}
                          onClick={() => addItem(type, item)}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                      {localSearchValue.trim() && !getFilteredSuggestions(type as keyof typeof suggestions, localSearchValue).includes(localSearchValue.trim()) && (
                        <div className="border-t border-gray-200 pt-1 mt-1">
                          <button
                            onClick={() => addItem(type, localSearchValue.trim())}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-green-100 bg-green-50 text-green-700 rounded-md transition-colors border border-green-200"
                          >
                            <Plus className="w-3 h-3 inline mr-2" />
                            Add "{localSearchValue.trim()}" as custom {label.toLowerCase().slice(0, -1)}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap gap-2">
          {localPreferences[type]?.map((item) => (
            <Badge key={item} variant="secondary" className="bg-blue-100 text-blue-800">
              {item}
              <button 
                onClick={() => removeItem(type, item)} 
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Job Notification Preferences</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Keywords & Skills */}
          <SearchableInput
            type="keywords"
            label="Keywords & Skills"
            placeholder="Search for skills, technologies, or keywords..."
            description="Add specific skills, technologies, or keywords to get notified about relevant jobs"
          />

          <Separator />

          {/* Industries */}
          <SearchableInput
            type="industries"
            label="Industries"
            placeholder="Search for industries..."
            description="Select industries you're interested in working in"
          />

          <Separator />

          {/* Companies */}
          <SearchableInput
            type="companies"
            label="Target Companies"
            placeholder="Search for companies..."
            description="Add companies you'd like to work for"
          />

          <Separator />

          {/* Locations */}
          <SearchableInput
            type="locations"
            label="Preferred Locations"
            placeholder="Search for cities or 'Remote'..."
            description="Add cities, regions, or 'Remote' for remote work opportunities"
          />

          <Separator />

          {/* Job Types */}
          <SearchableInput
            type="jobTypes"
            label="Job Types"
            placeholder="Search for job types..."
            description="Select the types of employment you're looking for"
          />

          <Separator />

          {/* Experience Levels */}
          <SearchableInput
            type="experienceLevels"
            label="Experience Levels"
            placeholder="Search for experience levels..."
            description="Select the experience levels that match your career stage"
          />

          <Separator />

          {/* Salary Range */}
          <div>
            <Label className="text-base font-semibold">
              Salary Range: ${localPreferences.salaryRange.min.toLocaleString()} - $
              {localPreferences.salaryRange.max.toLocaleString()}
            </Label>
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-sm">Minimum Salary</Label>
                <Slider
                  value={[localPreferences.salaryRange.min]}
                  onValueChange={([value]) =>
                    setLocalPreferences({
                      ...localPreferences,
                      salaryRange: { ...localPreferences.salaryRange, min: value },
                    })
                  }
                  max={200000}
                  step={5000}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Maximum Salary</Label>
                <Slider
                  value={[localPreferences.salaryRange.max]}
                  onValueChange={([value]) =>
                    setLocalPreferences({
                      ...localPreferences,
                      salaryRange: { ...localPreferences.salaryRange, max: value },
                    })
                  }
                  max={200000}
                  step={5000}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Methods */}
          <div>
            <Label className="text-base font-semibold">Notification Methods</Label>
            <p className="text-sm text-gray-600 mb-4">Choose how you want to receive job alerts</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Get job alerts via email</p>
                  </div>
                </div>
                <Checkbox
                  checked={localPreferences.notifications.email}
                  onCheckedChange={(checked) => 
                    setLocalPreferences({
                      ...localPreferences,
                      notifications: { ...localPreferences.notifications, email: checked as boolean }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-500">SMS Notifications</p>
                    <p className="text-sm text-gray-400">Get job alerts via SMS</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
                <Checkbox disabled checked={false} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-500">WhatsApp Notifications</p>
                    <p className="text-sm text-gray-400">Get job alerts via WhatsApp</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
                <Checkbox disabled checked={false} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Preferences
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
