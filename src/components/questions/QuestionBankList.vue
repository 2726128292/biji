<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { questionService } from '@/services/questionService'
import { formatDate } from '@/utils/index'
import type { QuestionBank } from '@/types/database'
import Empty from '@/components/Empty.vue'

const emit = defineEmits<{
  practice: [sourceType: string, sourceId: string]
  create: []
}>()

const banks = ref<QuestionBank[]>([])
const bankCounts = ref<Record<string, number>>({})
const loading = ref(true)

async function loadBanks() {
  loading.value = true
  try {
    banks.value = await questionService.getBanks()
    for (const bank of banks.value) {
      bankCounts.value[bank.id] = await questionService.getBankQuestionCount(bank.id)
    }
  } finally {
    loading.value = false
  }
}

function handlePractice(bank: QuestionBank) {
  emit('practice', 'bank', bank.id)
}

function handleCreate() {
  emit('create')
}

async function handleRename(bank: QuestionBank) {
  const newName = prompt('请输入新名称：', bank.name)
  if (newName && newName.trim()) {
    await questionService.renameBank(bank.id, newName.trim())
    await loadBanks()
  }
}

async function handleDelete(bank: QuestionBank) {
  if (!confirm(`确定要删除题库「${bank.name}」吗？此操作不可恢复。`)) return
  try {
    await questionService.deleteBank(bank.id)
    await loadBanks()
  } catch (e: any) {
    alert(e.message || '删除失败')
  }
}

onMounted(() => {
  loadBanks()
})
</script>

<template>
  <div class="question-bank-list">
    <div v-if="loading" class="loading-state">
      <span>加载中...</span>
    </div>

    <div v-else-if="banks.length === 0" class="empty-state">
      <Empty />
      <p class="empty-text">还没有题库，点击上方按钮创建第一个题库吧</p>
      <button class="btn btn-primary" @click="handleCreate">新建题库</button>
    </div>

    <div v-else class="bank-grid">
      <div
        v-for="bank in banks"
        :key="bank.id"
        class="bank-card"
        @click="$router.push(`/questions/${bank.id}`)"
      >
        <div class="card-header">
          <h3 class="bank-name">{{ bank.name }}</h3>
          <div class="card-actions" @click.stop>
            <button class="action-btn" title="重命名" @click="handleRename(bank)">✏️</button>
            <button class="action-btn danger" title="删除" @click="handleDelete(bank)">🗑️</button>
          </div>
        </div>

        <div class="card-body">
          <div class="stat-row">
            <span class="stat-label">题目数量</span>
            <span class="stat-value">{{ bankCounts[bank.id] ?? 0 }} 道</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">创建时间</span>
            <span class="stat-value">{{ formatDate(bank.createdAt, 'YYYY-MM-DD') }}</span>
          </div>
        </div>

        <div class="card-footer" @click.stop>
          <button
            class="btn btn-accent btn-sm"
            @click="handlePractice(bank)"
            :disabled="(bankCounts[bank.id] ?? 0) === 0"
          >
            ▶ 开始练习
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-bank-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
}

.empty-text {
  color: var(--text-muted);
  font-size: 14px;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.bank-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  padding: 20px;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  display: flex;
  flex-direction: column;
}

.bank-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.bank-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  background: transparent;
  font-size: 14px;
  transition: background-color var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-hover);
}

.action-btn.danger:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 13px;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 13px;
}

.card-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  transition: transform var(--transition-fast), background-color var(--transition-fast), opacity var(--transition-fast);
  border: none;
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.btn-accent {
  background: var(--color-accent);
  color: white;
}

.btn-accent:hover:not(:disabled) {
  background: var(--color-accent-light);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
