"use client"

import { useState } from "react"
import Image from "next/image"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ReceiptImagePreviewProps {
  imageUrl?: string
}

export function ReceiptImagePreview({ imageUrl }: ReceiptImagePreviewProps) {
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  console.log("Rendering ReceiptImagePreview with imageUrl:", imageUrl)

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  if (!imageUrl) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">画像がありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">レシート画像</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto rounded-lg border border-border bg-muted/30">
          <div className="flex min-h-[400px] items-center justify-center p-4">
            <div
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                transition: "transform 0.3s ease",
              }}
            >
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="レシート画像"
                width={400}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
