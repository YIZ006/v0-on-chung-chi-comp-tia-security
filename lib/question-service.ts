import questionsData from "../data/enhanced-questions.json"

export interface Question {
  domain: string
  question: string
  choices: string[]
  answer: string
}

export interface DomainWeight {
  name: string
  weight: number
  color: string
}

export const DOMAIN_WEIGHTS: DomainWeight[] = [
  { name: "Threats, Attacks and Vulnerabilities", weight: 12, color: "chart-1" },
  { name: "Identity and Access Management", weight: 22, color: "chart-2" },
  { name: "Technologies and Tools", weight: 15, color: "chart-3" },
  { name: "Risk Management", weight: 16, color: "chart-4" },
  { name: "Architecture and Design", weight: 14, color: "chart-5" },
  { name: "Cryptography and PKI", weight: 12, color: "chart-1" },
]

export class QuestionService {
  private questions: Question[] = questionsData

  getAllQuestions(): Question[] {
    return this.questions
  }

  getQuestionsByDomain(domain: string): Question[] {
    return this.questions.filter((q) => q.domain === domain)
  }

  getRandomQuestions(count: number): Question[] {
    const weightedQuestions: Question[] = []

    DOMAIN_WEIGHTS.forEach((domainWeight) => {
      const domainQuestions = this.getQuestionsByDomain(domainWeight.name)
      const questionsNeeded = Math.round((count * domainWeight.weight) / 100)

      // Randomly select questions from this domain
      const shuffled = [...domainQuestions].sort(() => Math.random() - 0.5)
      weightedQuestions.push(...shuffled.slice(0, Math.min(questionsNeeded, domainQuestions.length)))
    })

    // Fill remaining slots if needed
    const remaining = count - weightedQuestions.length
    if (remaining > 0) {
      const unusedQuestions = this.questions.filter((q) => !weightedQuestions.includes(q))
      const shuffled = [...unusedQuestions].sort(() => Math.random() - 0.5)
      weightedQuestions.push(...shuffled.slice(0, remaining))
    }

    // Final shuffle to mix domain order
    return weightedQuestions.sort(() => Math.random() - 0.5)
  }

  getDomainStats(): { domain: string; total: number; weight: number }[] {
    return DOMAIN_WEIGHTS.map((dw) => ({
      domain: dw.name,
      total: this.getQuestionsByDomain(dw.name).length,
      weight: dw.weight,
    }))
  }
}

export const questionService = new QuestionService()
