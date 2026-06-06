<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'

const ui = useUIStore()

function handleAction(action: string) {
  ui.hideBottomSheet()
  window.dispatchEvent(new CustomEvent('bottomsheet-action', {
    detail: { action, targetId: ui.bottomSheet.targetId, targetType: ui.bottomSheet.targetType }
  }))
}

function handleMaskClick() {
  ui.hideBottomSheet()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div v-if="ui.bottomSheet.visible" class="bottom-sheet-container">
        <!-- 遮罩层 -->
        <div class="bottom-mask" @click="handleMaskClick"></div>
        
        <!-- 面板 -->
        <div class="bottom-panel">
          <div class="bottom-handle"></div>
          
          <div v-if="ui.bottomSheet.title" class="bottom-header">
            <h3 class="bottom-title">{{ ui.bottomSheet.title }}</h3>
          </div>
          
          <div class="bottom-list">
            <button
              v-for="(item, index) in ui.bottomSheet.items"
              :key="index"
              class="bottom-item"
              :class="{ 'danger': item.danger }"
              @click="handleAction(item.action)"
            >
              <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
              {{ item.label }}
            </button>
          </div>
          
          <button class="bottom-cancel" @click="handleMaskClick">取消</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bottom-sheet-container {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bottom-mask {
  position: absolute;
  inset: 0;
  background: var(--bg-overlay);
  animation: fadeIn var(--transition-fast) ease-out;
}

.bottom-panel {
  position: relative;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  padding: 8px 0 0;
  animation: slideUpPanel var(--transition-slow) cubic-bezier(0.32, 0.72, 0, 1);
  max-height: 70vh;
  overflow-y: auto;
}

@keyframes slideUpPanel {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.bottom-handle {
  width: 36px;
  height: 4px;
  background: var(--color-gray-300);
  border-radius: 2px;
  margin: 8px auto 12px;
}

.bottom-header {
  padding: 4px 20px 12px;
  border-bottom: 1px solid var(--border-color);
}

.bottom-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.bottom-list {
  padding: 8px 12px;
}

.bottom-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px 16px;
  font-size: 15px;
  color: var(--text-primary);
  border-radius: var(--border-radius);
  text-align: left;
  transition: background var(--transition-fast);
}
.bottom-item:hover {
  background: var(--bg-hover);
}
.bottom-item.danger {
  color: var(--color-error);
}
.bottom-item.danger:hover {
  background: var(--color-error-bg);
}

.item-icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.bottom-cancel {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: 4px;
  transition: background var(--transition-fast);
}
.bottom-cancel:active {
  background: var(--bg-hover);
}

/* 仅手机端显示 */
@media (min-width: 768px) {
  .bottom-sheet-container {
    display: none;
  }
}

.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity var(--transition-slow);
}
.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}
</style>
