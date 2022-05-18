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
    path: '/registry',
    component: () => import('../views/auth/Registry'),
    meta: {
      title: '注册'
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
            name: '好友申请',
            component: () => import('../views/friend/child/Apply')
          },
          {
            path: 'friendList',
            name: '我的好友',
            component: () => import('../views/friend/child/FriendList')
          },
          {
            path: 'groupList',
            name: '我的群聊',
            component: () => import('../views/friend/child/GroupList')
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
