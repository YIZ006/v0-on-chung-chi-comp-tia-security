"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import type { Question } from "@/lib/question-service"

interface FlashcardProps {
  question: Question
  currentIndex: number
  totalCards: number
  onNext: () => void
  onPrevious: () => void
  onStudied: () => void
}

export function Flashcard({ question, currentIndex, totalCards, onNext, onPrevious, onStudied }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showChoices, setShowChoices] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      onStudied()
    }
  }

  const handleNext = () => {
    setIsFlipped(false)
    setShowChoices(false)
    onNext()
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setShowChoices(false)
    onPrevious()
  }

  const progress = ((currentIndex + 1) / totalCards) * 100

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Thẻ {currentIndex + 1} / {totalCards}
          </span>
          <span>{Math.round(progress)}% hoàn thành</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Domain badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {question.domain}
        </Badge>
      </div>

      {/* Flashcard */}
      <Card className="min-h-[400px] cursor-pointer transition-all duration-300 hover:shadow-lg" onClick={handleFlip}>
        <CardContent className="p-8 flex flex-col justify-center items-center text-center space-y-6">
          {!isFlipped ? (
            // Question side
            <div className="space-y-6">
              <div className="text-lg font-medium leading-relaxed text-balance">{question.question}</div>

              {showChoices && (
                <div className="space-y-3 w-full">
                  {question.choices.map((choice, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-left text-sm">
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {choice}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowChoices(!showChoices)
                  }}
                  className="flex items-center gap-2"
                >
                  {showChoices ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showChoices ? "Ẩn lựa chọn" : "Hiện lựa chọn"}
                </Button>
                <span>Nhấn để xem đáp án</span>
              </div>
            </div>
          ) : (
            // Answer side
            <div className="space-y-6">
              <div className="text-xl font-semibold text-primary">Đáp án đúng:</div>
              <div className="text-lg font-medium bg-accent/20 p-4 rounded-lg border-l-4 border-accent">
                {question.answer}
              </div>
              <div className="text-sm text-muted-foreground">Nhấn để quay lại câu hỏi</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setIsFlipped(false)
            setShowChoices(false)
          }}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset thẻ
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="flex items-center gap-2 bg-transparent"
        >
          Tiếp
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
