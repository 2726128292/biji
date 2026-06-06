<script setup lang="ts">
import { ref } from 'vue'
import { backupService } from '@/services/backupService'

const emit = defineEmits<{
  close: []
}>()

// 备份类型
const backupType = ref<'zip' | 'json'>('zip')

// Loading 状态
const isBackingUp = ref(false)
const isRestoring = ref(false)
const isExporting = ref(false)

// 消息反馈
const message = ref('')
const messageType = ref<'success' | 'error' | ''>('')

// 导出选项
const exportFormat = ref<'txt' | 'markdown' | 'word'>('markdown')
const exportScope = ref<'all' | 'currentBank'>('all')

// 文件输入引用
const restoreFileInput = ref<HTMLInputElement | null>(null)

function showMessage(text: string, type: 'success' | 'error') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 4000)
}

async function handleBackup() {
  isBackingUp.value = true
  message.value = ''
  try {
    let blob: Blob
    let filename: string

    if (backupType.value === 'zip') {
      blob = await backupService.createBackup()
      filename = `zhixing-notes-backup-${new Date().toISOString().slice(0, 10)}.zip`
    } else {
      const jsonStr = await backupService.createJSONBackup()
      blob = new Blob([jsonStr], { type: 'application/json' })
      filename = `zhixing-notes-backup-${new Date().toISOString().slice(0, 10)}.json`
    }

    downloadBlob(blob, filename)
    showMessage('备份成功！文件已开始下载', 'success')
  } catch (e: any) {
    showMessage(`备份失败：${e.message}`, 'error')
  } finally {
    isBackingUp.value = false
  }
}

function triggerRestoreInput() {
  restoreFileInput.value?.click()
}

async function handleRestore(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isRestoring.value = true
  message.value = ''

  try {
    const result = await backupService.restoreBackup(file)
    if (result.success) {
      showMessage(`${result.message} 请刷新页面以加载数据。`, 'success')
    } else {
      showMessage(result.message, 'error')
    }
  } catch (e: any) {
    showMessage(`恢复失败：${e.message}`, 'error')
  } finally {
    isRestoring.value = false
    // 重置 input 以允许选择同一文件
    input.value = ''
  }
}

async function handleExport() {
  isExporting.value = true
  message.value = ''
  try {
    // 基础导出实现：获取数据并生成文件
    const data = await backupService.createJSONBackup()
    const parsed = JSON.parse(data)

    let content = ''
    let filename = ''
    const dateStr = new Date().toISOString().slice(0, 10)

    switch (exportFormat.value) {
      case 'txt':
        content = generateTxtContent(parsed)
        filename = `zhixing-notes-export-${dateStr}.txt`
        break
      case 'markdown':
        content = generateMarkdownContent(parsed)
        filename = `zhixing-notes-export-${dateStr}.md`
        break
      case 'word':
        // 基础 Word 导出：使用 docx 库或降级为 markdown
        try {
          const { Document, Packer, Paragraph, TextRun } = await import('docx')
          const doc = new Document({
            sections: [{
              children: generateDocxParagraphs(parsed)
            }]
          })
          const blob = await Packer.toBlob(doc)
          downloadBlob(blob, `zhixing-notes-export-${dateStr}.docx`)
          showMessage('导出成功！Word 文件已下载', 'success')
          return
        } catch {
          // docx 导出失败时降级为 markdown
          content = generateMarkdownContent(parsed)
          filename = `zhixing-notes-export-${dateStr}.md`
        }
        break
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, filename)
    showMessage('导出成功！文件已开始下载', 'success')
  } catch (e: any) {
    showMessage(`导出失败：${e.message}`, 'error')
  } finally {
    isExporting.value = false
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateTxtContent(data: any): string {
  const lines: string[] = ['知行笔记 - 数据导出', `导出时间：${new Date().toLocaleString()}`, '']

  if (data.notes?.length) {
    lines.push('=== 笔记 ===')
    for (const note of data.notes) {
      lines.push(`【${note.title || '无标题'}】`)
      lines.push(note.content || '')
      lines.push('')
    }
  }

  if (data.questions?.length) {
    lines.push('=== 题目 ===')
    for (const q of data.questions) {
      lines.push(`【${q.type}】${q.content}`)
      if (q.options?.length) {
        for (const opt of q.options) {
          lines.push(`  ${opt.label}. ${opt.text}${opt.isCorrect ? ' ✓' : ''}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

function generateMarkdownContent(data: any): string {
  const lines: string[] = ['# 知行笔记 - 数据导出', '', `导出时间：${new Date().toLocaleString()}`, '']

  if (data.notes?.length) {
    lines.push('## 笔记', '')
    for (const note of data.notes) {
      lines.push(`### ${note.title || '无标题'}`, '')
      lines.push(note.content || '', '')
    }
  }

  if (data.questions?.length) {
    lines.push('## 题目', '')
    for (const q of data.questions) {
      lines.push(`### [${q.type}] ${q.content}`, '')
      if (q.options?.length) {
        lines.push('| 选项 | 内容 | 正确 |')
        lines.push('|------|------|------|')
        for (const opt of q.options) {
          lines.push(`| ${opt.label} | ${opt.text} | ${opt.isCorrect ? '✓' : ''} |`)
        }
        lines.push('')
      }
    }
  }

  return lines.join('\n')
}

async function generateDocxParagraphs(data: any): Promise<any[]> {
  // 动态导入避免打包问题
  const { Paragraph, TextRun } = await import('docx')
  const children: any[] = [
    new Paragraph({ children: [new TextRun({ text: '知行笔记 - 数据导出', bold: true, size: 28 })] }),
    new Paragraph({ children: [new TextRun({ text: `导出时间：${new Date().toLocaleString()}` })] }),
    new Paragraph({ text: '' })
  ]

  if (data.notes?.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: '笔记', bold: true, size: 24 })] }))
    for (const note of data.notes) {
      children.push(new Paragraph({ children: [new TextRun({ text: note.title || '无标题', bold: true })] }))
      children.push(new Paragraph({ children: [new TextRun({ text: note.content || '' })] }))
      children.push(new Paragraph({ text: '' }))
    }
  }

  return children
}
</script>

<template>
  <div class="backup-restore-overlay" @click.self="emit('close')">
    <div class="backup-restore-panel">
      <!-- 顶部 -->
      <div class="br-header">
        <h2 class="br-title">备份与恢复</h2>
        <button class="br-close-btn" @click="emit('close')" aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 消息提示 -->
      <Transition name="message-fade">
        <div v-if="message" class="br-message" :class="[messageType]">
          {{ message }}
        </div>
      </Transition>

      <!-- 内容区 -->
      <div class="br-body">
        <!-- 备份区域 -->
        <section class="br-section">
          <h3 class="br-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            数据备份
          </h3>

          <div class="br-form-row">
            <label class="br-label">备份格式</label>
            <div class="radio-group-inline">
              <label class="radio-option">
                <input type="radio" v-model="backupType" value="zip" />
                <span>ZIP 压缩</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="backupType" value="json" />
                <span>JSON 纯文本</span>
              </label>
            </div>
          </div>

          <button
            class="btn btn-primary btn-block"
            @click="handleBackup"
            :disabled="isBackingUp"
          >
            <svg v-if="isBackingUp" class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {{ isBackingUp ? '正在备份...' : '一键备份' }}
          </button>
        </section>

        <!-- 恢复区域 -->
        <section class="br-section">
          <h3 class="br-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            数据恢复
          </h3>

          <p class="br-hint">选择之前备份的 ZIP 或 JSON 文件进行恢复，恢复后将覆盖当前所有数据。</p>

          <button
            class="btn btn-secondary btn-block"
            @click="triggerRestoreInput"
            :disabled="isRestoring"
          >
            <svg v-if="isRestoring" class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {{ isRestoring ? '正在恢复...' : '选择备份文件' }}
          </button>

          <input
            ref="restoreFileInput"
            type="file"
            accept=".zip,.json"
            style="display: none"
            @change="handleRestore"
          />
        </section>

        <!-- 导出区域 -->
        <section class="br-section">
          <h3 class="br-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            数据导出
          </h3>

          <div class="br-form-row">
            <label class="br-label">导出格式</label>
            <select v-model="exportFormat" class="br-select">
              <option value="markdown">Markdown (.md)</option>
              <option value="txt">纯文本 (.txt)</option>
              <option value="word">Word 文档 (.docx)</option>
            </select>
          </div>

          <div class="br-form-row">
            <label class="br-label">导出范围</label>
            <div class="radio-group-inline">
              <label class="radio-option">
                <input type="radio" v-model="exportScope" value="all" />
                <span>全部笔记</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="exportScope" value="currentBank" />
                <span>当前题库</span>
              </label>
            </div>
          </div>

          <button
            class="btn btn-outline btn-block"
            @click="handleExport"
            :disabled="isExporting"
          >
            <svg v-if="isExporting" class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {{ isExporting ? '正在导出...' : '导出数据' }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backup-restore-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn var(--transition-normal) ease-out;
}

.backup-restore-panel {
  width: 420px;
  max-width: 92vw;
  max-height: 85vh;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn var(--transition-normal) ease-out;
}

.br-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.br-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.br-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.br-close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* 消息提示 */
.br-message {
  margin: 0 20px;
  padding: 10px 14px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  animation: slideDown var(--transition-fast) ease-out;
}

.br-message.success {
  background: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid #bbf7d0;
}

.br-message.error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid #fecaca;
}

/* 内容区 */
.br-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 20px;
}

.br-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.br-section:last-child {
  border-bottom: none;
}

.br-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.br-section-title svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.br-hint {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 12px;
}

.br-form-row {
  margin-bottom: 12px;
}

.br-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.br-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: white;
  color: var(--text-primary);
  cursor: pointer;
}

.radio-group-inline {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-primary);
}

.radio-option input[type="radio"] {
  accent-color: var(--color-primary);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-gray-100);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-primary-bg);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 旋转图标 */
.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 消息过渡 */
.message-fade-enter-active {
  transition: all var(--transition-fast) ease-out;
}
.message-fade-leave-active {
  transition: all 200ms ease-in;
}
.message-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.message-fade-leave-to {
  opacity: 0;
}
</style>
