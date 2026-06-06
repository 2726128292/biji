<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { practiceService } from '@/services/practiceService'
import type { PracticeReport as ReportType } from '@/types/database'
import { formatSubmittedAnswer } from '@/utils/questionJudge'

const props = defineProps<{
  sessionId: string
}>()

const emit = defineEmits<{
  back: []
  retry: [sessionId: string]
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

function handleBack() {
  emit('back')
}

function handleRetry() {
  emit('retry', props.sessionId)
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
      <!-- 标题 -->
      <div class="report-header">
        <h2 class="report-title">📊 本轮练习结果</h2>
      </div>

      <!-- 统计卡片区 -->
      <div class="stats-grid">
        <div class="stat-card total">
          <span class="stat-number">{{ report.totalQuestions }}</span>
          <span class="stat-label">总题数</span>
        </div>
        <div class="stat-card correct">
          <span class="stat-number">{{ report.correctCount }}</span>
          <span class="stat-label">正确数</span>
        </div>
        <div class="stat-card wrong">
          <span class="stat-number">{{ report.wrongCount }}</span>
          <span class="stat-label">错误数</span>
        </div>
        <div class="stat-card accuracy" :class="accuracyColor">
          <span class="stat-number">{{ report.accuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
      </div>

      <!-- 详细列表 -->
      <div class="detail-section">
        <h3 class="section-title">详细记录</h3>
        <div class="answer-list">
          <div
            v-for="(ans, idx) in report.answers"
            :key="ans.id"
            class="answer-row"
            :class="ans.result"
          >
            <div class="row-left">
              <span class="row-index">{{ idx + 1 }}</span>
              <span class="row-result-icon">
                {{ ans.result === 'correct' ? '✅' : ans.result === 'wrong' ? '❌' : '❓' }}
              </span>
              <p class="row-content">{{ ans.questionContent }}</p>
            </div>
            <div class="row-right">
              <span class="row-time">{{ new Date(ans.answeredAt).toLocaleTimeString() }}</span>
              <span v-if="ans.addedToTarget" class="row-wb-badge">已加入错题本</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮区 -->
      <div class="action-section">
        <button class="btn btn-secondary" @click="handleBack">← 返回题库</button>
        <button class="btn btn-accent" @click="handleRetry">🔄 再练一轮</button>
        <button class="btn btn-primary" @click="$router.push('/wrongbook/' + sessionId)">
          📕 查看错题本
        </button>
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
  gap: 28px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex: 1;
  color: var(--text-muted);
  font-size: 15px;
}

/* 标题 */
.report-header {
  text-align: center;
}
.report-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 720px;
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
  border-top-color: var(--color-accent);
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
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-card.total .stat-number { color: #1e3a5f; }
.stat-card.correct .stat-number { color: var(--color-success); }
.stat-card.wrong .stat-number { color: var(--color-error); }
.stat-card.accuracy .stat-number { color: var(--color-accent-dark); }

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

/* 详细列表 */
.detail-section {
  width: 100%;
  max-width: 720px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 3px solid transparent;
  transition: box-shadow var(--transition-fast);
  gap: 12px;
  flex-wrap: wrap;
}
.answer-row:hover {
  box-shadow: var(--shadow-md);
}
.answer-row.correct {
  border-left-color: var(--color-success);
}
.answer-row.wrong {
  border-left-color: var(--color-error);
}

.row-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.row-index {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-gray-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.row-result-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.row-content {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.row-time {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.row-wb-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  background: var(--color-error-bg);
  color: var(--color-error);
  white-space: nowrap;
}

/* 操作按钮 */
.action-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: transform var(--transition-fast), background-color var(--transition-fast);
}
.btn:hover { transform: scale(1.02); }

.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover { background: var(--color-primary-light); }

.btn-accent {
  background: var(--color-accent);
  color: white;
}
.btn-accent:hover { background: var(--color-accent-light); }

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--text-secondary);
}
.btn-secondary:hover { background: var(--color-gray-200); }
</style>
