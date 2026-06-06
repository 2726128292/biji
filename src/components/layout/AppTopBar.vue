<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { Menu, Search, Settings, BookOpen, Library } from 'lucide-vue-next'

const ui = useUIStore()
const settings = useSettingsStore()
const route = useRoute()
const router = useRouter()

const isNotesActive = computed(() => route.path.startsWith('/notes'))
const isQuestionsActive = computed(() => route.path.startsWith('/questions') || route.path.startsWith('/wrongbook'))

function switchToNotes() {
  ui.setModule('notes')
  router.push('/notes')
}

function switchToQuestions() {
  ui.setModule('questions')
  router.push('/questions')
}
</script>

<template>
  <header class="app-topbar">
    <div class="topbar-left">
      <button class="topbar-btn menu-btn" @click="ui.toggleSidebar()" :title="ui.sidebarOpen ? '收起目录' : '展开目录'">
        <Menu :size="20" />
      </button>
      <h1 class="app-title">知行笔记</h1>
      <div class="module-switcher">
        <button
          class="module-tab"
          :class="{ active: isNotesActive }"
          @click="switchToNotes()"
        >
          <BookOpen :size="16" />
          <span>笔记</span>
        </button>
        <button
          class="module-tab"
          :class="{ active: isQuestionsActive }"
          @click="switchToQuestions()"
        >
          <Library :size="16" />
          <span>题库</span>
        </button>
      </div>
    </div>

    <div class="topbar-right">
      <button class="topbar-btn" title="搜索（开发中）">
        <Search :size="18" />
      </button>
      <button class="topbar-btn" @click="ui.showSettings = true" title="设置">
        <Settings :size="18" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 100;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.topbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.topbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.menu-btn {
  display: none; /* 移动端显示 */
}
@media (max-width: 767px) {
  .menu-btn { display: flex; }
}

.app-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 1px;
  white-space: nowrap;
}

.module-switcher {
  display: flex;
  background: var(--color-gray-100);
  border-radius: var(--border-radius);
  padding: 2px;
  margin-left: 8px;
}

.module-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.module-tab:hover {
  color: var(--text-primary);
}
.module-tab.active {
  background: var(--bg-secondary);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
</style>
