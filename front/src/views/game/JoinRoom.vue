<template>
  <div class="join-room">
    <div class="join-bg"></div>
    <div class="join-content">
      <button class="btn-back" @click="router.push('/')">← Retour</button>

      <div class="logo-badge">QUIZ LIVE</div>
      <h1 class="join-title">REJOINDRE<br><span class="accent">UNE PARTIE</span></h1>

      <div class="join-card">
        <div class="field">
          <label>Code de la room</label>
          <input
            v-model="code"
            placeholder="ABC123"
            maxlength="10"
            class="input-code"
            @input="code = code.toUpperCase()"
          />
        </div>

        <div class="field">
          <label>Ton pseudo</label>
          <input
            v-model="name"
            placeholder="Ex: Pierre"
            maxlength="100"
            class="input-name"
            @keyup.enter="join"
          />
        </div>

        <p v-if="error" class="error">⚠️ {{ error }}</p>

        <button class="btn-join" :disabled="!code || !name || loading" @click="join">
          <span v-if="loading" class="loading-dots">Connexion<span>...</span></span>
          <span v-else>🎮 Rejoindre</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

const code = ref('')
const name = ref('')
const error = ref('')
const loading = ref(false)

async function join() {
  error.value = ''
  loading.value = true
  try {
    await gameStore.joinRoom(code.value, name.value)
    router.push(`/room/${code.value}`)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erreur lors de la connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');

.join-room {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a12;
  color: #f0f0f5;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.join-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 50% 60% at 80% 20%, rgba(99,60,255,0.2) 0%, transparent 70%),
    radial-gradient(ellipse 40% 50% at 10% 80%, rgba(236,72,153,0.15) 0%, transparent 70%);
  pointer-events: none;
}

.join-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.btn-back {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: #6b6b8a;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.2s;
}

.btn-back:hover { color: #d4d4e8; }

.logo-badge {
  display: inline-block;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  letter-spacing: 4px;
  color: #a78bfa;
  border: 1px solid rgba(167,139,250,0.3);
  padding: 4px 14px;
  border-radius: 99px;
}

.join-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(40px, 10vw, 64px);
  line-height: 1;
  letter-spacing: 2px;
  margin: 0;
  text-align: center;
}

.accent {
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.join-card {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 11px;
  letter-spacing: 2px;
  color: #6b6b8a;
  font-weight: 600;
  text-transform: uppercase;
}

input {
  padding: 14px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #f0f0f5;
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s;
  outline: none;
}

input::placeholder { color: #4a4a6a; }

input:focus {
  border-color: rgba(124,58,237,0.5);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
}

.input-code {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 6px;
  text-align: center;
}

.btn-join {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 30px rgba(124,58,237,0.4);
  font-family: 'DM Sans', sans-serif;
  margin-top: 4px;
}

.btn-join:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 40px rgba(124,58,237,0.6);
}

.btn-join:disabled { opacity: 0.3; cursor: not-allowed; }

.error {
  color: #f87171;
  font-size: 13px;
  margin: 0;
  text-align: center;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  padding: 10px;
}

.loading-dots span {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>