<template>
    <div class="question-card"
        :class="{ 'card-buzz': currentPhase?.type === 'buzz', 'card-qcm': currentPhase?.type === 'all_answer' }">

        <!-- Badges + question — masqués sur téléphone joueur en mode display -->
        <div v-if="!displayMode || isAdmin" class="question-badges">
            <span class="badge-type">{{ currentPhase?.type === 'buzz' ? '🔔 BUZZ' : '📝 QCM' }}</span>
            <span class="badge-pts">⭐ {{ currentQuestion.points }} PT{{ currentQuestion.points > 1 ? 'S' : '' }}</span>
            <span v-if="currentQuestion.time_limit" class="badge-timer">⏱ {{ currentQuestion.time_limit }}s</span>
        </div>

        <h2 v-if="!displayMode || isAdmin" class="question-text">
            {{ currentQuestion.text }}
        </h2>

        <!-- ── BUZZ ── -->
        <div v-if="currentPhase?.type === 'buzz'" class="buzz-zone">
            <div v-if="buzzedPlayer" class="buzzed-display">
                <div class="buzzed-emoji">🔔</div>
                <div class="buzzed-name">{{ buzzedPlayer.name }}</div>
                <div class="buzzed-label">A BUZZÉ !</div>
                <div v-if="isAdmin" class="award-row">
                    <button class="btn-correct" @click="$emit('awardPoints', currentQuestion.points)">
                        ✅ +{{ currentQuestion.points }} pts
                    </button>
                    <button class="btn-wrong" @click="$emit('awardPoints', 0)">
                        ❌ Raté !
                    </button>
                </div>
            </div>

            <div v-else-if="questionResolved" class="resolved-display">
                <span class="resolved-big">🎉</span>
                <span>Bonne réponse trouvée !</span>
            </div>

            <button v-else-if="!isAdmin" class="buzz-btn" @click="$emit('buzz')">
                <span class="buzz-ring"></span>
                <span class="buzz-ring buzz-ring-2"></span>
                <span class="buzz-label">BUZZ !</span>
            </button>

            <div v-else class="waiting-buzz">
                <span class="pulse-dot"></span> En attente d'un buzz...
            </div>
        </div>

        <!-- ── QCM ── -->
        <div v-else-if="currentPhase?.type === 'all_answer'" class="qcm-zone">

            <!-- Résultat joueur -->
            <div v-if="!isAdmin && answerResult !== null" class="result-display">
                <div v-if="answerResult.isCorrect" class="result-correct">
                    <img :src="`${baseUrl}images/heureuse.png`" class="character-img" alt="" />
                    <span class="result-text">Bonne réponse !</span>
                    <span class="result-pts">+{{ answerResult.points }} pts</span>
                </div>
                <div v-else class="result-wrong">
                    <img :src="`${baseUrl}images/decue.png`" class="character-img" alt="" />
                    <span class="result-text">Pas cette fois !</span>
                </div>
            </div>

            <!-- Options joueur -->
            <div v-else-if="!isAdmin" class="options-grid" :class="{ 'options-grid-display': displayMode }">
                <button v-for="(option, i) in currentQuestion.options" :key="option.id" class="option-btn"
                    :class="{ selected: selectedAnswer === option.text, 'option-btn-large': displayMode }"
                    :disabled="hasAnswered" @click="$emit('selectOption', option.text)">
                    <span class="option-letter">{{ letters[i as number] }}</span>
                    <span v-if="!displayMode" class="option-text">{{ option.text }}</span>
                </button>
                <div v-if="hasAnswered" class="answered-msg">
                    <span class="pulse-dot"></span> Réponse envoyée — en attente des autres...
                </div>
            </div>

            <!-- Vue admin -->
            <div v-if="isAdmin" class="admin-answers">
                <div class="admin-answers-header">
                    <span>Réponses reçues</span>
                    <span class="answers-counter">{{ answers.length }} / {{ players.length }}</span>
                </div>

                <div v-if="resultsRevealed && correctAnswer" class="correct-answer-banner">
                    ✅ Bonne réponse : <strong>{{ correctAnswer }}</strong>
                </div>

                <div v-for="ans in answers" :key="ans.playerId" class="admin-answer-row" :class="{
                    'row-correct': resultsRevealed && ans.answer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim(),
                    'row-wrong': resultsRevealed && ans.answer?.toLowerCase().trim() !== correctAnswer?.toLowerCase().trim()
                }">
                    <span class="ans-player">{{ getPlayerName(ans.playerId) }}</span>
                    <span class="ans-value">{{ ans.answer }}</span>
                </div>

                <p v-if="answers.length === 0" class="waiting-text">En attente des réponses...</p>

                <button v-if="!resultsRevealed" class="btn-reveal" :disabled="answers.length === 0"
                    @click="$emit('revealResults')">
                    🎯 Révéler les résultats
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const baseUrl = import.meta.env.BASE_URL
const letters = ['A', 'B', 'C', 'D']

const props = defineProps<{
    currentQuestion: any
    currentPhase: any
    isAdmin: boolean
    displayMode: boolean
    buzzedPlayer: any
    questionResolved: boolean
    answerResult: { isCorrect: boolean; points: number } | null
    resultsRevealed: boolean
    correctAnswer: string | null
    answers: any[]
    players: any[]
    selectedAnswer: string
    hasAnswered: boolean
}>()

defineEmits<{
    (e: 'buzz'): void
    (e: 'awardPoints', points: number): void
    (e: 'selectOption', text: string): void
    (e: 'revealResults'): void
}>()

function getPlayerName(playerId: number) {
    return props.players.find(p => p.id === playerId)?.name || 'Inconnu'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800&display=swap');

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

.character-img {
    width: 140px;
    height: 140px;
    object-fit: contain;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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

.pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    animation: pulse 1.5s infinite;
    flex-shrink: 0;
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

@media (max-width: 480px) {
    .options-grid {
        grid-template-columns: 1fr;
    }
}
</style>