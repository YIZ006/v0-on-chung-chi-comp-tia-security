"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, BookOpen, Calendar } from "lucide-react"
import { progressService, type StudyProgress } from "@/lib/progress-service"

export function StudyStats() {
  const [progress, setProgress] = useState<StudyProgress | null>(null)

  useEffect(() => {
    setProgress(progressService.getProgress())
  }, [])

  if (!progress) {
    return null
  }

  const weakDomains = progressService.getWeakDomains()
  const averagePercentage = Math.round(progress.averageScore * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total quizzes */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{progress.totalQuizzes}</div>
              <div className="text-sm text-muted-foreground">Quiz đã làm</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">{averagePercentage}%</div>
              <div className="text-sm text-muted-foreground">Điểm trung bình</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flashcards studied */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{progress.flashcardsStudied}</div>
              <div className="text-sm text-muted-foreground">Flashcard đã học</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last study date */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium">{new Date(progress.lastStudyDate).toLocaleDateString("vi-VN")}</div>
              <div className="text-sm text-muted-foreground">Học lần cuối</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress overview */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Tiến độ học tập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Điểm trung bình tổng</span>
            <span className="font-semibold">{averagePercentage}%</span>
          </div>
          <Progress value={averagePercentage} className="h-2" />

          {weakDomains.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Cần cải thiện:</div>
              <div className="flex flex-wrap gap-2">
                {weakDomains.slice(0, 3).map((domain) => (
                  <Badge key={domain} variant="outline" className="border-yellow-400 text-yellow-600 text-xs">
                    {domain.split(" ").slice(-2).join(" ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
