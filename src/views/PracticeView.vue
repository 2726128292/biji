<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PracticeSetupModal from '@/components/practice/PracticeSetupModal.vue'
import MemorizeCard from '@/components/practice/MemorizeCard.vue'
import QuizRunner from '@/components/practice/QuizRunner.vue'
import PracticeReport from '@/components/practice/PracticeReport.vue'
import { practiceService } from '@/services/practiceService'
import type { Question, PracticeConfig, AnswerResult } from '@/types/database'

const route = useRoute()
const router = useRouter()

// 状态
const phase = ref<'setup' | 'running' | 'report'>('setup')
const sessionId = ref<string | null>(null)
const questions = ref<Question[]>([])
const currentIndex = ref(0)
const mode = ref<'memorize' | 'quiz'>('memorize')
const answers = ref<Array<{ questionId: string; result: AnswerResult; submittedAnswer: any }>>([])

// 设置弹窗
const showSetup = computed(() => {
  return route.path === '/practice' && !route.params.sessionId && phase.value === 'setup'
})

const sourceType = computed(() => (route.query.sourceType as string) || 'bank')
const sourceId = computed(() => (route.query.sourceId as string) || '')

// 报告模式
const isReportMode = computed(() => !!route.params.sessionId)

onMounted(async () => {
  if (route.params.sessionId) {
    sessionId.value = route.params.sessionId as string
    phase.value = 'report'
  }
})

async function handleStart(config: PracticeConfig) {
  mode.value = config.mode
  const session = await practiceService.createSession(config)
  sessionId.value = session.id
  questions.value = await practiceService.getQuestionQueue(session)

  if (config.order === 'random') {
    // Fisher-Yates shuffle
    for (let i = questions.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[questions.value[i], questions.value[j]] = [questions.value[j], questions.value[i]]
    }
  }

  if (config.count && config.count < questions.value.length) {
    questions.value = questions.value.slice(0, config.count)
  }

  currentIndex.value = 0
  phase.value = 'running'
}

function currentQuestion(): Question | undefined {
  return questions.value[currentIndex.value]
}

async function handleSubmitAnswer(answer: any) {
  if (!sessionId.value || !currentQuestion()) return
  const result = await practiceService.submitAnswer(
    sessionId.value,
    currentQuestion()!,
    answer
  )
  answers.value.push({
    questionId: currentQuestion()!.id,
    result: result.result,
    submittedAnswer: answer
  })
}

async function handleGiveUp() {
  if (!sessionId.value || !currentQuestion()) return
  await practiceService.markUnknown(sessionId.value, currentQuestion()!)
  answers.value.push({
    questionId: currentQuestion()!.id,
    result: 'unknown',
    submittedAnswer: '__UNKNOWN__'
  })
}

function handleNext() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  } else {
    finishSession()
  }
}

function handlePrev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 背题模式操作（列表式，不依赖 currentIndex）
async function handleMemorizeKnow(id: string) {
  if (!sessionId.value) return
  await practiceService.submitAnswer(sessionId.value, questions.value.find(q => q.id === id)!, 'known')
}

async function handleMemorizeDontKnow(id: string) {
  if (!sessionId.value) return
  const q = questions.value.find(qq => qq.id === id)
  if (q) await practiceService.markUnknown(sessionId.value, q)
  // 自动加入错题本
  answers.value.push({ questionId: id, result: 'unknown', submittedAnswer: '__UNKNOWN__' })
}

async function handleMemorizeStar(id: string) {
  // 标记重点（可选：记录到答案中）
}

async function finishSession() {
  if (!sessionId.value) return
  await practiceService.completeSession(sessionId.value)
  phase.value = 'report'
}

function handleRetryWithWrongBook() {
  router.push({ path: '/practice', query: { sourceType: 'wrongBook', sourceId: '' } })
  phase.value = 'setup'
}

function handleViewWrongBook() {
  // 跳转到错题本页面（如果有的话）
  router.push('/questions')
}

function handleBack() {
  router.push('/questions')
}

function handleCloseSetup() {
  router.back()
}
</script>

<template>
  <div class="practice-view">
    <!-- 练习设置 -->
    <PracticeSetupModal
      v-if="showSetup"
      :show="true"
      :source-type="sourceType"
      :source-id="sourceId"
      @close="handleCloseSetup"
      @start="handleStart"
    />

    <!-- 运行中 -->
    <template v-else-if="phase === 'running'">
      <!-- 顶部导航栏 -->
      <nav class="practice-nav">
        <button class="nav-btn" @click="handleBack">← 返回</button>
        <div class="progress-info">
          第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题
        </div>
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill"
            :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
          ></div>
        </div>
        <button class="nav-btn danger" @click="finishSession">退出练习</button>
      </nav>

      <!-- 背题模式：列表式多卡展示 -->
      <MemorizeCard
        v-if="mode === 'memorize'"
        :questions="questions"
        :wrong-book-name="(sourceType === 'wrongBook' && sourceId) ? sourceId : undefined"
        @know="handleMemorizeKnow"
        @dont-know="handleMemorizeDontKnow"
        @star="handleMemorizeStar"
        @finish="finishSession"
      />

      <!-- 刷题模式 -->
      <QuizRunner
        v-else
        :question="currentQuestion()"
        :current-index="currentIndex"
        :total="questions.length"
        @submit="handleSubmitAnswer"
        @give-up="handleGiveUp"
        @next="handleNext"
      />
    </template>

    <!-- 练习报告 -->
    <PracticeReport
      v-else-if="phase === 'report' || isReportMode"
      :session-id="sessionId || (route.params.sessionId as string)"
      @back="handleBack"
      @retry="handleRetryWithWrongBook"
      @retry-same="() => { phase = 'setup' }"
      @view-wrong-book="handleViewWrongBook"
    />
  </div>
</template>

<style scoped>
.practice-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

/* 导航栏 */
.practice-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  z-index: 10;
}

.nav-btn {
  padding: 6px 14px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  background: transparent;
}
.nav-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.nav-btn.danger:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.progress-info {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.progress-bar-track {
  flex: 1;
  height: 6px;
  background: var(--color-gray-200);
  border-radius: 3px;
  overflow: hidden;
  max-width: 300px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: 3px;
  transition: width var(--transition-normal);
}
</style>
