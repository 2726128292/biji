<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { practiceService } from '@/services/practiceService'
import type { PracticeReport as ReportType } from '@/types/database'

const props = defineProps<{
  sessionId: string
}>()

const emit = defineEmits<{
  back: []
  retry: [sessionId: string]
  retrySame: []
  viewWrongBook: [sessionId: string]
}>()

const report = ref<ReportType | null>(null)
const loading = ref(true)

async function loadReport() {
  loading.value = true
  try {
    report.value = await practiceService.getReport(props.sessionId)
  } catch (e: any) {
    console.error('加载报告失败', e)
  } finally {
    loading.value = false
  }
}

const accuracyColor = computed(() => {
  if (!report.value) return ''
  const acc = report.value.accuracy
  if (acc >= 80) return 'high'
  if (acc >= 60) return 'mid'
  return 'low'
})

// 计算总用时
const totalTime = computed(() => {
  if (!report.value) return '0分0秒'
  const start = new Date(report.value.startedAt).getTime()
  const end = new Date(report.value.completedAt).getTime()
  const diffMs = end - start
  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)
  return `${minutes}分${seconds}秒`
})

// 获取目标错题本名称
const targetWrongBookName = computed(() => {
  if (!report.value) return ''
  return report.value.targetWrongBookName || '错题本'
})

function handleBack() {
  emit('back')
}

function handleRetry() {
  emit('retry', props.sessionId)
}

function handleRetrySame() {
  emit('retrySame')
}

function handleViewWrongBook() {
  emit('viewWrongBook', props.sessionId)
}

onMounted(() => {
  loadReport()
})
</script>

<template>
  <div class="practice-report">
    <div v-if="loading" class="loading-state">
      <span>加载报告...</span>
    </div>

    <template v-else-if="report">
      <!-- 居中白色卡片容器 -->
      <div class="report-card">
        <!-- 标题 -->
        <div class="report-header">
          <h2 class="report-title">本轮刷题完成</h2>
          <p class="report-subtitle">来源：{{ report.sourceName || '未知来源' }}</p>
        </div>

        <!-- 统计卡片区 2x3网格 -->
        <div class="stats-grid">
          <div class="stat-card total">
            <span class="stat-number">{{ report.totalQuestions }}</span>
            <span class="stat-label">本轮总数</span>
          </div>
          <div class="stat-card correct">
            <span class="stat-number">{{ report.correctCount }}</span>
            <span class="stat-label">答对</span>
          </div>
          <div class="stat-card wrong">
            <span class="stat-number">{{ report.wrongCount }}</span>
            <span class="stat-label">错误</span>
          </div>
          <div class="stat-card accuracy" :class="accuracyColor">
            <span class="stat-number">{{ report.accuracy }}%</span>
            <span class="stat-label">正确率</span>
          </div>
          <div class="stat-card time">
            <span class="stat-number">{{ totalTime }}</span>
            <span class="stat-label">总用时</span>
          </div>
          <div class="stat-card wrongbook">
            <span class="stat-number">{{ targetWrongBookName }}</span>
            <span class="stat-label">已入错题本</span>
          </div>
        </div>

        <!-- 操作按钮区 - 4个按钮 -->
        <div class="action-section">
          <button class="btn btn-primary" @click="handleRetry">
            刷练"{{ targetWrongBookName }}"
          </button>
          <button class="btn btn-outline" @click="handleViewWrongBook">
            查看错题本
          </button>
          <button class="btn btn-secondary" @click="handleRetrySame">
            重新刷本题
          </button>
          <button class="btn btn-secondary" @click="handleBack">
            返回目录
          </button>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <p>未找到报告数据</p>
      <button class="btn btn-primary" @click="handleBack">返回</button>
    </div>
  </div>
</template>

<style scoped>
.practice-report {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-muted);
  font-size: 15px;
}

/* 居中白色卡片容器 */
.report-card {
  max-width: 680px;
  width: 100%;
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 标题 */
.report-header {
  text-align: center;
}

.report-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.report-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* 统计卡片 2x3网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 4px solid transparent;
}

.stat-card.total {
  border-top-color: #1e3a5f;
}
.stat-card.correct {
  border-top-color: var(--color-success);
}
.stat-card.wrong {
  border-top-color: var(--color-error);
}
.stat-card.accuracy {
  border-top-color: #f59e0b;
}
.stat-card.time {
  border-top-color: #8b5cf6;
}
.stat-card.wrongbook {
  border-top-color: #ec4899;
}

.stat-card.accuracy.high {
  background: #f0fdf4;
}
.stat-card.accuracy.mid {
  background: #fffbeb;
}
.stat-card.accuracy.low {
  background: #fef2f2;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  word-break: break-word;
}
.stat-card.total .stat-number { color: #1e3a5f; }
.stat-card.correct .stat-number { color: var(--color-success); }
.stat-card.wrong .stat-number { color: var(--color-error); }
.stat-card.accuracy .stat-number { color: #f59e0b; }
.stat-card.time .stat-number { color: #8b5cf6; }
.stat-card.wrongbook .stat-number { color: #ec4899; font-size: 16px; }

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

/* 操作按钮 */
.action-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 10px 24px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform var(--transition-fast), background-color var(--transition-fast);
  border: none;
}
.btn:hover { transform: scale(1.02); }

.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover { background: var(--color-primary-light); }

.btn-outline {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.btn-outline:hover {
  background: var(--color-info-bg);
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--text-secondary);
}
.btn-secondary:hover { background: var(--color-gray-200); }
</style>
