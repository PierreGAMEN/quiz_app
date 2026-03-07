<template>
  <div class="finished">
    <div class="deco deco-circle-1"></div>
    <div class="deco deco-circle-2"></div>

    <div class="finished-content">
      <div class="trophy-emoji">🏆</div>
      <img :src="`${baseUrl}images/victoire.png`" class="character-img-large" alt="" />
      <BirthdayBadge />

      <h1 class="finished-title">
        <span class="title-small">LES</span>
        <span class="title-big">RÉSULTATS</span>
      </h1>

      <ol class="leaderboard">
        <li v-for="(player, index) in players" :key="player.id" class="leaderboard-item" :class="`rank-${index + 1}`"
          :style="`--i: ${index}`">
          <span class="lb-rank">{{ ['🥇', '🥈', '🥉'][index] ?? `${index + 1}.` }}</span>
          <span class="lb-name">{{ player.name }}</span>
          <span class="lb-score">{{ player.score }}<span class="lb-unit">pts</span></span>
        </li>
      </ol>

      <SportIcons />

      <button class="btn-back" @click="$emit('back')">
        {{ isAdmin ? '← Retour admin' : '← Accueil' }}
      </button>

      <p class="home-mention">Créé avec ❤️ pour ses 30 ans</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BirthdayBadge from '../../../components/common/BirthdayBadge.vue';
import SportIcons from '../../../components/common/SportIcons.vue';

const baseUrl = import.meta.env.BASE_URL

defineProps<{
  players: any[]
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'back'): void
}>()
</script>

<style scoped>
.finished {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
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

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

.character-img-large {
  width: 180px;
  height: 180px;
  object-fit: contain;
  animation: bounce 2s infinite;
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

.finished-title {
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

.home-mention {
  color: #93c5fd;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}
</style>