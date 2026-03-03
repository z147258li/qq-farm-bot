<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const userRole = localStorage.getItem('user_role') || ''
const isAdmin = computed(() => userRole === 'admin')

interface Card {
  code: string
  description: string
  type: string
  typeChar: string
  days: number
  enabled: boolean
  usedBy: string | null
  usedAt: number | null
  createdAt: number
}

const cards = ref<Card[]>([])
const loading = ref(false)

// 创建卡密
const showCreateModal = ref(false)
const createForm = ref({
  description: '',
  type: 'M',
  days: 30,
  count: 1,
})

// 编辑卡密
const editingCard = ref<Card | null>(null)
const showEditModal = ref(false)
const editDescription = ref('')
const editEnabled = ref(true)

// 批量删除
const selectedCards = ref<string[]>([])
const showDeleteConfirm = ref(false)

const cardTypes = [
  { value: 'T', label: '测试卡', suffix: '10分钟' },
  { value: 'D', label: '天卡', suffix: '天' },
  { value: 'W', label: '周卡', suffix: '天 (7)' },
  { value: 'M', label: '月卡', suffix: '天 (30)' },
  { value: 'F', label: '永久卡', suffix: '永久' },
]

function getCardTypeLabel(type: string) {
  const cardType = cardTypes.find(t => t.value === type)
  return cardType ? cardType.label : type
}

// 根据卡密类型自动设置天数
function updateDaysByType(type: string) {
  const daysMap: Record<string, number> = {
    'T': 10 / (24 * 60), // 10分钟
    'D': 1,
    'W': 7,
    'M': 30,
    'F': 36500,
  }
  createForm.value.days = daysMap[type] || 30
}

async function loadCards() {
  if (!isAdmin.value) return
  loading.value = true
  try {
    const res = await api.get('/api/admin/cards')
    if (res.data.ok) {
      cards.value = res.data.data
    }
  }
  catch (e: any) {
    console.error('加载卡密失败:', e)
  }
  finally {
    loading.value = false
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('zh-CN')
}

async function copyCode(code: string) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code)
      alert('已复制到剪贴板')
    } else {
      // 降级方案：使用 document.execCommand
      const textArea = document.createElement('textarea')
      textArea.value = code
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        alert('已复制到剪贴板')
      } catch (err) {
        throw err
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch (e) {
    alert('复制失败，请手动复制')
    console.error('复制失败:', e)
  }
}

async function createCards() {
  loading.value = true
  try {
    const res = await api.post('/api/admin/cards', {
      description: createForm.value.description,
      type: createForm.value.type,
      days: createForm.value.days,
      count: createForm.value.count,
    })
    if (res.data.ok) {
      showCreateModal.value = false
      createForm.value = { description: '', type: 'M', days: 30, count: 1 }
      await loadCards()
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '创建失败')
  }
  finally {
    loading.value = false
  }
}

function openEditModal(card: Card) {
  editingCard.value = card
  editDescription.value = card.description
  editEnabled.value = card.enabled
  showEditModal.value = true
}

async function saveCard() {
  if (!editingCard.value) return
  loading.value = true
  try {
    const res = await api.put(`/api/admin/cards/${editingCard.value.code}`, {
      description: editDescription.value,
      enabled: editEnabled.value,
    })
    if (res.data.ok) {
      showEditModal.value = false
      await loadCards()
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '更新失败')
  }
  finally {
    loading.value = false
  }
}

async function deleteCard(code: string) {
  if (!confirm(`确定要删除卡密 "${code}" 吗？`)) return
  loading.value = true
  try {
    const res = await api.delete(`/api/admin/cards/${code}`)
    if (res.data.ok) {
      await loadCards()
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '删除失败')
  }
  finally {
    loading.value = false
  }
}

async function batchDeleteCards() {
  if (!confirm(`确定要删除选中的 ${selectedCards.value.length} 个卡密吗？`)) return
  loading.value = true
  try {
    const res = await api.post('/api/admin/cards/batch-delete', { codes: selectedCards.value })
    if (res.data.ok) {
      selectedCards.value = []
      showDeleteConfirm.value = false
      await loadCards()
    }
  }
  catch (e: any) {
    alert(e.response?.data?.error || '批量删除失败')
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isAdmin.value) {
    loadCards()
  }
})
</script>

<template>
  <div v-if="!isAdmin" class="p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">权限不足</h2>
    <p class="text-gray-600 dark:text-gray-400">只有管理员才能访问此页面</p>
  </div>

  <div v-else class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">卡密管理</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理用户激活卡密</p>
      </div>
      <BaseButton variant="primary" @click="showCreateModal = true">
        创建卡密
      </BaseButton>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedCards.length > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
      <p class="text-sm text-red-800 dark:text-red-400 mb-2">已选中 {{ selectedCards.length }} 个卡密</p>
      <BaseButton
        variant="danger"
        size="sm"
        @click="showDeleteConfirm = true"
      >
        批量删除
      </BaseButton>
    </div>

    <!-- 卡密列表 -->
    <div class="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              <input
                v-model="selectedCards"
                type="checkbox"
                class="rounded border-gray-300"
              >
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              卡密
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              描述
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              类型
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              状态
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              使用者
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              创建时间
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          <tr v-for="card in cards" :key="card.code" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                v-model="selectedCards"
                :value="card.code"
                type="checkbox"
                class="rounded border-gray-300"
                :disabled="card.usedBy !== null"
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                <code class="text-sm font-mono bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">
                  {{ card.code }}
                </code>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  @click="copyCode(card.code)"
                >
                  复制
                </BaseButton>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ card.description }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': card.type === 'T',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': card.type === 'D',
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': card.type === 'W',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': card.type === 'M',
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300': card.type === 'F',
                }"
              >
                {{ getCardTypeLabel(card.type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="card.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
              >
                {{ card.enabled ? '正常' : '禁用' }}
              </span>
              <span v-if="card.usedBy !== null" class="ml-2 text-xs text-gray-500 dark:text-gray-400">(已使用)</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="card.usedBy" class="text-sm text-gray-900 dark:text-white">
                {{ card.usedBy }}
              </div>
              <div v-else class="text-sm text-gray-500 dark:text-gray-400">-</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(card.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <BaseButton
                variant="ghost"
                size="sm"
                @click="openEditModal(card)"
              >
                编辑
              </BaseButton>
              <BaseButton
                v-if="!card.usedBy"
                variant="danger"
                size="sm"
                @click="deleteCard(card.code)"
              >
                删除
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 创建卡密弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md dark:bg-gray-800">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">创建卡密</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
            <BaseInput v-model="createForm.description" placeholder="例如：月卡" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">类型</label>
            <select
              v-model="createForm.type"
              @change="updateDaysByType(createForm.type)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="type in cardTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          <div v-if="createForm.type !== 'F'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ createForm.type === 'T' ? '时长(天)' : '天数' }}
            </label>
            <BaseInput v-model.number="createForm.days" type="number" min="0.0001" step="0.0001" />
            <p v-if="createForm.type === 'T'" class="text-xs text-gray-500 mt-1">10分钟 ≈ {{ (10 / (24 * 60)).toFixed(4) }} 天</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">生成数量</label>
            <BaseInput v-model.number="createForm.count" type="number" min="1" max="100" />
          </div>
        </div>
        <div class="mt-6 flex space-x-3">
          <BaseButton
            variant="secondary"
            @click="showCreateModal = false"
          >
            取消
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="loading"
            @click="createCards"
          >
            创建
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 编辑卡密弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md dark:bg-gray-800">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">编辑卡密</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">卡密</label>
            <BaseInput :model-value="editingCard?.code" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
            <BaseInput v-model="editDescription" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">状态</label>
            <select
              v-model="editEnabled"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option :value="true">正常</option>
              <option :value="false">禁用</option>
            </select>
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
            @click="saveCard"
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
          确定要删除选中的 {{ selectedCards.length }} 个卡密吗？此操作不可恢复。
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
            @click="batchDeleteCards"
          >
            确认删除
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
