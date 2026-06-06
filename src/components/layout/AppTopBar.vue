<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { Menu, Settings, BookOpen, Library } from 'lucide-vue-next'

const ui = useUIStore()
const settings = useSettingsStore()
const route = useRoute()
const router = useRouter()

const isNotesActive = computed(() => route.path.startsWith('/notes'))
const isQuestionsActive = computed(() => route.path.startsWith('/questions') || route.path.startsWith('/wrongbook'))

// 移动端动态页面标题（根据当前路由）
const mobilePageTitle = computed(() => {
  if (route.path.startsWith('/notes')) return '费曼笔记'
  if (route.path.startsWith('/wrongbook')) {
    // 从路由或store获取错题本名称
    return ui.selectedWrongBookId ? '错题本' : '错题本'
  }
  if (route.path.startsWith('/practice')) {
    if (ui.practiceMode === 'memorize') return '背题模式'
    if (ui.practiceMode === 'quiz') return '刷题模式'
    return '练习'
  }
  if (route.path.startsWith('/questions')) {
    if (route.params.bankId) return '题库详情'
    return '我的题库'
  }
  if (route.path.startsWith('/settings')) return '设置'
  return '知行笔记'
})

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
      <!-- 汉堡菜单（移动端始终显示，桌面端也可用于收起侧边栏） -->
      <button class="topbar-btn menu-btn" @click="ui.toggleSidebar()" :title="ui.sidebarOpen ? '收起目录' : '展开目录'">
        <Menu :size="20" />
      </button>

      <!-- 桌面端：Logo + 模块切换器 -->
      <h1 class="app-title desktop-only">知行笔记</h1>
      <div class="module-switcher desktop-only">
        <button
          class="module-tab"
          :class="{ active: isNotesActive }"
          @click="switchToNotes()"
        >
          <BookOpen :size="16" />
          <span>费曼笔记</span>
        </button>
        <button
          class="module-tab"
          :class="{ active: isQuestionsActive }"
          @click="switchToQuestions()"
        >
          <Library :size="16" />
          <span>背题刷题</span>
        </button>
      </div>

      <!-- 移动端：页面标题 -->
      <h2 class="mobile-title mobile-only">{{ mobilePageTitle }}</h2>
    </div>

    <div class="topbar-right">
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

/* 桌面端默认显示 */
.desktop-only { display: flex; }
.mobile-only { display: none; }

/* 移动端切换 */
@media (max-width: 767px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .mobile-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    white-space: nowrap;
  }
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
  gap: 8px;
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
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  transition: all var(--transition-fast);
}
.module-tab:hover {
  background: var(--color-primary-bg);
}
.module-tab.active {
  background: var(--color-primary);
  color: white;
  border: none;
}
</style>
