<template>
  <div class="finished">
    <DecoCircles />

    <div class="finished-content">
      <div class="trophy-emoji">🏆</div>
      <BirthdayBadge />

      <h1 class="finished-title">
        <span class="title-small">LES</span>
        <span class="title-big">RÉSULTATS</span>
      </h1>

      <ScoreBoard :players="players" />

      <img :src="`${baseUrl}images/victoire.png`" class="character-img-large" alt="" />

      <button class="btn-back" @click="$emit('back')">
        {{ isAdmin ? '← Retour admin' : '← Accueil' }}
      </button>

      <p class="home-mention">Créé avec ❤️ pour ses 30 ans</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BirthdayBadge from '../../../components/common/BirthdayBadge.vue';
import DecoCircles from '../../../components/common/DecoCircles.vue';
import ScoreBoard from '../../../components/common/ScoreBoard.vue';

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