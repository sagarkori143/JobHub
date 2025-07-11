export type MockJob = {
  id: string
  title: string
  company: string
  location: string
  type: string
  industry: string
  remote: boolean
  salary: { min: number; max: number }
  logo: string
}

export const mockJobs: MockJob[] = [
  {
    id: "1",
    title: "Frontend Engineer",
    company: "Google",
    location: "Mountain View, CA",
    type: "Full-time",
    industry: "Software",
    remote: true,
    salary: { min: 140000, max: 200000 },
    // local placeholder kept in repo → always resolves
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    title: "Backend Engineer",
    company: "Amazon",
    location: "Seattle, WA",
    type: "Full-time",
    industry: "E-commerce",
    remote: false,
    salary: { min: 135000, max: 190000 },
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    title: "Product Manager",
    company: "Microsoft",
    location: "Redmond, WA",
    type: "Full-time",
    industry: "Software",
    remote: true,
    salary: { min: 150000, max: 210000 },
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    title: "Network Engineer",
    company: "Cisco",
    location: "San Jose, CA",
    type: "Full-time",
    industry: "Networking",
    remote: false,
    salary: { min: 125000, max: 175000 },
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    title: "UI/UX Designer",
    company: "Apple",
    location: "Cupertino, CA",
    type: "Contract",
    industry: "Consumer Electronics",
    remote: true,
    salary: { min: 90000, max: 140000 },
    logo: "/placeholder.svg?height=40&width=40",
  },
]
