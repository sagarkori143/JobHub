"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "./user-avatar"
import { DefaultAvatar } from "./default-avatar"
import { ImageCropper } from "./image-cropper"
import { Upload, X, Camera, Crop, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { cropToSquare } from "@/utils/image-utils"

interface ProfileImageUploadProps {
  currentAvatar?: string | null
  userName: string
  onImageUpload: (file: File) => Promise<void>
  onImageRemove: () => Promise<void>
  className?: string
}

export function ProfileImageUpload({ 
  currentAvatar, 
  userName, 
  onImageUpload, 
  onImageRemove,
  className 
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB')
      return
    }

    // Store selected file and create preview
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setOriginalImageUrl(imageUrl)
      setPreviewUrl(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadImage = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      await onImageUpload(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
      setOriginalImageUrl(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], selectedFile?.name || 'cropped-image.jpg', {
      type: 'image/jpeg'
    })
    
    setSelectedFile(croppedFile)
    
    // Update preview with cropped image
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(croppedBlob)
  }

  const handleAutoCrop = async () => {
    if (!selectedFile) return

    try {
      const croppedBlob = await cropToSquare(selectedFile)
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: 'image/jpeg'
      })
      
      setSelectedFile(croppedFile)
      
      // Update preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(croppedBlob)
    } catch (error) {
      console.error('Error auto-cropping image:', error)
      alert('Failed to auto-crop image. Please try manual cropping.')
    }
  }

  const handleRemoveImage = async () => {
    setIsUploading(true)
    try {
      await onImageRemove()
      setPreviewUrl(null)
      setSelectedFile(null)
    } catch (error) {
      console.error('Error removing image:', error)
      alert('Failed to remove image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const displayAvatar = previewUrl || currentAvatar

  return (
    <Card className={cn("w-full max-w-xs", className)}>
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Avatar Display */}
          <div className="flex justify-center">
            <div className="relative">
              {displayAvatar ? (
                <div className="relative">
                  <img
                    src={displayAvatar}
                    alt={`${userName}'s avatar`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                  />
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <DefaultAvatar name={userName} size="lg" className="w-16 h-16" />
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-3 text-center transition-colors",
              isDragOver 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-1">
              <Camera className="w-6 h-6 mx-auto text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {displayAvatar ? "Change Profile Picture" : "Upload Profile Picture"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Drag and drop an image here, or click to browse
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Button - Only show when file is selected */}
          {selectedFile && (
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-600">
                Selected: {selectedFile.name}
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                <Button
                  onClick={handleAutoCrop}
                  disabled={isUploading}
                  size="sm"
                  variant="outline"
                >
                  <Square className="w-4 h-4 mr-1" />
                  Auto Crop
                </Button>
                <Button
                  onClick={() => setIsCropperOpen(true)}
                  disabled={isUploading}
                  size="sm"
                  variant="outline"
                >
                  <Crop className="w-4 h-4 mr-1" />
                  Manual Crop
                </Button>
                <Button
                  onClick={handleUploadImage}
                  disabled={isUploading}
                  size="sm"
                  variant="default"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />
        {/* Image Cropper Modal */}
        <ImageCropper
          isOpen={isCropperOpen}
          imageSrc={originalImageUrl || ""}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      </CardContent>
    </Card>
  )
} 