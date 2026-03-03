<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()

// 登录模式: 'login' 或 'register'
const mode = ref<'login' | 'register'>('login')

// 登录表单
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// 注册表单
const registerUsername = ref('')
const registerPassword = ref('')
const cardCode = ref('')
const registerError = ref('')
const registerLoading = ref(false)

const token = useStorage('auth_token', '')
const currentUser = useStorage('current_user', '')
const userRole = useStorage('user_role', '')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    console.log('开始登录...', username.value)
    const res = await api.post('/api/auth/login', {
      username: username.value,
      password: password.value,
    })
    console.log('登录响应:', res.data)
    if (res.data.ok) {
      const receivedToken = res.data.data.token
      console.log('收到的token:', receivedToken)
      token.value = receivedToken
      currentUser.value = res.data.data.user.username
      userRole.value = res.data.data.user.role
      console.log('token保存后:', token.value)
      console.log('登录成功，跳转到首页')
      router.push('/')
    }
    else {
      error.value = res.data.error || '登录失败'
    }
  }
  catch (e: any) {
    console.error('登录错误:', e)
    error.value = e.response?.data?.error || e.message || '登录异常'
  }
  finally {
    loading.value = false
  }
}

async function handleRegister() {
  registerLoading.value = true
  registerError.value = ''
  try {
    const res = await api.post('/api/auth/register', {
      username: registerUsername.value,
      password: registerPassword.value,
      cardCode: cardCode.value,
    })
    if (res.data.ok) {
      token.value = res.data.data.token
      currentUser.value = res.data.data.user.username
      userRole.value = res.data.data.user.role
      router.push('/')
    }
    else {
      registerError.value = res.data.error || '注册失败'
    }
  }
  catch (e: any) {
    registerError.value = e.response?.data?.error || e.message || '注册异常'
  }
  finally {
    registerLoading.value = false
  }
}
</script>

<template>
  <div class="w-full flex items-start justify-center bg-gray-100 px-4 pt-[10vh] min-h-dvh sm:items-center dark:bg-gray-900 sm:pt-0">
    <div class="max-w-md w-full rounded-xl bg-white p-8 shadow-lg space-y-6 dark:bg-gray-800">
      <div class="mb-8 py-4 text-center">
        <h1 class="text-3xl text-gray-900 font-bold tracking-tight dark:text-white">
          QQ农场智能助手
        </h1>
        <p class="mt-3 text-sm text-gray-500 tracking-widest uppercase dark:text-gray-400">
          管理面板
        </p>
      </div>

      <!-- 模式切换 -->
      <div class="flex space-x-2 bg-gray-200 rounded-lg p-1 dark:bg-gray-700">
        <button
          class="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
          :class="mode === 'login' ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          class="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
          :class="mode === 'register' ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <form v-if="mode === 'login'" class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <BaseInput
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div>
          <BaseInput
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="error" class="text-sm text-red-600">
          {{ error }}
        </div>
        <BaseButton
          type="submit"
          variant="primary"
          block
          :loading="loading"
        >
          登录
        </BaseButton>
      </form>

      <!-- 注册表单 -->
      <form v-else class="space-y-4" @submit.prevent="handleRegister">
        <div>
          <BaseInput
            id="register-username"
            v-model="registerUsername"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div>
          <BaseInput
            id="register-password"
            v-model="registerPassword"
            type="password"
            placeholder="请输入密码（至少4位）"
            required
            minlength="4"
          />
        </div>
        <div>
          <BaseInput
            id="card-code"
            v-model="cardCode"
            type="text"
            placeholder="请输入卡密"
            required
          />
        </div>
        <div v-if="registerError" class="text-sm text-red-600">
          {{ registerError }}
        </div>
        <BaseButton
          type="submit"
          variant="primary"
          block
          :loading="registerLoading"
        >
          注册
        </BaseButton>
      </form>
    </div>
  </div>
</template>
