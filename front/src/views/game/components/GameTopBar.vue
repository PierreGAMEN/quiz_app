<template>
    <div class="top-bar">
        <div class="phase-pill">
            {{ currentPhase?.type === 'buzz' ? '🔔' : '📝' }}
            {{ currentPhase?.title ?? '...' }}
        </div>
        <div class="scoreboard">
            <div v-for="player in players" :key="player.id" class="score-entry">
                <span class="score-name">{{ player.name }}</span>
                <span class="score-val">{{ player.score }}<span class="score-unit">pts</span></span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    currentPhase: any
    players: any[]
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800&display=swap');

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

@media (max-width: 480px) {
    .top-bar {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>