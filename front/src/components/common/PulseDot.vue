<template>
    <span class="pulse-dot"></span>
</template>

<style scoped>
.pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    animation: pulse 1.5s infinite;
    flex-shrink: 0;
    display: inline-block;
}
</style>