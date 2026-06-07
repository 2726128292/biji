<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { questionService } from '@/services/questionService'
import QuestionCard from './QuestionCard.vue'
import QuestionFormModal from './QuestionFormModal.vue'
import type { Folder, Question } from '@/types/database'

const props = defineProps<{
  bankId: string
  folderId?: string
}>()

const emit = defineEmits<{
  practice: [sourceType: string, sourceId: string]
  batchImport: []
}>()

const chapterTree = ref<any[]>([])
const questions = ref<Question[]>([])
const selectedFolderId = ref<string | null>(props.folderId || null)
const loading = ref(false)

// 题目表单弹窗
const showQuestionForm = ref(false)
const questionFormMode = ref<'create' | 'edit'>('create')
const editingQuestion = ref<Question | undefined>(undefined)

// 面包屑数据
const bankName = ref('')
const breadcrumbPath = computed(() => {
  const path: string[] = ['我的题库']
  if (bankName.value) path.push(bankName.value)
  if (selectedFolderId.value && currentFolderName.value !== '全部题目') {
    path.push(currentFolderName.value)
  }
  return path
})

const currentFolderName = computed(() => {
  function findName(nodes: any[], id: string): string {
    for (const node of nodes) {
      if (node.id === id) return node.name
      if (node.children) {
        const found = findName(node.children, id)
        if (found) return found
      }
    }
    return ''
  }
  if (!selectedFolderId.value) return '全部题目'
  return findName(chapterTree.value, selectedFolderId.value) || '未知章节'
})

async function loadChapterTree() {
  chapterTree.value = await questionService.getChapterTree(props.bankId)
  // 获取题库名称用于面包屑
  const banks = await questionService.getBanks()
  const bank = banks.find((b: any) => b.id === props.bankId)
  if (bank) bankName.value = bank.name
}

async function loadQuestions() {
  loading.value = true
  try {
    const fid = selectedFolderId.value || chapterTree.value[0]?.id
    if (fid) {
      questions.value = await questionService.getQuestionsByFolder(fid)
      selectedFolderId.value = fid
    } else {
      questions.value = []
    }
  } finally {
    loading.value = false
  }
}

function selectFolder(folderId: string) {
  selectedFolderId.value = folderId
  loadQuestions()
}

function toggleNode(node: any) {
  node._expanded = !node._expanded
}

function isExpanded(node: any): boolean {
  return node._expanded !== false
}

async function handleCreateChapter(parentId: string | null) {
  const name = prompt('请输入章节名称：')
  if (!name?.trim()) return
  await questionService.createChapter(props.bankId, parentId, name.trim())
  await loadChapterTree()
}

async function handleCreateQuestion() {
  questionFormMode.value = 'create'
  editingQuestion.value = undefined
  showQuestionForm.value = true
}

function handleEditQuestion(q: Question) {
  questionFormMode.value = 'edit'
  editingQuestion.value = q
  showQuestionForm.value = true
}

function handleQuestionSaved() {
  showQuestionForm.value = false
  loadQuestions()
}

function handleBatchImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,.txt,.md'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      // 简单JSON数组格式：[{type, content, options, answer, explanation}]
      if (file.name.endsWith('.json')) {
        const items = JSON.parse(text)
        if (!Array.isArray(items)) {
          alert('JSON文件格式不正确，需要是题目数组')
          return
        }
        const folderId = selectedFolderId.value || chapterTree.value[0]?.id
        if (!folderId) { alert('请先选择一个章节'); return }

        let count = 0
        for (const item of items) {
          if (!item.content) continue
          await questionService.createQuestion(props.bankId, folderId, {
            type: item.type || 'single',
            content: item.content,
            options: item.options || [],
            answer: item.answer ?? true,
            explanation: item.explanation || ''
          })
          count++
        }
        alert(`成功导入 ${count} 道题目`)
        loadQuestions()
      } else {
        alert('仅支持JSON格式导入。请使用标准格式：[{type, content, options, answer, explanation}]')
      }
    } catch (e: any) {
      alert('导入失败：' + e.message)
    }
  }
  input.click()
}

function handlePractice() {
  emit('practice', 'folder', selectedFolderId.value!)
}

onMounted(async () => {
  await loadChapterTree()
  await loadQuestions()
})

watch(() => props.folderId, async (val) => {
  if (val) {
    selectedFolderId.value = val
    await loadQuestions()
  }
})
</script>

<template>
  <div class="question-bank-view">
    <!-- 左侧章节树 -->
    <aside class="chapter-sidebar">
      <div class="sidebar-header">
        <h3>章节目录</h3>
        <button class="btn-icon" title="新建章节" @click="handleCreateChapter(null)">+</button>
      </div>

      <div class="tree-container">
        <div v-if="chapterTree.length === 0" class="tree-empty">暂无章节</div>

        <div v-else class="tree-list">
          <template v-for="node in chapterTree" :key="node.id">
            <div class="tree-node">
              <div
                class="node-item"
                :class="{ active: selectedFolderId === node.id }"
                @click="selectFolder(node.id)"
              >
                <span
                  class="expand-icon"
                  :class="{ expanded: isExpanded(node) && node.children?.length }"
                  @click.stop="toggleNode(node)"
                  v-if="node.children?.length"
                >
                  {{ isExpanded(node) ? '▼' : '▶' }}
                </span>
                <span v-else class="expand-placeholder"></span>
                <span class="node-name">{{ node.name }}</span>
              </div>

              <!-- 子节点 -->
              <div v-if="isExpanded(node) && node.children?.length" class="tree-children">
                <div
                  v-for="child in node.children"
                  :key="child.id"
                  class="node-item child"
                  :class="{ active: selectedFolderId === child.id }"
                  @click="selectFolder(child.id)"
                >
                  <span class="expand-placeholder"></span>
                  <span class="node-name">{{ child.name }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </aside>

    <!-- 右侧题目列表 -->
    <main class="questions-panel">
      <!-- 面包屑导航 -->
      <nav class="breadcrumb-nav">
        <span
          v-for="(item, index) in breadcrumbPath"
          :key="index"
          class="breadcrumb-item"
        >
          <span v-if="index > 0" class="separator"> &gt; </span>
          <span class="breadcrumb-text">{{ item }}</span>
        </span>
      </nav>

      <!-- 工具栏 -->
      <div class="panel-header">
        <h3>{{ currentFolderName }}</h3>
        <span class="question-count">共 {{ questions.length }} 道题</span>
        <div class="panel-actions">
          <button class="btn btn-primary btn-sm" @click="handleCreateQuestion">+ 新建题目</button>
          <button class="btn btn-outline btn-sm" @click="handleBatchImport">↑ 批量导入</button>
          <button class="btn btn-outline-primary btn-sm" @click="handlePractice">▶ 开始刷题</button>
        </div>
      </div>

      <div class="questions-list" v-if="!loading">
        <QuestionCard
          v-for="q in questions"
          :key="q.id"
          :question="q"
        />
        <div v-if="questions.length === 0" class="empty-hint">该章节下暂无题目</div>
      </div>

      <div v-else class="loading-state">加载中...</div>
    </main>

    <!-- 创建/编辑题目弹窗 -->
    <QuestionFormModal
      :show="showQuestionForm"
      :mode="questionFormMode"
      :question="editingQuestion"
      :bank-id="bankId"
      :folder-id="selectedFolderId || chapterTree[0]?.id || ''"
      @close="showQuestionForm = false"
      @saved="handleQuestionSaved"
    />
  </div>
</template>

<style scoped>
.question-bank-view {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧章节树 */
.chapter-sidebar {
  width: 240px;
  min-width: 200px;
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.sidebar-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-primary);
  transition: background-color var(--transition-fast);
}

.btn-icon:hover {
  background: var(--bg-hover);
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tree-empty,
.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
  padding: 32px 16px;
}

.tree-list {
  padding: 0 8px;
}

.tree-node {
  /* container */
}

.node-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: 13px;
}

.node-item:hover {
  background: var(--bg-hover);
}

.node-item.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 500;
}

.node-item.child {
  padding-left: 28px;
}

.expand-icon {
  width: 16px;
  text-align: center;
  font-size: 10px;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.expand-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.node-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-children {
  /* children container */
}

/* 右侧题目列表 */
.questions-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面包屑导航 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  padding: 12px 24px 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-text {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-item:last-child .breadcrumb-text {
  color: var(--color-primary);
}

.separator {
  margin: 0 6px;
  color: var(--text-muted);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.panel-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.question-count {
  color: var(--text-muted);
  font-size: 13px;
}

.panel-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.questions-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: var(--border-radius);
  font-size: 13px;
  font-weight: 500;
  transition: transform var(--transition-fast), background-color var(--transition-fast);
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-outline {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-outline-primary {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline-primary:hover:not(:disabled) {
  background: var(--color-primary-bg);
}

.btn-accent {
  background: var(--color-accent);
  color: white;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
}
</style>
