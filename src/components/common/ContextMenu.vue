<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/uiStore'

const ui = useUIStore()

const menuStyle = computed(() => ({
  left: `${ui.contextMenu.x}px`,
  top: `${ui.contextMenu.y}px`
}))

function handleClick(action: string) {
  ui.hideContextMenu()
  // 通过事件总线或 store 回调处理
  window.dispatchEvent(new CustomEvent('contextmenu-action', {
    detail: { action, targetId: ui.contextMenu.targetId, targetType: ui.contextMenu.targetType }
  }))
}

function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.context-menu')) {
    ui.hideContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="ui.contextMenu.visible"
        class="context-menu"
        :style="menuStyle"
      >
        <button
          v-for="(item, index) in ui.contextMenu.items"
          :key="index"
          class="context-item"
          @click="handleClick(item.action)"
        >
          <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1100;
  min-width: 160px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  padding: 4px;
  animation: menuIn var(--transition-fast) ease-out;
}

@keyframes menuIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.context-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 13.5px;
  color: var(--text-primary);
  border-radius: var(--border-radius-sm);
  text-align: left;
  transition: background var(--transition-fast);
}
.context-item:hover {
  background: var(--bg-hover);
}

.item-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

/* 仅桌面端显示 */
@media (max-width: 767px) {
  .context-menu {
    display: none;
  }
}

.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
