<template>
  <div class="join-room">
    <div class="card">
      <h1>🎯 Rejoindre une partie</h1>

      <div class="field">
        <label>Code de la room</label>
        <input
          v-model="code"
          placeholder="Ex: ABC123"
          maxlength="10"
          style="text-transform: uppercase"
          @input="code = code.toUpperCase()"
        />
      </div>

      <div class="field">
        <label>Ton pseudo</label>
        <input v-model="name" placeholder="Ex: Pierre" maxlength="100" />
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <button :disabled="!code || !name || loading" @click="join">
        {{ loading ? 'Connexion...' : 'Rejoindre' }}
      </button>
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
.join-room {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  font-family: sans-serif;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h1 { margin: 0 0 8px; font-size: 24px; text-align: center; }

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label { font-size: 13px; font-weight: 500; color: #374151; }

input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 15px;
}

button {
  padding: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

button:disabled { opacity: 0.4; cursor: not-allowed; }

.error { color: #ef4444; font-size: 13px; margin: 0; }
</style>