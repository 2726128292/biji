<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Question } from '@/types/database'
import { getQuestionTypeName, getOptionLabel, countBlanks } from '@/utils/index'
import { formatSubmittedAnswer, formatCorrectAnswer } from '@/utils/questionJudge'

const props = defineProps<{
  question?: Question
  currentIndex: number
  total: number
}>()

const emit = defineEmits<{
  submit: [answer: any]
  giveUp: []
  next: []
}>()

// 状态
const submitted = ref(false)
const result = ref<'correct' | 'wrong' | null>(null)

// 作答数据
const singleAnswer = ref<number | null>(null)
const multipleAnswers = ref<number[]>([])
const tfAnswer = ref<boolean | null>(null)
const blankAnswers = ref<string[]>([])
const shortAnswer = ref('')

// 计算属性
const typeName = computed(() => {
  if (!props.question) return ''
  return getQuestionTypeName(props.question.type)
})

const blankCount = computed(() => {
  if (!props.question) return 0
  return countBlanks(props.question.content)
})

// 初始化填空答案数组
function initBlankAnswers() {
  if (blankCount.value > 0 && blankAnswers.value.length !== blankCount.value) {
    blankAnswers.value = Array(blankCount.value).fill('')
  }
}

initBlankAnswers()

function handleSubmit() {
  if (submitted.value || !props.question) return

  let answer: any

  switch (props.question.type) {
    case 'single':
      if (singleAnswer.value === null) { alert('请选择一个答案'); return }
      answer = [singleAnswer.value]
      break
    case 'multiple':
      if (multipleAnswers.value.length === 0) { alert('请至少选择一个答案'); return }
      answer = [...multipleAnswers.value].sort((a, b) => a - b)
      break
    case 'trueFalse':
      if (tfAnswer.value === null) { alert('请选择对或错'); return }
      answer = tfAnswer.value
      break
    case 'blank':
      if (blankAnswers.value.some(a => !a.trim())) { alert('请填写所有空格'); return }
      answer = [...blankAnswers.value]
      break
    case 'shortAnswer':
      if (!shortAnswer.value.trim()) { alert('请输入答案'); return }
      answer = shortAnswer.value.trim()
      break
    default:
      return
  }

  emit('submit', answer)
  // 模拟结果（实际由父组件通过practiceService判断）
  result.value = 'wrong' // 默认显示为错，等父组件反馈后更新
  submitted.value = true
}

function handleGiveUp() {
  if (submitted.value || !props.question) return
  emit('giveUp')
  result.value = 'wrong'
  submitted.value = true
}

function handleNext() {
  emit('next')
  resetState()
}

function resetState() {
  submitted.value = false
  result.value = null
  singleAnswer.value = null
  multipleAnswers.value = []
  tfAnswer.value = null
  blankAnswers.value = Array(blankCount.value).fill('')
  shortAnswer.value = ''
}

function toggleMultipleOption(index: number) {
  const idx = multipleAnswers.value.indexOf(index)
  if (idx >= 0) {
    multipleAnswers.value.splice(idx, 1)
  } else {
    multipleAnswers.value.push(index)
  }
}
</script>

<template>
  <div class="quiz-runner" v-if="question">
    <!-- 题目区 -->
    <div class="question-area">
      <!-- 进度 + 题号 -->
      <div class="question-header">
        <span class="type-badge">{{ typeName }}</span>
        <span class="q-number">{{ currentIndex + 1 }} / {{ total }}</span>
      </div>

      <!-- 题干 -->
      <h2 class="question-text">{{ question.content }}</h2>

      <!-- 作答区（未提交时） -->
      <div v-if="!submitted" class="answer-area">
        <!-- 单选 -->
        <template v-if="question.type === 'single'">
          <div class="option-group">
            <label
              v-for="(opt, idx) in question.options"
              :key="idx"
              class="option-item"
              :class="{ selected: singleAnswer === idx }"
            >
              <input type="radio" :value="idx" v-model="singleAnswer" />
              <span class="opt-label">{{ opt.label || getOptionLabel(idx) }}</span>
              <span class="opt-text">{{ opt.text }}</span>
            </label>
          </div>
        </template>

        <!-- 多选 -->
        <template v-else-if="question.type === 'multiple'">
          <div class="option-group">
            <label
              v-for="(opt, idx) in question.options"
              :key="idx"
              class="option-item"
              :class="{ selected: multipleAnswers.includes(idx) }"
            >
              <input type="checkbox" :value="idx" :checked="multipleAnswers.includes(idx)"
                @change="toggleMultipleOption(idx)" />
              <span class="opt-label">{{ opt.label || getOptionLabel(idx) }}</span>
              <span class="opt-text">{{ opt.text }}</span>
            </label>
          </div>
        </template>

        <!-- 判断 -->
        <template v-else-if="question.type === 'trueFalse'">
          <div class="tf-buttons">
            <button
              class="tf-btn"
              :class="{ active: tfAnswer === true }"
              @click="tfAnswer = true"
            >
              ✓ 正确
            </button>
            <button
              class="tf-btn wrong"
              :class="{ active: tfAnswer === false }"
              @click="tfAnswer = false"
            >
              ✗ 错误
            </button>
          </div>
        </template>

        <!-- 填空 -->
        <template v-else-if="question.type === 'blank'">
          <div class="blank-inputs">
            <input
              v-for="(_, idx) in blankCount"
              :key="idx"
              type="text"
              v-model="blankAnswers[idx]"
              :placeholder="`第 ${idx + 1} 空`"
              class="blank-input"
            />
          </div>
        </template>

        <!-- 简答 -->
        <template v-else-if="question.type === 'shortAnswer'">
          <textarea
            v-model="shortAnswer"
            placeholder="请输入你的答案..."
            class="short-answer-input"
            rows="5"
          ></textarea>
        </template>

        <!-- 操作按钮 -->
        <div class="submit-actions">
          <button class="btn btn-giveup" @click="handleGiveUp">不会</button>
          <button class="btn btn-submit" @click="handleSubmit">提交答案</button>
        </div>
      </div>

      <!-- 反馈区（提交后） -->
      <div v-else class="feedback-area">
        <div class="feedback-header" :class="result">
          <span v-if="result === 'correct'" class="feedback-icon">✅ 回答正确!</span>
          <span v-else class="feedback-icon">❌ 回答错误</span>
        </div>

        <!-- 正确答案展示 -->
        <div class="correct-answer-box">
          <strong>正确答案：</strong>
          <span class="correct-value">{{ formatCorrectAnswer(question) }}</span>
        </div>

        <!-- 你的答案 -->
        <div class="your-answer-box">
          <strong>你的答案：</strong>
          <span>{{ formatSubmittedAnswer(question, singleAnswer ?? multipleAnswers ?? tfAnswer ?? blankAnswers ?? shortAnswer) }}</span>
        </div>

        <!-- 解析 -->
        <div v-if="question.explanation" class="explanation-box">
          <strong>解析：</strong>
          <p>{{ question.explanation }}</p>
        </div>

        <button class="btn btn-next" @click="handleNext">
          {{ currentIndex >= total - 1 ? '查看报告 →' : '下一题 →' }}
        </button>
      </div>
    </div>
  </div>

  <div v-else class="empty-state">
    <p>没有更多题目</p>
  </div>
</template>

<style scoped>
.quiz-runner {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}

.empty-state {
  display: flex; align-items: center; justify-content: center;
  flex: 1; color: var(--text-muted); font-size: 16px;
}

/* 题目区域 */
.question-area {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 32px 36px;
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-badge {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.q-number {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

.question-text {
  font-size: 19px;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
}

/* 作答区 */
.answer-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-secondary);
}
.option-item:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-bg);
}
.option-item.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.option-item input[type="radio"],
.option-item input[type="checkbox"] {
  width: 18px; height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.opt-label {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-gray-200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.option-item.selected .opt-label {
  background: var(--color-primary);
  color: white;
}

.opt-text {
  font-size: 15px;
  color: var(--text-primary);
}

/* 判断题按钮 */
.tf-buttons {
  display: flex;
  gap: 16px;
}

.tf-btn {
  flex: 1;
  padding: 18px 24px;
  border-radius: var(--border-radius-lg);
  font-size: 18px;
  font-weight: 600;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.tf-btn:hover {
  border-color: var(--color-primary-light);
}
.tf-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
}
.tf-btn.wrong.active {
  border-color: var(--color-error);
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* 填空输入 */
.blank-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.blank-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 15px;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}
.blank-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

/* 简答题 */
.short-answer-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
  transition: border-color var(--transition-fast);
}
.short-answer-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

/* 提交按钮 */
.submit-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 11px 28px;
  border-radius: var(--border-radius);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform var(--transition-fast), opacity var(--transition-fast), background-color var(--transition-fast);
}
.btn:hover:not(:disabled) { transform: scale(1.02); }

.btn-submit {
  background: var(--color-primary);
  color: white;
  flex: 1;
}
.btn-submit:hover { background: var(--color-primary-light); }

.btn-giveup {
  background: var(--color-gray-100);
  color: var(--text-secondary);
}
.btn-giveup:hover { background: var(--color-gray-200); }

/* 反馈区 */
.feedback-area {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feedback-header {
  padding: 14px 20px;
  border-radius: var(--border-radius-lg);
  text-align: center;
  font-size: 17px;
  font-weight: 600;
}
.feedback-header.correct {
  background: var(--color-success-bg);
  color: var(--color-success);
}
.feedback-header.wrong {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.feedback-icon {
  font-size: 18px;
}

.correct-answer-box,
.your-answer-box,
.explanation-box {
  padding: 12px 16px;
  border-radius: var(--border-radius);
  font-size: 14px;
  line-height: 1.6;
}

.correct-answer-box {
  background: #f0fdf4;
  border-left: 3px solid var(--color-success);
}
.correct-value {
  color: var(--color-success);
  font-weight: 600;
}

.your-answer-box {
  background: var(--color-gray-50);
  border-left: 3px solid var(--color-gray-300);
}

.explanation-box {
  background: #fffbeb;
  border-left: 3px solid var(--color-accent);
}
.explanation-box p {
  margin: 6px 0 0;
  color: var(--text-secondary);
}

.btn-next {
  align-self: flex-end;
  background: var(--color-accent);
  color: white;
  padding: 10px 28px;
}
.btn-next:hover { background: var(--color-accent-light); }
</style>
