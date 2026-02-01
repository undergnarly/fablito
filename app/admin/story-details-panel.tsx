"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  X,
  BookOpen,
  User,
  Palette,
  FileText,
  ImageIcon,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface StoryPage {
  text: string
  imagePrompt?: string
}

interface StoryDetails {
  id: string
  title: string
  childName?: string
  childAge?: number
  theme?: string
  status: string
  visibility: string
  createdAt: string
  completedAt?: string
  style?: {
    language: string
    illustration?: string
  }
  storyContent?: {
    title: string
    pages: StoryPage[]
    moral: string
  }
  images?: string[]
  characterReference?: string
  textStory?: string
}

interface StoryDetailsPanelProps {
  story: StoryDetails | null
  open: boolean
  onClose: () => void
}

export default function StoryDetailsPanel({ story, open, onClose }: StoryDetailsPanelProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!story) return null

  const pages = story.storyContent?.pages || []
  const images = story.images || []

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedPrompt(index)
    setTimeout(() => setCopiedPrompt(null), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {story.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content & Prompts</TabsTrigger>
            <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
            <TabsTrigger value="debug">Debug Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Character Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {story.childName || "N/A"}</div>
                    <div><strong>Age:</strong> {story.childAge || "N/A"}</div>
                    <div><strong>Theme:</strong> {story.theme || "N/A"}</div>
                    {story.textStory && (
                      <div>
                        <strong>Parent's Story:</strong>
                        <p className="mt-1 p-2 bg-muted rounded text-xs">{story.textStory}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Style & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Language:</strong> {story.style?.language || "N/A"}</div>
                    <div><strong>Illustration:</strong> {story.style?.illustration || "N/A"}</div>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge variant={story.status === "complete" ? "default" : story.status === "failed" ? "destructive" : "secondary"}>
                        {story.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Visibility:</strong>
                      {story.visibility === "unlisted" ? (
                        <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" />Unlisted</Badge>
                      ) : (
                        <Badge variant="default"><Eye className="h-3 w-3 mr-1" />Public</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timestamps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Created:</strong> {formatDate(story.createdAt)}</div>
                    <div><strong>Completed:</strong> {story.completedAt ? formatDate(story.completedAt) : "N/A"}</div>
                    <div><strong>ID:</strong> <code className="text-xs bg-muted px-1 rounded">{story.id}</code></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Story Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Pages:</strong> {pages.length}</div>
                    <div><strong>Images:</strong> {images.length}</div>
                    {story.storyContent?.moral && (
                      <div>
                        <strong>Moral:</strong>
                        <p className="mt-1 p-2 bg-muted rounded text-xs italic">"{story.storyContent.moral}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Character Reference Preview */}
                {story.characterReference && (
                  <Card className="col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Character Reference Image
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                          <Image
                            src={`data:image/png;base64,${story.characterReference.substring(0, 100)}...` !== story.characterReference
                              ? `data:image/png;base64,${story.characterReference}`
                              : story.characterReference}
                            alt="Character reference"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        This image is used as reference for character consistency
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Content & Prompts Tab */}
          <TabsContent value="content" className="mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {pages.map((page, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Page {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Story Text:</div>
                        <p className="p-2 bg-muted rounded text-sm">{page.text}</p>
                      </div>
                      {page.imagePrompt && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Image Prompt:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => copyToClipboard(page.imagePrompt!, index)}
                            >
                              {copiedPrompt === index ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <p className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs font-mono whitespace-pre-wrap">
                            {page.imagePrompt}
                          </p>
                        </div>
                      )}
                      {images[index] && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <div className="relative w-16 h-16 rounded overflow-hidden">
                            <Image
                              src={images[index]}
                              alt={`Page ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">Generated image for this page</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="mt-4">
            <div className="h-[60vh] flex flex-col">
              {images.length > 0 ? (
                <>
                  {/* Main Image Display */}
                  <div className="flex-1 relative bg-black/5 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={images[currentImageIndex]}
                      alt={`Image ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                    {/* Navigation */}
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        className="rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={nextImage}
                        disabled={currentImageIndex === images.length - 1}
                        className="rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <ScrollArea className="h-24">
                    <div className="flex gap-2 p-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                            index === currentImageIndex ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Debug Info Tab */}
          <TabsContent value="debug" className="mt-4">
            <ScrollArea className="h-[60vh]">
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(story, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
