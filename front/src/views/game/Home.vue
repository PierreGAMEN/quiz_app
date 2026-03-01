<template>
  <div class="home">
    <div class="card">
      <h1>🎯 Quiz App</h1>
      <p>Rejoins une partie ou accède à l'espace admin.</p>
      <button @click="router.push('/join')">Rejoindre une partie</button>
      <button class="secondary" @click="router.push('/admin')">Espace admin</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.home {
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
  text-align: center;
}

h1 { margin: 0; font-size: 32px; }
p { color: #6b7280; margin: 0; }

button {
  padding: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

button.secondary {
  background: white;
  color: #4f46e5;
  border: 1px solid #4f46e5;
}
</style>