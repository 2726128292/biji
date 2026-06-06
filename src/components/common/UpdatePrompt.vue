<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'

const ui = useUIStore()

function handleReload() {
  ui.showUpdatePrompt = false
  location.reload()
}

function handleDismiss() {
  ui.showUpdatePrompt = false
}
</script>

<template>
  <Transition name="update-prompt">
    <div v-if="ui.showUpdatePrompt" class="update-prompt">
      <div class="prompt-inner">
        <span class="prompt-dot"></span>
        <span class="prompt-text">新版本已准备好</span>
        <div class="prompt-actions">
          <button class="prompt-btn prompt-btn-dismiss" @click="handleDismiss">
            稍后再说
          </button>
          <button class="prompt-btn prompt-btn-reload" @click="handleReload">
            立即重启
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.update-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
}

.prompt-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-xl, 50px);
  box-shadow: var(--shadow-lg);
  animation: promptSlideUp var(--transition-slow) ease-out;
}

@keyframes promptSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.prompt-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulseDot 1.5s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.prompt-text {
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
}

.prompt-actions {
  display: flex;
  gap: 6px;
  margin-left: 4px;
}

.prompt-btn {
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 500;
  border-radius: 20px;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.prompt-btn-dismiss {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
}
.prompt-btn-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}

.prompt-btn-reload {
  background: var(--color-accent);
  color: white;
}
.prompt-btn-reload:hover {
  background: var(--color-accent-light);
  transform: translateY(-1px);
}

.update-prompt-enter-active,
.update-prompt-leave-active {
  transition: all var(--transition-slow);
}
.update-prompt-enter-from,
.update-prompt-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
