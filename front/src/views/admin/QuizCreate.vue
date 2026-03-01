<template>
    <div class="quiz-create">
        <header>
            <button @click="router.push('/admin')">← Retour</button>
            <h1>Nouveau quiz</h1>
        </header>

        <!-- Étape 1 : infos du quiz -->
        <section class="card" v-if="!quiz">
            <h2>Informations générales</h2>
            <div class="field">
                <label>Titre</label>
                <input v-model="form.title" placeholder="Ex: Burger Quiz S01" />
            </div>
            <div class="field">
                <label>Description</label>
                <textarea v-model="form.description" placeholder="Description optionnelle..." />
            </div>
            <button :disabled="!form.title" @click="createQuiz">Créer le quiz</button>
        </section>

        <!-- Étape 2 : phases et questions -->
        <template v-else>
            <div class="quiz-header">
                <h2>{{ quiz.title }}</h2>
                <button @click="router.push(`/admin/quiz/${quiz.id}/edit`)">✏️ Continuer l'édition</button>
            </div>

            <!-- Phases existantes -->
            <div v-for="(phase, pIndex) in phases" :key="phase.id" class="card phase">
                <div class="phase-header">
                    <h3>Phase {{ pIndex + 1 }} — {{ phase.title }} <span class="tag">{{ phase.type }}</span></h3>
                    <button class="danger small" @click="deletePhase(phase.id)">🗑️</button>
                </div>

                <!-- Questions de la phase -->
                <div v-for="(question, qIndex) in phase.questions" :key="question.id" class="question-item">
                    <span>Q{{ Number(qIndex) + 1 }}. {{ question.text }}</span>
                    <span class="points">{{ question.points }} pt(s)</span>
                </div>

                <!-- Ajouter une question -->
                <div class="add-question" v-if="activePhaseId === phase.id">
                    <div class="field">
                        <label>Question</label>
                        <input v-model="questionForm.text" placeholder="Texte de la question" />
                    </div>
                    <div class="row">
                        <div class="field">
                            <label>Points</label>
                            <input v-model.number="questionForm.points" type="number" min="1" />
                        </div>
                        <div class="field">
                            <label>Temps limite (sec)</label>
                            <input v-model.number="questionForm.time_limit" type="number" min="0"
                                placeholder="Optionnel" />
                        </div>
                    </div>

                    <!-- Options QCM si all_answer -->
                    <div v-if="phase.type === 'all_answer'" class="field">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="questionForm.has_options" />
                            Proposer des options (QCM)
                        </label>
                        <div v-if="questionForm.has_options" class="options-list">
                            <div v-for="(opt, i) in questionForm.options" :key="i" class="option-row">
                                <input v-model="opt.text" :placeholder="`Option ${i + 1}`" />
                                <label class="checkbox-label">
                                    <input type="checkbox" v-model="opt.is_correct" /> Correcte
                                </label>
                                <button class="small danger" @click="questionForm.options.splice(i, 1)">✕</button>
                            </div>
                            <button class="small" @click="questionForm.options.push({ text: '', is_correct: false })">
                                + Option
                            </button>
                        </div>
                    </div>

                    <div class="actions">
                        <button @click="activePhaseId = null">Annuler</button>
                        <button :disabled="!questionForm.text" @click="addQuestion(phase)">Ajouter la question</button>
                    </div>
                </div>

                <button v-else class="small" @click="openAddQuestion(phase.id)">+ Ajouter une question</button>
            </div>

            <!-- Ajouter une phase -->
            <div class="card" v-if="showPhaseForm">
                <h3>Nouvelle phase</h3>
                <div class="field">
                    <label>Titre</label>
                    <input v-model="phaseForm.title" placeholder="Ex: Manche rapide" />
                </div>
                <div class="field">
                    <label>Type</label>
                    <select v-model="phaseForm.type">
                        <option value="buzz">Buzz (réponse orale)</option>
                        <option value="all_answer">Tout le monde répond</option>
                    </select>
                </div>
                <div class="actions">
                    <button @click="showPhaseForm = false">Annuler</button>
                    <button :disabled="!phaseForm.title" @click="addPhase">Ajouter la phase</button>
                </div>
            </div>

            <button v-else @click="showPhaseForm = true">+ Ajouter une phase</button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../../stores/quizStore'

const router = useRouter()
const quizStore = useQuizStore()

const quiz = ref<any>(null)
const phases = ref<any[]>([])

// Formulaire quiz
const form = ref({ title: '', description: '' })

// Formulaire phase
const showPhaseForm = ref(false)
const phaseForm = ref({ title: '', type: 'buzz' })

// Formulaire question
const activePhaseId = ref<number | null>(null)
const questionForm = ref({
    text: '',
    points: 1,
    time_limit: null as number | null,
    has_options: false,
    options: [] as any[]
})

async function createQuiz() {
    quiz.value = await quizStore.create(form.value.title, form.value.description)
}

async function addPhase() {
    const order = phases.value.length + 1
    const phase = await quizStore.createPhase(quiz.value.id, phaseForm.value.title, order, phaseForm.value.type)
    phases.value.push({ ...phase, questions: [] })
    phaseForm.value = { title: '', type: 'buzz' }
    showPhaseForm.value = false
}

async function deletePhase(id: number) {
    if (confirm('Supprimer cette phase et toutes ses questions ?')) {
        await quizStore.deletePhase(id)
        phases.value = phases.value.filter(p => p.id !== id)
    }
}

function openAddQuestion(phaseId: number) {
    activePhaseId.value = phaseId
    questionForm.value = { text: '', points: 1, time_limit: null, has_options: false, options: [] }
}

async function addQuestion(phase: any) {
    const question = await quizStore.createQuestion(phase.id, {
        text: questionForm.value.text,
        points: questionForm.value.points,
        order: phase.questions.length + 1,
        time_limit: questionForm.value.time_limit,
        has_options: questionForm.value.has_options,
        options: questionForm.value.has_options ? questionForm.value.options : []
    })
    phase.questions.push(question)
    activePhaseId.value = null
}
</script>

<style scoped>
.quiz-create {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: sans-serif;
}

header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 30px;
}

.card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
}

.phase {
    background: #fafafa;
}

.phase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.tag {
    font-size: 11px;
    background: #e0e7ff;
    color: #4f46e5;
    padding: 2px 8px;
    border-radius: 99px;
    margin-left: 8px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
}

.field label {
    font-size: 13px;
    color: #374151;
    font-weight: 500;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #374151;
    font-weight: 500;
    cursor: pointer;
}

input,
textarea,
select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

textarea {
    min-height: 80px;
    resize: vertical;
}

button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #4f46e5;
    color: white;
    cursor: pointer;
    font-size: 14px;
}

button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

button.danger {
    background: #ef4444;
}

button.small {
    font-size: 12px;
    padding: 4px 10px;
}

.actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.row {
    display: flex;
    gap: 16px;
}

.row .field {
    flex: 1;
}

.question-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 14px;
}

.points {
    color: #6b7280;
    font-size: 12px;
}

.option-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.options-list {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.add-question {
    margin-top: 12px;
    padding: 12px;
    background: white;
    border: 1px dashed #d1d5db;
    border-radius: 6px;
}
</style>