# Job Synchronization System

This document explains the job synchronization system that compares old vs new company job files, manages job expiration, and handles new job notifications.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Scraper       │    │   Supabase       │    │   JobHub        │
│   Server        │───▶│   Storage        │───▶│   Sync Script   │
│   (Separate)    │    │   (company-jobs) │    │   (Cron Job)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Notification   │
                       │   Queue          │
                       └──────────────────┘
```

## Components

### 1. Job Sync Manager (`scripts/job-sync.js`)

The main synchronization engine that:
- Downloads company job files from Supabase storage
- Compares old vs new job data
- Identifies expired, new, and active jobs
- Updates local data files
- Adds new jobs to notification queue

### 2. Cron Job Wrapper (`scripts/cron-job-sync.js`)

A wrapper for automated execution that:
- Handles logging to files
- Manages error handling
- Provides detailed execution reports
- Designed for scheduled execution

### 3. Database Schema

#### Job Notifications Table
```sql
CREATE TABLE job_notifications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);
```

#### Storage Bucket
- **Bucket Name**: `company-jobs`
- **Purpose**: Store company job files uploaded by scraper server
- **File Format**: JSON files with company job data
- **Access**: Private bucket with service role access

## Setup Instructions

### 1. Database Setup

Run the SQL scripts in order:

```bash
# Create job notifications table
psql -d your_database -f scripts/009_create_job_notifications_table.sql

# Setup company-jobs bucket
psql -d your_database -f scripts/setup-company-jobs-bucket.sql
```

### 2. Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Directory Structure

Create required directories:

```bash
mkdir -p data logs
```

## Usage

### Manual Execution

```bash
# Run job sync manually
npm run job-sync

# Run with cron wrapper (includes logging)
npm run cron-sync
```

### Cron Job Setup

Add to your crontab for automated execution:

```bash
# Edit crontab
crontab -e

# Add line to run every 6 hours
0 */6 * * * cd /path/to/jobhub && npm run cron-sync >> /var/log/job-sync.log 2>&1

# Or run daily at 2 AM
0 2 * * * cd /path/to/jobhub && npm run cron-sync >> /var/log/job-sync.log 2>&1
```

## Job Comparison Logic

### Job Identification
Jobs are identified using a composite key:
```
${job.title}-${job.location}-${job.company}
```

### Job States

1. **Active Jobs**: Present in both old and new files
2. **New Jobs**: Present in new file but not in old file
3. **Expired Jobs**: Present in old file but not in new file

### File Structure

#### Company Job File Format
```json
{
  "company": "Amazon",
  "scrapedAt": "2024-01-01T00:00:00Z",
  "jobs": [
    {
      "id": "job-001",
      "title": "Software Engineer",
      "company": "Amazon",
      "location": "Seattle, WA",
      "url": "https://amazon.com/careers/job-001",
      "description": "Job description...",
      "requirements": ["JavaScript", "React", "Node.js"],
      "postedDate": "2024-01-01",
      "isActive": true
    }
  ]
}
```

#### Sync Summary Format
```json
{
  "syncSession": {
    "startTime": "2024-01-01T00:00:00Z",
    "endTime": "2024-01-01T00:05:00Z",
    "duration": 300,
    "companiesProcessed": 15,
    "totalNewJobs": 25,
    "totalActiveJobs": 150,
    "totalExpiredJobs": 10
  },
  "results": [...],
  "newJobs": [...],
  "logs": [...]
}
```

## Monitoring

### Log Files
- **Location**: `logs/` directory
- **Format**: `job-sync-YYYY-MM-DDTHH-MM-SS.log`
- **Error Logs**: `cron-error-{timestamp}.json`

### Sync Summary
- **Location**: `data/job-sync-summary.json`
- **Updated**: After each sync run
- **Contains**: Detailed statistics and results

## Notification System

### New Job Processing
1. New jobs are identified during sync
2. Added to `job_notifications` table with `pending` status
3. Notification service processes pending notifications
4. Status updated to `sent` or `failed`

### Notification Queue
```sql
-- Check pending notifications
SELECT * FROM job_notifications 
WHERE status = 'pending' 
AND scheduled_for <= NOW()
ORDER BY created_at ASC;
```

## Error Handling

### Common Issues

1. **Bucket Not Found**
   - Ensure `company-jobs` bucket exists
   - Check Supabase storage permissions

2. **Service Role Access**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set
   - Check RLS policies

3. **File Download Failures**
   - Check network connectivity
   - Verify file exists in bucket

### Recovery

```bash
# Check logs for errors
tail -f logs/job-sync-*.log

# Re-run failed sync
npm run job-sync

# Check notification queue
psql -d your_database -c "SELECT * FROM job_notifications WHERE status = 'failed';"
```

## Integration with Scraper Server

The scraper server should:

1. **Upload Files**: Save company job files to `company-jobs` bucket
2. **File Naming**: Use format `{company_name}.json`
3. **File Structure**: Follow the JSON format specified above
4. **Error Handling**: Log upload failures and retry logic

### Example Scraper Upload
```javascript
const { data, error } = await supabase.storage
  .from('company-jobs')
  .upload(`${companyName}.json`, JSON.stringify(companyData))
```

## Performance Considerations

- **File Size**: Keep company files under 10MB
- **Sync Frequency**: Run every 6-12 hours
- **Memory Usage**: Process companies sequentially
- **Error Recovery**: Implement retry logic for failed downloads

## Security

- **Service Role**: Used only for sync operations
- **Private Bucket**: Company files not publicly accessible
- **RLS Policies**: Proper access control on notifications table
- **Log Rotation**: Implement log cleanup for old files 