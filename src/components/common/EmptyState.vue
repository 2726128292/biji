<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
  actionText?: string
}>(), {
  icon: '',
  description: '',
  actionText: ''
})

const emit = defineEmits<{
  (e: 'action'): void
}>()

const hasAction = computed(() => props.actionText && !!emit)
</script>

<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon" v-html="icon"></div>
    <div class="empty-content">
      <h3 class="empty-title">{{ title }}</h3>
      <p v-if="description" class="empty-desc">{{ description }}</p>
    </div>
    <button v-if="actionText" class="empty-action" @click="emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  min-height: 300px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  opacity: 0.6;
}
.empty-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.empty-content {
  max-width: 320px;
}

.empty-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.empty-action {
  margin-top: 20px;
  padding: 10px 24px;
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}
.empty-action:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  background: var(--color-primary-light);
}
</style>
