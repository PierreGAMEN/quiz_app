<template>
    <div class="quiz-edit">

        <header class="edit-header">
            <button class="btn-back" @click="router.push('/admin')">← Retour</button>

            <div v-if="!editingTitle" class="header-title">
                <h1 class="edit-title">{{ quiz?.title }}</h1>
                <span v-if="quiz?.description" class="edit-desc">{{ quiz?.description }}</span>
                <button class="btn-edit-title" @click="startEditTitle">✏️ Modifier</button>
            </div>

            <div v-else class="inline-edit">
                <input v-model="titleForm.title" class="input" placeholder="Titre du quiz" />
                <textarea v-model="titleForm.description" class="textarea" placeholder="Description..." />
                <div class="actions">
                    <button class="btn-secondary" @click="editingTitle = false">Annuler</button>
                    <button class="btn-primary" @click="saveQuizInfo">Sauvegarder</button>
                </div>
            </div>
        </header>

        <div v-if="loading" class="state-msg">Chargement...</div>

        <main v-else class="edit-main">

            <!-- Phases -->
            <div v-for="(phase, pIndex) in quiz?.phases" :key="phase.id" class="phase-card">
                <div class="phase-header">
                    <div class="phase-header-left">
                        <span class="phase-number">Phase {{ Number(pIndex) + 1 }}</span>
                        <span class="phase-title">{{ phase.title }}</span>
                        <span class="phase-tag" :class="phase.type">
                            {{ phase.type === 'buzz' ? '🔔 Buzz' : '📝 QCM' }}
                        </span>
                    </div>
                    <button class="btn-icon danger" @click="deletePhase(phase.id)">🗑️</button>
                </div>

                <!-- Questions -->
                <ul class="question-list">
                    <li v-for="(question, qIndex) in phase.questions" :key="question.id" class="question-item">
                        <span class="question-index">Q{{ Number(qIndex) + 1 }}</span>
                        <span class="question-text">{{ question.text }}</span>
                        <div class="question-right">
                            <span class="question-pts">{{ question.points }} pt{{ question.points > 1 ? 's' : ''
                                }}</span>
                            <button class="btn-icon danger" @click="deleteQuestion(question.id, phase.id)">🗑️</button>
                        </div>
                    </li>
                    <li v-if="phase.questions.length === 0" class="question-empty">
                        Aucune question
                    </li>
                </ul>

                <!-- Formulaire ajout question -->
                <div v-if="activePhaseId === phase.id" class="add-question-form">
                    <div class="field">
                        <label>Question</label>
                        <input v-model="questionForm.text" class="input" placeholder="Texte de la question" />
                    </div>
                    <div class="field-row">
                        <div class="field">
                            <label>Points</label>
                            <input v-model.number="questionForm.points" class="input" type="number" min="1" />
                        </div>
                        <div class="field">
                            <label>Temps limite (sec)</label>
                            <input v-model.number="questionForm.time_limit" class="input" type="number" min="0"
                                placeholder="Optionnel" />
                        </div>
                    </div>

                    <div v-if="phase.type === 'all_answer'" class="options-section">
                        <label>Options <span class="hint">(une seule bonne réponse)</span></label>
                        <div v-for="(opt, i) in questionForm.options" :key="i" class="option-row">
                            <input v-model="opt.text" class="input" :placeholder="`Option ${i + 1}`" />
                            <label class="radio-label">
                                <input type="radio" :name="`correct-${phase.id}`" :value="i"
                                    v-model="questionForm.correctIndex" />
                                Correcte
                            </label>
                            <button class="btn-icon danger" @click="questionForm.options.splice(i, 1)">✕</button>
                        </div>
                        <button class="btn-secondary small"
                            @click="questionForm.options.push({ text: '', is_correct: false })">
                            + Option
                        </button>
                    </div>

                    <div class="actions">
                        <button class="btn-secondary" @click="activePhaseId = null">Annuler</button>
                        <button class="btn-primary" :disabled="!canAddQuestion(phase)" @click="addQuestion(phase)">
                            Ajouter la question
                        </button>
                    </div>
                </div>

                <button v-else class="btn-add-question" @click="openAddQuestion(phase.id)">
                    + Ajouter une question
                </button>
            </div>

            <!-- Formulaire ajout phase -->
            <div v-if="showPhaseForm" class="phase-card">
                <h3 class="form-title">Nouvelle phase</h3>
                <div class="field">
                    <label>Titre</label>
                    <input v-model="phaseForm.title" class="input" placeholder="Ex: Manche rapide" />
                </div>
                <div class="field">
                    <label>Type</label>
                    <select v-model="phaseForm.type" class="input">
                        <option value="buzz">🔔 Buzz (réponse orale)</option>
                        <option value="all_answer">📝 QCM (tout le monde répond)</option>
                    </select>
                </div>
                <div class="actions">
                    <button class="btn-secondary" @click="showPhaseForm = false">Annuler</button>
                    <button class="btn-primary" :disabled="!phaseForm.title" @click="addPhase">Ajouter la phase</button>
                </div>
            </div>

            <button v-else class="btn-add-phase" @click="showPhaseForm = true">+ Ajouter une phase</button>

        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '../../stores/quizStore'

const router = useRouter()
const route = useRoute()
const quizStore = useQuizStore()

const quiz = ref<any>(null)
const loading = ref(true)
const editingTitle = ref(false)
const titleForm = ref({ title: '', description: '' })
const showPhaseForm = ref(false)
const phaseForm = ref({ title: '', type: 'buzz' })
const activePhaseId = ref<number | null>(null)
const questionForm = ref({
    text: '',
    points: 1,
    time_limit: null as number | null,
    correctIndex: null as number | null,
    options: [] as any[]
})

onMounted(async () => {
    const id = Number(route.params.id)
    await quizStore.fetchById(id)
    quiz.value = quizStore.currentQuiz
    titleForm.value = { title: quiz.value.title, description: quiz.value.description || '' }
    loading.value = false
})

function startEditTitle() {
    titleForm.value = { title: quiz.value.title, description: quiz.value.description || '' }
    editingTitle.value = true
}

async function saveQuizInfo() {
    await quizStore.update(quiz.value.id, titleForm.value.title, titleForm.value.description)
    quiz.value.title = titleForm.value.title
    quiz.value.description = titleForm.value.description
    editingTitle.value = false
}

async function addPhase() {
    const order = quiz.value.phases.length + 1
    await quizStore.createPhase(quiz.value.id, phaseForm.value.title, order, phaseForm.value.type)
    quiz.value = quizStore.currentQuiz
    phaseForm.value = { title: '', type: 'buzz' }
    showPhaseForm.value = false
}

async function deletePhase(id: number) {
    if (confirm('Supprimer cette phase et toutes ses questions ?')) {
        await quizStore.deletePhase(id)
        quiz.value.phases = quiz.value.phases.filter((p: any) => p.id !== id)
    }
}

function openAddQuestion(phaseId: number) {
    activePhaseId.value = phaseId
    questionForm.value = { text: '', points: 1, time_limit: null, correctIndex: null, options: [] }
}

function canAddQuestion(phase: any): boolean {
    if (!questionForm.value.text) return false
    if (phase.type === 'all_answer') {
        return questionForm.value.options.length >= 2
            && questionForm.value.correctIndex !== null
            && questionForm.value.options.every((o: any) => o.text.trim() !== '')
    }
    return true
}

async function addQuestion(phase: any) {
    const options = questionForm.value.options.map((opt: any, i: number) => ({
        text: opt.text,
        is_correct: i === questionForm.value.correctIndex
    }))
    await quizStore.createQuestion(phase.id, {
        text: questionForm.value.text,
        points: questionForm.value.points,
        order: phase.questions.length + 1,
        time_limit: questionForm.value.time_limit,
        options
    })
    quiz.value = quizStore.currentQuiz
    activePhaseId.value = null
}

async function deleteQuestion(id: number, phaseId: number) {
    if (confirm('Supprimer cette question ?')) {
        await quizStore.deleteQuestion(id, phaseId)
        const phase = quiz.value.phases.find((p: any) => p.id === phaseId)
        if (phase) phase.questions = phase.questions.filter((q: any) => q.id !== id)
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800&display=swap');

.quiz-edit {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Nunito', sans-serif;
    color: #1e3a8a;
}

/* ─── HEADER ─── */
.edit-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 24px 40px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
}

.btn-back {
    padding: 8px 14px;
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Nunito', sans-serif;
    transition: all 0.2s;
    flex-shrink: 0;
}

.btn-back:hover {
    background: #e2e8f0;
}

.header-title {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
}

.edit-title {
    font-family: 'Righteous', sans-serif;
    font-size: 20px;
    margin: 0;
    color: #1e3a8a;
    letter-spacing: 0.5px;
}

.edit-desc {
    font-size: 13px;
    color: #94a3b8;
}

.btn-edit-title {
    align-self: flex-start;
    padding: 4px 10px;
    background: transparent;
    color: #94a3b8;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    transition: all 0.2s;
    margin-top: 4px;
}

.btn-edit-title:hover {
    color: #1d4ed8;
    border-color: #bfdbfe;
    background: #eff6ff;
}

.inline-edit {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* ─── MAIN ─── */
.edit-main {
    max-width: 720px;
    margin: 32px auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.state-msg {
    text-align: center;
    color: #94a3b8;
    margin-top: 60px;
    font-size: 15px;
}

/* ─── PHASE CARD ─── */
.phase-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
}

.phase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.phase-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.phase-number {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #94a3b8;
    text-transform: uppercase;
}

.phase-title {
    font-size: 16px;
    font-weight: 800;
    color: #1e3a8a;
}

.phase-tag {
    font-size: 11px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 99px;
}

.phase-tag.buzz {
    background: #fff7ed;
    color: #c2410c;
    border: 1px solid #fed7aa;
}

.phase-tag.all_answer {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
}

/* ─── QUESTIONS ─── */
.question-list {
    list-style: none;
    padding: 0;
    margin: 0 0 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.question-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    transition: background 0.15s;
}

.question-item:hover {
    background: #f8fafc;
}

.question-index {
    font-size: 11px;
    font-weight: 800;
    color: #94a3b8;
    width: 28px;
    flex-shrink: 0;
}

.question-text {
    flex: 1;
    font-size: 14px;
    color: #334155;
}

.question-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.question-pts {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 99px;
}

.question-empty {
    font-size: 13px;
    color: #cbd5e1;
    padding: 8px 10px;
    text-align: center;
}

/* ─── FORMULAIRE QUESTION ─── */
.add-question-form {
    margin-top: 12px;
    padding: 16px;
    background: #f8fafc;
    border: 1px dashed #e2e8f0;
    border-radius: 12px;
}

.form-title {
    font-family: 'Righteous', sans-serif;
    font-size: 16px;
    color: #1e3a8a;
    margin: 0 0 16px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 12px;
}

.field label {
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.field-row {
    display: flex;
    gap: 12px;
}

.field-row .field {
    flex: 1;
}

.input {
    padding: 9px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Nunito', sans-serif;
    color: #1e3a8a;
    background: white;
    transition: border-color 0.2s;
}

.input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea {
    padding: 9px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Nunito', sans-serif;
    color: #1e3a8a;
    min-height: 60px;
    resize: vertical;
}

.textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

select.input {
    cursor: pointer;
}

/* ─── OPTIONS QCM ─── */
.options-section {
    margin-bottom: 12px;
}

.options-section>label {
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    display: block;
    margin-bottom: 8px;
}

.hint {
    font-size: 11px;
    color: #cbd5e1;
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
}

.option-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
    cursor: pointer;
}

/* ─── BOUTONS ─── */
.actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.btn-primary {
    padding: 9px 18px;
    background: #1d4ed8;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: #1e40af;
}

.btn-primary:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-secondary {
    padding: 9px 18px;
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f1f5f9;
}

.btn-secondary.small {
    font-size: 12px;
    padding: 6px 12px;
}

.btn-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
    flex-shrink: 0;
}

.btn-icon:hover {
    background: #e2e8f0;
}

.btn-icon.danger:hover {
    background: #fff1f2;
    border-color: #fecdd3;
}

.btn-add-question {
    width: 100%;
    padding: 8px;
    background: transparent;
    color: #94a3b8;
    border: 1px dashed #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    transition: all 0.2s;
    margin-top: 4px;
}

.btn-add-question:hover {
    color: #1d4ed8;
    border-color: #bfdbfe;
    background: #eff6ff;
}

.btn-add-phase {
    width: 100%;
    padding: 14px;
    background: white;
    color: #94a3b8;
    border: 2px dashed #e2e8f0;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    transition: all 0.2s;
}

.btn-add-phase:hover {
    color: #1d4ed8;
    border-color: #bfdbfe;
    background: #eff6ff;
}
</style>