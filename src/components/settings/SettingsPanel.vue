<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { backupService } from '@/services/backupService'

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const uiStore = useUIStore()

const s = computed(() => settingsStore.settings)

// 本地编辑值
const themeMode = ref(s.value.themeMode || 'light')
const editorFontSize = ref(s.value.editorFontSize)
const lineHeight = ref(s.value.lineHeight || 1.6)
const typewriterMode = ref(s.value.typewriterMode || false)
const focusMode = ref(s.value.focusMode || false)
const sidebarWidth = ref(s.value.sidebarWidth || 260)
const autoSave = ref(s.value.autoSave !== false)
const historyVersions = ref(s.value.historyVersions || 10)

// 存储信息
const storageUsed = ref('加载中...')
const storageQuota = ref('...')
const persistenceGranted = ref<boolean | null>(null)

onMounted(async () => {
  const estimate = await backupService.getStorageEstimate()
  storageUsed.value = estimate.used
  storageQuota.value = estimate.quota
})

async function saveSetting(key: string, value: any) {
  await settingsStore.saveSettings({ [key]: value })
}

async function handleBackup() {
  try {
    const blob = await backupService.createBackup()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `知行笔记_备份_${new Date().toISOString().slice(0, 10)}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e: any) {
    alert('导出失败：' + e.message)
  }
}

async function handleRestore() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,.zip'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    if (!confirm('恢复将覆盖当前所有数据，确定继续？')) return
    try {
      const result = await backupService.restoreBackup(file)
      if (result.success) {
        alert(result.message)
        window.location.reload()
      } else {
        alert(result.message)
      }
    } catch (e: any) {
      alert('恢复失败：' + e.message)
    }
  }
  input.click()
}

async function requestPersistence() {
  const granted = await backupService.requestPersistence()
  persistenceGranted.value = granted
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div class="settings-overlay" @click.self="handleClose">
    <div class="settings-panel">
      <!-- 顶部 -->
      <div class="settings-header">
        <h2 class="settings-title">设置</h2>
        <button class="settings-close-btn" @click="handleClose" aria-label="关闭设置">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 内容区 - 列表形式 -->
      <div class="settings-body">
        <!-- 外观设置 -->
        <div class="settings-list">
          <h3 class="list-section-title">外观</h3>

          <div class="setting-row" @click="themeMode = themeMode === 'light' ? 'dark' : 'light'; saveSetting('themeMode', themeMode)">
            <span class="setting-label">主题模式</span>
            <span class="setting-value clickable">{{ themeMode === 'light' ? '浅色' : '深色' }}</span>
          </div>

          <div class="setting-row">
            <span class="setting-label">编辑器字号</span>
            <span class="setting-value clickable">{{ editorFontSize }}px</span>
          </div>

          <div class="setting-row">
            <span class="setting-label">行间距</span>
            <span class="setting-value clickable">{{ lineHeight }}</span>
          </div>
        </div>

        <!-- 编辑器设置 -->
        <div class="settings-list">
          <h3 class="list-section-title">编辑器</h3>

          <div class="setting-row" @click="typewriterMode = !typewriterMode; saveSetting('typewriterMode', typewriterMode)">
            <span class="setting-label">打字机模式</span>
            <span class="setting-value clickable">{{ typewriterMode ? '已开启' : '已关闭' }}</span>
          </div>

          <div class="setting-row" @click="focusMode = !focusMode; saveSetting('focusMode', focusMode)">
            <span class="setting-label">专注模式</span>
            <span class="setting-value clickable">{{ focusMode ? '已开启' : '已关闭' }}</span>
          </div>

          <div class="setting-row">
            <span class="setting-label">目录栏宽度</span>
            <span class="setting-value clickable">{{ sidebarWidth }}px</span>
          </div>
        </div>

        <!-- 数据与保存 -->
        <div class="settings-list">
          <h3 class="list-section-title">数据与保存</h3>

          <div class="setting-row" @click="autoSave = !autoSave; saveSetting('autoSave', autoSave)">
            <span class="setting-label">自动保存</span>
            <span class="setting-value clickable">{{ autoSave ? '已开启' : '已关闭' }}</span>
          </div>

          <div class="setting-row">
            <span class="setting-label">历史版本</span>
            <span class="setting-value clickable">保留 {{ historyVersions }} 个版本</span>
          </div>
        </div>

        <!-- 数据安全区域 - 两列卡片布局 -->
        <div class="data-safety-section">
          <h3 class="list-section-title">数据安全</h3>

          <div class="backup-cards">
            <div class="backup-card">
              <button class="backup-btn primary" @click="handleBackup">
                导出完整备份
              </button>
              <p class="backup-desc">下载包含所有笔记和题库的JSON文件</p>
            </div>

            <div class="backup-card">
              <button class="backup-btn secondary" @click="handleRestore">
                恢复备份
              </button>
              <p class="backup-desc">选择备份文件恢复数据</p>
            </div>
          </div>

          <!-- 存储状态 -->
          <div class="storage-status">
            <span class="storage-text">已用 {{ storageUsed }} · 可用空间 {{ storageQuota }}</span>
          </div>

          <!-- 申请持久化存储 -->
          <div class="persistence-action">
            <button class="persistence-btn" @click="requestPersistence">
              申请持久化存储
            </button>
            <span v-if="persistenceGranted !== null" class="persistence-status" :class="{ granted: persistenceGranted }">
              {{ persistenceGranted ? '已授予' : '未授予' }}
            </span>
          </div>

          <!-- 红色提示文字 -->
          <div class="safety-warning">
            ⚠️ 数据仅保存在当前浏览器中，请定期导出备份。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--bg-overlay);
  display: flex;
  justify-content: flex-end;
  animation: fadeIn var(--transition-normal) ease-out;
}

.settings-panel {
  width: 420px;
  max-width: 90vw;
  height: 100%;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: slideInRight var(--transition-normal) ease-out;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  transition: background var(--transition-fast), color var(--transition-fast);
  background: transparent;
  border: none;
  cursor: pointer;
}

.settings-close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* 列表形式的设置项 */
.settings-list {
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
}

.list-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 20px 8px;
  margin: 0;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-bottom: 1px solid var(--color-gray-100);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row:hover {
  background: var(--bg-hover);
}

.setting-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.setting-value {
  font-size: 14px;
  color: var(--text-muted);
}

.setting-value.clickable {
  color: var(--color-primary);
  font-weight: 500;
}

/* 数据安全区域 */
.data-safety-section {
  padding: 4px 0;
}

.backup-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px 20px;
}

.backup-card {
  background: white;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.backup-btn {
  padding: 10px 16px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.backup-btn.primary {
  background: var(--color-primary);
  color: white;
}
.backup-btn.primary:hover {
  background: var(--color-primary-light);
}

.backup-btn.secondary {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.backup-btn.secondary:hover {
  background: var(--bg-hover);
}

.backup-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.storage-status {
  padding: 12px 20px;
}

.storage-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.persistence-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
}

.persistence-btn {
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.persistence-btn:hover {
  background: var(--color-gray-100);
}

.persistence-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--color-error-bg);
  color: var(--color-error);
}

.persistence-status.granted {
  background: var(--color-success-bg);
  color: var(--color-success);
}

/* 红色提示文字 */
.safety-warning {
  margin: 12px 20px 20px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--border-radius);
  color: #dc2626;
  font-size: 13px;
  line-height: 1.5;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
