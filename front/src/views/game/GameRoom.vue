<template>
    <div class="game-room">

        <!-- Confettis globaux -->
        <div class="confetti-layer">
            <span v-for="i in 25" :key="i" class="confetti" :style="confettiStyle(i)"></span>
        </div>

        <!-- ─── LOBBY ─── -->
        <div v-if="gameStore.status === 'waiting'" class="lobby">
            <div class="deco deco-circle-1"></div>
            <div class="deco deco-circle-2"></div>
            <div class="deco deco-star-1">⭐</div>
            <div class="deco deco-star-2">🎉</div>

            <div class="lobby-content">
                <div class="birthday-badge">🎂 30 ANS — ÉDITION SPÉCIALE</div>

                <h1 class="lobby-title">
                    <span class="title-small">ROOM</span>
                    <span class="title-big">{{ route.params.code }}</span>
                </h1>

                <div class="sport-icons">
                    <span class="sport-icon" style="--d: 0s">🤸‍♀️</span>
                    <span class="sport-icon" style="--d: 0.2s">🧗‍♀️</span>
                    <span class="sport-icon" style="--d: 0.4s">⛷️</span>
                </div>

                <div class="players-panel">
                    <div class="players-header">
                        <span class="players-label">JOUEURS CONNECTÉS</span>
                        <span class="players-count">{{ gameStore.players.length }}</span>
                    </div>
                    <ul class="players-ul">
                        <li v-for="(player, i) in gameStore.players" :key="player.id" class="player-entry"
                            :style="`--i: ${i}`">
                            <span class="player-dot"></span>
                            {{ player.name }}
                        </li>
                        <li v-if="gameStore.players.length === 0" class="player-empty">
                            En attente de joueurs...
                        </li>
                    </ul>
                </div>

                <div v-if="isAdmin" class="admin-actions">
                    <button :disabled="gameStore.players.length === 0" class="btn-launch" @click="startGame">
                        🎮 LANCER LE QUIZ
                    </button>
                </div>
                <div v-else class="waiting-msg">
                    <span class="pulse-dot"></span>
                    En attente du lancement par l'admin...
                </div>

                <p class="home-mention">Créé avec ❤️ pour ses 30 ans</p>
            </div>
        </div>

        <!-- ─── JEU EN COURS ─── -->
        <div v-else-if="gameStore.status === 'in_progress'" class="game" :class="{ 'game-display': isDisplay }">

            <!-- Top bar — masquée en mode display -->
            <div v-if="!isDisplay" class="top-bar">
                <div class="phase-pill">
                    {{ gameStore.currentPhase?.type === 'buzz' ? '🔔' : '📝' }}
                    {{ gameStore.currentPhase?.title ?? '...' }}
                </div>
                <div class="scoreboard">
                    <div v-for="player in gameStore.players" :key="player.id" class="score-entry">
                        <span class="score-name">{{ player.name }}</span>
                        <span class="score-val">{{ player.score }}<span class="score-unit">pts</span></span>
                    </div>
                </div>
            </div>

            <!-- Zone centrale -->
            <div class="game-body" :class="{ 'has-admin-nav': isAdmin }">

                <!-- Attente question -->
                <div v-if="!gameStore.currentQuestion" class="waiting-question">
                    <div class="waiting-emoji">🎯</div>
                    <p>{{ isAdmin ? 'Lance la première question !' : 'La prochaine question arrive...' }}</p>
                </div>

                <!-- Question -->
                <div v-else class="question-wrapper">

                    <!-- ── MODE DISPLAY TV ── -->
                    <div v-if="isDisplay" class="display-card">
                        <div class="display-phase">
                            {{ gameStore.currentPhase?.type === 'buzz' ? '🔔' : '📝' }}
                            {{ gameStore.currentPhase?.title }}
                        </div>

                        <h2 class="display-question">{{ gameStore.currentQuestion.text }}</h2>

                        <!-- QCM TV : options ou bonne réponse après révélation -->
                        <div v-if="gameStore.currentPhase?.type === 'all_answer'">
                            <div v-if="gameStore.resultsRevealed && gameStore.correctAnswer"
                                class="display-correct-answer">
                                ✅ {{ gameStore.correctAnswer }}
                            </div>
                            <div v-else class="display-options">
                                <div v-for="(option, i) in gameStore.currentQuestion.options" :key="option.id"
                                    class="display-option" :class="`display-option-${i}`">
                                    <span class="display-option-letter">{{ letters[i as number] }}</span>
                                    <span class="display-option-text">{{ option.text }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Buzz TV -->
                        <div v-else-if="gameStore.currentPhase?.type === 'buzz'" class="display-buzz">
                            <div v-if="gameStore.buzzedPlayer" class="display-buzzed">
                                <div class="display-buzzed-name">{{ gameStore.buzzedPlayer.name }}</div>
                                <div class="display-buzzed-label">A BUZZÉ ! 🔔</div>
                            </div>
                            <div v-else-if="gameStore.questionResolved" class="display-resolved">
                                🎉 Bonne réponse trouvée !
                            </div>
                            <div v-else class="display-waiting-buzz">
                                <span class="pulse-dot blue"></span> En attente d'un buzz...
                            </div>
                        </div>
                    </div>

                    <!-- ── MODE NORMAL (admin + joueurs) ── -->
                    <div v-else class="question-card"
                        :class="{ 'card-buzz': gameStore.currentPhase?.type === 'buzz', 'card-qcm': gameStore.currentPhase?.type === 'all_answer' }">

                        <!-- Badges et question — masqués sur téléphone joueur en mode display -->
                        <div v-if="!gameStore.displayMode || isAdmin" class="question-badges">
                            <span class="badge-type">{{ gameStore.currentPhase?.type === 'buzz' ? '🔔 BUZZ' : '📝 QCM'
                                }}</span>
                            <span class="badge-pts">⭐ {{ gameStore.currentQuestion.points }} PT{{
                                gameStore.currentQuestion.points > 1 ? 'S' : '' }}</span>
                            <span v-if="gameStore.currentQuestion.time_limit" class="badge-timer">⏱ {{
                                gameStore.currentQuestion.time_limit }}s</span>
                        </div>

                        <h2 v-if="!gameStore.displayMode || isAdmin" class="question-text">
                            {{ gameStore.currentQuestion.text }}
                        </h2>

                        <!-- ── BUZZ ── -->
                        <div v-if="gameStore.currentPhase?.type === 'buzz'" class="buzz-zone">

                            <!-- Quelqu'un a buzzé -->
                            <div v-if="gameStore.buzzedPlayer" class="buzzed-display">
                                <div class="buzzed-emoji">🔔</div>
                                <div class="buzzed-name">{{ gameStore.buzzedPlayer.name }}</div>
                                <div class="buzzed-label">A BUZZÉ !</div>
                                <div v-if="isAdmin" class="award-row">
                                    <button class="btn-correct" @click="awardPoints(gameStore.currentQuestion.points)">
                                        ✅ +{{ gameStore.currentQuestion.points }} pts
                                    </button>
                                    <button class="btn-wrong" @click="awardPointsAndReset(0)">
                                        ❌ Raté !
                                    </button>
                                </div>
                            </div>

                            <!-- Question résolue -->
                            <div v-else-if="gameStore.questionResolved" class="resolved-display">
                                <span class="resolved-big">🎉</span>
                                <span>Bonne réponse trouvée !</span>
                            </div>

                            <!-- Joueur : bouton buzz -->
                            <button v-else-if="!isAdmin" class="buzz-btn" @click="buzz">
                                <span class="buzz-ring"></span>
                                <span class="buzz-ring buzz-ring-2"></span>
                                <span class="buzz-label">BUZZ !</span>
                            </button>

                            <!-- Admin : attente -->
                            <div v-else class="waiting-buzz">
                                <span class="pulse-dot blue"></span> En attente d'un buzz...
                            </div>
                        </div>

                        <!-- ── QCM ── -->
                        <div v-else-if="gameStore.currentPhase?.type === 'all_answer'" class="qcm-zone">

                            <!-- Résultat joueur après révélation -->
                            <div v-if="!isAdmin && gameStore.answerResult !== null" class="result-display">
                                <div v-if="gameStore.answerResult.isCorrect" class="result-correct">
                                    <img :src="`${baseUrl}images/heureuse.png`" class="character-img" alt="" />
                                    <span class="result-text">Bonne réponse !</span>
                                    <span class="result-pts">+{{ gameStore.answerResult.points }} pts</span>
                                </div>
                                <div v-else class="result-wrong">
                                    <img :src="`${baseUrl}images/decue.png`" class="character-img" alt="" />
                                    <span class="result-text">Pas cette fois !</span>
                                </div>
                            </div>

                            <!-- Options joueur -->
                            <div v-else-if="!isAdmin" class="options-grid"
                                :class="{ 'options-grid-display': gameStore.displayMode }">
                                <button v-for="(option, i) in gameStore.currentQuestion.options" :key="option.id"
                                    class="option-btn" :class="{
                                        selected: selectedAnswer === option.text,
                                        'option-btn-large': gameStore.displayMode
                                    }" :disabled="hasAnswered" @click="selectOption(option.text)">
                                    <span class="option-letter">{{ letters[i as number] }}</span>
                                    <span v-if="!gameStore.displayMode" class="option-text">{{ option.text }}</span>
                                </button>
                                <div v-if="hasAnswered" class="answered-msg">
                                    <span class="pulse-dot blue"></span> Réponse envoyée — en attente des autres...
                                </div>
                            </div>

                            <!-- Vue admin -->
                            <div v-if="isAdmin" class="admin-answers">
                                <div class="admin-answers-header">
                                    <span>Réponses reçues</span>
                                    <span class="answers-counter">{{ gameStore.answers.length }} / {{
                                        gameStore.players.length }}</span>
                                </div>

                                <!-- Bonne réponse après révélation -->
                                <div v-if="gameStore.resultsRevealed && gameStore.correctAnswer"
                                    class="correct-answer-banner">
                                    ✅ Bonne réponse : <strong>{{ gameStore.correctAnswer }}</strong>
                                </div>

                                <div v-for="ans in gameStore.answers" :key="ans.playerId" class="admin-answer-row"
                                    :class="{
                                        'row-correct': gameStore.resultsRevealed && ans.answer?.toLowerCase().trim() === gameStore.correctAnswer?.toLowerCase().trim(),
                                        'row-wrong': gameStore.resultsRevealed && ans.answer?.toLowerCase().trim() !== gameStore.correctAnswer?.toLowerCase().trim()
                                    }">
                                    <span class="ans-player">{{ getPlayerName(ans.playerId) }}</span>
                                    <span class="ans-value">{{ ans.answer }}</span>
                                </div>

                                <p v-if="gameStore.answers.length === 0" class="waiting-text">En attente des réponses...
                                </p>

                                <button v-if="!gameStore.resultsRevealed" class="btn-reveal"
                                    :disabled="gameStore.answers.length === 0" @click="revealResults">
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
                        {{ gameStore.currentPhase?.title }} — {{ gameStore.currentQuestion.text.substring(0, 28) }}...
                    </span>
                    <span v-else class="current-q muted">Prêt à lancer ?</span>
                </div>
                <div class="nav-actions">
                    <button class="btn-display-toggle" :class="{ active: gameStore.displayMode }"
                        @click="toggleDisplayMode">
                        {{ gameStore.displayMode ? '📺 ON' : '📺 OFF' }}
                    </button>
                    <button class="btn-next" :disabled="!gameStore.nextQuestionData" @click="nextQuestion">
                        {{ gameStore.currentQuestion ? '➡️ Suivante' : '▶️ Lancer !' }}
                    </button>
                    <button class="btn-end" @click="endGame">🏁</button>
                </div>
            </div>
        </div>

        <!-- ─── FIN DE PARTIE ─── -->
        <div v-else-if="gameStore.status === 'finished'" class="finished">
            <div class="deco deco-circle-1"></div>
            <div class="deco deco-circle-2"></div>

            <div class="finished-content">
                <div class="trophy-emoji">🏆</div>
                <img :src="`${baseUrl}images/victoire.png`" class="character-img-large" alt="" />
                <div class="birthday-badge">🎂 30 ANS — ÉDITION SPÉCIALE</div>
                <h1 class="finished-title">
                    <span class="title-small">LES</span>
                    <span class="title-big">RÉSULTATS</span>
                </h1>

                <ol class="leaderboard">
                    <li v-for="(player, index) in gameStore.players" :key="player.id" class="leaderboard-item"
                        :class="`rank-${index + 1}`" :style="`--i: ${index}`">
                        <span class="lb-rank">{{ ['🥇', '🥈', '🥉'][index] ?? `${index + 1}.` }}</span>
                        <span class="lb-name">{{ player.name }}</span>
                        <span class="lb-score">{{ player.score }}<span class="lb-unit">pts</span></span>
                    </li>
                </ol>

                <div class="sport-icons">
                    <span class="sport-icon" style="--d: 0s">🤸‍♀️</span>
                    <span class="sport-icon" style="--d: 0.2s">🧗‍♀️</span>
                    <span class="sport-icon" style="--d: 0.4s">⛷️</span>
                </div>

                <button v-if="isAdmin" class="btn-back" @click="router.push('/admin')">← Retour admin</button>
                <button v-else class="btn-back" @click="router.push('/')">← Accueil</button>

                <p class="home-mention">Créé avec ❤️ pour ses 30 ans</p>
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
const baseUrl = import.meta.env.BASE_URL

const letters = ['A', 'B', 'C', 'D']
const isAdmin = computed(() => route.query.admin === 'true')
const isDisplay = computed(() => route.query.display === 'true')
const roomCode = computed(() => route.params.code as string)

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

function toggleDisplayMode() {
    gameStore.setDisplayMode(roomCode.value, !gameStore.displayMode)
}

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

function confettiStyle(i: number) {
    const colors = ['#1d4ed8', '#3b82f6', '#fbbf24', '#f472b6', '#34d399', '#f87171', '#a78bfa', '#ffffff']
    const color = colors[i % colors.length]
    const left = (i * 4.1) % 100
    const delay = (i * 0.18) % 5
    const duration = 4 + (i % 3)
    const size = 6 + (i % 8)
    return {
        '--color': color,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size * 0.5}px`,
        transform: `rotate(${i * 47}deg)`,
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800&display=swap');

/* ─── BASE ─── */
.game-room {
    min-height: 100vh;
    background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%);
    font-family: 'Nunito', sans-serif;
    color: #1e3a8a;
    position: relative;
}

/* ─── CONFETTIS ─── */
.confetti-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
}

.confetti {
    position: absolute;
    top: -20px;
    background: var(--color);
    border-radius: 2px;
    animation: fall linear infinite;
    opacity: 0.5;
}

@keyframes fall {
    0% {
        transform: translateY(-20px) rotate(0deg);
        opacity: 0.6;
    }

    100% {
        transform: translateY(110vh) rotate(720deg);
        opacity: 0;
    }
}

/* ─── DÉCOS ─── */
.deco {
    position: absolute;
    pointer-events: none;
    z-index: 0;
}

.deco-circle-1 {
    width: 350px;
    height: 350px;
    border-radius: 50%;
    border: 3px solid rgba(29, 78, 216, 0.1);
    top: -100px;
    right: -100px;
    animation: spin 25s linear infinite;
}

.deco-circle-2 {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    border: 2px dashed rgba(29, 78, 216, 0.08);
    bottom: -60px;
    left: -60px;
    animation: spin 18s linear infinite reverse;
}

.deco-star-1 {
    font-size: 28px;
    top: 10%;
    left: 6%;
    animation: floatStar 3s ease-in-out infinite;
}

.deco-star-2 {
    font-size: 24px;
    top: 15%;
    right: 8%;
    animation: floatStar 3.5s ease-in-out infinite 0.5s;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes floatStar {

    0%,
    100% {
        transform: translateY(0) rotate(-5deg);
    }

    50% {
        transform: translateY(-10px) rotate(5deg);
    }
}

/* ─── LOBBY ─── */
.lobby {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 24px;
}

.lobby-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.birthday-badge {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: white;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2px;
    padding: 6px 18px;
    border-radius: 99px;
    box-shadow: 0 4px 16px rgba(29, 78, 216, 0.3);
}

.lobby-title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
}

.title-small {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(16px, 4vw, 22px);
    color: #3b82f6;
    letter-spacing: 4px;
}

.title-big {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(52px, 14vw, 80px);
    color: #1e3a8a;
    text-shadow: 3px 3px 0 rgba(29, 78, 216, 0.15);
    line-height: 0.95;
    letter-spacing: 3px;
}

.sport-icons {
    display: flex;
    gap: 16px;
}

.sport-icon {
    font-size: 28px;
    animation: bounce 2s ease-in-out infinite;
    animation-delay: var(--d);
    display: inline-block;
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

.players-panel {
    width: 100%;
    background: white;
    border: 2px solid rgba(29, 78, 216, 0.1);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(29, 78, 216, 0.08);
}

.players-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.players-label {
    font-size: 11px;
    letter-spacing: 2px;
    color: #93c5fd;
    font-weight: 800;
    text-transform: uppercase;
}

.players-count {
    font-family: 'Righteous', sans-serif;
    font-size: 24px;
    color: #1d4ed8;
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
    font-weight: 700;
    color: #1e3a8a;
    animation: slideIn 0.3s ease calc(var(--i) * 0.05s) both;
}

.player-empty {
    color: #93c5fd;
    font-size: 14px;
    text-align: center;
    padding: 8px 0;
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
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: white;
    border: none;
    border-radius: 16px;
    font-family: 'Righteous', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 6px 24px rgba(29, 78, 216, 0.35);
}

.btn-launch:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(29, 78, 216, 0.45);
}

.btn-launch:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.waiting-msg {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #93c5fd;
    font-size: 15px;
    font-weight: 600;
}

.pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    animation: pulse 1.5s infinite;
    flex-shrink: 0;
}

.pulse-dot.blue {
    background: #3b82f6;
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

.home-mention {
    color: #93c5fd;
    font-size: 13px;
    font-weight: 600;
    margin: 0;
}

/* ─── GAME ─── */
.game {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.game-display {
    height: 100vh;
    overflow: hidden;
}

.game-display .game-body {
    padding: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-bottom: 2px solid rgba(29, 78, 216, 0.1);
    padding: 10px 16px;
    gap: 12px;
    flex-wrap: wrap;
    flex-shrink: 0;
    box-shadow: 0 2px 12px rgba(29, 78, 216, 0.08);
}

.phase-pill {
    font-family: 'Righteous', sans-serif;
    font-size: 16px;
    letter-spacing: 1px;
    color: #1d4ed8;
    display: flex;
    align-items: center;
    gap: 6px;
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
    color: #93c5fd;
    text-transform: uppercase;
    font-weight: 800;
}

.score-val {
    font-family: 'Righteous', sans-serif;
    font-size: 20px;
    color: #1d4ed8;
    line-height: 1;
}

.score-unit {
    font-size: 11px;
    color: #93c5fd;
    margin-left: 2px;
}

.game-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 24px;
}

.game-body.has-admin-nav {
    padding-bottom: 90px;
}

.waiting-question {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
    color: #93c5fd;
    min-height: 200px;
}

.waiting-emoji {
    font-size: 48px;
    animation: bounce 2s infinite;
}

.question-wrapper {
    display: flex;
    justify-content: center;
}

/* ─── QUESTION CARD ─── */
.question-card {
    width: 100%;
    max-width: 680px;
    background: white;
    border: 2px solid rgba(29, 78, 216, 0.1);
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 4px 24px rgba(29, 78, 216, 0.1);
    position: relative;
    overflow: hidden;
}

.question-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1d4ed8, #3b82f6, #f472b6);
}

.card-buzz::before {
    background: linear-gradient(90deg, #f97316, #ef4444);
}

.card-qcm::before {
    background: linear-gradient(90deg, #1d4ed8, #3b82f6);
}

.question-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.badge-type,
.badge-pts,
.badge-timer {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    padding: 4px 12px;
    border-radius: 99px;
}

.badge-type {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1.5px solid #bfdbfe;
}

.badge-pts {
    background: #fffbeb;
    color: #d97706;
    border: 1.5px solid #fde68a;
}

.badge-timer {
    background: #fff1f2;
    color: #e11d48;
    border: 1.5px solid #fecdd3;
}

.question-text {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(20px, 4vw, 30px);
    letter-spacing: 1px;
    line-height: 1.3;
    margin: 0 0 24px;
    color: #1e3a8a;
}

/* ─── BUZZ ─── */
.buzz-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
}

.buzz-btn {
    position: relative;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444, #f97316);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.15);
    transition: all 0.15s;
}

.buzz-btn:active {
    transform: scale(0.92);
}

.buzz-ring {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    border: 3px solid rgba(239, 68, 68, 0.3);
    animation: ring 2s infinite;
}

.buzz-ring-2 {
    inset: -20px;
    border-color: rgba(239, 68, 68, 0.15);
    animation-delay: 0.4s;
}

@keyframes ring {
    0% {
        transform: scale(1);
        opacity: 0.7;
    }

    100% {
        transform: scale(1.2);
        opacity: 0;
    }
}

.buzz-label {
    font-family: 'Righteous', sans-serif;
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

.buzzed-emoji {
    font-size: 40px;
}

.buzzed-name {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(32px, 8vw, 52px);
    color: #1d4ed8;
    line-height: 1;
    margin: 4px 0;
}

.buzzed-label {
    font-size: 12px;
    letter-spacing: 4px;
    color: #93c5fd;
    font-weight: 800;
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
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
    font-family: 'Nunito', sans-serif;
}

.btn-correct:hover {
    transform: translateY(-2px);
}

.btn-wrong {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Nunito', sans-serif;
}

.btn-wrong:hover {
    transform: translateY(-2px);
}

.resolved-display {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 700;
    color: #16a34a;
    padding: 16px 20px;
    background: #f0fdf4;
    border: 2px solid #bbf7d0;
    border-radius: 14px;
}

.resolved-big {
    font-size: 28px;
}

.waiting-buzz {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #93c5fd;
    font-size: 15px;
    font-weight: 600;
}

/* ─── QCM ─── */
.qcm-zone {
    width: 100%;
}

.options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.options-grid-display {
    gap: 16px;
}

.option-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f0f7ff;
    border: 2px solid #bfdbfe;
    border-radius: 14px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    color: #1e3a8a;
    font-family: 'Nunito', sans-serif;
}

.option-btn:hover:not(:disabled) {
    background: #dbeafe;
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.15);
}

.option-btn.selected {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: white;
    box-shadow: 0 4px 16px rgba(29, 78, 216, 0.3);
}

.option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.option-letter {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: #bfdbfe;
    color: #1d4ed8;
    font-family: 'Righteous', sans-serif;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.option-btn.selected .option-letter {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.option-text {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
}

.option-btn-large {
    justify-content: center;
    padding: 24px;
    min-height: 80px;
}

.option-btn-large .option-letter {
    width: 44px;
    height: 44px;
    font-size: 24px;
    border-radius: 12px;
}

.answered-msg {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #3b82f6;
    font-size: 13px;
    font-weight: 600;
    margin-top: 4px;
}

/* ─── RÉSULTATS JOUEUR ─── */
.result-display {
    display: flex;
    justify-content: center;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-correct {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background: #f0fdf4;
    border: 2px solid #bbf7d0;
    border-radius: 20px;
    padding: 32px 40px;
    width: 100%;
}

.result-wrong {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background: #fff1f2;
    border: 2px solid #fecdd3;
    border-radius: 20px;
    padding: 32px 40px;
    width: 100%;
}

.result-text {
    font-family: 'Righteous', sans-serif;
    font-size: 26px;
    letter-spacing: 2px;
    color: #1e3a8a;
}

.result-pts {
    font-size: 20px;
    font-weight: 800;
    color: #1d4ed8;
}

/* ─── ADMIN ANSWERS ─── */
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
    color: #93c5fd;
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.answers-counter {
    font-family: 'Righteous', sans-serif;
    font-size: 20px;
    color: #1d4ed8;
}

.correct-answer-banner {
    background: #f0fdf4;
    border: 2px solid #bbf7d0;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 15px;
    font-weight: 700;
    color: #16a34a;
    text-align: center;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.admin-answer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: #f0f7ff;
    border: 1.5px solid #bfdbfe;
    border-radius: 10px;
    transition: all 0.3s;
}

.row-correct {
    background: #f0fdf4 !important;
    border-color: #bbf7d0 !important;
}

.row-wrong {
    background: #fff1f2 !important;
    border-color: #fecdd3 !important;
    opacity: 0.6;
}

.ans-player {
    font-size: 13px;
    color: #93c5fd;
    font-weight: 700;
}

.ans-value {
    font-size: 14px;
    font-weight: 800;
    color: #1d4ed8;
}

.waiting-text {
    color: #93c5fd;
    font-size: 13px;
    text-align: center;
    font-weight: 600;
}

.btn-reveal {
    margin-top: 8px;
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(29, 78, 216, 0.3);
    font-family: 'Nunito', sans-serif;
}

.btn-reveal:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(29, 78, 216, 0.4);
}

.btn-reveal:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

/* ─── MODE DISPLAY TV ─── */
.display-card {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 48px;
    padding: 60px 100px;
}

.display-phase {
    font-family: 'Righteous', sans-serif;
    font-size: 22px;
    color: #3b82f6;
    letter-spacing: 3px;
    text-align: center;
    background: white;
    padding: 8px 24px;
    border-radius: 99px;
    border: 2px solid #bfdbfe;
}

.display-question {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(40px, 6vw, 72px);
    color: #1e3a8a;
    text-align: center;
    line-height: 1.2;
    margin: 0;
}

.display-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    width: 100%;
    max-width: 900px;
}

.display-option {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px 32px;
    border-radius: 20px;
    font-size: 26px;
    font-weight: 800;
    font-family: 'Nunito', sans-serif;
}

.display-option-0 {
    background: #eff6ff;
    border: 2px solid #bfdbfe;
    color: #1e3a8a;
}

.display-option-1 {
    background: #f0fdf4;
    border: 2px solid #bbf7d0;
    color: #14532d;
}

.display-option-2 {
    background: #fffbeb;
    border: 2px solid #fde68a;
    color: #78350f;
}

.display-option-3 {
    background: #fff1f2;
    border: 2px solid #fecdd3;
    color: #881337;
}

.display-option-letter {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(29, 78, 216, 0.1);
    color: #1d4ed8;
    font-family: 'Righteous', sans-serif;
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.display-option-text {
    font-size: 22px;
}

.display-correct-answer {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(32px, 6vw, 60px);
    color: #16a34a;
    background: #f0fdf4;
    border: 3px solid #bbf7d0;
    border-radius: 24px;
    padding: 32px 64px;
    text-align: center;
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.display-buzz {
    text-align: center;
}

.display-buzzed-name {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(60px, 12vw, 120px);
    color: #1d4ed8;
    line-height: 1;
    text-align: center;
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.display-buzzed-label {
    font-size: 32px;
    font-weight: 800;
    color: #3b82f6;
    letter-spacing: 4px;
    text-align: center;
    margin-top: 8px;
}

.display-resolved {
    font-family: 'Righteous', sans-serif;
    font-size: 36px;
    color: #16a34a;
    text-align: center;
}

.display-waiting-buzz {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    color: #93c5fd;
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
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-top: 2px solid rgba(29, 78, 216, 0.1);
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    z-index: 100;
    box-shadow: 0 -4px 20px rgba(29, 78, 216, 0.08);
}

.nav-info {
    flex: 1;
    min-width: 0;
}

.current-q {
    font-size: 12px;
    font-weight: 700;
    color: #3b82f6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
}

.current-q.muted {
    color: #93c5fd;
}

.nav-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.btn-display-toggle {
    padding: 10px 14px;
    background: #f0f7ff;
    color: #93c5fd;
    border: 2px solid #bfdbfe;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    font-family: 'Nunito', sans-serif;
}

.btn-display-toggle.active {
    background: #1d4ed8;
    color: white;
    border-color: #1d4ed8;
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
}

.btn-next {
    padding: 10px 16px;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    font-family: 'Nunito', sans-serif;
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
}

.btn-next:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-next:hover:not(:disabled) {
    transform: translateY(-1px);
}

.btn-end {
    padding: 10px 14px;
    background: #fff1f2;
    color: #e11d48;
    border: 2px solid #fecdd3;
    border-radius: 10px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-end:hover {
    background: #ffe4e6;
}

/* ─── FINISHED ─── */
.finished {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 24px;
}

.finished-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.trophy-emoji {
    font-size: 72px;
    animation: bounce 1.5s infinite;
    display: block;
}

.finished-title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
}

.leaderboard {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.leaderboard-item {
    display: flex;
    align-items: center;
    gap: 16px;
    background: white;
    border: 2px solid rgba(29, 78, 216, 0.1);
    border-radius: 16px;
    padding: 16px 20px;
    animation: slideIn 0.4s ease calc(var(--i) * 0.1s) both;
    box-shadow: 0 2px 12px rgba(29, 78, 216, 0.06);
}

.leaderboard-item.rank-1 {
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border-color: #fde68a;
    box-shadow: 0 4px 20px rgba(234, 179, 8, 0.2);
}

.leaderboard-item.rank-2 {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-color: #cbd5e1;
}

.leaderboard-item.rank-3 {
    background: linear-gradient(135deg, #fff7ed, #ffedd5);
    border-color: #fed7aa;
}

.lb-rank {
    font-size: 24px;
    width: 36px;
    text-align: center;
}

.lb-name {
    flex: 1;
    font-size: 16px;
    font-weight: 800;
    text-align: left;
    color: #1e3a8a;
}

.lb-score {
    font-family: 'Righteous', sans-serif;
    font-size: 26px;
    color: #1d4ed8;
    line-height: 1;
}

.lb-unit {
    font-size: 12px;
    color: #93c5fd;
    margin-left: 2px;
}

.character-img {
    width: 140px;
    height: 140px;
    object-fit: contain;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.character-img-large {
    width: 180px;
    height: 180px;
    object-fit: contain;
    animation: bounce 2s infinite;
}

.btn-back {
    padding: 14px 32px;
    background: white;
    color: #1d4ed8;
    border: 2px solid #bfdbfe;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Nunito', sans-serif;
    box-shadow: 0 2px 12px rgba(29, 78, 216, 0.1);
}

.btn-back:hover {
    background: #eff6ff;
    transform: translateY(-2px);
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
}
</style>