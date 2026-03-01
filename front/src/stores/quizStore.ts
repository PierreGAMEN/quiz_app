import { defineStore } from 'pinia'
import api from '../services/api'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    quizzes: [] as any[],
    currentQuiz: null as any,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const res = await api.get('/quiz')
        this.quizzes = res.data
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchById(id: number) {
      this.loading = true
      try {
        const res = await api.get(`/quiz/${id}`)
        this.currentQuiz = res.data
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async create(title: string, description: string) {
      const res = await api.post('/quiz', { title, description })
      this.quizzes.push(res.data)
      return res.data
    },

    async update(id: number, title: string, description: string) {
      const res = await api.put(`/quiz/${id}`, { title, description })
      const index = this.quizzes.findIndex(q => q.id === id)
      if (index !== -1) this.quizzes[index] = res.data
      return res.data
    },

    async delete(id: number) {
      await api.delete(`/quiz/${id}`)
      this.quizzes = this.quizzes.filter(q => q.id !== id)
    },

    async createPhase(quiz_id: number, title: string, order: number, type: string) {
      const res = await api.post('/phase', { quiz_id, title, order, type })
      if (this.currentQuiz && this.currentQuiz.id === quiz_id) {
        this.currentQuiz.phases = this.currentQuiz.phases || []
        this.currentQuiz.phases.push({ ...res.data, questions: [] })
      }
      return res.data
    },

    async deletePhase(id: number) {
      await api.delete(`/phase/${id}`)
      if (this.currentQuiz) {
        this.currentQuiz.phases = this.currentQuiz.phases.filter((p: any) => p.id !== id)
      }
    },

    async createQuestion(phase_id: number, payload: any) {
      const res = await api.post('/question', { phase_id, ...payload })
      if (this.currentQuiz) {
        const phase = this.currentQuiz.phases.find((p: any) => p.id === phase_id)
        if (phase) {
          phase.questions = phase.questions || []
          phase.questions.push(res.data)
        }
      }
      return res.data
    },

    async deleteQuestion(id: number, phase_id: number) {
      await api.delete(`/question/${id}`)
      if (this.currentQuiz) {
        const phase = this.currentQuiz.phases.find((p: any) => p.id === phase_id)
        if (phase) {
          phase.questions = phase.questions.filter((q: any) => q.id !== id)
        }
      }
    }
  }
})