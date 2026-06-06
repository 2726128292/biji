<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { questionService } from '@/services/questionService'
import { formatDate } from '@/utils/index'
import { useUIStore } from '@/stores/uiStore'
import type { QuestionBank } from '@/types/database'
import Empty from '@/components/Empty.vue'
import { MoreVertical, Search, Library } from 'lucide-vue-next'

const ui = useUIStore()
const emit = defineEmits<{
  practice: [sourceType: string, sourceId: string, mode: string]
  create: []
  importBank: []
}>()

const banks = ref<QuestionBank[]>([])
const bankCounts = ref<Record<string, number>>({})
const bankChapterCounts = ref<Record<string, number>>({})
const loading = ref(true)

// 今日待复习数据
const reviewCount = ref(0)
let reviewTimer: ReturnType<typeof setInterval> | null = null

// 移动端搜索
const searchQuery = ref('')

const filteredBanks = computed(() => {
  if (!searchQuery.value.trim()) return banks.value
  const q = searchQuery.value.toLowerCase()
  return banks.value.filter(b => b.name.toLowerCase().includes(q))
})

async function loadBanks() {
  loading.value = true
  try {
    banks.value = await questionService.getBanks()
    for (const bank of banks.value) {
      bankCounts.value[bank.id] = await questionService.getBankQuestionCount(bank.id)
      const chapters = await questionService.getChapterTree(bank.id)
      bankChapterCounts.value[bank.id] = countChapters(chapters)
    }
    // 模拟今日待复习数量
    reviewCount.value = Math.floor(Math.random() * 30) + 10
  } finally {
    loading.value = false
  }
}

function countChapters(nodes: any[]): number {
  let count = 0
  for (const node of nodes) {
    count++
    if (node.children?.length) {
      count += countChapters(node.children)
    }
  }
  return count
}

function handlePractice(bank: QuestionBank, mode: string) {
  emit('practice', 'bank', bank.id, mode)
}

function handleCreate() {
  emit('create')
}

function handleImport() {
  emit('importBank')
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
    questionService.deleteBank(bank.id).then(() => loadBanks())
  } catch (e: any) {
    alert(e.message || '删除失败')
  }
}

// 移动端：显示底部操作菜单
function showBankMenu(bank: QuestionBank, event: Event) {
  event.stopPropagation()
  ui.showBottomSheet(
    bank.name,
    [
      { label: '开始背题', action: 'memorize', icon: '▶' },
      { label: '开始刷题', action: 'quiz', icon: '▶' },
      { label: '重命名', action: 'rename', icon: '✎' },
      { label: '删除题库', action: 'delete', icon: '🗑', danger: true }
    ],
    bank.id,
    'bank'
  )
}

onMounted(() => {
  loadBanks()
})

onUnmounted(() => {
  if (reviewTimer) {
    clearInterval(reviewTimer)
  }
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

    <template v-else>
      <!-- 桌面端：顶部操作栏 + 网格 -->
      <div class="desktop-layout">
        <div class="top-actions">
          <button class="btn btn-primary" @click="handleCreate">新建题库</button>
          <button class="btn btn-outline" @click="handleImport">导入题库</button>
        </div>

        <div class="bank-grid">
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
              <span class="stat-text">{{ bankCounts[bank.id] ?? 0 }} 道题 · {{ bankChapterCounts[bank.id] ?? 0 }} 个章节</span>
            </div>

            <div class="card-footer" @click.stop>
              <button
                class="btn btn-outline-sm"
                @click="handlePractice(bank, 'memorize')"
                :disabled="(bankCounts[bank.id] ?? 0) === 0"
              >
                开始背题
              </button>
              <button
                class="btn btn-primary-sm"
                @click="handlePractice(bank, 'quiz')"
                :disabled="(bankCounts[bank.id] ?? 0) === 0"
              >
                开始刷题
              </button>
            </div>
          </div>
        </div>

        <!-- 今日待复习横幅 -->
        <div class="review-banner">
          <div class="review-content">
            <strong>今日待复习</strong>
            <span>又有{{ reviewCount }}道新题需要复习</span>
          </div>
          <button class="btn btn-review" @click="$emit('practice', 'review', '', 'quiz')">开始复习</button>
        </div>
      </div>

      <!-- 移动端：搜索框 + 列表 -->
      <div class="mobile-layout">
        <!-- 搜索框 -->
        <div class="mobile-search">
          <Search :size="16" />
          <input type="text" v-model="searchQuery" placeholder="搜索题库" class="mobile-search-input" />
        </div>

        <!-- 新建按钮行 -->
        <div class="mobile-header">
          <span></span>
          <button class="btn btn-primary btn-sm" @click="handleCreate">新建题库</button>
        </div>

        <!-- 单列列表 -->
        <div class="bank-list">
          <div
            v-for="bank in filteredBanks"
            :key="bank.id"
            class="bank-list-item"
            @click="$router.push(`/questions/${bank.id}`)"
          >
            <Library :size="20" class="list-icon" />
            <div class="list-info">
              <span class="list-name">{{ bank.name }}</span>
              <span class="list-count">{{ bankCounts[bank.id] ?? 0 }}题</span>
            </div>
            <button class="list-more-btn" @click="showBankMenu(bank, $event)">
              <MoreVertical :size="18" />
            </button>
          </div>
        </div>

        <!-- 移动端今日待复习 -->
        <div v-if="reviewCount > 0" class="mobile-review-bar">
          <span>今日待复习：{{ reviewCount }}道新题</span>
          <button class="btn btn-review-sm" @click="$emit('practice', 'review', '', 'quiz')">去复习</button>
        </div>
      </div>
    </template>
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

/* ===== 桌面端布局 ===== */
.desktop-layout { display: flex; flex-direction: column; gap: 0; }
.mobile-layout { display: none; }

/* 顶部操作栏 */
.top-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

/* 题库网格 - 固定3列 */
.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  font-size: 18px;
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
  align-items: center;
}

.stat-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.card-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
}

/* 今日待复习横幅 */
.review-banner {
  margin-top: 24px;
  padding: 16px 20px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-content strong {
  font-size: 15px;
  color: var(--text-primary);
}

.review-content span {
  font-size: 13px;
  color: var(--text-secondary);
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

.btn-outline {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-outline-sm {
  padding: 6px 14px;
  font-size: 13px;
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-outline-sm:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-primary-sm {
  padding: 6px 14px;
  font-size: 13px;
  background: var(--color-primary);
  color: white;
}

.btn-primary-sm:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.btn-review {
  background: #f59e0b;
  color: white;
  padding: 8px 20px;
}

.btn-review:hover {
  background: #d97706;
}

/* ===== 移动端布局 (< 768px) ===== */
@media (max-width: 767px) {
  .question-bank-list { padding: 12px; }

  .desktop-layout { display: none !important; }
  .mobile-layout { display: flex; flex-direction: column; gap: 0; }

  /* 移动端搜索框 */
  .mobile-search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    background: var(--color-gray-100);
    border-radius: var(--border-radius);
    margin-bottom: 10px;
  }
  .mobile-search svg { color: var(--text-muted); flex-shrink: 0; }
  .mobile-search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    padding: 9px 0;
  }
  .mobile-search-input::placeholder { color: var(--text-muted); }

  /* 移动端头部 */
  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  /* 移动端列表 */
  .bank-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bank-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 12px;
    background: white;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: background var(--transition-fast);
    min-height: 56px; /* 触控友好 */
  }
  .bank-list-item:active {
    background: var(--bg-hover);
  }

  .list-icon {
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .list-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .list-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-count {
    font-size: 12px;
    color: var(--text-muted);
  }

  .list-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-sm);
    color: var(--text-muted);
    background: transparent;
    border: none;
    flex-shrink: 0;
  }
  .list-more-btn:active {
    background: var(--color-gray-100);
  }

  /* 移动端今日待复习 */
  .mobile-review-bar {
    margin-top: 16px;
    padding: 12px 16px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .btn-review-sm {
    padding: 6px 14px;
    font-size: 13px;
    background: #f59e0b;
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
  }

  .btn-sm {
    padding: 7px 16px;
    font-size: 13px;
  }
}
</style>
