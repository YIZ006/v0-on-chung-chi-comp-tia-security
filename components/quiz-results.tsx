"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, TrendingUp, RotateCcw, Home } from "lucide-react"
import type { QuizResult } from "@/lib/progress-service"
import { DOMAIN_WEIGHTS } from "@/lib/question-service"

interface QuizResultsProps {
  result: QuizResult
  onRetakeQuiz: () => void
  onGoHome: () => void
}

export function QuizResults({ result, onRetakeQuiz, onGoHome }: QuizResultsProps) {
  const percentage = Math.round((result.score / result.totalQuestions) * 100)
  const passed = percentage >= 70 // CompTIA Security+ passing score is typically 750/900 (~83%), but we'll use 70% for practice

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Xuất sắc", variant: "default" as const, class: "bg-green-500" }
    if (score >= 80) return { text: "Tốt", variant: "secondary" as const, class: "bg-blue-500 text-white" }
    if (score >= 70) return { text: "Đạt", variant: "outline" as const, class: "border-yellow-500 text-yellow-600" }
    return { text: "Chưa đạt", variant: "outline" as const, class: "border-red-500 text-red-600" }
  }

  const scoreBadge = getScoreBadge(percentage)

  // Calculate domain performance
  const domainPerformance = Object.entries(result.domainBreakdown).map(([domain, stats]) => {
    const domainScore = Math.round((stats.correct / stats.total) * 100)
    const domainWeight = DOMAIN_WEIGHTS.find((d) => d.name === domain)?.weight || 0
    return {
      domain,
      score: domainScore,
      correct: stats.correct,
      total: stats.total,
      weight: domainWeight,
    }
  })

  // Find weak areas
  const weakAreas = domainPerformance.filter((d) => d.score < 70).sort((a, b) => a.score - b.score)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className={`h-12 w-12 ${passed ? "text-yellow-500" : "text-gray-400"}`} />
          </div>
          <CardTitle className="text-3xl">
            <span className={getScoreColor(percentage)}>{percentage}%</span>
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant={scoreBadge.variant} className={scoreBadge.class}>
              {scoreBadge.text}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            {result.score} / {result.totalQuestions} câu đúng
          </p>
        </CardHeader>
      </Card>

      {/* Domain Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Phân tích theo Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {domainPerformance.map((domain) => (
            <div key={domain.domain} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium text-sm">{domain.domain}</div>
                  <div className="text-xs text-muted-foreground">
                    Trọng số: {domain.weight}% • {domain.correct}/{domain.total} câu đúng
                  </div>
                </div>
                <div className={`font-semibold ${getScoreColor(domain.score)}`}>{domain.score}%</div>
              </div>
              <Progress value={domain.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Gợi ý cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Bạn nên tập trung ôn tập thêm các domain sau để cải thiện điểm số:
            </p>
            {weakAreas.map((domain) => (
              <div key={domain.domain} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-sm">{domain.domain}</div>
                  <div className="text-xs text-muted-foreground">Điểm hiện tại: {domain.score}%</div>
                </div>
                <Badge variant="outline" className="border-red-300 text-red-600">
                  Cần cải thiện
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRetakeQuiz} size="lg" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Làm lại Quiz
        </Button>
        <Button onClick={onGoHome} variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
          <Home className="h-4 w-4" />
          Về trang chủ
        </Button>
      </div>
    </div>
  )
}
