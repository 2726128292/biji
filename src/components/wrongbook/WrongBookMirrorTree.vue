<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
const wrongQuestions = ref<QuestionWithRef[]>([])
const selectedFolderId = ref<string | null>(null)
const loading = ref(true)

async function loadMirrorTree() {
  loading.value = true
  try {
    mirrorTree.value = await wrongBookService.getMirrorTree(props.wrongBookId)
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
  wrongQuestions.value = await wrongBookService.getWrongQuestions(props.wrongBookId, folderId)
}

function toggleNode(node: any) {
  node._expanded = !node._expanded
}

function isExpanded(node: any): boolean {
  return node._expanded !== false
}

function getReasonText(reason: string): string {
  return reason === 'wrong' ? '答错' : '不会'
}

async function handleRemove(refId: string, questionId: string) {
  if (!confirm('确定要将此题从错题本中移除吗？')) return
  await wrongBookService.removeQuestionRef(props.wrongBookId, questionId)
  await loadMirrorTree()
  if (selectedFolderId.value) {
    wrongQuestions.value = await wrongBookService.getWrongQuestions(
      props.wrongBookId,
      selectedFolderId.value
    )
  }
}

function handlePracticeSingle(questionId: string) {
  emit('practice', 'wrongbook', props.wrongBookId)
}

onMounted(() => {
  loadMirrorTree()
})
</script>

<template>
  <div class="wrongbook-mirror">
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

    <!-- 右侧错题列表 -->
    <main class="wrong-questions-panel">
      <div class="panel-header">
        <h3>错题详情</h3>
        <span class="question-count">共 {{ wrongQuestions.length }} 道错题</span>
      </div>

      <div class="questions-list" v-if="!loading">
        <div
          v-for="q in wrongQuestions"
          :key="q.refId"
          class="wrong-question-card"
        >
          <div class="card-top">
            <span class="type-tag">{{ getQuestionTypeName(q.type) }}</span>
            <span class="reason-badge" :class="q.addedReason">{{ getReasonText(q.addedReason) }}</span>
            <span class="wrong-count">答错 {{ q.wrongCount }} 次</span>
          </div>

          <p class="question-content">{{ q.content }}</p>

          <div class="card-actions">
            <button class="action-btn remove" @click="handleRemove(q.refId, q.id)">
              移出错题本
            </button>
            <button class="action-btn practice" @click="handlePracticeSingle(q.id)">
              以此题开始练习
            </button>
          </div>
        </div>

        <div v-if="wrongQuestions.length === 0 && !loading" class="empty-hint">
          该章节下暂无错题
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.wrongbook-mirror {
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

/* 右侧错题列表 */
.wrong-questions-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
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

.questions-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wrong-question-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--color-error);
  padding: 14px 18px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.wrong-question-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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

.wrong-count {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}

.question-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0 0 10px;
  word-break: break-word;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  padding: 5px 14px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  background: transparent;
}

.action-btn.remove {
  color: var(--text-muted);
}
.action-btn.remove:hover {
  background: var(--color-gray-100);
  color: var(--text-secondary);
}

.action-btn.practice {
  color: var(--color-primary-light);
  font-weight: 500;
}
.action-btn.practice:hover {
  background: var(--color-info-bg);
}
</style>
