<template>
    <div class="confetti-layer">
        <span v-for="i in 25" :key="i" class="confetti" :style="confettiStyle(i)"></span>
    </div>
</template>

<script setup lang="ts">
function confettiStyle(i: number) {
    const colors = ['#1d4ed8', '#3b82f6', '#fbbf24', '#f472b6', '#34d399', '#f87171', '#a78bfa', '#ffffff']
    const color = colors[i % colors.length]
    const left = (i * 4.1) % 100
    const delay = (i * 0.18) % 5
    const duration = 4 + (i % 3)
    const size = 6 + (i % 8)
    return {
        '--color': color,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size * 0.5}px`,
        transform: `rotate(${i * 47}deg)`,
    }
}
</script>

<style scoped>
.confetti-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
}

.confetti {
    position: absolute;
    top: -20px;
    background: var(--color);
    border-radius: 2px;
    animation: fall linear infinite;
    opacity: 0.5;
}

@keyframes fall {
    0% {
        transform: translateY(-20px) rotate(0deg);
        opacity: 0.6;
    }

    100% {
        transform: translateY(110vh) rotate(720deg);
        opacity: 0;
    }
}
</style>