<template>
  <div class="deco deco-circle-1"></div>
  <div class="deco deco-circle-2"></div>
</template>

<style scoped>
.deco { position: absolute; pointer-events: none; z-index: 0; }

.deco-circle-1 {
  width: 350px; height: 350px;
  border-radius: 50%;
  border: 3px solid rgba(29,78,216,0.1);
  top: -100px; right: -100px;
  animation: spin 25s linear infinite;
}

.deco-circle-2 {
  width: 220px; height: 220px;
  border-radius: 50%;
  border: 2px dashed rgba(29,78,216,0.08);
  bottom: -60px; left: -60px;
  animation: spin 18s linear infinite reverse;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>