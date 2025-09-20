export interface StudyProgress {
  totalQuizzes: number
  averageScore: number
  domainScores: { [domain: string]: number[] }
  flashcardsStudied: number
  lastStudyDate: string
}

export interface QuizResult {
  score: number
  totalQuestions: number
  domainBreakdown: { [domain: string]: { correct: number; total: number } }
  date: string
}

export class ProgressService {
  private readonly STORAGE_KEY = "comptia-security-progress"

  getProgress(): StudyProgress {
    if (typeof window === "undefined") {
      return this.getDefaultProgress()
    }

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) {
      return this.getDefaultProgress()
    }

    try {
      return JSON.parse(stored)
    } catch {
      return this.getDefaultProgress()
    }
  }

  private getDefaultProgress(): StudyProgress {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      domainScores: {},
      flashcardsStudied: 0,
      lastStudyDate: new Date().toISOString(),
    }
  }

  saveQuizResult(result: QuizResult): void {
    if (typeof window === "undefined") return

    const progress = this.getProgress()

    progress.totalQuizzes += 1
    progress.averageScore = (progress.averageScore * (progress.totalQuizzes - 1) + result.score) / progress.totalQuizzes
    progress.lastStudyDate = result.date

    // Update domain scores
    Object.entries(result.domainBreakdown).forEach(([domain, stats]) => {
      if (!progress.domainScores[domain]) {
        progress.domainScores[domain] = []
      }
      const domainScore = (stats.correct / stats.total) * 100
      progress.domainScores[domain].push(domainScore)
    })

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress))
  }

  updateFlashcardProgress(): void {
    if (typeof window === "undefined") return

    const progress = this.getProgress()
    progress.flashcardsStudied += 1
    progress.lastStudyDate = new Date().toISOString()

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress))
  }

  getWeakDomains(): string[] {
    const progress = this.getProgress()
    const domainAverages: { domain: string; average: number }[] = []

    Object.entries(progress.domainScores).forEach(([domain, scores]) => {
      if (scores.length > 0) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
        domainAverages.push({ domain, average })
      }
    })

    return domainAverages
      .filter((d) => d.average < 70) // Below 70% considered weak
      .sort((a, b) => a.average - b.average)
      .map((d) => d.domain)
  }
}

export const progressService = new ProgressService()
