"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudyStats } from "./study-stats"
import { DOMAIN_WEIGHTS, questionService } from "@/lib/question-service"
import { BookOpen, Brain, BarChart3, Target, Zap, Clock, Award } from "lucide-react"

export function StudyDashboard() {
  const domainStats = questionService.getDomainStats()
  const totalQuestions = domainStats.reduce((sum, stat) => sum + stat.total, 0)

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-balance">Ôn tập CompTIA Security+</h1>
        <p className="text-xl text-muted-foreground text-balance">
          Chuẩn bị cho kỳ thi chứng chỉ bảo mật với {totalQuestions} câu hỏi thực tế
        </p>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Phiên bản SY0-701
        </Badge>
      </div>

      {/* Study stats */}
      <StudyStats />

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Flashcards */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span>Flashcards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Học từng câu hỏi một cách chi tiết với flashcards tương tác. Phù hợp để ghi nhớ kiến thức.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>5-10 phút/session</span>
            </div>
            <Button asChild className="w-full">
              <Link href="/flashcards">Bắt đầu học Flashcard</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quiz */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              <span>Quiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Kiểm tra kiến thức với quiz trắc nghiệm theo đúng tỷ lệ domain của kỳ thi thật.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>10-90 câu hỏi</span>
            </div>
            <Button asChild className="w-full">
              <Link href="/quiz">Làm Quiz ngay</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <span>Tiến độ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Theo dõi kết quả học tập và phân tích điểm mạnh, điểm yếu để cải thiện.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Analytics chi tiết</span>
            </div>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/progress">Xem tiến độ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Domain overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Cấu trúc kỳ thi CompTIA Security+
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Kỳ thi gồm 6 domains chính với trọng số khác nhau. Hệ thống sẽ tự động tạo quiz theo đúng tỷ lệ này.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOMAIN_WEIGHTS.map((domain, index) => {
              const stat = domainStats.find((s) => s.domain === domain.name)
              return (
                <div key={domain.name} className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm leading-tight">{domain.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat?.total || 0} câu hỏi</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {domain.weight}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Study tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Gợi ý học tập hiệu quả
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Cho người mới bắt đầu:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bắt đầu với Flashcards để làm quen với thuật ngữ</li>
                <li>• Học từng domain một cách có hệ thống</li>
                <li>• Làm quiz ngắn (10-25 câu) để kiểm tra hiểu biết</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Chuẩn bị thi:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Làm quiz đầy đủ 50-90 câu thường xuyên</li>
                <li>• Tập trung vào các domain có điểm thấp</li>
                <li>• Sử dụng chế độ có thời gian để làm quen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
