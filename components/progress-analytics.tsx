"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Target, BookOpen, Calendar, Award, AlertTriangle, BarChart3, PieChartIcon } from "lucide-react"
import { progressService, type StudyProgress } from "@/lib/progress-service"
import { DOMAIN_WEIGHTS } from "@/lib/question-service"

export function ProgressAnalytics() {
  const [progress, setProgress] = useState<StudyProgress | null>(null)
  const [selectedView, setSelectedView] = useState<"overview" | "domains" | "trends">("overview")

  useEffect(() => {
    setProgress(progressService.getProgress())
  }, [])

  if (!progress) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Đang tải dữ liệu tiến độ...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate domain averages
  const domainAverages = Object.entries(progress.domainScores).map(([domain, scores]) => {
    const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    const domainWeight = DOMAIN_WEIGHTS.find((d) => d.name === domain)
    return {
      domain: domain.split(" ").slice(-2).join(" "), // Shorten domain names for charts
      fullDomain: domain,
      average: Math.round(average),
      attempts: scores.length,
      weight: domainWeight?.weight || 0,
      color: domainWeight?.color || "chart-1",
    }
  })

  // Get weak domains
  const weakDomains = progressService.getWeakDomains()

  // Prepare trend data (last 10 quiz attempts)
  const trendData = Object.entries(progress.domainScores)
    .flatMap(([domain, scores]) =>
      scores.slice(-10).map((score, index) => ({
        attempt: index + 1,
        domain: domain.split(" ").slice(-2).join(" "),
        score: Math.round(score),
      })),
    )
    .sort((a, b) => a.attempt - b.attempt)

  // Pie chart data for domain distribution
  const pieData = domainAverages.map((domain) => ({
    name: domain.domain,
    value: domain.average,
    weight: domain.weight,
  }))

  const COLORS = ["#84cc16", "#15803d", "#ecfeff", "#475569", "#374151"]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{progress.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground">Quiz đã làm</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(progress.averageScore * 100)}%</div>
                <div className="text-sm text-muted-foreground">Điểm trung bình</div>
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {new Date(progress.lastStudyDate).toLocaleDateString("vi-VN")}
                </div>
                <div className="text-sm text-muted-foreground">Học lần cuối</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Tiến độ tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Điểm trung bình</span>
            <span className="font-semibold">{Math.round(progress.averageScore * 100)}%</span>
          </div>
          <Progress value={progress.averageScore * 100} className="h-3" />
          <div className="text-sm text-muted-foreground">
            {progress.averageScore >= 0.7 ? (
              <span className="text-green-600">Bạn đang có kết quả tốt! Tiếp tục duy trì.</span>
            ) : progress.averageScore >= 0.5 ? (
              <span className="text-yellow-600">Bạn đang tiến bộ. Hãy tập trung ôn tập thêm.</span>
            ) : (
              <span className="text-red-600">Cần cải thiện. Hãy ôn tập kỹ hơn các domain yếu.</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weak areas */}
      {weakDomains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Cần cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakDomains.slice(0, 3).map((domain) => {
              const domainData = domainAverages.find((d) => d.fullDomain === domain)
              return (
                <div
                  key={domain}
                  className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                >
                  <div>
                    <div className="font-medium text-sm">{domain}</div>
                    <div className="text-xs text-muted-foreground">{domainData?.attempts || 0} lần làm quiz</div>
                  </div>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                    {domainData?.average || 0}%
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderDomains = () => (
    <div className="space-y-6">
      {/* Domain performance chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất theo Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, "Điểm trung bình"]}
                  labelFormatter={(label: any) => {
                    const domain = domainAverages.find((d) => d.domain === label)
                    return domain?.fullDomain || label
                  }}
                />
                <Bar dataKey="average" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Domain details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domainAverages.map((domain) => (
          <Card key={domain.fullDomain}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{domain.fullDomain}</div>
                    <div className="text-xs text-muted-foreground">Trọng số: {domain.weight}%</div>
                  </div>
                  <Badge
                    variant={domain.average >= 70 ? "default" : "outline"}
                    className={domain.average >= 70 ? "bg-green-500" : "border-red-300 text-red-600"}
                  >
                    {domain.average}%
                  </Badge>
                </div>
                <Progress value={domain.average} className="h-2" />
                <div className="text-xs text-muted-foreground">{domain.attempts} lần làm quiz</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Score trend */}
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng điểm số</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attempt" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => [`${value}%`, "Điểm số"]} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Domain distribution pie chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Phân bố hiệu suất Domain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, "Điểm trung bình"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Phân tích tiến độ</h2>
          <p className="text-muted-foreground">Theo dõi kết quả học tập và xác định điểm cần cải thiện</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedView === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView("overview")}
          >
            Tổng quan
          </Button>
          <Button
            variant={selectedView === "domains" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView("domains")}
          >
            Domains
          </Button>
          <Button
            variant={selectedView === "trends" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView("trends")}
          >
            Xu hướng
          </Button>
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === "overview" && renderOverview()}
      {selectedView === "domains" && renderDomains()}
      {selectedView === "trends" && renderTrends()}
    </div>
  )
}
