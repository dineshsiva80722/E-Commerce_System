"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface FileUploadProps {
  onFileChange: (file: File | null) => void
  onUrlChange: (url: string) => void
  initialUrl?: string
  className?: string
}

export function FileUpload({ onFileChange, onUrlChange, initialUrl = "", className = "" }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>(initialUrl)
  const [inputUrl, setInputUrl] = useState<string>(initialUrl)
  const [useFile, setUseFile] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setUseFile(true)
      onFileChange(file)
      onUrlChange("")
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setInputUrl(url)
    setPreview(url)
    setUseFile(false)
    onFileChange(null)
    onUrlChange(url)
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview("")
    setInputUrl("")
    setUseFile(false)
    onFileChange(null)
    onUrlChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={triggerFileInput} className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            id="file-upload"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Or use image URL:</div>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={inputUrl}
          onChange={handleUrlChange}
          className="flex-1"
        />
      </div>

      {preview && (
        <div className="relative border rounded-md overflow-hidden">
          <div className="aspect-square relative">
            <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
