<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { noteService } from '@/services/noteService'
import type { Note } from '@/types/database'
import { Link2, FileText } from 'lucide-vue-next'

const props = defineProps<{
  noteId: string
}>()

const router = useRouter()
const backLinks = ref<Array<{ sourceNote: Note }>>([])
const loading = ref(true)

async function loadBackLinks() {
  loading.value = true
  try {
    backLinks.value = await noteService.getBackLinks(props.noteId)
  } catch (e) {
    console.error('加载反向链接失败:', e)
  } finally {
    loading.value = false
  }
}

function navigateToNote(noteId: string) {
  router.push(`/notes/${noteId}`)
}

onMounted(() => {
  loadBackLinks()
})

watch(() => props.noteId, () => {
  loadBackLinks()
})
</script>

<template>
  <div class="back-links-panel">
    <div class="panel-header">
      <Link2 :size="14" class="panel-icon" />
      <span class="panel-title">反向链接</span>
      <span v-if="!loading" class="panel-count">{{ backLinks.length }}</span>
    </div>

    <div v-if="loading" class="panel-loading">
      <span>加载中...</span>
    </div>

    <div v-else-if="backLinks.length === 0" class="panel-empty">
      <span class="empty-text">暂无引用此笔记的其他笔记</span>
    </div>

    <div v-else class="link-list">
      <button
        v-for="(item, index) in backLinks"
        :key="index"
        class="link-item"
        @click="navigateToNote(item.sourceNote.id)"
      >
        <FileText :size="14" class="link-icon" />
        <div class="link-info">
          <span class="link-title">{{ item.sourceNote.title || '无标题笔记' }}</span>
          <span class="link-time">{{ formatTime(item.sourceNote.updatedAt) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    formatTime(timestamp: number): string {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
      if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
}
</script>

<style scoped>
.back-links-panel {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
  max-height: 200px;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background: var(--bg-secondary);
  z-index: 1;
}

.panel-icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.panel-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex: 1;
}

.panel-count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--color-gray-100);
  padding: 1px 7px;
  border-radius: 10px;
  line-height: 18px;
}

.panel-loading,
.panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.empty-text {
  font-size: 13px;
  color: var(--text-muted);
}

.link-list {
  padding: 4px 8px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--border-radius-sm);
  text-align: left;
  transition: background var(--transition-fast);
}
.link-item:hover {
  background: var(--bg-hover);
}

.link-icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.link-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.link-title {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-time {
  font-size: 11.5px;
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>
