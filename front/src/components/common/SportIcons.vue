<template>
    <div class="sport-icons">
        <span class="sport-icon" style="--d: 0s">🤸‍♀️</span>
        <span class="sport-icon" style="--d: 0.2s">🧗‍♀️</span>
        <span class="sport-icon" style="--d: 0.4s">⛷️</span>
    </div>
</template>

<style scoped>
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
</style>