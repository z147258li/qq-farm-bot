<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const currentUser = localStorage.getItem('current_user') || ''
const userRole = localStorage.getItem('user_role') || ''
const isAdmin = computed(() => userRole === 'admin')

interface User {
  username: string
  role: string
  card: {
    code?: string
    description?: string
    type?: string
    typeChar?: string
    days?: number
    expiresAt?: number | null
    enabled?: boolean
  } | null
}

const users = ref<User[]>([])
const loading = ref(false)

// 用户编辑
const editingUser = ref<User | null>(null)
const showEditModal = ref(false)
const editEnabled = ref(true)
const editExpiresAt = ref('')

// 批量删除
const selectedUsers = ref<string[]>([])
const showDeleteConfirm = ref(false)

// 添加用户
const showAddUserModal = ref(false)
const addUserForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  expiresAt: '',
})

async function loadUsers() {
  if (!isAdmin.value) return
  loading.value = true
  try {
    const res = await api.get('/api/admin/users')
    if (res.data.ok) {
      users.value = res.data.data
    }
  }
  catch (e: any) {
    console.error('加载用户失败:', e)
  }
  finally {
    loading.value = false
  }
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return '永久'
  return new Date(timestamp).toLocaleString('zh-CN')
}

function formatDateForInput(timestamp: number | null) {
  if (!timestamp) return ''
  return new Date(timestamp).toISOString().slice(0, 16)
}

function openEditModal(user: User) {
  editingUser.value = user
  editEnabled.value = user.card?.enabled ?? true
  editExpiresAt.value = user.card?.expiresAt ? formatDateForInput(user.card.expiresAt) : ''
  showEditModal.value = true
}

async function saveUser() {
  if (!editingUser.value) return
  loading.value = true
  try {
    const updates: any = { enabled: editEnabled.value }
    if (editExpiresAt.value) {
      updates.expiresAt = new Date(editExpiresAt.value).getTime()
    }
    else {
      updates.expiresAt = null
    }

    const res = await api.put(`/api/admin/users/${editingUser.value.username}`, updates)
    if (res.data.ok) {
      showEditModal.value = false
      await loadUsers()
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '更新失败')
  }
  finally {
    loading.value = false
  }
}

async function deleteUser(username: string) {
  if (!confirm(`确定要删除用户 "${username}" 吗？`)) return
  loading.value = true
  try {
    const res = await api.delete(`/api/admin/users/${username}`)
    if (res.data.ok) {
      await loadUsers()
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '删除失败')
  }
  finally {
    loading.value = false
  }
}

async function batchDeleteUsers() {
  if (!confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`)) return
  loading.value = true
  try {
    const res = await api.post('/api/admin/users/batch-delete', { usernames: selectedUsers.value })
    if (res.data.ok) {
      selectedUsers.value = []
      showDeleteConfirm.value = false
      await loadUsers()
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '批量删除失败')
  }
  finally {
    loading.value = false
  }
}

async function addUser() {
  const { username, password, confirmPassword, expiresAt } = addUserForm.value

  if (!username || !password) {
    alert('用户名和密码不能为空')
    return
  }

  if (password.length < 4) {
    alert('密码长度至少4位')
    return
  }

  if (password !== confirmPassword) {
    alert('两次密码输入不一致')
    return
  }

  loading.value = true
  try {
    const data: any = { username, password }
    if (expiresAt) {
      data.expiresAt = new Date(expiresAt).getTime()
    }

    const res = await api.post('/api/admin/users', data)
    if (res.data.ok) {
      showAddUserModal.value = false
      addUserForm.value = { username: '', password: '', confirmPassword: '', expiresAt: '' }
      await loadUsers()
      alert('用户添加成功')
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '添加失败')
  }
  finally {
    loading.value = false
  }
}

function openAddUserModal() {
  showAddUserModal.value = true
  addUserForm.value = { username: '', password: '', confirmPassword: '', expiresAt: '' }
}

onMounted(() => {
  if (isAdmin.value) {
    loadUsers()
  }
})
</script>

<template>
  <div v-if="!isAdmin" class="p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">权限不足</h2>
    <p class="text-gray-600 dark:text-gray-400">只有管理员才能访问此页面</p>
  </div>

  <div v-else class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理系统用户和权限</p>
    </div>

    <!-- 操作按钮 -->
    <div class="mb-4 flex justify-between items-center">
      <BaseButton
        variant="primary"
        @click="openAddUserModal"
      >
        添加用户
      </BaseButton>

      <div v-if="selectedUsers.length > 0" class="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
        <p class="text-sm text-red-800 dark:text-red-400 mb-2">已选中 {{ selectedUsers.length }} 个用户</p>
        <BaseButton
          variant="danger"
          size="sm"
          @click="showDeleteConfirm = true"
        >
          批量删除
        </BaseButton>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              <input
                v-model="selectedUsers"
                type="checkbox"
                class="rounded border-gray-300"
              >
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              用户名
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              角色
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              卡密
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              状态
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              过期时间
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          <tr v-for="user in users" :key="user.username" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                v-model="selectedUsers"
                :value="user.username"
                type="checkbox"
                class="rounded border-gray-300"
                :disabled="user.role === 'admin' || user.username === currentUser"
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ user.username }}
                <span v-if="user.username === currentUser" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">(当前)</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ user.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="user.card" class="text-sm text-gray-900 dark:text-white">
                {{ user.card.description || '-' }}
              </div>
              <div v-else class="text-sm text-gray-500 dark:text-gray-400">-</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                v-if="user.card"
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="user.card.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
              >
                {{ user.card.enabled ? '正常' : '封禁' }}
              </span>
              <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ user.card ? formatDate(user.card.expiresAt ?? null) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <BaseButton
                variant="ghost"
                size="sm"
                @click="openEditModal(user)"
              >
                编辑
              </BaseButton>
              <BaseButton
                v-if="user.role !== 'admin' && user.username !== currentUser"
                variant="danger"
                size="sm"
                @click="deleteUser(user.username)"
              >
                删除
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 编辑用户弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md dark:bg-gray-800">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">编辑用户</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
            <BaseInput :model-value="editingUser?.username" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">账号状态</label>
            <select
              v-model="editEnabled"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option :value="true">正常</option>
              <option :value="false">封禁</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">过期时间（留空为永久）</label>
            <BaseInput
              v-model="editExpiresAt"
              type="datetime-local"
            />
          </div>
        </div>
        <div class="mt-6 flex space-x-3">
          <BaseButton
            variant="secondary"
            @click="showEditModal = false"
          >
            取消
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="loading"
            @click="saveUser"
          >
            保存
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 批量删除确认 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md dark:bg-gray-800">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">确认删除</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          确定要删除选中的 {{ selectedUsers.length }} 个用户吗？此操作不可恢复。
        </p>
        <div class="flex space-x-3">
          <BaseButton
            variant="secondary"
            @click="showDeleteConfirm = false"
          >
            取消
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="loading"
            @click="batchDeleteUsers"
          >
            确认删除
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 添加用户弹窗 -->
    <div v-if="showAddUserModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md dark:bg-gray-800">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">添加用户</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
            <BaseInput
              v-model="addUserForm.username"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
            <BaseInput
              v-model="addUserForm.password"
              type="password"
              placeholder="至少4位密码"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认密码</label>
            <BaseInput
              v-model="addUserForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">过期时间（留空为永久）</label>
            <BaseInput
              v-model="addUserForm.expiresAt"
              type="datetime-local"
            />
          </div>
        </div>
        <div class="mt-6 flex space-x-3">
          <BaseButton
            variant="secondary"
            @click="showAddUserModal = false"
          >
            取消
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="loading"
            @click="addUser"
          >
            添加
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
