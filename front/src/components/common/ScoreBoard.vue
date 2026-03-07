<template>
  <div class="scoreboard-wrapper">
    <div class="scoreboard-title">📊 CLASSEMENT</div>
    <ol class="leaderboard">
      <li
        v-for="(player, index) in sortedPlayers"
        :key="player.id"
        class="lb-item"
        :class="`rank-${index + 1}`"
        :style="`--i: ${index}`"
      >
        <span class="lb-rank">{{ ['🥇', '🥈', '🥉'][index] ?? `${index + 1}.` }}</span>
        <span class="lb-name">{{ player.name }}</span>
        <span class="lb-score">{{ player.score }}<span class="lb-unit">pts</span></span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  players: any[]
  large?: boolean
}>()

const sortedPlayers = computed(() =>
  [...props.players].sort((a, b) => b.score - a.score)
)
</script>

<style scoped>
.scoreboard-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 700px;
}

.scoreboard-title {
  font-family: 'Righteous', sans-serif;
  font-size: clamp(22px, 4vw, 48px);
  color: #1e3a8a;
  letter-spacing: 4px;
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

.lb-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border: 2px solid rgba(29,78,216,0.1);
  border-radius: 16px;
  padding: 14px 20px;
  animation: slideIn 0.4s ease calc(var(--i) * 0.08s) both;
  box-shadow: 0 2px 12px rgba(29,78,216,0.06);
  transition: all 0.3s;
}

.lb-item.rank-1 {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fde68a;
  box-shadow: 0 4px 20px rgba(234,179,8,0.2);
}

.lb-item.rank-2 {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-color: #cbd5e1;
}

.lb-item.rank-3 {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border-color: #fed7aa;
}

.lb-rank { font-size: 22px; width: 36px; text-align: center; }

.lb-name {
  flex: 1;
  font-family: 'Righteous', sans-serif;
  font-size: clamp(16px, 2.5vw, 28px);
  color: #1e3a8a;
}

.lb-score {
  font-family: 'Righteous', sans-serif;
  font-size: clamp(22px, 3vw, 40px);
  color: #1d4ed8;
  line-height: 1;
}

.lb-unit { font-size: 12px; color: #93c5fd; margin-left: 4px; }
</style>