"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Home, BookOpen, Brain, BarChart3, Shield } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    icon: BookOpen,
  },
  {
    name: "Quiz",
    href: "/quiz",
    icon: Brain,
  },
  {
    name: "Tiến độ",
    href: "/progress",
    icon: BarChart3,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">CompTIA Security+</span>
            <Badge variant="secondary" className="text-xs">
              SY0-701
            </Badge>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn("flex items-center gap-2", isActive && "bg-primary text-primary-foreground")}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
