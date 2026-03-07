<template>
  <div class="admin-nav">
    <div class="nav-info">
      <span v-if="currentQuestion" class="current-q">
        {{ currentPhase?.title }} — {{ currentQuestion.text.substring(0, 28) }}...
      </span>
      <span v-else class="current-q muted">Prêt à lancer ?</span>
    </div>
    <div class="nav-actions">
      <button class="btn-display-toggle" :class="{ active: displayMode }" @click="$emit('toggleDisplay')">
        {{ displayMode ? '📺 ON' : '📺 OFF' }}
      </button>
      <button class="btn-next" :disabled="!hasNextQuestion" @click="$emit('next')">
        {{ currentQuestion ? '➡️ Suivante' : '▶️ Lancer !' }}
      </button>
      <button class="btn-end" @click="$emit('end')">🏁</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentQuestion: any
  currentPhase: any
  displayMode: boolean
  hasNextQuestion: boolean
}>()

defineEmits<{
  (e: 'toggleDisplay'): void
  (e: 'next'): void
  (e: 'end'): void
}>()
</script>

<style scoped>
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
</style>