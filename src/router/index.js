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
        component: () => import('../views/friend/FriendView'),
        children: [
          {
            path: '',
            redirect: 'apply'
          },
          {
            path: 'apply',
            component: () => import('../views/friend/Apply')
          },
          {
            path: 'friendList',
            component: () => import('../views/friend/FriendList')
          },
          {
            path: 'groupList',
            component: () => import('../views/friend/GroupList')
          }
        ]
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
