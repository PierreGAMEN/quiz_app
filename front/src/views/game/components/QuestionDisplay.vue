<template>
    <div class="display-card">

        <ScoreBoard v-if="showScores" :players="players" />

        <template v-else>
            <div class="display-phase">
                {{ currentPhase?.type === 'buzz' ? '🔔' : '📝' }}
                {{ currentPhase?.title }}
            </div>

            <h2 class="display-question">{{ currentQuestion.text }}</h2>

            <!-- QCM -->
            <div v-if="currentPhase?.type === 'all_answer'">
                <div v-if="resultsRevealed && correctAnswer" class="display-correct-answer">
                    ✅ {{ correctAnswer }}
                </div>
                <div v-else class="display-options">
                    <div v-for="(option, i) in currentQuestion.options" :key="option.id" class="display-option"
                        :class="`display-option-${i}`">
                        <span class="option-letter">{{ letters[i as number] }}</span>
                        <span class="display-option-text">{{ option.text }}</span>
                    </div>
                </div>
            </div>

            <!-- Buzz -->
            <div v-else-if="currentPhase?.type === 'buzz'" class="display-buzz">
                <div v-if="buzzedPlayer" class="display-buzzed">
                    <div class="display-buzzed-name">{{ buzzedPlayer.name }}</div>
                    <div class="display-buzzed-label">A BUZZÉ ! 🔔</div>
                </div>
                <div v-else-if="questionResolved" class="display-resolved">
                    🎉 Bonne réponse trouvée !
                </div>
                <div v-else class="display-waiting-buzz">
                    <PulseDot /> En attente d'un buzz...
                </div>
            </div>
        </template>

    </div>
</template>

<script setup lang="ts">
import PulseDot from '../../../components/common/PulseDot.vue'
import ScoreBoard from '../../../components/common/ScoreBoard.vue'

const letters = ['A', 'B', 'C', 'D']

defineProps<{
    currentQuestion: any
    currentPhase: any
    buzzedPlayer: any
    questionResolved: boolean
    resultsRevealed: boolean
    correctAnswer: string | null
    showScores: boolean
    players: any[]
}>()
</script>

<style scoped>
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
</style>