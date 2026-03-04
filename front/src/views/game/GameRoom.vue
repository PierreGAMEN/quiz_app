<template>
    <div class="game-room">

        <!-- LOBBY -->
        <div v-if="gameStore.status === 'waiting'" class="lobby">
            <div class="lobby-bg"></div>
            <div class="lobby-content">
                <div class="logo-badge">QUIZ LIVE</div>
                <h1 class="lobby-title">Room <span class="code-display">{{ route.params.code }}</span></h1>

                <div class="players-panel">
                    <div class="players-header">
                        <span class="players-label">JOUEURS</span>
                        <span class="players-count">{{ gameStore.players.length }}</span>
                    </div>
                    <ul class="players-ul">
                        <li v-for="(player, i) in gameStore.players" :key="player.id" class="player-entry"
                            :style="`--i: ${i}`">
                            <span class="player-dot"></span>
                            {{ player.name }}
                        </li>
                    </ul>
                </div>

                <div v-if="isAdmin" class="admin-actions">
                    <button :disabled="gameStore.players.length === 0" class="btn-launch" @click="startGame">
                        <span class="btn-icon">▶</span> LANCER LE QUIZ
                    </button>
                </div>
                <div v-else class="waiting-msg">
                    <span class="pulse-dot"></span>
                    En attente du lancement...
                </div>
            </div>
        </div>

        <!-- JEU EN COURS -->
        <div v-else-if="gameStore.status === 'in_progress'" class="game">

            <!-- Top bar -->
            <div class="top-bar">
                <div class="phase-pill">
                    <span class="phase-icon">{{ gameStore.currentPhase?.type === 'buzz' ? '🔔' : '📝' }}</span>
                    {{ gameStore.currentPhase?.title ?? '...' }}
                </div>
                <div class="scoreboard">
                    <div v-for="player in gameStore.players" :key="player.id" class="score-entry">
                        <span class="score-name">{{ player.name }}</span>
                        <span class="score-val">{{ player.score }}<span class="score-unit">pts</span></span>
                    </div>
                </div>
            </div>

            <!-- Zone centrale scrollable -->
            <div class="game-body" :class="{ 'has-admin-nav': isAdmin }">

                <!-- Waiting for question -->
                <div v-if="!gameStore.currentQuestion" class="waiting-question">
                    <div class="waiting-icon">⏳</div>
                    <p>{{ isAdmin ? 'Choisis une question ci-dessous' : 'La prochaine question arrive...' }}</p>
                </div>

                <!-- Question card -->
                <div v-else class="question-wrapper">
                    <div class="question-card"
                        :class="{ 'card-buzz': gameStore.currentPhase?.type === 'buzz', 'card-qcm': gameStore.currentPhase?.type === 'all_answer' }">
                        <div class="question-badges">
                            <span class="badge-type">{{ gameStore.currentPhase?.type === 'buzz' ? '🔔 BUZZ' : '📝 QCM'
                                }}</span>
                            <span class="badge-pts">{{ gameStore.currentQuestion.points }} PT{{
                                gameStore.currentQuestion.points > 1 ? 'S' : '' }}</span>
                            <span v-if="gameStore.currentQuestion.time_limit" class="badge-timer">⏱ {{
                                gameStore.currentQuestion.time_limit }}s</span>
                        </div>

                        <h2 class="question-text">{{ gameStore.currentQuestion.text }}</h2>

                        <!-- BUZZ -->
                        <div v-if="gameStore.currentPhase?.type === 'buzz'" class="buzz-zone">
                            <div v-if="gameStore.buzzedPlayer" class="buzzed-display">
                                <div class="buzzed-name">{{ gameStore.buzzedPlayer.name }}</div>
                                <div class="buzzed-label">A BUZZÉ !</div>
                                <div v-if="isAdmin" class="award-row">
                                    <button class="btn-correct" @click="awardPoints(gameStore.currentQuestion.points)">
                                        ✅ +{{ gameStore.currentQuestion.points }} pts
                                    </button>
                                    <button class="btn-wrong" @click="awardPointsAndReset(0)">
                                        ❌ Mauvaise réponse
                                    </button>
                                </div>
                            </div>
                            <div v-else-if="gameStore.questionResolved" class="resolved-display">
                                <span class="resolved-icon">✅</span>
                                <span>Question résolue !</span>
                            </div>
                            <button v-else-if="!isAdmin" class="buzz-btn" @click="buzz">
                                <span class="buzz-ring"></span>
                                <span class="buzz-label">BUZZ !</span>
                            </button>
                            <div v-else class="waiting-buzz">
                                <span class="pulse-dot"></span> En attente d'un buzz...
                            </div>
                        </div>

                        <!-- QCM -->
                        <div v-else-if="gameStore.currentPhase?.type === 'all_answer'" class="qcm-zone">
                            <div v-if="!isAdmin && gameStore.answerResult !== null" class="result-display">
                                <div v-if="gameStore.answerResult.isCorrect" class="result-correct">
                                    <span class="result-icon">✅</span>
                                    <span class="result-text">Bonne réponse !</span>
                                    <span class="result-pts">+{{ gameStore.answerResult.points }} pts</span>
                                </div>
                                <div v-else class="result-wrong">
                                    <span class="result-icon">❌</span>
                                    <span class="result-text">Mauvaise réponse</span>
                                </div>
                            </div>

                            <div v-else-if="!isAdmin" class="options-grid">
                                <button v-for="(option, i) in gameStore.currentQuestion.options" :key="option.id"
                                    class="option-btn"
                                    :class="{ selected: selectedAnswer === option.text, disabled: hasAnswered }"
                                    :data-letter="letters[i]" :disabled="hasAnswered"
                                    @click="selectOption(option.text)">
                                    <span class="option-letter">{{ letters[i] }}</span>
                                    <span class="option-text">{{ option.text }}</span>
                                </button>
                                <p v-if="hasAnswered" class="answered-msg">
                                    <span class="pulse-dot green"></span> Réponse envoyée — en attente des autres...
                                </p>
                            </div>

                            <div v-if="isAdmin" class="admin-answers">
                                <div class="admin-answers-header">
                                    <span>Réponses</span>
                                    <span class="answers-counter">{{ gameStore.answers.length }} / {{
                                        gameStore.players.length }}</span>
                                </div>
                                <div v-for="ans in gameStore.answers" :key="ans.playerId" class="admin-answer-row">
                                    <span class="ans-player">{{ getPlayerName(ans.playerId) }}</span>
                                    <span class="ans-value">{{ ans.answer }}</span>
                                </div>
                                <p v-if="gameStore.answers.length === 0" class="waiting-text">En attente des réponses...
                                </p>
                                <button class="btn-reveal" :disabled="gameStore.answers.length === 0"
                                    @click="revealResults">
                                    🎯 Révéler les résultats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Admin nav fixée en bas -->
            <div v-if="isAdmin" class="admin-nav">
                <div class="nav-info">
                    <span v-if="gameStore.currentQuestion" class="current-q">
                        {{ gameStore.currentPhase?.title }} — {{ gameStore.currentQuestion.text.substring(0, 30) }}...
                    </span>
                    <span v-else class="current-q muted">Aucune question en cours</span>
                </div>
                <div class="nav-actions">
                    <button class="btn-next" :disabled="!gameStore.nextQuestionData" @click="nextQuestion">
                        {{ gameStore.currentQuestion ? '➡️ Question suivante' : '▶️ Lancer le quiz' }}
                    </button>
                    <button class="btn-end" @click="endGame">🏁</button>
                </div>
            </div>

        </div>

        <!-- FIN DE PARTIE -->
        <div v-else-if="gameStore.status === 'finished'" class="finished">
            <div class="finished-bg"></div>
            <div class="finished-content">
                <div class="trophy">🏆</div>
                <h1 class="finished-title">RÉSULTATS</h1>
                <ol class="leaderboard">
                    <li v-for="(player, index) in gameStore.players" :key="player.id" class="leaderboard-item"
                        :class="`rank-${index + 1}`" :style="`--i: ${index}`">
                        <span class="lb-rank">{{ ['🥇', '🥈', '🥉'][index] ?? index + 1 }}</span>
                        <span class="lb-name">{{ player.name }}</span>
                        <span class="lb-score">{{ player.score }}<span class="lb-unit">pts</span></span>
                    </li>
                </ol>
                <button v-if="isAdmin" class="btn-back" @click="router.push('/admin')">← Retour admin</button>
                <button v-else class="btn-back" @click="router.push('/')">← Accueil</button>
            </div>
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

const letters = ['A', 'B', 'C', 'D']
const isAdmin = computed(() => route.query.admin === 'true')
const roomCode = computed(() => route.params.code as string)

const selectedPhaseId = ref<number | null>(null)
const selectedQuestionId = ref<number | null>(null)
const currentPhaseQuestions = computed(() => {
    if (!selectedPhaseId.value) return []
    const phase = gameStore.phases.find(p => p.id === selectedPhaseId.value)
    return phase?.questions || []
})

const selectedAnswer = ref('')
const hasAnswered = ref(false)

onMounted(async () => {
    gameStore.status = 'waiting'
    if (!gameStore.room) {
        try {
            const res = await api.get(`/room/${roomCode.value}`)
            gameStore.room = res.data
            gameStore.players = res.data.players || []
        } catch {
            router.push('/')
            return
        }
    }
    gameStore.connectSocket(roomCode.value)
})

onUnmounted(() => gameStore.disconnectSocket())

watch(() => gameStore.buzzedPlayer, (val) => { if (val === null) hasAnswered.value = false })
watch(() => gameStore.currentQuestion, () => { hasAnswered.value = false; selectedAnswer.value = '' })

function startGame() { gameStore.startGame(roomCode.value) }

function nextQuestion() {
    const next = gameStore.nextQuestionData
    if (!next) return
    gameStore.nextQuestion(roomCode.value, next.phaseId, next.questionId)
}

function buzz() {
    if (!gameStore.player) return
    gameStore.buzz(roomCode.value, gameStore.player.id)
}

function selectOption(text: string) {
    if (hasAnswered.value) return
    selectedAnswer.value = text
    hasAnswered.value = true
    if (!gameStore.player || !gameStore.currentQuestion) return
    gameStore.sendAnswer(roomCode.value, gameStore.player.id, gameStore.currentQuestion.id, text)
}

function awardPoints(points: number) {
    if (!gameStore.buzzedPlayer || !gameStore.currentQuestion) return
    gameStore.awardPoints(roomCode.value, gameStore.buzzedPlayer.id, gameStore.currentQuestion.id, points)
    if (points > 0) gameStore.resolveQuestion(roomCode.value)
    else gameStore.resetBuzz(roomCode.value)
}

function awardPointsAndReset(points: number) { awardPoints(points) }

function revealResults() {
    if (!gameStore.currentQuestion) return
    gameStore.revealResults(roomCode.value, gameStore.currentQuestion.id)
}

function endGame() {
    if (confirm('Terminer le quiz ?')) gameStore.endGame(roomCode.value)
}

function getPlayerName(playerId: number) {
    return gameStore.players.find(p => p.id === playerId)?.name || 'Inconnu'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');

/* ─── BASE ─── */
.game-room {
    min-height: 100vh;
    background: #0a0a12;
    color: #f0f0f5;
    font-family: 'DM Sans', sans-serif;
}

/* ─── LOBBY ─── */
.lobby {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.lobby-bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse 60% 50% at 20% 50%, rgba(99, 60, 255, 0.25) 0%, transparent 70%),
        radial-gradient(ellipse 50% 60% at 80% 30%, rgba(255, 60, 120, 0.15) 0%, transparent 70%);
}

.lobby-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 480px;
    padding: 0 24px;
}

.logo-badge {
    display: inline-block;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 4px;
    color: #a78bfa;
    border: 1px solid rgba(167, 139, 250, 0.3);
    padding: 4px 14px;
    border-radius: 99px;
    margin-bottom: 24px;
}

.lobby-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 8vw, 64px);
    margin: 0 0 8px;
    letter-spacing: 2px;
    line-height: 1;
}

.code-display {
    color: #a78bfa;
    background: rgba(167, 139, 250, 0.1);
    padding: 2px 12px;
    border-radius: 8px;
    border: 1px solid rgba(167, 139, 250, 0.3);
}

.players-panel {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    margin: 28px 0;
    text-align: left;
}

.players-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.players-label {
    font-size: 11px;
    letter-spacing: 3px;
    color: #6b6b8a;
    font-weight: 600;
}

.players-count {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    color: #a78bfa;
    line-height: 1;
}

.players-ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.player-entry {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    color: #d4d4e8;
    animation: slideIn 0.3s ease calc(var(--i) * 0.05s) both;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-12px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.player-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 6px #22c55e;
    flex-shrink: 0;
}

.btn-launch {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 36px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 30px rgba(124, 58, 237, 0.4);
}

.btn-launch:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 40px rgba(124, 58, 237, 0.6);
}

.btn-launch:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-icon {
    font-size: 18px;
}

.waiting-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #6b6b8a;
    font-size: 15px;
    margin-top: 20px;
}

.pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #a78bfa;
    animation: pulse 1.5s infinite;
    flex-shrink: 0;
}

.pulse-dot.green {
    background: #22c55e;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.4;
        transform: scale(0.7);
    }
}

/* ─── GAME ─── */
.game {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.game-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 24px;
}

.game-body.has-admin-nav {
    padding-bottom: 100px;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px 20px;
    gap: 16px;
    flex-wrap: wrap;
}

.phase-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 1px;
    color: #a78bfa;
}

.phase-icon {
    font-size: 16px;
}

.scoreboard {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.score-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
}

.score-name {
    font-size: 10px;
    letter-spacing: 1px;
    color: #6b6b8a;
    text-transform: uppercase;
}

.score-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: #f0f0f5;
    line-height: 1;
}

.score-unit {
    font-size: 11px;
    color: #6b6b8a;
    margin-left: 2px;
}

.waiting-question {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #6b6b8a;
}

.waiting-icon {
    font-size: 40px;
    animation: bounce 2s infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

.question-wrapper {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.question-card {
    width: 100%;
    max-width: 680px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 28px;
    position: relative;
    overflow: hidden;
}

.question-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #7c3aed, #a855f7, #ec4899);
}

.card-buzz::before {
    background: linear-gradient(90deg, #ef4444, #f97316);
}

.card-qcm::before {
    background: linear-gradient(90deg, #7c3aed, #a855f7);
}

.question-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.badge-type,
.badge-pts,
.badge-timer {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    padding: 3px 10px;
    border-radius: 99px;
}

.badge-type {
    background: rgba(124, 58, 237, 0.2);
    color: #a78bfa;
    border: 1px solid rgba(124, 58, 237, 0.3);
}

.badge-pts {
    background: rgba(234, 179, 8, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(234, 179, 8, 0.3);
}

.badge-timer {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.question-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    letter-spacing: 1px;
    line-height: 1.2;
    margin: 0 0 28px;
    color: #f0f0f5;
}

/* ─── BUZZ ─── */
.buzz-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
}

.buzz-btn {
    position: relative;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.5), 0 0 80px rgba(239, 68, 68, 0.2);
    transition: all 0.15s;
}

.buzz-btn:active {
    transform: scale(0.93);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}

.buzz-ring {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 2px solid rgba(239, 68, 68, 0.4);
    animation: ring 2s infinite;
}

@keyframes ring {
    0% {
        transform: scale(1);
        opacity: 0.6;
    }

    100% {
        transform: scale(1.15);
        opacity: 0;
    }
}

.buzz-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 3px;
    color: white;
    position: relative;
    z-index: 1;
}

.buzzed-display {
    text-align: center;
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.buzzed-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    letter-spacing: 2px;
    color: #fbbf24;
    text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
    line-height: 1;
}

.buzzed-label {
    font-size: 13px;
    letter-spacing: 4px;
    color: #6b6b8a;
    margin-bottom: 20px;
}

.award-row {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn-correct {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.btn-correct:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
}

.btn-wrong {
    background: linear-gradient(135deg, #b91c1c, #ef4444);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-wrong:hover {
    transform: translateY(-2px);
}

.resolved-display {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    color: #22c55e;
    padding: 20px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 12px;
}

.resolved-icon {
    font-size: 28px;
}

.waiting-buzz {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #6b6b8a;
    font-size: 15px;
}

/* ─── QCM ─── */
.qcm-zone {
    width: 100%;
}

.options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.option-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    color: #d4d4e8;
}

.option-btn:hover:not(:disabled) {
    background: rgba(124, 58, 237, 0.15);
    border-color: rgba(124, 58, 237, 0.5);
    transform: translateY(-2px);
}

.option-btn.selected {
    background: rgba(124, 58, 237, 0.25);
    border-color: #7c3aed;
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
}

.option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.option-letter {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: rgba(124, 58, 237, 0.3);
    color: #a78bfa;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.option-btn.selected .option-letter {
    background: #7c3aed;
    color: white;
}

.option-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.3;
}

.answered-msg {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b6b8a;
    font-size: 13px;
    margin-top: 4px;
}

.result-display {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    border-radius: 16px;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-correct {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 16px;
    padding: 28px 40px;
    width: 100%;
}

.result-wrong {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 16px;
    padding: 28px 40px;
    width: 100%;
}

.result-icon {
    font-size: 40px;
}

.result-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
}

.result-pts {
    font-size: 18px;
    font-weight: 700;
}

.admin-answers {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.admin-answers-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    letter-spacing: 2px;
    color: #6b6b8a;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.answers-counter {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    color: #a78bfa;
    letter-spacing: 1px;
}

.admin-answer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
}

.ans-player {
    font-size: 13px;
    color: #6b6b8a;
}

.ans-value {
    font-size: 14px;
    font-weight: 600;
    color: #d4d4e8;
}

.waiting-text {
    color: #6b6b8a;
    font-size: 13px;
    text-align: center;
}

.btn-reveal {
    margin-top: 8px;
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
}

.btn-reveal:hover:not(:disabled) {
    box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);
    transform: translateY(-1px);
}

.btn-reveal:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

/* ─── ADMIN NAV ─── */
.admin-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 8px;
    align-items: center;
    background: rgba(10, 10, 18, 0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    flex-wrap: nowrap;
    z-index: 100;
}

.nav-selects {
    display: flex;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.nav-select {
    flex: 1;
    min-width: 0;
    padding: 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #d4d4e8;
    font-size: 13px;
    cursor: pointer;
    direction: ltr;
    /* Force l'ouverture vers le haut */
    position: relative;
    transform: translateZ(0);
}

.nav-select option {
    background: #1a1a2e;
}

.nav-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.btn-next {
    padding: 10px 16px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-next:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-next:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

.btn-end {
    padding: 10px 20px;
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-end:hover {
    background: rgba(239, 68, 68, 0.25);
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0;
    padding: 10px 16px;
    gap: 12px;
    flex-wrap: wrap;
    flex-shrink: 0;
}

/* ─── FINISHED ─── */
.finished {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.finished-bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse 60% 50% at 50% 0%, rgba(234, 179, 8, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 20% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 60%);
}

.finished-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 500px;
    padding: 0 24px;
}

.trophy {
    font-size: 64px;
    animation: bounce 2s infinite;
    display: block;
    margin-bottom: 8px;
}

.finished-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 10vw, 80px);
    letter-spacing: 6px;
    margin: 0 0 32px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.leaderboard {
    list-style: none;
    padding: 0;
    margin: 0 0 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.leaderboard-item {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px 20px;
    animation: slideIn 0.4s ease calc(var(--i) * 0.1s) both;
}

.leaderboard-item.rank-1 {
    background: rgba(234, 179, 8, 0.1);
    border-color: rgba(234, 179, 8, 0.3);
}

.lb-rank {
    font-size: 24px;
    width: 36px;
    text-align: center;
}

.lb-name {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
}

.lb-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    color: #fbbf24;
    line-height: 1;
}

.lb-unit {
    font-size: 12px;
    color: #6b6b8a;
    margin-left: 2px;
}

.btn-back {
    padding: 12px 28px;
    background: rgba(255, 255, 255, 0.06);
    color: #d4d4e8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* ─── RESPONSIVE ─── */
@media (max-width: 480px) {
    .options-grid {
        grid-template-columns: 1fr;
    }

    .top-bar {
        flex-direction: column;
        align-items: flex-start;
    }

    .nav-selects {
        flex-direction: column;
    }
}
</style>