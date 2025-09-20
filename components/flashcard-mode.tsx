"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Flashcard } from "./flashcard"
import { questionService, type Question, DOMAIN_WEIGHTS } from "@/lib/question-service"
import { progressService } from "@/lib/progress-service"
import { BookOpen, RotateCcw, Shuffle } from "lucide-react"

export function FlashcardMode() {
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [studiedCount, setStudiedCount] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  const loadQuestions = (domain: string) => {
    let newQuestions: Question[]

    if (domain === "all") {
      newQuestions = questionService.getAllQuestions()
    } else {
      newQuestions = questionService.getQuestionsByDomain(domain)
    }

    // Shuffle questions
    const shuffled = [...newQuestions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setStudiedCount(0)
  }

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain)
    setIsStarted(false)
  }

  const handleStart = () => {
    loadQuestions(selectedDomain)
    setIsStarted(true)
  }

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled)
    setCurrentIndex(0)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleStudied = () => {
    setStudiedCount((prev) => prev + 1)
    progressService.updateFlashcardProgress()
  }

  const handleReset = () => {
    setIsStarted(false)
    setCurrentIndex(0)
    setStudiedCount(0)
  }

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6 text-primary" />
              Chế độ Flashcard
            </CardTitle>
            <p className="text-muted-foreground">Học từng câu hỏi một cách chi tiết với flashcards tương tác</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Chọn domain để học:</label>
              <Select value={selectedDomain} onValueChange={handleDomainChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả domains</SelectItem>
                  {DOMAIN_WEIGHTS.map((domain) => (
                    <SelectItem key={domain.name} value={domain.name}>
                      {domain.name} ({domain.weight}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Domain stats preview */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Thống kê câu hỏi:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questionService.getDomainStats().map((stat) => (
                  <div key={stat.domain} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium truncate">{stat.domain}</div>
                      <div className="text-muted-foreground">{stat.weight}% trọng số</div>
                    </div>
                    <Badge variant="outline">{stat.total} câu</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleStart} className="w-full" size="lg">
              Bắt đầu học Flashcard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Không có câu hỏi nào cho domain này.</p>
            <Button onClick={handleReset} className="mt-4">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Flashcard Learning</h2>
          <p className="text-muted-foreground">
            {selectedDomain === "all" ? "Tất cả domains" : selectedDomain} • {studiedCount} thẻ đã học
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShuffle} size="sm">
            <Shuffle className="h-4 w-4 mr-2" />
            Trộn bài
          </Button>
          <Button variant="outline" onClick={handleReset} size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Kết thúc
          </Button>
        </div>
      </div>

      {/* Flashcard component */}
      <Flashcard
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        totalCards={questions.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onStudied={handleStudied}
      />
    </div>
  )
}
