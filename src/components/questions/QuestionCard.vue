<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/types/database'
import { getQuestionTypeName, getOptionLabel } from '@/utils/index'

const props = defineProps<{
  question: Question
}>()

const emit = defineEmits<{
  edit: [question: Question]
  delete: [id: string]
  practice: [id: string]
}>()

const typeName = computed(() => getQuestionTypeName(props.question.type))

const contentPreview = computed(() => {
  const text = props.question.content.replace(/[#*_`]/g, '')
  return text.length > 80 ? text.slice(0, 80) + '...' : text
})

const optionsPreview = computed(() => {
  if (!props.question.options?.length) return ''
  return props.question.options
    .slice(0, 4)
    .map((o, i) => `${getOptionLabel(i)}. ${o.text}`)
    .join('  ')
})

const typeColorClass = computed(() => {
  const map: Record<string, string> = {
    single: 'tag-single',
    multiple: 'tag-multiple',
    trueFalse: 'tag-truefalse',
    blank: 'tag-blank',
    shortAnswer: 'tag-shortanswer'
  }
  return map[props.question.type] || 'tag-default'
})

function handleEdit() {
  emit('edit', props.question)
}

function handleDelete() {
  if (confirm('确定要删除这道题目吗？')) {
    emit('delete', props.question.id)
  }
}

function handlePractice() {
  emit('practice', props.question.id)
}
</script>

<template>
  <div class="question-card">
    <div class="card-top">
      <span class="type-tag" :class="typeColorClass">{{ typeName }}</span>
      <span class="index-badge">#{{ question.originalIndex }}</span>
    </div>

    <div class="card-content">
      <p class="content-text">{{ contentPreview }}</p>
    </div>

    <div v-if="optionsPreview" class="options-preview">
      <span class="options-label">选项：</span>
      <span class="options-text">{{ optionsPreview }}</span>
      <span v-if="question.options!.length > 4" class="more-hint">
        +{{ question.options!.length - 4 }}
      </span>
    </div>

    <div class="card-actions">
      <button class="action-btn edit" @click="handleEdit" title="编辑">✏️ 编辑</button>
      <button class="action-btn practice" @click="handlePractice" title="练习">▶ 练习</button>
      <button class="action-btn delete" @click="handleDelete" title="删除">🗑️ 删除</button>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  padding: 16px 20px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.question-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.type-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.tag-single {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag-multiple {
  background: #fef3c7;
  color: #b45309;
}

.tag-truefalse {
  background: #e0e7ff;
  color: #4338ca;
}

.tag-blank {
  background: #dcfce7;
  color: #15803d;
}

.tag-shortanswer {
  background: #fce7f3;
  color: #be185d;
}

.tag-default {
  background: var(--color-gray-100);
  color: var(--text-secondary);
}

.index-badge {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.card-content {
  margin-bottom: 10px;
}

.content-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
}

.options-preview {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-gray-50);
  border-radius: var(--border-radius-sm);
  margin-bottom: 12px;
  font-size: 13px;
}

.options-label {
  color: var(--text-muted);
  flex-shrink: 0;
}

.options-text {
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-hint {
  color: var(--text-muted);
  font-size: 12px;
  flex-shrink: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  padding: 5px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  background: transparent;
}

.action-btn.edit {
  color: var(--color-info);
}
.action-btn.edit:hover {
  background: var(--color-info-bg);
}

.action-btn.practice {
  color: var(--color-accent-dark);
}
.action-btn.practice:hover {
  background: var(--color-warning-bg);
}

.action-btn.delete {
  color: var(--color-error);
}
.action-btn.delete:hover {
  background: var(--color-error-bg);
}
</style>
