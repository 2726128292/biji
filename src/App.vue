<script setup lang="ts">
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { initDefaultData } from '@/services/db'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import SidebarTree from '@/components/layout/SidebarTree.vue'
import ContextMenu from '@/components/common/ContextMenu.vue'
import MobileBottomSheet from '@/components/common/MobileBottomSheet.vue'
import UpdatePrompt from '@/components/common/UpdatePrompt.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'

const ui = useUIStore()
const settings = useSettingsStore()

onMounted(async () => {
  await initDefaultData()
  await settings.loadSettings()
  
  // 申请持久化存储
  if ('storage' in navigator && 'persist' in (navigator as any).storage) {
    try {
      await (navigator as any).storage.persist()
    } catch {
      // 忽略
    }
  }
})
</script>

<template>
  <div class="app-container">
    <AppTopBar />
    
    <div class="app-body">
      <SidebarTree />
      
      <main class="main-content" :class="{ 'sidebar-collapsed': !ui.sidebarOpen }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- 全局覆盖层 -->
    <ContextMenu />
    <MobileBottomSheet />
    <SettingsPanel v-if="ui.showSettings" @close="ui.showSettings = false" />
    <UpdatePrompt v-if="ui.showUpdatePrompt" />
    
    <!-- 移动端遮罩 -->
    <div
      v-if="ui.sidebarOpen"
      class="mobile-overlay"
      @click="ui.closeSidebar()"
    ></div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  min-width: 0;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端遮罩 */
.mobile-overlay {
  display: none;
}
@media (max-width: 767px) {
  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    top: var(--topbar-height);
    background: var(--bg-overlay);
    z-index: 199;
  }
}
</style>
