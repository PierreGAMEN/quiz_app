<template>
    <div class="admin-home">

        <header class="admin-header">
            <div class="header-left">
                <h1 class="admin-title">🎯 Quiz App</h1>
                <span class="admin-subtitle">Panneau d'administration</span>
            </div>
        </header>

        <main class="admin-main">
            <button class="btn-create" @click="goToCreate">+ Nouveau quiz</button>

            <div v-if="quizStore.loading" class="state-msg">Chargement...</div>

            <div v-else-if="quizStore.quizzes.length === 0" class="state-msg">
                Aucun quiz pour l'instant.
            </div>

            <ul v-else class="quiz-list">
                <li v-for="quiz in quizStore.quizzes" :key="quiz.id" class="quiz-item">
                    <div class="quiz-info">
                        <strong class="quiz-title">{{ quiz.title }}</strong>
                        <span class="quiz-desc">{{ quiz.description }}</span>
                    </div>
                    <div class="quiz-actions">
                        <button class="btn-icon" title="Éditer" @click="goToEdit(quiz.id)">✏️</button>
                        <button class="btn-launch" @click="startRoom(quiz.id)">▶️ Lancer</button>
                        <button class="btn-icon danger" title="Supprimer" @click="deleteQuiz(quiz.id)">🗑️</button>
                    </div>
                </li>
            </ul>

            <div v-if="newRoomCode" class="room-created">
                <span class="room-label">CODE DE LA ROOM</span>
                <strong class="room-code">{{ newRoomCode }}</strong>
                <button class="btn-join" @click="goToRoom">Rejoindre en tant qu'admin →</button>
            </div>

        </main>

        <footer class="admin-footer">
            <button class="btn-reset" @click="resetDb">🗑️ Vider la base de données</button>
        </footer>

    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../../stores/quizStore'
import { useGameStore } from '../../stores/gameStore'
import api from '../../services/api'

const router = useRouter()
const quizStore = useQuizStore()
const gameStore = useGameStore()
const newRoomCode = ref<string | null>(null)

onMounted(() => quizStore.fetchAll())

function goToCreate() { router.push('/admin/quiz/create') }
function goToEdit(id: number) { router.push(`/admin/quiz/${id}/edit`) }
function goToRoom() { router.push(`/room/${newRoomCode.value}?admin=true`) }

async function startRoom(quizId: number) {
    const room = await gameStore.createRoom(quizId)
    newRoomCode.value = room.code
}

async function deleteQuiz(id: number) {
    if (confirm('Supprimer ce quiz ?')) await quizStore.delete(id)
}

async function resetDb() {
    if (confirm('Vider toute la base de données ?')) {
        await api.delete('/quiz/reset/all')
        quizStore.quizzes = []
        alert('Base vidée !')
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800&display=swap');

.admin-home {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Nunito', sans-serif;
    color: #1e3a8a;
    display: flex;
    flex-direction: column;
}

/* ─── HEADER ─── */
.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 40px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.admin-title {
    font-family: 'Righteous', sans-serif;
    font-size: 22px;
    color: #1e3a8a;
    margin: 0;
    letter-spacing: 1px;
}

.admin-subtitle {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.btn-create {
    padding: 10px 20px;
    background: #1d4ed8;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Nunito', sans-serif;
    margin-bottom: 20px;
}

.btn-create:hover {
    background: #1e40af;
    transform: translateY(-1px);
}

/* ─── MAIN ─── */
.admin-main {
    flex: 1;
    max-width: 720px;
    width: 100%;
    margin: 40px auto;
    padding: 0 24px;
}

.state-msg {
    text-align: center;
    color: #94a3b8;
    font-size: 15px;
    margin-top: 60px;
}

/* ─── LISTE ─── */
.quiz-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.quiz-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    transition: all 0.2s;
}

.quiz-item:hover {
    border-color: #bfdbfe;
    box-shadow: 0 2px 12px rgba(29, 78, 216, 0.08);
}

.quiz-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.quiz-title {
    font-size: 16px;
    font-weight: 800;
    color: #1e3a8a;
}

.quiz-desc {
    font-size: 13px;
    color: #94a3b8;
}

.quiz-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #e2e8f0;
}

.btn-icon.danger:hover {
    background: #fff1f2;
    border-color: #fecdd3;
}

.btn-launch {
    padding: 8px 16px;
    background: #1d4ed8;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Nunito', sans-serif;
}

.btn-launch:hover {
    background: #1e40af;
}

/* ─── ROOM CRÉÉE ─── */
.room-created {
    margin-top: 24px;
    padding: 24px;
    background: white;
    border: 1px solid #bfdbfe;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.room-label {
    font-size: 11px;
    letter-spacing: 2px;
    color: #93c5fd;
    font-weight: 800;
}

.room-code {
    font-family: 'Righteous', sans-serif;
    font-size: 48px;
    letter-spacing: 10px;
    color: #1d4ed8;
    line-height: 1;
}

.btn-join {
    padding: 10px 24px;
    background: #1d4ed8;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Nunito', sans-serif;
}

.btn-join:hover {
    background: #1e40af;
    transform: translateY(-1px);
}

/* ─── FOOTER ─── */
.admin-footer {
    padding: 20px 40px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: center;
}

.btn-reset {
    padding: 8px 16px;
    background: transparent;
    color: #cbd5e1;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Nunito', sans-serif;
}

.btn-reset:hover {
    color: #ef4444;
    border-color: #fecdd3;
    background: #fff1f2;
}
</style>