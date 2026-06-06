<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { wrongBookService } from '@/services/wrongBookService'
import type { MirrorTreeNode, QuestionWithRef } from '@/types/database'
import { getQuestionTypeName, formatDate } from '@/utils/index'

const props = defineProps<{
  wrongBookId: string
}>()

const emit = defineEmits<{
  practice: [sourceType: string, sourceId: string]
}>()

const mirrorTree = ref<MirrorTreeNode[]>([])
const allWrongQuestions = ref<QuestionWithRef[]>([])
const selectedFolderId = ref<string | null>(null)
const loading = ref(true)
const expandedFolders = ref<Set<string>>(new Set())

async function loadMirrorTree() {
  loading.value = true
  try {
    mirrorTree.value = await wrongBookService.getMirrorTree(props.wrongBookId)
    // 加载所有错题用于分组显示
    allWrongQuestions.value = await wrongBookService.getWrongQuestions(props.wrongBookId)
    // 默认选中第一个有题目的节点
    if (mirrorTree.value.length > 0 && !selectedFolderId.value) {
      selectFirstNode(mirrorTree.value)
    }
  } finally {
    loading.value = false
  }
}

function selectFirstNode(nodes: MirrorTreeNode[]) {
  for (const node of nodes) {
    if (node.questionCount > 0) {
      selectFolder(node.folderId)
      return
    }
    if (node.children.length > 0) {
      selectFirstNode(node.children)
    }
  }
}

async function selectFolder(folderId: string) {
  selectedFolderId.value = folderId
}

function toggleNode(node: any) {
  node._expanded = !node._expanded
}

function isExpanded(node: any): boolean {
  return node._expanded !== false
}

function toggleFolderExpand(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}

function isFolderExpanded(folderId: string): boolean {
  return expandedFolders.value.has(folderId)
}

// 按文件夹ID分组错题
const questionsByFolder = computed(() => {
  const groups = new Map<string, { folderName: string; questions: QuestionWithRef[] }>()

  // 从镜像树获取文件夹名称
  function getFolderName(folderId: string): string {
    for (const node of mirrorTree.value) {
      if (node.folderId === folderId) return node.name
      for (const child of node.children || []) {
        if (child.folderId === folderId) return child.name
      }
    }
    return '未知章节'
  }

  // 分组
  for (const q of allWrongQuestions.value) {
    const folderId = q.folderId || 'unknown'
    if (!groups.has(folderId)) {
      groups.set(folderId, {
        folderName: getFolderName(folderId),
        questions: []
      })
    }
    groups.get(folderId)!.questions.push(q)
  }

  return groups
})

function getReasonText(reason: string): string {
  return reason === 'wrong' ? '答错' : '不会'
}

async function handleRemove(refId: string, questionId: string) {
  if (!confirm('确定要将此题从错题本中移除吗？')) return
  await wrongBookService.removeQuestionRef(props.wrongBookId, questionId)
  await loadMirrorTree()
}

function handlePracticeSingle(questionId: string) {
  emit('practice', 'wrongbook', props.wrongBookId)
}

function handleRetryPractice() {
  emit('practice', 'wrongbook', props.wrongBookId)
}

function handleExportWrongQuestions() {
  alert('导出错题功能：将导出当前错题本中的所有题目为JSON格式（功能预留）')
}

// 截取题干前50字
function truncateContent(content: string, maxLength: number = 50): string {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

onMounted(() => {
  loadMirrorTree()
})
</script>

<template>
  <div class="wrongbook-mirror">
    <!-- 绿色提示横幅 -->
    <div class="mirror-banner">
      镜像结构：每道错题保留原题库章节、文件夹和原题号
    </div>

    <div class="mirror-content">
      <!-- 左侧镜像目录树 -->
      <aside class="mirror-sidebar">
        <div class="sidebar-header">
          <h3>错题目录</h3>
          <span class="total-count" v-if="mirrorTree.length > 0">
            {{ mirrorTree.reduce((sum, n) => sum + n.questionCount, 0) }} 题
          </span>
        </div>

        <div class="tree-container" v-if="!loading">
          <div v-if="mirrorTree.length === 0" class="empty-tree">暂无错题</div>

          <template v-else>
            <div v-for="node in mirrorTree" :key="node.folderId" class="tree-node">
              <div
                class="node-item"
                :class="{ active: selectedFolderId === node.folderId }"
                @click="selectFolder(node.folderId)"
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
                <span class="node-count" v-if="node.questionCount">{{ node.questionCount }}</span>
              </div>

              <!-- 子节点 -->
              <div v-if="isExpanded(node) && node.children?.length" class="tree-children">
                <div
                  v-for="child in node.children"
                  :key="child.folderId"
                  class="node-item child"
                  :class="{ active: selectedFolderId === child.folderId }"
                  @click="selectFolder(child.folderId)"
                >
                  <span class="expand-placeholder"></span>
                  <span class="node-name">{{ child.name }}</span>
                  <span class="node-count" v-if="child.questionCount">{{ child.questionCount }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-else class="loading-state">加载中...</div>
      </aside>

      <!-- 右侧错题列表 - 章节分组视图 -->
      <main class="wrong-questions-panel">
        <div class="panel-header">
          <div class="panel-header-left">
            <h3>错题详情</h3>
            <span class="question-count">共 {{ allWrongQuestions.length }} 道错题</span>
          </div>
          <div class="panel-header-actions">
            <button class="action-btn-header primary" @click="handleRetryPractice">
              重复刷题
            </button>
            <button class="action-btn-header secondary" @click="handleExportWrongQuestions">
              导出错题
            </button>
          </div>
        </div>

        <div class="questions-list" v-if="!loading">
          <!-- 章节分组列表 -->
          <div
            v-for="[folderId, group] in questionsByFolder"
            :key="folderId"
            class="folder-group"
          >
            <!-- 可展开的文件夹行 -->
            <div
              class="folder-row"
              @click="toggleFolderExpand(folderId)"
            >
              <span class="folder-icon">📁</span>
              <span class="folder-name">{{ group.folderName }}</span>
              <span class="folder-count">{{ group.questions.length }}题</span>
              <span class="expand-arrow" :class="{ expanded: isFolderExpanded(folderId) }">
                {{ isFolderExpanded(folderId) ? '▼' : '▶' }}
              </span>
            </div>

            <!-- 展开的题目列表 -->
            <div v-if="isFolderExpanded(folderId)" class="folder-questions">
              <div
                v-for="q in group.questions"
                :key="q.refId"
                class="question-item"
              >
                <div class="question-top">
                  <span class="type-tag">{{ getQuestionTypeName(q.type) }}</span>
                  <span class="reason-badge" :class="q.addedReason">{{ getReasonText(q.addedReason) }}</span>
                </div>
                <p class="question-content">{{ truncateContent(q.content) }}</p>
                <div class="question-actions">
                  <button class="remove-btn" @click="handleRemove(q.refId, q.id)">
                    移除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="allWrongQuestions.length === 0 && !loading" class="empty-hint">
            暂无错题
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.wrongbook-mirror {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 绿色提示横幅 */
.mirror-banner {
  background: #f0fdf4;
  color: #15803d;
  padding: 12px 24px;
  font-size: 13.5px;
  border-bottom: 1px solid #bbf7d0;
  flex-shrink: 0;
  text-align: center;
}

.mirror-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧镜像树 */
.mirror-sidebar {
  width: 260px;
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

.total-count {
  font-size: 12px;
  color: var(--color-accent-dark);
  font-weight: 500;
  background: var(--color-warning-bg);
  padding: 2px 8px;
  border-radius: 10px;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty-tree,
.loading-state,
.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
  padding: 32px 16px;
}

.tree-node {
  /* container */
}

.node-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: 13px;
}

.node-item:hover {
  background: var(--bg-hover);
}

.node-item.active {
  background: #fef2f2;
  color: var(--color-error);
  font-weight: 500;
}

.node-item.child {
  padding-left: 32px;
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
  flex: 1;
}

.node-count {
  font-size: 11px;
  color: white;
  background: var(--color-error);
  padding: 0 6px;
  border-radius: 10px;
  font-weight: 500;
  flex-shrink: 0;
}

.tree-children {
  /* children container */
}

/* 右侧错题面板 */
.wrong-questions-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
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

.panel-header-actions {
  display: flex;
  gap: 8px;
}

.action-btn-header {
  padding: 6px 16px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.action-btn-header.primary {
  background: var(--color-primary);
  color: white;
}
.action-btn-header.primary:hover {
  background: var(--color-primary-light);
}

.action-btn-header.secondary {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.action-btn-header.secondary:hover {
  background: var(--bg-hover);
}

/* 章节分组列表 */
.questions-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.folder-group {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.folder-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-bottom: 1px solid transparent;
}

.folder-row:hover {
  background: var(--bg-hover);
}

.folder-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.folder-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.folder-count {
  font-size: 13px;
  color: var(--text-muted);
  background: var(--color-gray-100);
  padding: 2px 10px;
  border-radius: 10px;
  flex-shrink: 0;
}

.expand-arrow {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.expand-arrow.expanded {
  transform: rotate(0deg);
}

/* 展开的题目列表 */
.folder-questions {
  border-top: 1px solid var(--border-color);
  background: white;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-item {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--color-error);
  padding: 12px 14px;
}

.question-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.type-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  background: var(--color-gray-100);
  color: var(--text-secondary);
}

.reason-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}
.reason-badge.wrong {
  background: var(--color-error-bg);
  color: var(--color-error);
}
.reason-badge.unknown {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.question-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0 0 8px;
  word-break: break-word;
}

.question-actions {
  display: flex;
  justify-content: flex-end;
}

.remove-btn {
  padding: 4px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.remove-btn:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}
</style>
