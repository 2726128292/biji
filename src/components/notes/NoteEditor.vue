<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, highlightActiveLine, Decoration } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { history, historyKeymap } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { noteService, FEYNMAN_TEMPLATE } from '@/services/noteService'
import BackLinks from './BackLinks.vue'
import VersionHistoryPanel from './VersionHistoryPanel.vue'
import Modal from '@/components/common/Modal.vue'
import {
  BookOpen,
  History,
  RotateCcw,
  AlertTriangle
} from 'lucide-vue-next'

const props = defineProps<{
  noteId: string
}>()

const router = useRouter()
const settings = useSettingsStore()
const ui = useUIStore()

// ===== 编辑器状态 =====
const editorContainer = ref<HTMLElement | null>(null)
let editorView: EditorView | null = null
const content = ref('')
const noteTitle = ref('无标题笔记')
const breadcrumbPath = ref<string[]>([])
let saveTimer: ReturnType<typeof setTimeout> | null = null
let versionTimer: ReturnType<typeof setInterval> | null = null
let lastVersionContent = ''

// ===== 面板状态 =====
const showVersionPanel = ref(false)
const restoreConfirm = ref<{ versionId: string; versionContent: string } | null>(null)
const savedStatus = ref<'saved' | 'saving' | 'unsaved'>('saved')

// ===== 费曼关键字装饰器 =====
const FEYNMAN_PATTERNS: Array<{ regex: RegExp; className: string }> = [
  { regex: /^##\s*问题\s*$/m, className: 'cm-feynman-question' },
  { regex: /^##\s*重点\s*$/m, className: 'cm-feynman-keypoint' },
  { regex: /^##\s*解释\s*$/m, className: 'cm-feynman-explain' },
  { regex: /^##\s*卡壳点\s*$/m, className: 'cm-feynman-blocker' },
  { regex: /^##\s*类比\s*$/m, className: 'cm-feynman-analogy' },
  { regex: /^##\s*总结\s*$/m, className: 'cm-feynman-summary' }
]

const feynmanMark = EditorView.decorations.compute(['doc'], (state) => {
  const doc = state.doc
  const widgets: any[] = []
  const text = doc.toString()
  let activeClass = ''
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    // 检测费曼标题行
    let matched = false
    for (const p of FEYNMAN_PATTERNS) {
      if (p.regex.test(lines[i])) {
        activeClass = p.className
        matched = true
        break
      }
    }

    if (!matched && activeClass) {
      // 检查是否到了下一个非引用内容（新标题或空行后接非引用）
      if (/^##\s/.test(lines[i])) {
        activeClass = ''
      } else if (lines[i] === '' || lines[i].startsWith('>')) {
        // 继续使用当前颜色（空行或引用内容属于当前区块）
      } else {
        // 非引用非空行，结束区块
        activeClass = ''
      }
    }

    if (activeClass) {
      const from = doc.line(i + 1).from
      const to = doc.line(i + 1).to
      widgets.push(Decoration.line({ class: activeClass }).range(from))
    }
  }

  return Decoration.set(widgets)
})

function createFeynmanTheme() {
  return EditorView.theme({
    '.cm-editor': {
      fontSize: `${settings.settings.editorFontSize}px`,
      fontFamily: `var(--font-sans), ${getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() || "'Noto Sans SC', sans-serif"}`
    },
    '.cm-content': {
      padding: '16px 20px',
      lineHeight: '1.8',
      caretColor: 'var(--color-primary)'
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
      color: 'var(--text-muted)',
      fontSize: '12px'
    },
    '.cm-line': {
      padding: '2px 0'
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--color-gray-100)'
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(30, 58, 95, 0.04)'
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--color-primary)'
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(232, 168, 56, 0.25) !important'
    },
    // 费曼关键字高亮样式（整块彩色背景）
    '.cm-feynman-question': {
      backgroundColor: '#dbeafe',
      borderRadius: '6px',
      padding: '2px 8px',
      margin: '2px 0'
    },
    '.cm-feynman-keypoint': {
      backgroundColor: '#fef3c7',
      borderRadius: '6px',
      padding: '2px 8px',
      margin: '2px 0'
    },
    '.cm-feynman-explain': {
      backgroundColor: '#dcfce7',
      borderRadius: '6px',
      padding: '2px 8px',
      margin: '2px 0'
    },
    '.cm-feynman-blocker': {
      backgroundColor: '#fee2e2',
      borderRadius: '6px',
      padding: '2px 8px',
      margin: '2px 0'
    },
    '.cm-feynman-analogy': {
      backgroundColor: '#f3e8ff',
      borderRadius: '6px',
      padding: '2px 8px',
      margin: '2px 0'
    },
    '.cm-feynman-summary': {
      backgroundColor: '#e0f2fe',
      borderRadius: '6px',
      padding: '2px 8px',
      margin: '2px 0'
    },
    // 双向链接高亮
    '.cm-wikilink': {
      color: 'var(--color-primary-light)',
      textDecoration: 'underline',
      textDecorationStyle: 'dashed',
      cursor: 'pointer',
      backgroundColor: 'rgba(30, 58, 95, 0.06)',
      borderRadius: '3px',
      padding: '0 2px'
    },
    // 标签高亮
    '.cm-tag': {
      color: 'var(--color-accent-dark)',
      fontWeight: 500,
      backgroundColor: 'rgba(232, 168, 56, 0.1)',
      borderRadius: '3px',
      padding: '0 2px'
    }
  })
}

// ===== 费曼关键字语法高亮扩展（预留）=====
const feynmanHighlight = []

// ===== 初始化编辑器 =====
async function initEditor() {
  if (!editorContainer.value || !props.noteId) return

  const note = await noteService.getNote(props.noteId)
  if (!note) return

  content.value = note.content || ''
  noteTitle.value = note.title || '无标题笔记'
  lastVersionContent = content.value

  // 构建面包屑路径
  await buildBreadcrumb(props.noteId)

  // 销毁旧实例
  if (editorView) {
    editorView.destroy()
    editorView = null
  }

  const state = EditorState.create({
    doc: content.value,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      highlightActiveLine(),
      ...(settings.settings.editorTheme === 'dark' ? [oneDark] : [createFeynmanTheme()]),
      markdown(),
      keymap.of([...historyKeymap]),
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString()
          content.value = newContent
          handleAutoSave(props.noteId, newContent)
        }
      }),
      feynmanMark,
      feynmanHighlight
    ]
  })

  await nextTick()
  editorView = new EditorView({
    state,
    parent: editorContainer.value
  })

  // 启动版本快照定时器
  startVersionSnapshot()
}

// ===== 自动保存（500ms防抖）=====
function handleAutoSave(id: string, currentContent: string) {
  if (saveTimer) clearTimeout(saveTimer)
  savedStatus.value = 'unsaved'
  saveTimer = setTimeout(async () => {
    savedStatus.value = 'saving'
    await noteService.debouncedSave(id, currentContent)
    savedStatus.value = 'saved'
  }, 500)
}

// ===== 版本快照（每30秒）=====
function startVersionSnapshot() {
  if (versionTimer) clearInterval(versionTimer)
  versionTimer = setInterval(() => {
    if (content.value && content.value !== lastVersionContent && props.noteId) {
      noteService.saveVersion(props.noteId, content.value)
      lastVersionContent = content.value
    }
  }, 30000)
}

// ===== 构建面包屑路径 =====
async function buildBreadcrumb(noteId: string) {
  try {
    const note = await noteService.getNote(noteId)
    if (!note) return

    const path: string[] = [note.title || '无标题笔记']

    let folderId = note.folderId
    while (folderId) {
      const { db } = await import('@/services/db')
      const folder = await db.folders.get(folderId)
      if (folder) {
        path.unshift(folder.name)
        folderId = folder.parentId ?? null
      } else {
        break
      }
    }

    breadcrumbPath.value = path
  } catch (e) {
    breadcrumbPath.value = ['我的笔记']
  }
}

// ===== 插入费曼模板 =====
function insertFeynmanTemplate() {
  if (!editorView) return
  const doc = editorView.state.doc
  const insertPos = doc.length > 0 ? doc.length + 1 : 0
  const templateText = insertPos > 0 && doc.toString().slice(-1) !== '\n' ? '\n\n' + FEYNMAN_TEMPLATE : FEYNMAN_TEMPLATE

  editorView.dispatch({
    changes: { from: insertPos, insert: templateText },
    selection: { anchor: insertPos + templateText.length }
  })
  editorView.focus()
}

// ===== 历史版本操作 =====
function openVersionHistory() {
  showVersionPanel.value = true
}

function confirmRestore(versionId: string, versionContent: string) {
  restoreConfirm.value = { versionId, versionContent }
}

async function executeRestore() {
  if (!restoreConfirm.value || !props.noteId) return
  await noteService.restoreVersion(props.noteId, restoreConfirm.value.versionId)
  content.value = restoreConfirm.value.versionContent
  if (editorView) {
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: content.value }
    })
  }
  restoreConfirm.value = null
  showVersionPanel.value = false
}

// ===== 生命周期 =====
onMounted(() => {
  initEditor()
})

watch(() => props.noteId, () => {
  initEditor()
})

onUnmounted(() => {
  if (saveTimer) clearTimeout(saveTimer)
  if (versionTimer) clearInterval(versionTimer)
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
  // 强制保存当前内容
  if (props.noteId && content.value) {
    noteService.forceSave(props.noteId, content.value)
  }
})
</script>

<template>
  <div class="note-editor">
    <!-- 顶部面包屑 + 工具栏 -->
    <header class="editor-header">
      <div class="breadcrumb">
        <template v-for="(segment, index) in breadcrumbPath" :key="index">
          <span v-if="index > 0" class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item">{{ segment }}</span>
        </template>
      </div>

      <div class="toolbar">
        <button class="toolbar-btn primary" @click="insertFeynmanTemplate" title="插入费曼模板">
          <BookOpen :size="15" />
          <span class="btn-label">插入费曼模板</span>
        </button>
        <button class="toolbar-btn" @click="openVersionHistory" title="历史版本">
          <History :size="15" />
          <span class="btn-label">历史版本</span>
        </button>
        <span
          class="save-status"
          :class="savedStatus"
        >{{ savedStatus === 'saved' ? '已保存' : savedStatus === 'saving' ? '保存中...' : '未保存' }}</span>
      </div>
    </header>

    <!-- CodeMirror 编辑区 -->
    <div ref="editorContainer" class="editor-container"></div>

    <!-- 底部反向链接面板 -->
    <BackLinks :note-id="noteId" />

    <!-- 历史版本面板 -->
    <VersionHistoryPanel
      v-if="showVersionPanel"
      :note-id="noteId"
      @close="showVersionPanel = false"
      @restore="confirmRestore"
    />

    <!-- 恢复确认弹窗 -->
    <Modal
      :show="!!restoreConfirm"
      title="确认恢复版本"
      size="sm"
      @update:show="restoreConfirm = null"
    >
      <div class="restore-confirm-body">
        <AlertTriangle :size="24" class="confirm-icon" />
        <p>确定要恢复到此历史版本吗？</p>
        <p class="confirm-hint">当前内容将被覆盖，此操作不可撤销。</p>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="restoreConfirm = null">取消</button>
        <button class="btn btn-danger" @click="executeRestore">
          <RotateCcw :size="14" /> 恢复
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.note-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg-secondary);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
  gap: 12px;
  min-height: 48px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.breadcrumb-sep {
  color: var(--text-muted);
  font-size: 12px;
  flex-shrink: 0;
}

.breadcrumb-item {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.breadcrumb-item:last-child {
  color: var(--text-primary);
  font-weight: 500;
  font-family: var(--font-serif);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
.toolbar-btn.primary {
  background: var(--color-primary);
  color: white;
}
.toolbar-btn.primary:hover {
  background: var(--color-primary-light);
  color: white;
}

.btn-label {
  display: none;
}
@media (min-width: 640px) {
  .btn-label {
    display: inline;
  }
}

.save-status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  margin-left: 4px;
  transition: all var(--transition-fast);
}
.save-status.saved {
  color: var(--color-success);
  background: rgba(22, 163, 74, 0.08);
}
.save-status.saving {
  color: var(--color-accent);
  background: rgba(232, 168, 56, 0.08);
}
.save-status.unsaved {
  color: var(--text-muted);
}

.editor-container {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.editor-container :deep(.cm-editor) {
  height: 100%;
}
.editor-container :deep(.cm-scroller) {
  overflow: auto;
}

.restore-confirm-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 8px 0;
}

.confirm-icon {
  color: var(--color-warning);
}

.confirm-hint {
  font-size: 12.5px;
  color: var(--text-muted);
}

.btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 18px;
  font-size: 13.5px;
  font-weight: 500;
  border-radius: 8px;
  transition: all var(--transition-fast);
}
.btn:hover {
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--text-secondary);
}
.btn-secondary:hover {
  background: var(--color-gray-200);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}
.btn-danger:hover {
  background: #b91c1c;
}

@media (max-width: 767px) {
  .editor-header {
    padding: 8px 14px;
  }
  .toolbar-btn {
    padding: 6px 8px;
  }
}
</style>
