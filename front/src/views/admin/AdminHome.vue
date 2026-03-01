<template>
    <div class="admin-home">
        <header>
            <h1>🎯 Quiz App — Admin</h1>
            <button @click="goToCreate">+ Nouveau quiz</button>
        </header>

        <div v-if="quizStore.loading">Chargement...</div>

        <div v-else-if="quizStore.quizzes.length === 0" class="empty">
            Aucun quiz pour l'instant.
        </div>

        <ul v-else class="quiz-list">
            <li v-for="quiz in quizStore.quizzes" :key="quiz.id" class="quiz-item">
                <div class="quiz-info">
                    <strong>{{ quiz.title }}</strong>
                    <span>{{ quiz.description }}</span>
                </div>
                <div class="quiz-actions">
                    <button @click="goToEdit(quiz.id)">✏️ Éditer</button>
                    <button @click="startRoom(quiz.id)">▶️ Lancer</button>
                    <button class="danger" @click="deleteQuiz(quiz.id)">🗑️ Supprimer</button>
                </div>
            </li>
        </ul>

        <div v-if="newRoomCode" class="room-created">
            <p>Room créée ! Code à partager :</p>
            <strong class="room-code">{{ newRoomCode }}</strong>
            <button @click="goToRoom">Rejoindre en tant qu'admin</button>
        </div>
        <div style="margin-top: 60px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <button class="danger" @click="resetDb">🗑️ Vider la base de données</button>
        </div>
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


onMounted(() => {
    quizStore.fetchAll()
})

function goToCreate() {
    router.push('/admin/quiz/create')
}

function goToEdit(id: number) {
    router.push(`/admin/quiz/${id}/edit`)
}

async function startRoom(quizId: number) {
    const room = await gameStore.createRoom(quizId)
    newRoomCode.value = room.code
}

function goToRoom() {
    router.push(`/room/${newRoomCode.value}?admin=true`)
}

async function deleteQuiz(id: number) {
    if (confirm('Supprimer ce quiz ?')) {
        await quizStore.delete(id)
    }
}

// A SUPPRIMER A LA FIN DU PROJET
async function resetDb() {
    if (confirm('Vider toute la base de données ?')) {
        await api.delete('/quiz/reset/all')
        quizStore.quizzes = []
        alert('Base vidée !')
    }
}
</script>

<style scoped>
.admin-home {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: sans-serif;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

button {
    padding: 8px 16px;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background: #4f46e5;
    color: white;
    font-size: 14px;
}

button.danger {
    background: #ef4444;
}

.quiz-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.quiz-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.quiz-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.quiz-info span {
    font-size: 13px;
    color: #6b7280;
}

.quiz-actions {
    display: flex;
    gap: 8px;
}

.room-created {
    margin-top: 30px;
    padding: 20px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
    text-align: center;
}

.room-code {
    display: block;
    font-size: 36px;
    letter-spacing: 8px;
    margin: 10px 0;
    color: #16a34a;
}

.empty {
    color: #6b7280;
    text-align: center;
    margin-top: 40px;
}
</style>