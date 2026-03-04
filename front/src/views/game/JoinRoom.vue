<template>
    <div class="join-room">
        <!-- Confettis -->
        <div class="confetti-layer">
            <span v-for="i in 20" :key="i" class="confetti" :style="confettiStyle(i)"></span>
        </div>

        <div class="deco deco-circle-1"></div>
        <div class="deco deco-circle-2"></div>

        <div class="join-content">
            <button class="btn-back" @click="router.push('/')">← Retour</button>

            <div class="birthday-badge">🎂 30 ANS — ÉDITION SPÉCIALE</div>

            <h1 class="join-title">
                <span class="title-small">REJOINDRE</span>
                <span class="title-big">LA FÊTE</span>
            </h1>

            <div class="sport-icons">
                <span class="sport-icon" style="--d: 0s">🤸‍♀️</span>
                <span class="sport-icon" style="--d: 0.2s">🧗‍♀️</span>
                <span class="sport-icon" style="--d: 0.4s">⛷️</span>
            </div>

            <div class="join-card">
                <div class="field">
                    <label>Code de la room</label>
                    <input v-model="code" placeholder="ABC123" maxlength="10" class="input-code"
                        @input="code = code.toUpperCase()" />
                </div>

                <div class="field">
                    <label>Ton prénom</label>
                    <input v-model="name" placeholder="Ex: Pierre" maxlength="100" class="input-name"
                        @keyup.enter="join" />
                </div>

                <p v-if="error" class="error">⚠️ {{ error }}</p>

                <button class="btn-join" :disabled="!code || !name || loading" @click="join">
                    <span v-if="loading">Connexion en cours...</span>
                    <span v-else>🎉 C'est parti !</span>
                </button>
            </div>

            <p class="home-mention">Créé avec ❤️ pour ses 30 ans</p>
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
        error.value = err.response?.data?.error || 'Room introuvable, vérifie le code !'
    } finally {
        loading.value = false
    }
}

function confettiStyle(i: number) {
    const colors = ['#1d4ed8', '#3b82f6', '#fbbf24', '#f472b6', '#34d399', '#f87171', '#a78bfa', '#ffffff']
    const color = colors[i % colors.length]
    const left = (i * 5.1) % 100
    const delay = (i * 0.2) % 4
    const duration = 3 + (i % 3)
    const size = 6 + (i % 8)
    const rotation = i * 47
    return {
        '--color': color,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size * 0.5}px`,
        transform: `rotate(${rotation}deg)`,
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800&display=swap');

.join-room {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%);
    font-family: 'Nunito', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 24px;
}

.confetti-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.confetti {
    position: absolute;
    top: -20px;
    background: var(--color);
    border-radius: 2px;
    animation: fall linear infinite;
    opacity: 0.7;
}

@keyframes fall {
    0% {
        transform: translateY(-20px) rotate(0deg);
        opacity: 0.8;
    }

    100% {
        transform: translateY(110vh) rotate(720deg);
        opacity: 0;
    }
}

.deco {
    position: absolute;
    pointer-events: none;
}

.deco-circle-1 {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    border: 3px solid rgba(29, 78, 216, 0.1);
    top: -80px;
    right: -80px;
    animation: spin 20s linear infinite;
}

.deco-circle-2 {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 2px dashed rgba(29, 78, 216, 0.08);
    bottom: -60px;
    left: -60px;
    animation: spin 15s linear infinite reverse;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.join-content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.btn-back {
    align-self: flex-start;
    background: transparent;
    border: none;
    color: #93c5fd;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    font-family: 'Nunito', sans-serif;
    transition: color 0.2s;
}

.btn-back:hover {
    color: #1d4ed8;
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
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.7);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.join-title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    gap: 0;
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.title-small {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(18px, 4vw, 24px);
    color: #3b82f6;
    letter-spacing: 4px;
}

.title-big {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(56px, 15vw, 80px);
    color: #1e3a8a;
    text-shadow: 3px 3px 0px rgba(29, 78, 216, 0.15);
    line-height: 0.95;
}

.sport-icons {
    display: flex;
    gap: 16px;
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.sport-icon {
    font-size: 28px;
    animation: bounce 2s ease-in-out infinite;
    animation-delay: var(--d);
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

.join-card {
    width: 100%;
    background: white;
    border: 2px solid rgba(29, 78, 216, 0.1);
    border-radius: 24px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 8px 32px rgba(29, 78, 216, 0.1);
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #93c5fd;
    text-transform: uppercase;
}

input {
    padding: 14px 16px;
    background: #f0f7ff;
    border: 2px solid #bfdbfe;
    border-radius: 12px;
    color: #1e3a8a;
    font-size: 15px;
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
}

input::placeholder {
    color: #bfdbfe;
}

input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-code {
    font-family: 'Righteous', sans-serif;
    font-size: 28px;
    letter-spacing: 8px;
    text-align: center;
    color: #1d4ed8;
}

.btn-join {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 18px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 6px 24px rgba(29, 78, 216, 0.35);
    font-family: 'Nunito', sans-serif;
    margin-top: 4px;
}

.btn-join:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(29, 78, 216, 0.45);
}

.btn-join:active:not(:disabled) {
    transform: translateY(0);
}

.btn-join:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.error {
    color: #ef4444;
    font-size: 13px;
    font-weight: 700;
    margin: 0;
    text-align: center;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 10px;
    padding: 10px;
}

.home-mention {
    color: #93c5fd;
    font-size: 13px;
    font-weight: 600;
    margin: 0;
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
}
</style>