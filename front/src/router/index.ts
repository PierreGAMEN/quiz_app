import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/game/Home.vue'
import JoinRoom from '../views/game/JoinRoom.vue'
import GameRoom from '../views/game/GameRoom.vue'
import AdminHome from '../views/admin/AdminHome.vue'
import QuizCreate from '../views/admin/QuizCreate.vue'
import QuizEdit from '../views/admin/QuizEdit.vue'
import JoinRoomDisplayMode from '../views/game/JoinRoomDisplayMode.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/join', component: JoinRoom },
    { path: '/display', component: JoinRoomDisplayMode },
    { path: '/room/:code', component: GameRoom },
    { path: '/admin', component: AdminHome },
    { path: '/admin/quiz/create', component: QuizCreate },
    { path: '/admin/quiz/:id/edit', component: QuizEdit },
  ]
})

export default router