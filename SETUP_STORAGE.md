# Supabase Storage Setup for Avatars

## Prerequisites
- Access to your Supabase project dashboard
- Database admin privileges

## Step 1: Create the Storage Bucket

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set bucket name: `avatars`
5. Check **Public bucket** (for public read access)
6. Click **Create bucket**

### Option B: Using SQL (Recommended)
Run the SQL script in your Supabase SQL editor:

```sql
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

## Step 2: Set Up Storage Policies

Run these policies in your Supabase SQL editor:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

## Step 3: Add Database Column

Run the migration script:

```sql
-- Add avatar_url column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN avatar_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user profile image stored in Supabase Storage';
```

## Step 4: Verify Setup

1. **Test Upload**: Try uploading an avatar through the profile page
2. **Check Storage**: Verify files appear in the Storage dashboard
3. **Test URLs**: Ensure avatar URLs are publicly accessible

## Troubleshooting

### "Bucket not found" Error
- Ensure the bucket name is exactly `avatars` (lowercase)
- Check that the bucket is created in the correct project
- Verify storage is enabled for your project

### Permission Errors
- Ensure RLS (Row Level Security) is enabled
- Check that storage policies are correctly applied
- Verify user authentication is working

### File Upload Fails
- Check file size (max 5MB)
- Verify file type (images only)
- Ensure network connectivity

## Security Notes

- **Public Read Access**: Avatar URLs are publicly accessible for display
- **User-Specific Uploads**: Users can only upload to their own folder
- **File Validation**: Server-side validation prevents malicious uploads
- **Size Limits**: 5MB limit prevents abuse

## File Structure

Uploaded files are stored as:
```
avatars/
├── {user-id}-{timestamp}.jpg
├── {user-id}-{timestamp}.png
└── ...
```

## API Endpoints

- `POST /api/upload/avatar` - Upload new avatar
- `DELETE /api/upload/avatar` - Remove avatar

Both endpoints require authentication and validate file types/sizes. 