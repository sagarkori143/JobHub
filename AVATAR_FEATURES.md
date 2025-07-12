# Avatar Features

## Overview
JobHub now includes comprehensive avatar functionality that allows users to upload profile pictures and displays default avatars when no image is uploaded.

## Features

### 1. Default Avatar System
- **Component**: `DefaultAvatar` (`components/default-avatar.tsx`)
- **Functionality**: Generates colorful avatars with user initials
- **Colors**: 10 different colors based on user name hash
- **Sizes**: sm, md, lg, xl (8px, 10px, 12px, 16px)

### 2. User Avatar Component
- **Component**: `UserAvatar` (`components/user-avatar.tsx`)
- **Functionality**: Displays uploaded images or falls back to default avatars
- **Error Handling**: Graceful fallback if image fails to load
- **Props**: `user` object with name and avatar, size, className

### 3. Profile Image Upload
- **Component**: `ProfileImageUpload` (`components/profile-image-upload.tsx`)
- **Features**:
  - Drag and drop support
  - File type validation (images only)
  - Size limit (5MB)
  - Preview functionality
  - Remove image option
  - Loading states

### 4. API Endpoints
- **Upload**: `POST /api/upload/avatar`
- **Remove**: `DELETE /api/upload/avatar`
- **Storage**: Supabase Storage bucket 'avatars'
- **Database**: Updates `user_profiles.avatar_url` column

### 5. Profile Settings Page
- **Route**: `/profile`
- **Features**:
  - Avatar upload/remove
  - Basic profile information
  - Account details
  - Job preferences link

## Usage Examples

### Basic Avatar Display
```tsx
import { UserAvatar } from "@/components/user-avatar"

<UserAvatar user={user} size="md" />
```

### Default Avatar Only
```tsx
import { DefaultAvatar } from "@/components/default-avatar"

<DefaultAvatar name="John Doe" size="lg" />
```

### Profile Upload Component
```tsx
import { ProfileImageUpload } from "@/components/profile-image-upload"

<ProfileImageUpload
  currentAvatar={user.avatar}
  userName={user.name}
  onImageUpload={handleUpload}
  onImageRemove={handleRemove}
/>
```

## Database Schema

### Migration: `scripts/009_add_avatar_url_to_user_profiles.sql`
```sql
ALTER TABLE user_profiles 
ADD COLUMN avatar_url TEXT;

COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user profile image stored in Supabase Storage';
```

## Auth Context Integration

The auth context includes avatar management functions:
- `uploadAvatar(file: File)`: Upload new avatar
- `removeAvatar()`: Remove current avatar
- Automatic avatar URL updates in user state

## Storage Configuration

### Supabase Storage Bucket: 'avatars'
- **Public Access**: Enabled for avatar URLs
- **File Naming**: `{userId}-{timestamp}.{extension}`
- **Size Limit**: 5MB per file
- **Allowed Types**: image/*

## Components Updated

1. **Sidebar**: Uses UserAvatar for user display
2. **Profile Modal**: Shows avatar and links to full profile page
3. **Main Page**: Welcome section with user avatar
4. **Profile Page**: Complete avatar management interface

## Error Handling

- Image load failures fallback to default avatars
- Upload errors show toast notifications
- File validation prevents invalid uploads
- Graceful degradation for missing images

## Future Enhancements

- Image cropping functionality
- Multiple avatar options
- Avatar templates/themes
- Social media integration
- Avatar analytics 