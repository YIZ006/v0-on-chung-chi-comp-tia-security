"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { QuizQuestion } from "./quiz-question"
import { QuizResults } from "./quiz-results"
import { questionService, type Question, DOMAIN_WEIGHTS } from "@/lib/question-service"
import { progressService, type QuizResult } from "@/lib/progress-service"
import { Brain, Shuffle, Target } from "lucide-react"

type QuizState = "setup" | "active" | "results"

export function QuizMode() {
  const [quizState, setQuizState] = useState<QuizState>("setup")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ question: Question; selectedAnswer: string; isCorrect: boolean }[]>([])
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 50,
    domain: "all",
    timedMode: false,
    timeLimit: 90, // minutes
  })
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

  // Timer effect
  useEffect(() => {
    if (quizState === "active" && quizSettings.timedMode && timeRemaining !== undefined) {
      if (timeRemaining <= 0) {
        handleQuizComplete()
        return
      }

      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev !== undefined ? prev - 1 : undefined))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizState, quizSettings.timedMode, timeRemaining])

  const handleStartQuiz = () => {
    let quizQuestions: Question[]

    if (quizSettings.domain === "all") {
      quizQuestions = questionService.getRandomQuestions(quizSettings.questionCount)
    } else {
      const domainQuestions = questionService.getQuestionsByDomain(quizSettings.domain)
      const shuffled = [...domainQuestions].sort(() => Math.random() - 0.5)
      quizQuestions = shuffled.slice(0, Math.min(quizSettings.questionCount, domainQuestions.length))
    }

    setQuestions(quizQuestions)
    setCurrentIndex(0)
    setAnswers([])
    setQuizState("active")

    if (quizSettings.timedMode) {
      setTimeRemaining(quizSettings.timeLimit * 60) // Convert to seconds
    }
  }

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    const newAnswer = {
      question: questions[currentIndex],
      selectedAnswer,
      isCorrect,
    }

    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleQuizComplete(newAnswers)
    }
  }

  const handleQuizComplete = (finalAnswers = answers) => {
    // Calculate domain breakdown
    const domainBreakdown: { [domain: string]: { correct: number; total: number } } = {}

    finalAnswers.forEach((answer) => {
      const domain = answer.question.domain
      if (!domainBreakdown[domain]) {
        domainBreakdown[domain] = { correct: 0, total: 0 }
      }
      domainBreakdown[domain].total += 1
      if (answer.isCorrect) {
        domainBreakdown[domain].correct += 1
      }
    })

    const result: QuizResult = {
      score: finalAnswers.filter((a) => a.isCorrect).length,
      totalQuestions: finalAnswers.length,
      domainBreakdown,
      date: new Date().toISOString(),
    }

    setQuizResult(result)
    progressService.saveQuizResult(result)
    setQuizState("results")
  }

  const handleRetakeQuiz = () => {
    setQuizState("setup")
    setCurrentIndex(0)
    setAnswers([])
    setTimeRemaining(undefined)
    setQuizResult(null)
  }

  const handleGoHome = () => {
    handleRetakeQuiz()
  }

  if (quizState === "results" && quizResult) {
    return <QuizResults result={quizResult} onRetakeQuiz={handleRetakeQuiz} onGoHome={handleGoHome} />
  }

  if (quizState === "active" && questions.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">CompTIA Security+ Quiz</h2>
          <p className="text-muted-foreground">
            {quizSettings.domain === "all" ? "Tất cả domains" : quizSettings.domain}
            {quizSettings.timedMode && timeRemaining !== undefined && (
              <span>
                {" "}
                • Thời gian còn lại: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            )}
          </p>
        </div>

        <QuizQuestion
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          timeRemaining={quizSettings.timedMode ? timeRemaining : undefined}
        />
      </div>
    )
  }

  // Setup screen
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            Quiz CompTIA Security+
          </CardTitle>
          <p className="text-muted-foreground">Kiểm tra kiến thức với quiz trắc nghiệm theo đúng tỷ lệ domain</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz settings */}
          <div className="space-y-4">
            {/* Question count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Số câu hỏi:</label>
              <Select
                value={quizSettings.questionCount.toString()}
                onValueChange={(value) => setQuizSettings({ ...quizSettings, questionCount: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 câu (Nhanh)</SelectItem>
                  <SelectItem value="25">25 câu (Trung bình)</SelectItem>
                  <SelectItem value="50">50 câu (Đầy đủ)</SelectItem>
                  <SelectItem value="90">90 câu (Thi thật)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Domain selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain:</label>
              <Select
                value={quizSettings.domain}
                onValueChange={(value) => setQuizSettings({ ...quizSettings, domain: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả domains (theo trọng số)</SelectItem>
                  {DOMAIN_WEIGHTS.map((domain) => (
                    <SelectItem key={domain.name} value={domain.name}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timed mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Chế độ có thời gian</label>
                <p className="text-xs text-muted-foreground">Giới hạn thời gian làm bài</p>
              </div>
              <Switch
                checked={quizSettings.timedMode}
                onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, timedMode: checked })}
              />
            </div>

            {/* Time limit */}
            {quizSettings.timedMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Thời gian (phút):</label>
                <Select
                  value={quizSettings.timeLimit.toString()}
                  onValueChange={(value) => setQuizSettings({ ...quizSettings, timeLimit: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 phút</SelectItem>
                    <SelectItem value="60">60 phút</SelectItem>
                    <SelectItem value="90">90 phút (Thi thật)</SelectItem>
                    <SelectItem value="120">120 phút</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Domain preview */}
          <div className="space-y-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Phân bổ câu hỏi theo domain:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DOMAIN_WEIGHTS.map((domain) => {
                const questionsInDomain = Math.round((quizSettings.questionCount * domain.weight) / 100)
                return (
                  <div key={domain.name} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                    <span className="truncate">{domain.name}</span>
                    <Badge variant="outline">
                      {quizSettings.domain === "all" ? `~${questionsInDomain}` : domain.weight + "%"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <Button onClick={handleStartQuiz} className="w-full" size="lg">
            <Shuffle className="h-4 w-4 mr-2" />
            Bắt đầu Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
