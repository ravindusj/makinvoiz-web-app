"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Download, Undo2, Edit3 } from "lucide-react"

interface SignaturePadProps {
  value?: string
  onChange?: (signature: string) => void
  width?: number
  height?: number
  disabled?: boolean
  className?: string
}

export function SignaturePad({
  value,
  onChange,
  width = 400,
  height = 200,
  disabled = false,
  className = ""
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const [canvasSize, setCanvasSize] = useState({ width, height })

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (typeof window !== 'undefined') {
        const containerWidth = Math.min(width, window.innerWidth - 80)
        setCanvasSize({ 
          width: containerWidth, 
          height: height * (containerWidth / width) 
        })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [width, height])

  // Initialize canvas and load existing signature
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas style for crisp lines
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2

    // Load existing signature if provided
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height)
        setIsEmpty(false)
      }
      img.src = value
    } else {
      // Clear canvas and set white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
      setIsEmpty(true)
    }
  }, [value])

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL()
    setHistory(prev => [...prev.slice(-9), dataURL]) // Keep last 10 states
  }, [])

  // Get coordinates for both mouse and touch events
  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvasSize.width / rect.width
    const scaleY = canvasSize.height / rect.height

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
  }, [])

  // Start drawing
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return

    e.preventDefault()
    saveToHistory()
    setIsDrawing(true)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [disabled, getCoordinates, saveToHistory])

  // Continue drawing
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return

    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing, disabled, getCoordinates])

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return

    setIsDrawing(false)
    setIsEmpty(false)

    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL()
    onChange?.(dataURL)
  }, [isDrawing, onChange])

  // Clear signature
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
    setIsEmpty(true)
    setHistory([])
    onChange?.("")
  }, [onChange])

  // Undo last action
  const undoSignature = useCallback(() => {
    if (history.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const lastState = history[history.length - 1]
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
      ctx.drawImage(img, 0, 0)

      const dataURL = canvas.toDataURL()
      onChange?.(dataURL)
      setIsEmpty(false)
    }
    img.src = lastState

    setHistory(prev => prev.slice(0, -1))
  }, [history, onChange])

  // Download signature
  const downloadSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return

    const link = document.createElement("a")
    link.download = "signature.png"
    link.href = canvas.toDataURL()
    link.click()
  }, [isEmpty])

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={`
            border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-crosshair
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            touch-none select-none w-full max-w-full
          `}
          style={{ maxWidth: '100%', height: 'auto' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-slate-400">
              <Edit3 className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">Draw your signature here</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={clearSignature}
          variant="outline"
          size="sm"
          disabled={disabled || isEmpty}
          className="flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>

        <Button
          onClick={undoSignature}
          variant="outline"
          size="sm"
          disabled={disabled || history.length === 0}
          className="flex items-center gap-1"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Undo</span>
        </Button>

        <Button
          onClick={downloadSignature}
          variant="outline"
          size="sm"
          disabled={disabled || isEmpty}
          className="flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Draw your signature using mouse or touch. The signature will be saved automatically.
      </p>
    </div>
  )
}
