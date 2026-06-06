<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import SidebarTree from '@/components/layout/SidebarTree.vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'

const route = useRoute()
const ui = useUIStore()

const noteId = computed(() => route.params.noteId as string | undefined)
const hasNoteSelected = computed(() => !!noteId.value)

onMounted(() => {
  ui.setModule('notes')
})

watch(noteId, (id) => {
  if (id) {
    ui.editingNoteId = id
  }
}, { immediate: true })
</script>

<template>
  <div class="notes-view">
    <!-- 左侧目录树 -->
    <SidebarTree />

    <!-- 右侧编辑区 -->
    <div class="editor-area" :class="{ 'full-width': !ui.sidebarOpen }">
      <!-- 有选中笔记时显示编辑器 -->
      <NoteEditor v-if="hasNoteSelected" :note-id="noteId!" />

      <!-- 空状态 -->
      <div v-else class="empty-state-custom">
        <div class="empty-content">
          <h3 class="empty-title">建立属于自己的离线知识库</h3>
          <p class="empty-desc">从左侧目录新建文件或笔记，使用费曼模板整理知识。</p>
        </div>
        <div class="empty-actions">
          <button class="btn-primary" @click="handleCreateNote">新建笔记</button>
          <button class="btn-outline" @click="handleImportBackup">导入备份</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { noteService } from '@/services/noteService'

export default {
  methods: {
    async handleCreateNote() {
      const rootFolder = await this.getOrCreateRootFolder()
      if (rootFolder) {
        const note = await noteService.createNote(rootFolder.id, '新笔记')
        this.$router.push(`/notes/${note.id}`)
      }
    },
    async getOrCreateRootFolder() {
      const { db } = await import('@/services/db')
      let root = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
      if (!root) {
        root = await noteService.createFolder(null, '我的笔记', 'notes')
      }
      return root
    },
    handleImportBackup() {
      // TODO: 实现导入备份功能
      console.log('导入备份')
    }
  }
}
</script>

<style scoped>
.notes-view {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: var(--bg-primary);
  transition: margin-left var(--transition-normal);
}

/* 自定义空状态 */
.empty-state-custom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  min-height: 300px;
}
.empty-content {
  max-width: 360px;
}
.empty-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}
.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}
.empty-actions {
  display: flex;
  gap: 12px;
}
.btn-primary {
  padding: 10px 24px;
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  background: var(--color-primary-light);
}
.btn-outline {
  padding: 10px 24px;
  background: white;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal);
}
.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 移动端全宽 */
@media (max-width: 767px) {
  .notes-view {
    flex-direction: column;
  }
  .editor-area {
    width: 100%;
  }
}
</style>
