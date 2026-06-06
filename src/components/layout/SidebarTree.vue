<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { noteService } from '@/services/noteService'
import { questionService } from '@/services/questionService'
import { wrongBookService } from '@/services/wrongBookService'
import { db } from '@/services/db'
import type { TreeNode } from '@/types/database'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FolderIcon,
  Plus,
  MoreVertical,
  Library,
  BookX
} from 'lucide-vue-next'

const ui = useUIStore()
const route = useRoute()
const router = useRouter()

const treeData = ref<(TreeNode & { isFolder: boolean; noteCount?: number })[]>([])
const expandedIds = ref<Set<string>>(new Set())
const selectedId = ref<string | null>(null)
const dragNodeId = ref<string | null>(null)

// 判断当前是否为错题本模式
const isWrongBookMode = computed(() => route.path.startsWith('/wrongbook'))
const wrongBookId = computed(() => {
  const match = route.path.match(/\/wrongbook\/([^/]+)/)
  return match ? match[1] : null
})

async function loadTree() {
  if (ui.currentModule === 'notes') {
    const rootFolder = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
    if (rootFolder) {
      treeData.value = await noteService.getFullTree(rootFolder.id, 'notes')
    }
  } else if (isWrongBookMode.value && wrongBookId.value) {
    // 错题本镜像模式 - 加载镜像树
    const mirrorTree = await wrongBookService.getMirrorTree(wrongBookId.value)
    // 转换为树形结构展示
    treeData.value = convertMirrorToDisplay(mirrorTree)
  } else {
    // 题库模式
    await loadQuestionBanks()
  }
}

function convertMirrorToDisplay(mirrorTree: any[]): (TreeNode & { isFolder: boolean })[] {
  return mirrorTree.map(node => ({
    id: node.folderId,
    name: `${node.name} (${node.questionCount})`,
    isFolder: true,
    sortKey: 0,
    parentId: null,
    depth: 0,
    noteCount: node.questionCount,
    children: node.children.length > 0 ? convertMirrorToDisplay(node.children) : undefined
  }))
}

async function loadQuestionBanks() {
  const banks = await questionService.getBanks()
  const result: (TreeNode & { isFolder: boolean })[] = []
  
  for (const bank of banks) {
    const count = await questionService.getBankQuestionCount(bank.id)
    result.push({
      id: bank.id,
      name: bank.name,
      isFolder: true,
      sortKey: 0,
      parentId: null,
      depth: 0,
      noteCount: count,
      children: []
    })
    
    // 加载错题本列表
    const wrongBooks = await wrongBookService.getAllWrongBooks()
    for (const wb of wrongBooks.filter(wb => wb.sourceId === bank.id || wb.sourceType === 'bank')) {
      const wbCount = await wrongBookService.getWrongBookCount(wb.id)
      result.push({
        id: `wb_${wb.id}`,
        name: `错题: ${wb.name}`,
        isFolder: true,
        sortKey: 0,
        parentId: null,
        depth: 1,
        noteCount: wbCount,
        children: []
      })
    }
  }
  
  treeData.value = result
}

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

function isExpanded(id: string): boolean {
  return expandedIds.value.has(id)
}

function selectItem(item: any) {
  selectedId.value = item.id
  
  if (!item.isFolder) {
    // 笔记节点
    ui.editingNoteId = item.id
    router.push(`/notes/${item.id}`)
  } else if (item.id?.startsWith('wb_')) {
    // 错题本
    const wbId = item.id.replace('wb_', '')
    router.push(`/wrongbook/${wbId}`)
  } else {
    // 题库或章节
    ui.selectedBankId = item.id
    
    if (ui.currentModule === 'questions' || route.path.startsWith('/questions')) {
      router.push(`/questions/${item.id}`)
    }
  }
}

function handleContextMenu(event: MouseEvent, item: any) {
  event.preventDefault()
  const items = getContextMenuItems(item)
  ui.showContextMenu(event.clientX, event.clientY, items, item.id, item.isFolder ? 'folder' : 'note')
}

function getContextMenuItems(item: any): Array<{ label: string; action: string }> {
  if (item.isFolder) {
    return [
      { label: '新建子文件夹', action: 'create-subfolder' },
      ...(ui.currentModule === 'notes' ? [{ label: '新建笔记', action: 'create-note' }] : []),
      ...(ui.currentModule === 'questions' ? [{ label: '新建章节', action: 'create-chapter' }, { label: '新建题目', action: 'create-question' }] : []),
      { label: '重命名', action: 'rename' },
      { label: '删除', action: 'delete' }
    ]
  }
  return [
    { label: '重命名', action: 'rename' },
    { label: '删除', action: 'delete' },
    { label: '移动到...', action: 'move' }
  ]
}

async function handleCreateRootNote() {
  const rootFolder = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
  if (rootFolder) {
    const note = await noteService.createNote(rootFolder.id, '新笔记')
    router.push(`/notes/${note.id}`)
    loadTree()
  }
}

async function handleCreateFirstNote() {
  await handleCreateRootNote()
}

onMounted(() => {
  loadTree()
  // 默认展开第一层
  if (treeData.value.length > 0) {
    expandedIds.value.add(treeData.value[0].id)
  }
})

watch(() => [ui.currentModule, route.path], () => {
  loadTree()
})
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !ui.sidebarOpen }">
    <div class="sidebar-header">
      <span class="sidebar-title">
        {{ ui.currentModule === 'notes' ? '我的笔记' : (isWrongBookMode ? '错题本' : '我的题库') }}
      </span>
      <div class="sidebar-actions">
        <button
          v-if="ui.currentModule === 'notes'"
          class="action-btn"
          @click.stop="handleCreateRootNote"
          title="新建笔记"
        >
          <Plus :size="16" />
        </button>
        <button
          v-if="ui.currentModule === 'questions'"
          class="action-btn"
          @click="ui.showQuestionForm = true"
          title="新建题库"
        >
          <Plus :size="16" />
        </button>
      </div>
    </div>

    <div class="sidebar-tree">
      <template v-for="item in treeData" :key="item.id">
        <div
          class="tree-item"
          :class="{
            active: selectedId === item.id,
            'is-folder': item.isFolder
          }"
          :style="{ paddingLeft: `${(item.depth || 0) * 16 + 12}px` }"
          @click="selectItem(item)"
          @contextmenu.prevent="handleContextMenu($event, item)"
        >
          <!-- 展开/折叠箭头 -->
          <span
            v-if="item.isFolder && (item.children?.length || item.noteCount)"
            class="expand-icon"
            @click.stop="toggleExpand(item.id)"
          >
            <ChevronRight v-if="!isExpanded(item.id)" :size="14" />
            <ChevronDown v-else :size="14" />
          </span>
          <span v-else class="expand-placeholder"></span>

          <!-- 图标 -->
          <component
            :is="item.isFolder ? (item.noteCount !== undefined ? Library : FolderIcon) : FileText"
            :size="15"
            class="tree-icon"
            :class="{ 'text-accent': !item.isFolder }"
          />

          <!-- 名称 -->
          <span class="tree-label truncate">{{ item.name }}</span>

          <!-- 数量标记 -->
          <span v-if="item.noteCount !== undefined && item.isFolder" class="tree-count">
            {{ item.noteCount }}
          </span>

          <!-- 更多操作(移动端) -->
          <button
            v-if="item.isFolder"
            class="more-btn"
            @click.stop="handleContextMenu($event, item)"
          >
            <MoreVertical :size="14" />
          </button>
        </div>

        <!-- 子节点递归渲染通过展开状态控制 -->
        <template v-if="item.isFolder && isExpanded(item.id) && item.children?.length">
          <div
            v-for="child in item.children"
            :key="child.id"
            class="tree-item"
            :class="{ active: selectedId === child.id, 'is-folder': child.isFolder }"
            :style="{ paddingLeft: `${(child.depth || 0) * 16 + 12}px` }"
            @click="selectItem(child)"
            @contextmenu.prevent="handleContextMenu($event, child)"
          >
            <span v-if="child.isFolder && child.children?.length" class="expand-icon" @click.stop="toggleExpand(child.id)">
              <ChevronRight v-if="!isExpanded(child.id)" :size="14" />
              <ChevronDown v-else :size="14" />
            </span>
            <span v-else class="expand-placeholder"></span>
            <component :is="child.isFolder ? FolderIcon : FileText" :size="15" class="tree-icon" />
            <span class="tree-label truncate">{{ child.name }}</span>
            <span v-if="child.noteCount !== undefined" class="tree-count">{{ child.noteCount }}</span>
          </div>
        </template>
      </template>

      <!-- 空状态 -->
      <div v-if="treeData.length === 0" class="empty-sidebar">
        <p class="text-muted text-sm">暂无内容</p>
        <button v-if="ui.currentModule === 'notes'" class="btn-link text-sm mt-2" @click="handleCreateFirstNote">
          创建第一条笔记
        </button>
        <button v-else class="btn-link text-sm mt-2" @click="router.push('/questions')">
          创建第一个题库
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 100%;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal), min-width var(--transition-normal);
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.sidebar-actions {
  display: flex;
  gap: 2px;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}
.action-btn:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
}

.sidebar-tree {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  margin: 1px 6px;
  transition: background var(--transition-fast);
  position: relative;
  user-select: none;
}
.tree-item:hover {
  background: var(--bg-hover);
}
.tree-item.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}
.tree-item.active .tree-icon {
  color: var(--color-primary);
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}
.expand-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.tree-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}
.tree-label {
  flex: 1;
  font-size: 13.5px;
  line-height: 1.4;
}
.tree-count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--color-gray-100);
  padding: 0 5px;
  border-radius: 10px;
  line-height: 18px;
  flex-shrink: 0;
}
.more-btn {
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}
.tree-item:hover .more-btn {
  opacity: 1;
}
.more-btn:hover {
  background: var(--color-gray-100);
}

.empty-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.btn-link {
  background: none;
  color: var(--color-primary-light);
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
}
.btn-link:hover {
  background: var(--color-primary-bg);
}

@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: var(--topbar-height);
    left: 0;
    bottom: 0;
    z-index: 200;
    box-shadow: var(--shadow-lg);
  }
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}
</style>
