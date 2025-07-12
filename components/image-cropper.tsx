"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Crop, RotateCw, Check, X, ZoomIn, ZoomOut } from "lucide-react"

interface ImageCropperProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  aspectRatio?: number
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageCropper({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete, 
  aspectRatio = 1 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 80, height: 80 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = imageRef.current
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()

    // Calculate actual crop coordinates
    const scaleX = image.naturalWidth / imageRect.width
    const scaleY = image.naturalHeight / imageRect.height

    const cropX = (crop.x / 100) * imageRect.width * scaleX
    const cropY = (crop.y / 100) * imageRect.height * scaleY
    const cropWidth = (crop.width / 100) * imageRect.width * scaleX
    const cropHeight = (crop.height / 100) * imageRect.height * scaleY

    // Set canvas size
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply rotation
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw cropped image
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    )

    ctx.restore()

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob)
        onClose()
      }
    }, 'image/jpeg', 0.9)
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setDragStart({ x, y })
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    const deltaX = x - dragStart.x
    const deltaY = y - dragStart.y
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY))
    }))
    
    setDragStart({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0] / 100)
  }

  const handleCropSizeChange = (value: number[]) => {
    const newSize = value[0]
    setCrop(prev => ({
      ...prev,
      width: newSize,
      height: newSize
    }))
  }

  useEffect(() => {
    if (isOpen) {
      // Reset crop to center when opening
      setCrop({ x: 10, y: 10, width: 80, height: 80 })
      setRotation(0)
      setZoom(1)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Crop Profile Picture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Container */}
          <div 
            ref={containerRef}
            className="relative overflow-hidden border rounded-lg bg-gray-100 min-h-[400px] flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="max-w-full max-h-96 object-contain"
              style={{ 
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            />
            
            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Zoom
              </label>
              <Slider
                value={[zoom * 100]}
                onValueChange={handleZoomChange}
                max={200}
                min={50}
                step={10}
                className="w-full"
              />
            </div>

            {/* Crop Size Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Crop Size</label>
              <Slider
                value={[crop.width]}
                onValueChange={handleCropSizeChange}
                max={90}
                min={30}
                step={5}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRotate}
                  variant="outline"
                  size="sm"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleCrop}
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Crop & Save
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 