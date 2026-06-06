<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  show: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
}>(), {
  size: 'md',
  closable: true
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:show', false)
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show && props.closable) {
    close()
  }
}

function handleOverlayClick() {
  if (props.closable) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.show, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-wrapper" @click.self="handleOverlayClick">
        <div class="modal-overlay"></div>
        <div class="modal-dialog" :class="`modal-${size}`">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button v-if="closable" class="modal-close" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: var(--bg-overlay);
}

.modal-dialog {
  position: relative;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 32px);
  animation: modalIn var(--transition-normal) ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-sm { width: 380px; }
.modal-md { width: 520px; }
.modal-lg { width: 720px; }

@media (max-width: 767px) {
  .modal-sm, .modal-md, .modal-lg {
    width: 100%;
    max-width: calc(100vw - 32px);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.modal-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text-muted);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}
.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}
.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  transform: scale(0.95) translateY(10px);
}
</style>
