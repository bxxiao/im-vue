import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: () => import('../views/auth/Login'),
    meta: {
      title: '登录'
    }
  },

  {
    path: '/main',
    component: () => import('../views/MainLayout'),
    children: [
      {
        path: '',
        redirect: 'chat'
      },

      {
        path: 'chat',
        name: '聊天',
        component: () => import('../views/chat/ChatView')
      },

      {
        path: 'friend',
        name: '联系人',
        component: () => import('../views/friend/FriendView')
      },

      {
        path: 'settings',
        name: '设置',
        component: () => import('../views/settings/SettingView')
      }
    ]
  },
]

const router = new VueRouter({
  routes
})

export default router
