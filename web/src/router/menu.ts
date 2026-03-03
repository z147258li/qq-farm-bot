export interface MenuItem {
  path: string
  name: string
  label: string
  icon: string
  component: () => Promise<any>
}

export const menuRoutes: MenuItem[] = [
  {
    path: '',
    name: 'dashboard',
    label: '概览',
    icon: 'i-carbon-chart-pie',
    component: () => import('@/views/Dashboard.vue'),
  },
  {
    path: 'personal',
    name: 'personal',
    label: '个人',
    icon: 'i-carbon-user',
    component: () => import('@/views/Personal.vue'),
  },
  {
    path: 'friends',
    name: 'friends',
    label: '好友',
    icon: 'i-carbon-user-multiple',
    component: () => import('@/views/Friends.vue'),
  },
  {
    path: 'analytics',
    name: 'analytics',
    label: '分析',
    icon: 'i-carbon-analytics',
    component: () => import('@/views/Analytics.vue'),
  },
  {
    path: 'accounts',
    name: 'accounts',
    label: '账号',
    icon: 'i-carbon-user-settings',
    component: () => import('@/views/Accounts.vue'),
  },
  {
    path: 'users',
    name: 'users',
    label: '用户管理',
    icon: 'i-carbon-user-role',
    component: () => import('@/views/Users.vue'),
  },
  {
    path: 'cards',
    name: 'cards',
    label: '卡密管理',
    icon: 'i-carbon-password',
    component: () => import('@/views/Cards.vue'),
  },
  {
    path: 'settings',
    name: 'Settings',
    label: '设置',
    icon: 'i-carbon-settings',
    component: () => import('@/views/Settings.vue'),
  },
  {
    path: 'about',
    name: 'about',
    label: '关于',
    icon: 'i-carbon-information',
    component: () => import('@/views/About.vue'),
  },
]
