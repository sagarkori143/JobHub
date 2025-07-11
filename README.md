# JobHub - Job Applications Management Platform

A comprehensive web application for managing job applications, tracking application status, and organizing your job search process.

## Features

### 🎯 Job Search & Discovery
- Browse and search through job listings
- Advanced filtering by location, job type, experience level, industry, and salary range
- Detailed job information with company details and requirements
- Apply directly to jobs with one-click application

### 📊 Application Tracking
- **Applied**: Track all jobs you've applied to
- **Interviewing**: Monitor jobs where you're in the interview process
- **Offers**: Keep track of job offers received
- **Rejected**: Document rejected applications for future reference

### 📈 Dashboard & Analytics
- Job market overview with key statistics
- Track total jobs available, remote opportunities, and average salaries
- Monitor top industries and companies hiring
- View recent job postings and market trends

### 📝 Personal Job Management
- Save interesting jobs to your personal dashboard
- Organize jobs by status and priority
- Add notes and personal insights for each application
- Custom categorization and tagging system

### 🎯 Resume Scoring
- AI-powered resume analysis and scoring
- Get feedback on resume strength and areas for improvement
- Compare your resume against job requirements
- Optimize your resume for specific positions

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout the application

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd JobHub
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Structure

```
JobHub/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Job market overview
│   ├── applied/          # Applied jobs tracking
│   ├── interviewing/     # Interview process tracking
│   ├── offers/          # Job offers management
│   ├── rejected/        # Rejected applications
│   ├── personal/        # Personal job management
│   └── resume-scoring/  # Resume analysis tool
├── components/           # Reusable UI components
├── data/               # Mock data and utilities
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.