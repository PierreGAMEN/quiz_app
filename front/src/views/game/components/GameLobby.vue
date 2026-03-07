<template>
  <div class="lobby">
    <DecoCircles />
    <div class="deco deco-star-1">⭐</div>
    <div class="deco deco-star-2">🎉</div>

    <div class="lobby-content">
      <BirthdayBadge />

      <h1 class="lobby-title">
        <span class="title-small">ROOM</span>
        <span class="title-big">{{ roomCode }}</span>
      </h1>

      <SportIcons />

      <div class="players-panel">
        <div class="players-header">
          <span class="players-label">JOUEURS CONNECTÉS</span>
          <span class="players-count">{{ players.length }}</span>
        </div>
        <ul class="players-ul">
          <li v-for="(player, i) in players" :key="player.id" class="player-entry" :style="`--i: ${i}`">
            <span class="player-dot"></span>
            {{ player.name }}
          </li>
          <li v-if="players.length === 0" class="player-empty">
            En attente de joueurs...
          </li>
        </ul>
      </div>

      <div v-if="isAdmin" class="admin-actions">
        <button :disabled="players.length === 0" class="btn-launch" @click="$emit('start')">
          🎮 LANCER LE QUIZ
        </button>
      </div>
      <div v-else class="waiting-msg">
        <PulseDot />
        En attente du lancement par l'admin...
      </div>

      <p class="home-mention">Créé avec ❤️ pour ses 30 ans</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BirthdayBadge from '../../../components/common/BirthdayBadge.vue';
import DecoCircles from '../../../components/common/DecoCircles.vue';
import PulseDot from '../../../components/common/PulseDot.vue';
import SportIcons from '../../../components/common/SportIcons.vue';

defineProps<{
  roomCode: string
  players: any[]
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'start'): void
}>()
</script>

<style scoped>
.lobby {
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
</style>