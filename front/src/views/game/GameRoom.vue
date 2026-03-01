<template>
    <div class="game-room">

        <!-- LOBBY : en attente de démarrage -->
        <div v-if="gameStore.status === 'waiting'" class="lobby">
            <h1>🎯 Room <span class="code">{{ route.params.code }}</span></h1>

            <div class="players-list">
                <h2>Joueurs connectés ({{ gameStore.players.length }})</h2>
                <ul>
                    <li v-for="player in gameStore.players" :key="player.id">
                        👤 {{ player.name }}
                    </li>
                </ul>
            </div>

            <div v-if="isAdmin" class="admin-actions">
                <button :disabled="gameStore.players.length === 0" @click="startGame">
                    ▶️ Lancer le quiz
                </button>
            </div>
            <div v-else class="waiting-message">
                <p>En attente du lancement par l'admin...</p>
            </div>
        </div>

        <!-- JEU EN COURS -->
        <div v-else-if="gameStore.status === 'in_progress'" class="game">

            <!-- Barre du haut -->
            <div class="top-bar">
                <span class="phase-title">{{ gameStore.currentPhase?.title ?? '...' }}</span>
                <div class="scores">
                    <span v-for="player in gameStore.players" :key="player.id" class="score-chip">
                        {{ player.name }} — {{ player.score }} pts
                    </span>
                </div>
            </div>

            <!-- En attente de la première question -->
            <div v-if="!gameStore.currentQuestion" class="question-card">
                <p style="text-align:center; color: #6b7280;">
                    {{ isAdmin ? 'Sélectionne une question ci-dessous.' : 'En attente de la prochaine question...' }}
                </p>
            </div>

            <!-- Question courante -->
            <div v-else class="question-card">
                <div class="question-meta">
                    <span class="tag">{{ gameStore.currentPhase?.type }}</span>
                    <span class="points">{{ gameStore.currentQuestion.points }} pt(s)</span>
                    <span v-if="gameStore.currentQuestion.time_limit" class="timer">
                        ⏱ {{ gameStore.currentQuestion.time_limit }}s
                    </span>
                </div>
                <h2>{{ gameStore.currentQuestion.text }}</h2>

                <!-- Buzz -->
                <div v-if="gameStore.currentPhase?.type === 'buzz'" class="buzz-zone">
                    <div v-if="gameStore.buzzedPlayer" class="buzzed">
                        🔔 <strong>{{ gameStore.buzzedPlayer.name }}</strong> a buzzé !
                        <div v-if="isAdmin" class="award-points">
                            <button @click="awardPoints(gameStore.currentQuestion.points)">
                                ✅ +{{ gameStore.currentQuestion.points }} pts
                            </button>
                            <button class="danger" @click="awardPointsAndReset(0)">
                                ❌ Mauvaise réponse
                            </button>
                        </div>
                    </div>
                    <div v-else-if="gameStore.questionResolved" class="resolved">
                        ✅ Question résolue !
                    </div>
                    <button v-else-if="!isAdmin" class="buzz-btn" @click="buzz">BUZZ !</button>
                    <p v-else class="waiting-buzz">En attente d'un buzz...</p>
                </div>

                <!-- All answer -->
                <div v-else-if="gameStore.currentPhase?.type === 'all_answer'" class="written-zone">

                    <!-- QCM si has_options -->
                    <template v-if="gameStore.currentQuestion.has_options">
                        <div v-if="!isAdmin" class="options">
                            <button
                                v-for="option in gameStore.currentQuestion.options"
                                :key="option.id"
                                class="option-btn"
                                :class="{ selected: selectedAnswer === option.text }"
                                :disabled="hasAnswered"
                                @click="selectOption(option.text)"
                            >
                                {{ option.text }}
                            </button>
                        </div>
                    </template>

                    <!-- Réponse libre -->
                    <template v-else>
                        <div v-if="!isAdmin">
                            <input
                                v-model="writtenAnswer"
                                placeholder="Ta réponse..."
                                :disabled="hasAnswered"
                                @keyup.enter="submitAnswer"
                            />
                            <button :disabled="!writtenAnswer || hasAnswered" @click="submitAnswer">
                                {{ hasAnswered ? 'Réponse envoyée ✓' : 'Envoyer' }}
                            </button>
                        </div>
                    </template>

                    <!-- Vue admin -->
                    <div v-if="isAdmin" class="answers-list">
                        <h3>Réponses reçues ({{ gameStore.answers.length }}/{{ gameStore.players.length }})</h3>
                        <div v-for="ans in gameStore.answers" :key="ans.playerId" class="answer-row">
                            <span>{{ getPlayerName(ans.playerId) }} : <strong>{{ ans.answer }}</strong></span>
                            <div class="award-inline">
                                <button class="small"
                                    @click="awardPointsTo(ans.playerId, gameStore.currentQuestion.points)">
                                    ✅ +{{ gameStore.currentQuestion.points }}
                                </button>
                                <button class="small danger" @click="awardPointsTo(ans.playerId, 0)">❌</button>
                            </div>
                        </div>
                        <p v-if="gameStore.answers.length === 0" style="color: #6b7280; text-align: center;">
                            En attente des réponses...
                        </p>
                    </div>
                </div>
            </div>

            <!-- Navigation admin -->
            <div v-if="isAdmin" class="admin-nav">
                <select v-model="selectedPhaseId">
                    <option :value="null" disabled>-- Choisir une phase --</option>
                    <option v-for="phase in gameStore.phases" :key="phase.id" :value="phase.id">
                        {{ phase.title }}
                    </option>
                </select>
                <select v-model="selectedQuestionId" :disabled="!selectedPhaseId">
                    <option :value="null" disabled>-- Choisir une question --</option>
                    <option v-for="q in currentPhaseQuestions" :key="q.id" :value="q.id">
                        {{ q.text.substring(0, 40) }}
                    </option>
                </select>
                <button :disabled="!selectedPhaseId || !selectedQuestionId" @click="nextQuestion">
                    ➡️ Afficher cette question
                </button>
                <button class="danger" @click="endGame">🏁 Terminer le quiz</button>
            </div>

        </div>

        <!-- FIN DE PARTIE -->
        <div v-else-if="gameStore.status === 'finished'" class="finished">
            <h1>🏆 Résultats finaux</h1>
            <ol class="leaderboard">
                <li v-for="(player, index) in gameStore.players" :key="player.id" class="leaderboard-item">
                    <span class="rank">{{ index + 1 }}</span>
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-score">{{ player.score }} pts</span>
                </li>
            </ol>
            <button v-if="isAdmin" @click="router.push('/admin')">Retour à l'admin</button>
            <button v-else @click="router.push('/')">Retour à l'accueil</button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../../stores/gameStore'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const isAdmin = computed(() => route.query.admin === 'true')
const roomCode = computed(() => route.params.code as string)

// Navigation admin
const selectedPhaseId = ref<number | null>(null)
const selectedQuestionId = ref<number | null>(null)
const currentPhaseQuestions = computed(() => {
    if (!selectedPhaseId.value) return []
    const phase = gameStore.phases.find(p => p.id === selectedPhaseId.value)
    return phase?.questions || []
})

// Réponses joueur
const writtenAnswer = ref('')
const selectedAnswer = ref('')
const hasAnswered = ref(false)

onMounted(async () => {
    gameStore.status = 'waiting'

    if (!gameStore.room) {
        try {
            const res = await api.get(`/room/${roomCode.value}`)
            gameStore.room = res.data
            gameStore.players = res.data.players || []
        } catch (err) {
            console.error('Room introuvable')
            router.push('/')
            return
        }
    }

    gameStore.connectSocket(roomCode.value)
})

onUnmounted(() => {
    gameStore.disconnectSocket()
})

watch(() => gameStore.buzzedPlayer, (val) => {
    if (val === null) {
        hasAnswered.value = false
    }
})

function startGame() {
    gameStore.startGame(roomCode.value)
}

function nextQuestion() {
    if (!selectedPhaseId.value || !selectedQuestionId.value) return
    gameStore.nextQuestion(roomCode.value, selectedPhaseId.value, selectedQuestionId.value)
    hasAnswered.value = false
    writtenAnswer.value = ''
    selectedAnswer.value = ''
}

function buzz() {
    if (!gameStore.player) return
    gameStore.buzz(roomCode.value, gameStore.player.id)
}

function submitAnswer() {
    if (!writtenAnswer.value || !gameStore.player || !gameStore.currentQuestion) return
    gameStore.sendAnswer(roomCode.value, gameStore.player.id, gameStore.currentQuestion.id, writtenAnswer.value)
    hasAnswered.value = true
}

function selectOption(text: string) {
    selectedAnswer.value = text
    writtenAnswer.value = text
    submitAnswer()
}

function awardPoints(points: number) {
    if (!gameStore.buzzedPlayer || !gameStore.currentQuestion) return
    gameStore.awardPoints(roomCode.value, gameStore.buzzedPlayer.id, gameStore.currentQuestion.id, points)
    if (points > 0) {
        gameStore.resolveQuestion(roomCode.value)
    } else {
        gameStore.resetBuzz(roomCode.value)
    }
}

function awardPointsAndReset(points: number) {
    awardPoints(points)
    gameStore.resetBuzz(roomCode.value)
}

function awardPointsTo(playerId: number, points: number) {
    if (!gameStore.currentQuestion) return
    gameStore.awardPoints(roomCode.value, playerId, gameStore.currentQuestion.id, points)
}

function endGame() {
    if (confirm('Terminer le quiz ?')) {
        gameStore.endGame(roomCode.value)
    }
}

function getPlayerName(playerId: number) {
    return gameStore.players.find(p => p.id === playerId)?.name || 'Inconnu'
}
</script>

<style scoped>
.game-room {
    min-height: 100vh;
    background: #f9fafb;
    font-family: sans-serif;
    padding: 20px;
}

.lobby {
    max-width: 500px;
    margin: 60px auto;
    text-align: center;
}

.code {
    background: #e0e7ff;
    color: #4f46e5;
    padding: 4px 12px;
    border-radius: 6px;
    letter-spacing: 4px;
}

.players-list {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    text-align: left;
}

.players-list ul {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #4f46e5;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.phase-title { font-weight: bold; font-size: 16px; }

.scores { display: flex; gap: 12px; flex-wrap: wrap; }

.score-chip {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 13px;
}

.question-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 30px;
    max-width: 700px;
    margin: 0 auto 20px;
}

.question-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
}

.tag {
    background: #e0e7ff;
    color: #4f46e5;
    padding: 2px 10px;
    border-radius: 99px;
    font-size: 12px;
}

.points, .timer {
    font-size: 13px;
    color: #6b7280;
    padding: 2px 8px;
    background: #f3f4f6;
    border-radius: 99px;
}

.question-card h2 { font-size: 22px; margin: 0 0 20px; }

.options { display: flex; flex-direction: column; gap: 10px; }

.option-btn {
    padding: 12px 16px;
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    text-align: left;
    color: #111;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.15s;
}

.option-btn:hover:not(:disabled) { border-color: #4f46e5; background: #eef2ff; }
.option-btn.selected { border-color: #4f46e5; background: #e0e7ff; }
.option-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.buzz-btn {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    font-size: 28px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    display: block;
    margin: 20px auto;
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    transition: transform 0.1s;
}

.buzz-btn:active { transform: scale(0.95); }

.buzzed {
    text-align: center;
    font-size: 20px;
    padding: 20px;
}

.award-points {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 16px;
}

.written-zone input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    margin-bottom: 10px;
    box-sizing: border-box;
}

.answers-list { display: flex; flex-direction: column; gap: 10px; }

.answer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f9fafb;
    border-radius: 6px;
}

.award-inline { display: flex; gap: 6px; }

.admin-nav {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
}

select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    flex: 1;
}

.finished {
    max-width: 500px;
    margin: 60px auto;
    text-align: center;
}

.leaderboard {
    list-style: none;
    padding: 0;
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.leaderboard-item {
    display: flex;
    align-items: center;
    gap: 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 14px 20px;
}

.rank { font-size: 20px; font-weight: bold; color: #4f46e5; width: 30px; }
.player-name { flex: 1; font-size: 16px; }
.player-score { font-weight: bold; color: #16a34a; }

.resolved {
    text-align: center;
    font-size: 20px;
    color: #16a34a;
    padding: 20px;
    background: #f0fdf4;
    border-radius: 8px;
}

button {
    padding: 10px 18px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

button:disabled { opacity: 0.4; cursor: not-allowed; }
button.danger { background: #ef4444; }
button.secondary { background: white; color: #4f46e5; border: 1px solid #4f46e5; }
button.small { font-size: 12px; padding: 5px 10px; }

.waiting-message p, .waiting-buzz { color: #6b7280; text-align: center; }
.admin-actions, .waiting-message { margin-top: 20px; }
</style>