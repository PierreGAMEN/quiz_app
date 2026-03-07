<template>
    <div class="game-room">

        <ConfettiLayer />

        <GameLobby v-if="gameStore.status === 'waiting'" :room-code="(route.params.code as string)"
            :players="gameStore.players" :is-admin="isAdmin" @start="startGame" />

        <div v-else-if="gameStore.status === 'in_progress'" class="game" :class="{ 'game-display': isDisplay }">

            <GameTopBar v-if="!isDisplay" :current-phase="gameStore.currentPhase" :players="gameStore.players" />

            <div class="game-body" :class="{ 'has-admin-nav': isAdmin }">

                <div v-if="!gameStore.currentQuestion" class="waiting-question">
                    <div class="waiting-emoji">🎯</div>
                    <p>{{ isAdmin ? 'Lance la première question !' : 'La prochaine question arrive...' }}</p>
                </div>

                <div v-else class="question-wrapper">
                    <QuestionDisplay v-if="isDisplay" :current-question="gameStore.currentQuestion"
                        :current-phase="gameStore.currentPhase" :buzzed-player="gameStore.buzzedPlayer"
                        :question-resolved="gameStore.questionResolved" :results-revealed="gameStore.resultsRevealed"
                        :correct-answer="gameStore.correctAnswer" :show-scores="gameStore.showScores"
                        :players="gameStore.players" />
                    <QuestionCard v-else :current-question="gameStore.currentQuestion"
                        :current-phase="gameStore.currentPhase" :is-admin="isAdmin"
                        :display-mode="gameStore.displayMode" :buzzed-player="gameStore.buzzedPlayer"
                        :question-resolved="gameStore.questionResolved" :answer-result="gameStore.answerResult"
                        :results-revealed="gameStore.resultsRevealed" :correct-answer="gameStore.correctAnswer"
                        :answers="gameStore.answers" :players="gameStore.players" :selected-answer="selectedAnswer"
                        :has-answered="hasAnswered" :show-scores="gameStore.showScores" @buzz="buzz"
                        @award-points="handleAwardPoints" @select-option="selectOption"
                        @reveal-results="revealResults" />
                </div>
            </div>

            <GameAdminNav v-if="isAdmin" :current-question="gameStore.currentQuestion"
                :current-phase="gameStore.currentPhase" :display-mode="gameStore.displayMode"
                :has-next-question="!!gameStore.nextQuestionData" :show-scores="gameStore.showScores"
                @toggle-display="toggleDisplayMode" @toggle-scores="toggleShowScores" @next="nextQuestion"
                @end="endGame" />
        </div>

        <GameFinished v-else-if="gameStore.status === 'finished'" :players="gameStore.players" :is-admin="isAdmin"
            @back="isAdmin ? router.push('/admin') : router.push('/')" />

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../../stores/gameStore'
import api from '../../services/api'

import GameLobby from './components/GameLobby.vue'
import GameFinished from './components/GameFinished.vue'
import GameTopBar from './components/GameTopBar.vue'
import GameAdminNav from './components/GameAdminNav.vue'
import QuestionDisplay from './components/QuestionDisplay.vue'
import QuestionCard from './components/QuestionCard.vue'
import ConfettiLayer from '../../components/common/ConfettiLayer.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

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

function handleAwardPoints(points: number) {
    if (!gameStore.buzzedPlayer || !gameStore.currentQuestion) return
    gameStore.awardPoints(roomCode.value, gameStore.buzzedPlayer.id, gameStore.currentQuestion.id, points)
    if (points > 0) gameStore.resolveQuestion(roomCode.value)
    else gameStore.resetBuzz(roomCode.value)
}

function revealResults() {
    if (!gameStore.currentQuestion) return
    gameStore.revealResults(roomCode.value, gameStore.currentQuestion.id)
}

function toggleShowScores() {
    gameStore.setShowScores(roomCode.value, !gameStore.showScores)
}

function endGame() {
    if (confirm('Terminer le quiz ?')) gameStore.endGame(roomCode.value)
}


</script>

<style scoped>
.game-room {
    min-height: 100vh;
    background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%);
    font-family: 'Nunito', sans-serif;
    color: #1e3a8a;
    position: relative;
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

.game {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.game-display .game-body {
    padding: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
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
    display: flex;
    justify-content: center;
}
</style>