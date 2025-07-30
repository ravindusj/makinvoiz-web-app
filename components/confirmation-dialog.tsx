"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "default"
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
      onClose()
    }
  }

  const getButtonStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
      default:
        return "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-32px)] sm:max-w-[425px] p-4 sm:p-6 rounded-xl">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            {variant === "danger" && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />}
            {variant === "warning" && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}
            <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm sm:text-base leading-normal">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2 mt-4 sm:mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base"
          >
            {cancelText}
          </Button>
          <Button
            className={`${getButtonStyle()} w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
