<template>
  <div class="home">
    <div class="home-bg"></div>
    <div class="home-content">
      <div class="logo-badge">QUIZ LIVE</div>
      <h1 class="home-title">QUI SERA<br><span class="accent">LE MEILLEUR ?</span></h1>
      <p class="home-sub">Rejoins une partie en direct ou anime ton propre quiz.</p>
      <div class="home-actions">
        <button class="btn-join" @click="router.push('/join')">
          🎮 Rejoindre une partie
        </button>
        <button class="btn-admin" @click="router.push('/admin')">
          ⚙️ Espace admin
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');

.home {
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

.home-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 50%, rgba(99,60,255,0.25) 0%, transparent 70%),
    radial-gradient(ellipse 50% 60% at 80% 30%, rgba(255,60,120,0.15) 0%, transparent 70%);
  pointer-events: none;
}

.home-content {
  position: relative;
  z-index: 1;
  text-align: center;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

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

.home-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(48px, 12vw, 80px);
  line-height: 1;
  letter-spacing: 2px;
  margin: 0;
}

.accent {
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.home-sub {
  color: #6b6b8a;
  font-size: 15px;
  margin: 0;
  line-height: 1.5;
}

.home-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
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
}

.btn-join:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 40px rgba(124,58,237,0.6);
}

.btn-admin {
  width: 100%;
  padding: 16px;
  background: rgba(255,255,255,0.04);
  color: #d4d4e8;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.btn-admin:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
}
</style>