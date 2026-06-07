<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Question } from '@/types/database'
import { getQuestionTypeName } from '@/utils/index'

const props = defineProps<{
  questions: Question[]
  wrongBookName?: string
}>()

const emit = defineEmits<{
  know: [id: string]
  dontKnow: [id: string]
  star: [id: string]
  finish: []
}>()

// 每张卡片的答案展开状态
const expandedAnswers = ref<Set<string>>(new Set())
// 筛选: all / known / unknown / starred
const filterMode = ref<'all' | 'known' | 'unknown' | 'starred'>('all')
// 已操作过的题目ID集合（用于统计"已看"）
const viewedIds = ref<Set<string>>(new Set())
// 已标记星标的题目
const starredIds = ref<Set<string>>(new Set())

const total = computed(() => props.questions.length)
const viewedCount = computed(() => viewedIds.value.size)

/** 筛选后的题目列表 */
const filteredQuestions = computed(() => {
  if (filterMode.value === 'all') return props.questions
  if (filterMode.value === 'starred') {
    return props.questions.filter(q => starredIds.value.has(q.id))
  }
  // known/unknown 需要追踪状态，这里用 viewedIds 简化
  // 实际上 known/unknown 应该记录每题的操作结果
  return props.questions
})

function toggleAnswer(id: string) {
  if (expandedAnswers.value.has(id)) {
    expandedAnswers.value.delete(id)
  } else {
    expandedAnswers.value.add(id)
  }
}

function isExpanded(id: string): boolean {
  return expandedAnswers.value.has(id)
}

function handleKnow(id: string) {
  emit('know', id)
  viewedIds.value.add(id)
}

function handleDontKnow(id: string) {
  emit('dontKnow', id)
  viewedIds.value.add(id)
}

function handleStar(id: string) {
  if (starredIds.value.has(id)) {
    starredIds.value.delete(id)
  } else {
    starredIds.value.add(id)
  }
  emit('star', id)
  viewedIds.value.add(id)
}

function formatAnswer(q: Question): string {
  if (q.type === 'trueFalse') {
    return q.answer ? '正确' : '错误'
  }
  if (q.type === 'single' || q.type === 'multiple') {
    const correctOpts = q.options?.filter(o => o.isCorrect) || []
    return correctOpts.map(o => o.label).join('、')
  }
  return String(q.answer)
}
</script>

<template>
  <div class="memorize-list">
    <!-- 顶部信息栏 -->
    <header class="memo-header">
      <div class="header-left">
        <h2 class="wrongbook-name">{{ wrongBookName || '背题模式' }}</h2>
        <span class="viewed-count">已看 {{ viewedCount }} / 共 {{ total }} 题</span>
      </div>
      <div class="header-right">
        <span class="filter-label">筛选：</span>
        <select v-model="filterMode" class="filter-select">
          <option value="all">全部</option>
          <option value="starred">重点</option>
        </select>
      </div>
    </header>

    <!-- 进度条 -->
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: total > 0 ? `${(viewedCount / total) * 100}%` : '0%' }"
      ></div>
    </div>

    <!-- 卡片列表 -->
    <div class="cards-container">
      <div
        v-for="(question, index) in filteredQuestions"
        :key="question.id"
        class="memo-card"
      >
        <!-- 题号 + 题干 -->
        <div class="card-top">
          <span class="card-index">{{ index + 1 }}</span>
          <span class="type-badge">{{ getQuestionTypeName(question.type) }}</span>
          <p class="card-content">{{ question.content }}</p>
        </div>

        <!-- 折叠答案区 -->
        <div class="answer-section">
          <button class="answer-toggle" @click="toggleAnswer(question.id)">
            答案：{{ isExpanded(question.id) ? formatAnswer(question) : '点击查看答案' }}
          </button>
          <transition name="slide-v">
            <div v-if="isExpanded(question.id)" class="answer-detail">
              <strong>答案：{{ formatAnswer(question) }}</strong>
              <p v-if="question.explanation" class="explanation-text">{{ question.explanation }}</p>
            </div>
          </transition>
        </div>

        <!-- 操作按钮行 -->
        <div class="card-actions">
          <button class="action-btn know-btn" @click="handleKnow(question.id)">✓ 认识</button>
          <button class="action-btn dontknow-btn" @click="handleDontKnow(question.id)">✗ 不认识</button>
          <button
            class="action-btn star-btn"
            :class="{ active: starredIds.has(question.id) }"
            @click="handleStar(question.id)"
          >★ 重点</button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredQuestions.length === 0" class="empty-hint">
        <p>没有符合条件的题目</p>
      </div>
    </div>

    <!-- 底部完成按钮 -->
    <footer class="memo-footer">
      <button class="finish-btn" @click="emit('finish')">完成本轮</button>
    </footer>
  </div>
</template>

<style scoped>
.memorize-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0;
  background: var(--bg-primary);
}

/* ====== 顶部信息栏 ====== */
.memo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.wrongbook-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.viewed-count {
  font-size: 13px;
  color: var(--text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.filter-select {
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  color: var(--text-primary);
  background: white;
  cursor: pointer;
}

/* ====== 进度条 ====== */
.progress-track {
  height: 4px;
  background: var(--color-gray-200);
  flex-shrink: 0;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
  transition: width var(--transition-normal);
}

/* ====== 卡片容器 ====== */
.cards-container {
  padding: 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====== 单张卡片 ====== */
.memo-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow var(--transition-fast);
}
.memo-card:hover {
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.card-index {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 24px;
}

.type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 500;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.card-content {
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
}

/* ====== 折叠答案区 ====== */
.answer-section {
  border-top: 1px solid var(--color-gray-100);
  padding-top: 10px;
}

.answer-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13.5px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color var(--transition-fast);
}
.answer-toggle:hover { color: var(--color-primary); }

.answer-detail {
  padding: 10px 14px;
  background: var(--color-gray-50);
  border-radius: var(--border-radius);
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.answer-detail strong {
  color: var(--text-primary);
}

.explanation-text {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13.5px;
}

/* ====== 操作按钮 ====== */
.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
}

.action-btn {
  padding: 7px 18px;
  border-radius: var(--border-radius);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  line-height: 1.4;
}

.action-btn:hover {
  transform: translateY(-1px);
}
.action-btn:active {
  transform: translateY(0);
}

.know-btn {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}
.know-btn:hover {
  background: #dcfce7;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
}

.dontknow-btn {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}
.dontknow-btn:hover {
  background: #fee2e2;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

.star-btn {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}
.star-btn.active {
  background: #fef3c7;
  border-color: #fcd34d;
  font-weight: 700;
}
.star-btn:hover {
  background: #fef3c7;
  box-shadow: 0 2px 8px rgba(232, 168, 56, 0.15);
}

/* ====== 底部 ====== */
.memo-footer {
  padding: 16px 28px 24px;
  text-align: center;
  flex-shrink: 0;
}

.finish-btn {
  padding: 12px 40px;
  border-radius: var(--border-radius-lg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-primary);
  color: white;
  border: none;
  transition: all var(--transition-fast);
}
.finish-btn:hover {
  background: var(--color-primary-light);
  transform: scale(1.02);
}

.empty-hint {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
  font-size: 14px;
}

/* 动画 */
.slide-v-enter-active,
.slide-v-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-v-enter-from,
.slide-v-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  margin-top: 0;
}

@media (max-width: 767px) {
  .memo-header {
    padding: 12px 16px 10px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .wrongbook-name {
    font-size: 16px;
  }
  .cards-container {
    padding: 14px 16px;
  }
  .memo-card {
    padding: 14px 16px;
  }
  .card-actions {
    flex-wrap: wrap;
  }
  .action-btn {
    flex: 1;
    min-width: 0;
    text-align: center;
  }
}
</style>
