<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { noteService } from '@/services/noteService'
import type { NoteVersion } from '@/types/database'
import { History, Eye, RotateCcw, X } from 'lucide-vue-next'

const props = defineProps<{
  noteId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'restore', versionId: string, versionContent: string): void
}>()

const versions = ref<NoteVersion[]>([])
const loading = ref(true)
const previewContent = ref<string | null>(null)
const previewVersionId = ref<string | null>(null)

async function loadVersions() {
  loading.value = true
  try {
    versions.value = await noteService.getVersions(props.noteId)
  } catch (e) {
    console.error('加载历史版本失败:', e)
  } finally {
    loading.value = false
  }
}

function handlePreview(version: NoteVersion) {
  previewContent.value = version.content
  previewVersionId.value = version.id
}

function closePreview() {
  previewContent.value = null
  previewVersionId.value = null
}

function handleRestore(version: NoteVersion) {
  emit('restore', version.id, version.content)
}

onMounted(() => {
  loadVersions()
})

watch(() => props.noteId, () => {
  loadVersions()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-panel">
      <div v-if="true" class="version-history-overlay" @click.self="emit('close')">
        <div class="version-history-panel">
          <!-- 头部 -->
          <div class="panel-header">
            <div class="header-left">
              <History :size="16" />
              <h3 class="header-title">历史版本</h3>
              <span class="version-count">{{ versions.length }}/10</span>
            </div>
            <button class="close-btn" @click="emit('close')">
              <X :size="16" />
            </button>
          </div>

          <!-- 加载中 -->
          <div v-if="loading" class="panel-loading">
            <span>加载中...</span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="versions.length === 0" class="panel-empty">
            <History :size="32" class="empty-icon" />
            <p>暂无历史版本</p>
            <p class="empty-hint">编辑内容后系统会自动保存快照</p>
          </div>

          <!-- 版本列表 -->
          <div v-else class="version-list">
            <div
              v-for="version in versions"
              :key="version.id"
              class="version-item"
              :class="{ active: previewVersionId === version.id }"
            >
              <div class="version-meta">
                <span class="version-time">{{ formatTime(version.createdAt) }}</span>
                <span class="version-date">{{ formatDate(version.createdAt) }}</span>
              </div>
              <div class="version-actions">
                <button
                  class="action-btn preview-btn"
                  :class="{ active: previewVersionId === version.id }"
                  @click="handlePreview(version)"
                  title="预览"
                >
                  <Eye :size="13" />
                </button>
                <button
                  class="action-btn restore-btn"
                  @click="handleRestore(version)"
                  title="恢复此版本"
                >
                  <RotateCcw :size="13" />
                </button>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div v-if="previewContent !== null" class="preview-section">
            <div class="preview-header">
              <span>预览</span>
              <button class="preview-close" @click="closePreview">&times;</button>
            </div>
            <pre class="preview-content"><code>{{ previewContent }}</code></pre>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
export default {
  methods: {
    formatTime(timestamp: number): string {
      const date = new Date(timestamp)
      const h = String(date.getHours()).padStart(2, '0')
      const m = String(date.getMinutes()).padStart(2, '0')
      const s = String(date.getSeconds()).padStart(2, '0')
      return `${h}:${m}:${s}`
    },
    formatDate(timestamp: number): string {
      const date = new Date(timestamp)
      const y = date.getFullYear()
      const mo = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}/${mo}/${d}`
    }
  }
}
</script>

<style scoped>
.version-history-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.25);
}

.version-history-panel {
  width: 380px;
  max-width: 90vw;
  height: 100%;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: slideInFromRight var(--transition-slow) cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slideInFromRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
}

.header-title {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.version-count {
  font-size: 11.5px;
  color: var(--text-muted);
  background: var(--color-gray-100);
  padding: 1px 7px;
  border-radius: 10px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}
.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.panel-loading,
.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  flex: 1;
}

.empty-icon {
  opacity: 0.35;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.7;
}

.version-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px;
}

.version-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
  margin-bottom: 2px;
}
.version-item:hover {
  background: var(--bg-hover);
}
.version-item.active {
  background: var(--color-primary-bg);
}

.version-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.version-time {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.version-date {
  font-size: 11.5px;
  color: var(--text-muted);
}

.version-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}
.action-btn:hover {
  background: var(--color-gray-100);
  color: var(--text-primary);
}

.preview-btn.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.restore-btn:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.preview-section {
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  max-height: 40%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--border-color);
}

.preview-close {
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1;
}
.preview-close:hover {
  color: var(--text-primary);
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.65;
  color: var(--text-secondary);
  background: var(--color-gray-900);
  font-family: var(--font-mono);
  white-space: pre-wrap;
  word-break: break-all;
}

/* 过渡动画 */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity var(--transition-normal);
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .version-history-panel {
    width: 100vw;
    max-width: 100vw;
  }
}
</style>
