<template>
    <div class="home">
        <!-- Confettis animés -->
        <div class="confetti-layer">
            <span v-for="i in 30" :key="i" class="confetti" :style="confettiStyle(i)"></span>
        </div>

        <!-- Décorations géométriques -->
        <div class="deco deco-circle-1"></div>
        <div class="deco deco-circle-2"></div>
        <div class="deco deco-star-1">⭐</div>
        <div class="deco deco-star-2">🏅</div>
        <div class="deco deco-star-3">✨</div>

        <div class="home-content">
            <!-- Badge anniversaire -->
            <div class="birthday-badge">
                🎂 30 ANS — ÉDITION SPÉCIALE
            </div>

            <!-- Titre principal -->
            <div class="title-block">
                <h1 class="home-title">
                    <span class="title-line-1">LE GRAND</span>
                    <span class="title-line-2">QUIZ</span>
                    <span class="title-line-3">DE <span class="name-highlight">MARGAUX</span></span>
                </h1>
            </div>

            <!-- Pictos sport -->
            <div class="sport-icons">
                <span class="sport-icon" style="--d: 0s">🤸‍♀️</span>
                <span class="sport-icon" style="--d: 0.2s">🧗‍♀️</span>
                <span class="sport-icon" style="--d: 0.4s">⛷️</span>
            </div>

            <!-- Sous-titre -->
            <p class="home-sub">
                Es-tu vraiment son meilleur ami·e ?<br>
                <span class="sub-accent">Prouve-le !</span>
            </p>

            <!-- Actions -->
            <div class="home-actions">
                <button class="btn-join" @click="router.push('/join')">
                    🎮 Rejoindre la fête
                </button>
                <button class="btn-admin" @click="router.push('/admin')">
                    ⚙️ Admin
                </button>
            </div>

            <!-- Petite mention -->
            <p class="home-mention">Créé avec ❤️ pour ses 30 ans</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function confettiStyle(i: number) {
    const colors = ['#1d4ed8', '#3b82f6', '#fbbf24', '#f472b6', '#34d399', '#f87171', '#a78bfa', '#ffffff']
    const color = colors[i % colors.length]
    const left = (i * 3.4) % 100
    const delay = (i * 0.15) % 4
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

.home {
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

/* ─── CONFETTIS ─── */
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

/* ─── DÉCORATIONS ─── */
.deco {
    position: absolute;
    pointer-events: none;
}

.deco-circle-1 {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    border: 3px solid rgba(29, 78, 216, 0.15);
    top: -80px;
    right: -80px;
    animation: spin 20s linear infinite;
}

.deco-circle-2 {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 2px dashed rgba(29, 78, 216, 0.1);
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

.deco-star-1 {
    font-size: 32px;
    top: 12%;
    left: 8%;
    animation: floatStar 3s ease-in-out infinite;
}

.deco-star-2 {
    font-size: 28px;
    top: 20%;
    right: 10%;
    animation: floatStar 3.5s ease-in-out infinite 0.5s;
}

.deco-star-3 {
    font-size: 24px;
    bottom: 20%;
    right: 8%;
    animation: floatStar 2.8s ease-in-out infinite 1s;
}

@keyframes floatStar {

    0%,
    100% {
        transform: translateY(0) rotate(-5deg);
    }

    50% {
        transform: translateY(-12px) rotate(5deg);
    }
}

/* ─── CONTENU ─── */
.home-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
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

/* ─── TITRE ─── */
.title-block {
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.home-title {
    margin: 0;
    display: flex;
    flex-direction: column;
    line-height: 1;
    gap: 2px;
}

.title-line-1 {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(20px, 5vw, 28px);
    color: #1d4ed8;
    letter-spacing: 4px;
}

.title-line-2 {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(72px, 20vw, 110px);
    color: #1e3a8a;
    line-height: 0.9;
    text-shadow: 4px 4px 0px rgba(29, 78, 216, 0.2);
}

.title-line-3 {
    font-family: 'Righteous', sans-serif;
    font-size: clamp(22px, 5vw, 30px);
    color: #1d4ed8;
    letter-spacing: 3px;
}

.name-highlight {
    background: linear-gradient(135deg, #f59e0b, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: clamp(28px, 7vw, 40px);
}

/* ─── SPORT ICONS ─── */
.sport-icons {
    display: flex;
    gap: 16px;
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.sport-icon {
    font-size: 32px;
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

/* ─── SOUS-TITRE ─── */
.home-sub {
    color: #3b82f6;
    font-size: 17px;
    font-weight: 600;
    margin: 0;
    line-height: 1.6;
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

.sub-accent {
    font-size: 20px;
    font-weight: 800;
    color: #1d4ed8;
}

/* ─── ACTIONS ─── */
.home-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
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
    letter-spacing: 0.5px;
}

.btn-join:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(29, 78, 216, 0.45);
}

.btn-join:active {
    transform: translateY(0);
}

.btn-admin {
    width: 100%;
    padding: 14px;
    background: rgba(29, 78, 216, 0.08);
    color: #3b82f6;
    border: 2px solid rgba(29, 78, 216, 0.2);
    border-radius: 16px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Nunito', sans-serif;
}

.btn-admin:hover {
    background: rgba(29, 78, 216, 0.14);
    border-color: rgba(29, 78, 216, 0.4);
}

/* ─── MENTION ─── */
.home-mention {
    color: #93c5fd;
    font-size: 13px;
    margin: 0;
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both;
}
</style>