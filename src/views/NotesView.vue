<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import SidebarTree from '@/components/layout/SidebarTree.vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'
import EmptyState from '@/components/common/EmptyState.vue'

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
      <EmptyState
        v-else
        title="选择或创建笔记"
        description="从左侧目录选择一个笔记开始阅读和编辑，或创建一条新笔记"
        action-text="新建笔记"
        @action="handleCreateNote"
      />
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
