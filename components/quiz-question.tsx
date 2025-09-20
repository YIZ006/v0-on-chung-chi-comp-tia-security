"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import type { Question } from "@/lib/question-service"

interface QuizQuestionProps {
  question: Question
  currentIndex: number
  totalQuestions: number
  onAnswer: (selectedAnswer: string, isCorrect: boolean) => void
  timeRemaining?: number
}

export function QuizQuestion({ question, currentIndex, totalQuestions, onAnswer, timeRemaining }: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return

    const correct = answer === question.answer
    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setShowResult(true)

    // Auto advance after 2 seconds
    setTimeout(() => {
      onAnswer(answer, correct)
      setSelectedAnswer(null)
      setShowResult(false)
    }, 2000)
  }

  const progress = ((currentIndex + 1) / totalQuestions) * 100

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress and timer */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Câu {currentIndex + 1} / {totalQuestions}
          </span>
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Domain badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {question.domain}
        </Badge>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="text-lg font-medium leading-relaxed text-balance">{question.question}</div>

          {/* Answer choices */}
          <div className="space-y-3">
            {question.choices.map((choice, index) => {
              const isSelected = selectedAnswer === choice
              const isCorrectAnswer = choice === question.answer
              let buttonVariant: "default" | "outline" | "secondary" = "outline"
              let buttonClass = ""

              if (showResult) {
                if (isCorrectAnswer) {
                  buttonVariant = "default"
                  buttonClass = "bg-green-500 hover:bg-green-600 text-white border-green-500"
                } else if (isSelected && !isCorrectAnswer) {
                  buttonVariant = "outline"
                  buttonClass = "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                }
              } else if (isSelected) {
                buttonVariant = "secondary"
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={`w-full justify-start text-left h-auto p-4 ${buttonClass}`}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={showResult}
                >
                  <div className="flex items-start gap-3 w-full">
                    <span className="font-semibold text-sm mt-0.5 min-w-[24px]">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1 text-sm leading-relaxed">{choice}</span>
                    {showResult && isCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                    {showResult && isSelected && !isCorrectAnswer && (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Result feedback */}
          {showResult && (
            <div className="text-center space-y-2">
              {isCorrect ? (
                <div className="text-green-600 font-medium flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Chính xác!
                </div>
              ) : (
                <div className="text-red-600 font-medium flex items-center justify-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Sai rồi. Đáp án đúng là: {question.answer}
                </div>
              )}
              <div className="text-sm text-muted-foreground">Tự động chuyển câu tiếp theo...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
