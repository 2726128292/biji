<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Question } from '@/types/database'
import { getQuestionTypeName, getOptionLabel } from '@/utils/index'

const props = defineProps<{
  question?: Question
  currentIndex: number
  total: number
}>()

const emit = defineEmits<{
  know: [id: string]
  dontKnow: [id: string]
  star: [id: string]
  next: []
  prev: []
}>()

const showAnswer = ref(false)
const showExplanation = ref(false)

const typeName = computed(() => {
  if (!props.question) return ''
  return getQuestionTypeName(props.question.type)
})

function toggleAnswer() {
  showAnswer.value = !showAnswer.value
}

function toggleExplanation() {
  showExplanation.value = !showExplanation.value
}

function handleKnow() {
  if (!props.question) return
  emit('know', props.question.id)
  resetState()
}

function handleDontKnow() {
  if (!props.question) return
  emit('dontKnow', props.question.id)
  resetState()
}

function handleStar() {
  if (!props.question) return
  emit('star', props.question.id)
  resetState()
}

function handleNext() {
  emit('next')
  resetState()
}

function handlePrev() {
  emit('prev')
  resetState()
}

function resetState() {
  showAnswer.value = false
  showExplanation.value = false
}
</script>

<template>
  <div class="memorize-card-wrapper" v-if="question">
    <!-- 进度指示 -->
    <div class="progress-header">
      <span class="progress-text">第 {{ currentIndex + 1 }} 题 / 共 {{ total }} 题</span>
    </div>

    <!-- 卡片主体 -->
    <div class="card-main">
      <!-- 题型标签 -->
      <span class="type-badge">{{ typeName }}</span>

      <!-- 题干 -->
      <h2 class="question-content">{{ question.content }}</h2>

      <!-- 选项（如果有） -->
      <div v-if="question.options?.length" class="options-area">
        <div
          v-for="(opt, idx) in question.options"
          :key="idx"
          class="option-item"
        >
          <span class="option-label">{{ opt.label || getOptionLabel(idx) }}</span>
          <span class="option-text">{{ opt.text }}</span>
          <span v-if="opt.isCorrect" class="correct-mark">✓</span>
        </div>
      </div>

      <!-- 折叠答案区 -->
      <div class="collapsible-section">
        <button class="collapse-toggle" @click="toggleAnswer">
          {{ showAnswer ? '隐藏答案' : '查看答案' }}
          <span class="toggle-arrow">{{ showAnswer ? '▲' : '▼' }}</span>
        </button>
        <transition name="slide">
          <div v-if="showAnswer" class="answer-content">
            <template v-if="question.type === 'trueFalse'">
              <strong>答案：{{ question.answer ? '正确' : '错误' }}</strong>
            </template>
            <template v-else-if="question.type === 'single' || question.type === 'multiple'">
              <strong>答案：</strong>
              <span v-for="(opt, idx) in question.options" :key="idx">
                <span v-if="opt.isCorrect" class="correct-answer-text">
                  {{ opt.label || getOptionLabel(idx) }}
                </span>
              </span>
            </template>
            <template v-else>
              <strong>答案：</strong>{{ question.answer }}
            </template>
          </div>
        </transition>
      </div>

      <!-- 折叠解析区 -->
      <div v-if="question.explanation" class="collapsible-section">
        <button class="collapse-toggle explanation-btn" @click="toggleExplanation">
          {{ showExplanation ? '隐藏解析' : '查看解析' }}
          <span class="toggle-arrow">{{ showExplanation ? '▲' : '▼' }}</span>
        </button>
        <transition name="slide">
          <div v-if="showExplanation" class="explanation-content">
            {{ question.explanation }}
          </div>
        </transition>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <button class="action-btn know-btn" @click="handleKnow">✅ 认识</button>
      <button class="action-btn dontknow-btn" @click="handleDontKnow">❌ 不认识</button>
      <button class="action-btn star-btn" @click="handleStar">⭐ 重点</button>
    </div>

    <!-- 导航 -->
    <div class="nav-bar">
      <button class="nav-btn" :disabled="currentIndex === 0" @click="handlePrev">← 上一题</button>
      <button class="nav-btn primary" @click="handleNext">
        {{ currentIndex >= total - 1 ? '完成' : '下一题 →' }}
      </button>
    </div>
  </div>

  <div v-else class="empty-state">
    <p>没有更多题目了</p>
  </div>
</template>

<style scoped>
.memorize-card-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 20px;
  overflow-y: auto;
}

.empty-state {
  display: flex; align-items: center; justify-content: center;
  flex: 1; color: var(--text-muted); font-size: 16px;
}

/* 进度 */
.progress-header {
  text-align: center;
}
.progress-text {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 卡片主体 */
.card-main {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 32px 36px;
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.type-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.question-content {
  font-size: 20px;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
}

/* 选项 */
.options-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-gray-50);
  border-radius: var(--border-radius);
}

.option-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 15px;
  padding: 6px 0;
}

.option-label {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-gray-200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.option-text {
  color: var(--text-primary);
  flex: 1;
}

.correct-mark {
  color: var(--color-success);
  font-weight: 700;
}

/* 折叠区域 */
.collapsible-section {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-primary-light);
  font-weight: 500;
  transition: opacity var(--transition-fast);
}
.collapse-toggle:hover { opacity: 0.7; }

.toggle-arrow { font-size: 11px; }

.answer-content,
.explanation-content {
  padding: 12px 16px;
  background: var(--color-gray-50);
  border-radius: var(--border-radius);
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
}

.explanation-content {
  border-left: 3px solid var(--color-accent);
}

.correct-answer-text {
  color: var(--color-success);
  font-weight: 700;
  margin-right: 4px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  gap: 16px;
  max-width: 680px;
  width: 100%;
}

.action-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: var(--border-radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
  border: 2px solid transparent;
}
.action-btn:hover {
  transform: scale(1.02);
}
.action-btn:active {
  transform: scale(0.98);
}

.know-btn {
  background: #f0fdf4;
  border-color: #86efac;
  color: #15803d;
}
.know-btn:hover {
  background: #dcfce7;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
}

.dontknow-btn {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
}
.dontknow-btn:hover {
  background: #fee2e2;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.star-btn {
  background: #fffbeb;
  border-color: #fcd34d;
  color: #b45309;
}
.star-btn:hover {
  background: #fef3c7;
  box-shadow: 0 4px 12px rgba(232, 168, 56, 0.15);
}

/* 导航 */
.nav-bar {
  display: flex;
  gap: 12px;
  max-width: 680px;
  width: 100%;
}

.nav-btn {
  flex: 1;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.nav-btn:hover:not(:disabled) {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}
.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.nav-btn.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.nav-btn.primary:hover:not(:disabled) {
  background: var(--color-primary-light);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-normal);
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
