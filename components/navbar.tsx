"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, LogOut, Settings, User, Receipt, CreditCard, Calculator } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"

// Swapping Logo Component
const SwappingLogo = () => {
  const [currentIcon, setCurrentIcon] = useState(0)
  const icons = [Receipt, CreditCard, FileText, Calculator]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length)
    }, 2000) // Change icon every 2 seconds
    
    return () => clearInterval(interval)
  }, [])

  const IconComponent = icons[currentIcon]

  return (
    <div className="relative w-8 h-8 bg-cyan-600 rounded-sm flex items-center justify-center overflow-hidden">
      <IconComponent
        key={currentIcon}
        className="w-5 h-5 text-white transition-all duration-500 ease-in-out transform hover:scale-110 animate-fade-in"
      />
    </div>
  )
}

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  // On mobile, only show navbar on home page
  if (isMobile && pathname !== "/") {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColors = (seed: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-pink-100", text: "text-pink-700" },
      { bg: "bg-indigo-100", text: "text-indigo-700" },
      { bg: "bg-emerald-100", text: "text-emerald-700" },
      { bg: "bg-orange-100", text: "text-orange-700" },
      { bg: "bg-cyan-100", text: "text-cyan-700" },
      { bg: "bg-rose-100", text: "text-rose-700" },
    ]
    
    // Generate a consistent index based on the seed string
    const total = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = total % colors.length
    return colors[index]
  }

  if (!user) return null

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <SwappingLogo />
          <span className="font-semibold text-slate-800">Invoice Manager</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 hidden md:block">
            Welcome, {user.user_metadata?.full_name || user.email}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${getAvatarColors(user.user_metadata?.full_name || user.email || "U").bg} ${getAvatarColors(user.user_metadata?.full_name || user.email || "U").text}`}>
                    {getInitials(user.user_metadata?.full_name || user.email || "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {user.user_metadata?.company_name && (
                    <p className="text-xs leading-none text-muted-foreground">{user.user_metadata.company_name}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-red-50 group">
                <LogOut className="mr-2 h-4 w-4 group-hover:text-red-600" />
                <span className="group-hover:text-red-600">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
