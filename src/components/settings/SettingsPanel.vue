<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { backupService } from '@/services/backupService'
import BackupRestorePanel from './BackupRestorePanel.vue'

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const uiStore = useUIStore()

const s = computed(() => settingsStore.settings)

// 本地编辑值
const defaultModule = ref(s.value.defaultModule)
const autoSaveInterval = ref(s.value.autoSaveInterval)
const editorFontSize = ref(s.value.editorFontSize)
const editorTheme = ref(s.value.editorTheme)
const quizOrder = ref(s.value.quizOrder)
const autoAdvanceOnCorrect = ref(s.value.autoAdvanceOnCorrect)

// 存储信息
const storageUsed = ref('加载中...')
const storageQuota = ref('...')
const persistenceGranted = ref<boolean | null>(null)

onMounted(async () => {
  const estimate = await backupService.getStorageEstimate()
  storageUsed.value = estimate.used
  storageQuota.value = estimate.quota
})

async function saveAll() {
  await settingsStore.saveSettings({
    defaultModule: defaultModule.value,
    autoSaveInterval: autoSaveInterval.value,
    editorFontSize: editorFontSize.value,
    editorTheme: editorTheme.value,
    quizOrder: quizOrder.value,
    autoAdvanceOnCorrect: autoAdvanceOnCorrect.value
  })
}

async function handleBackup() {
  uiStore.showBackupRestore = true
}

async function requestPersistence() {
  const granted = await backupService.requestPersistence()
  persistenceGranted.value = granted
}

// PWA 更新状态
const pwaUpdateStatus = computed(() => {
  if (uiStore.showUpdatePrompt) return '有可用更新，请刷新页面'
  return '已是最新版本'
})

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

      <!-- 内容区 -->
      <div class="settings-body">
        <!-- 常规设置 -->
        <section class="settings-section">
          <h3 class="section-title">常规设置</h3>

          <div class="setting-item">
            <label class="setting-label">默认模块</label>
            <select v-model="defaultModule" @change="saveAll" class="setting-select">
              <option value="notes">笔记</option>
              <option value="questions">题库</option>
            </select>
          </div>

          <div class="setting-item">
            <label class="setting-label">自动保存间隔</label>
            <div class="setting-input-group">
              <input
                type="number"
                v-model.number="autoSaveInterval"
                @change="saveAll"
                min="100"
                max="5000"
                step="100"
                class="setting-input setting-input-sm"
              />
              <span class="setting-unit">ms</span>
            </div>
          </div>
        </section>

        <!-- 编辑器设置 -->
        <section class="settings-section">
          <h3 class="section-title">编辑器设置</h3>

          <div class="setting-item">
            <label class="setting-label">字体大小</label>
            <div class="setting-input-group">
              <input
                type="number"
                v-model.number="editorFontSize"
                @change="saveAll"
                min="12"
                max="24"
                class="setting-input setting-input-sm"
              />
              <span class="setting-unit">px</span>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">编辑器主题</label>
            <select v-model="editorTheme" @change="saveAll" class="setting-select">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </section>

        <!-- 练习设置 -->
        <section class="settings-section">
          <h3 class="section-title">练习设置</h3>

          <div class="setting-item">
            <label class="setting-label">默认刷题顺序</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="quizOrder" value="random" @change="saveAll" />
                <span>随机</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="quizOrder" value="sequential" @change="saveAll" />
                <span>顺序</span>
              </label>
            </div>
          </div>

          <div class="setting-item setting-item-row">
            <label class="setting-label">答对后自动跳转</label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="autoAdvanceOnCorrect" @change="saveAll" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </section>

        <!-- 数据管理 -->
        <section class="settings-section">
          <h3 class="section-title">数据管理</h3>

          <div class="setting-actions">
            <button class="btn btn-primary" @click="handleBackup">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              备份全部数据
            </button>
          </div>

          <div class="storage-info">
            <span class="storage-label">存储空间使用量：</span>
            <span class="storage-value">{{ storageUsed }} / {{ storageQuota }}</span>
          </div>

          <div class="setting-actions">
            <button class="btn btn-secondary" @click="requestPersistence">
              申请持久化存储
            </button>
            <span v-if="persistenceGranted !== null" class="persistence-status" :class="{ granted: persistenceGranted }">
              {{ persistenceGranted ? '已授予' : '未授予' }}
            </span>
          </div>
        </section>

        <!-- 关于 -->
        <section class="settings-section">
          <h3 class="section-title">关于</h3>

          <div class="about-info">
            <div class="about-row">
              <span class="about-label">版本号</span>
              <span class="about-value">V1.0.0</span>
            </div>
            <div class="about-row">
              <span class="about-label">PWA 更新状态</span>
              <span class="about-value">{{ pwaUpdateStatus }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 嵌入的备份恢复面板（通过独立面板打开） -->
      <BackupRestorePanel v-if="uiStore.showBackupRestore" @close="uiStore.showBackupRestore = false" />
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
  width: 360px;
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

.settings-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.setting-item {
  margin-bottom: 14px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.setting-item-row .setting-label {
  margin-bottom: 0;
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: white;
  color: var(--text-primary);
  cursor: pointer;
}

.setting-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.setting-input {
  width: 100%;
  max-width: 120px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: white;
  color: var(--text-primary);
}

.setting-input-sm {
  max-width: 80px;
}

.setting-unit {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Radio */
.radio-group {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
}

.radio-option input[type="radio"] {
  accent-color: var(--color-primary);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background-color: var(--color-gray-300);
  border-radius: 12px;
  transition: background-color var(--transition-fast);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* Buttons */
.setting-actions {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-light);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--color-gray-100);
}

.storage-info {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.storage-value {
  font-weight: 500;
  color: var(--text-primary);
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

/* About */
.about-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.about-label {
  color: var(--text-secondary);
}

.about-value {
  color: var(--text-primary);
  font-weight: 500;
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
