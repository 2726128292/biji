<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { wrongBookService } from '@/services/wrongBookService'
import type { PracticeConfig, WrongBook } from '@/types/database'

const props = defineProps<{
  show: boolean
  sourceType: string
  sourceId: string
}>()

const emit = defineEmits<{
  close: []
  start: [config: PracticeConfig]
}>()

// 表单状态
const order = ref<'random' | 'sequential'>('random')
const mode = ref<'memorize' | 'quiz'>('quiz')
const countMode = ref<'all' | 'custom'>('all')
const customCount = ref(20)
const wrongBookAction = ref<'create' | 'join' | 'none'>('none')
const newWrongBookName = ref('')
const targetWrongBookId = ref('')
const wrongBooks = ref<WrongBook[]>([])

async function loadWrongBooks() {
  wrongBooks.value = await wrongBookService.getAllWrongBooks()
}

function handleStart() {
  const config: PracticeConfig = {
    sourceType: props.sourceType as 'bank' | 'wrongBook' | 'folder',
    sourceId: props.sourceId,
    mode: mode.value,
    order: order.value,
    wrongBookAction: wrongBookAction.value
  }

  if (countMode.value === 'custom' && customCount.value > 0) {
    config.count = customCount.value
  }

  if (wrongBookAction.value === 'create') {
    if (!newWrongBookName.value.trim()) {
      alert('请输入错题本名称')
      return
    }
    config.newWrongBookName = newWrongBookName.value.trim()
  } else if (wrongBookAction.value === 'join') {
    if (!targetWrongBookId.value) {
      alert('请选择一个错题本')
      return
    }
    config.targetWrongBookId = targetWrongBookId.value
  }

  emit('start', config)
}

function handleClose() {
  emit('close')
}

onMounted(() => {
  loadWrongBooks()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <div class="modal-header">
          <h3>练习设置</h3>
          <button class="close-btn" @click="handleClose">✕</button>
        </div>

        <div class="modal-body">
          <!-- 来源范围（只读展示） -->
          <div class="form-group">
            <label class="form-label">练习范围</label>
            <div class="source-info">
              <span class="source-type-badge">{{ sourceType === 'bank' ? '题库' : sourceType === 'folder' ? '章节' : '错题本' }}</span>
              <span class="source-id">ID: {{ sourceId.slice(0, 8) }}...</span>
            </div>
          </div>

          <!-- 练习顺序 -->
          <div class="form-group">
            <label class="form-label">练习顺序</label>
            <div class="radio-group">
              <label class="radio-option" :class="{ active: order === 'random' }">
                <input type="radio" value="random" v-model="order" />
                <span>🔀 随机顺序</span>
              </label>
              <label class="radio-option" :class="{ active: order === 'sequential' }">
                <input type="radio" value="sequential" v-model="order" />
                <span>📋 按序练习</span>
              </label>
            </div>
          </div>

          <!-- 练习模式 -->
          <div class="form-group">
            <label class="form-label">练习模式</label>
            <div class="radio-group">
              <label class="radio-option mode-card" :class="{ active: mode === 'quiz' }">
                <input type="radio" value="quiz" v-model="mode" />
                <div class="mode-info">
                  <span class="mode-icon">✍️</span>
                  <div>
                    <strong>刷题模式</strong>
                    <p>作答后即时反馈对错</p>
                  </div>
                </div>
              </label>
              <label class="radio-option mode-card" :class="{ active: mode === 'memorize' }">
                <input type="radio" value="memorize" v-model="mode" />
                <div class="mode-info">
                  <span class="mode-icon">📖</span>
                  <div>
                    <strong>背题模式</strong>
                    <p>浏览题目并标记掌握程度</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- 题目数量 -->
          <div class="form-group">
            <label class="form-label">题目数量</label>
            <div class="count-options">
              <label class="radio-option" :class="{ active: countMode === 'all' }">
                <input type="radio" value="all" v-model="countMode" />
                全部题目
              </label>
              <label class="radio-option custom-count-row" :class="{ active: countMode === 'custom' }">
                <input type="radio" value="custom" v-model="countMode" />
                自定义数量：
                <input
                  type="number"
                  v-model.number="customCount"
                  min="1"
                  max="500"
                  class="count-input"
                  :disabled="countMode !== 'custom'"
                />
              </label>
            </div>
          </div>

          <!-- 错题处理方式 -->
          <div class="form-group">
            <label class="form-label">错题处理方式</label>
            <div class="wb-options">
              <label class="radio-option wb-option" :class="{ active: wrongBookAction === 'none' }">
                <input type="radio" value="none" v-model="wrongBookAction" />
                不加入任何错题本
              </label>
              <label class="radio-option wb-option" :class="{ active: wrongBookAction === 'join' }">
                <input type="radio" value="join" v-model="wrongBookAction" />
                加入已有错题本
                <select
                  v-if="wrongBookAction === 'join'"
                  v-model="targetWrongBookId"
                  class="wb-select"
                >
                  <option value="">请选择...</option>
                  <option v-for="wb in wrongBooks" :key="wb.id" :value="wb.id">
                    {{ wb.name }}
                  </option>
                </select>
              </label>
              <label class="radio-option wb-option" :class="{ active: wrongBookAction === 'create' }">
                <input type="radio" value="create" v-model="wrongBookAction" />
                新建错题本
                <input
                  v-if="wrongBookAction === 'create'"
                  v-model="newWrongBookName"
                  placeholder="请输入错题本名称"
                  class="wb-input"
                />
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="handleClose">取消</button>
          <button class="btn btn-submit" @click="handleStart">开始练习 ▶</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-normal);
}

.modal-container {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 560px;
  max-width: 92vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp var(--transition-normal);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.close-btn {
  width: 32px; height: 32px;
  border-radius: var(--border-radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: var(--text-muted);
  transition: background-color var(--transition-fast); cursor: pointer; border: none; background: transparent;
}
.close-btn:hover { background: var(--bg-hover); }

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 来源信息 */
.source-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-gray-50);
  border-radius: var(--border-radius-sm);
}
.source-type-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: var(--color-primary-bg);
  color: var(--color-primary);
}
.source-id {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* 单选项组 */
.radio-group,
.count-options,
.wb-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 14px;
  background: var(--bg-secondary);
}
.radio-option:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-bg);
}
.radio-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 500;
}
.radio-option input[type="radio"] {
  accent-color: var(--color-primary);
}

/* 模式卡片 */
.mode-card {
  flex-direction: column;
  align-items: stretch;
  padding: 14px 16px;
}
.mode-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}
.mode-icon {
  font-size: 28px;
}
.mode-info strong {
  font-size: 14px;
  display: block;
}
.mode-info p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

/* 自定义数量 */
.custom-count-row {
  flex-wrap: wrap;
}
.count-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  text-align: center;
  font-family: inherit;
}
.count-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* 错题本选项 */
.wb-option {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.wb-select,
.wb-input {
  width: 100%;
  padding: 7px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  font-family: inherit;
  margin-left: 24px;
}
.wb-select:focus,
.wb-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}
.btn {
  padding: 8px 22px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: transform var(--transition-fast), background-color var(--transition-fast);
}
.btn:hover { transform: scale(1.02); }
.btn-cancel { background: var(--color-gray-100); color: var(--text-secondary); }
.btn-cancel:hover { background: var(--color-gray-200); }
.btn-submit { background: var(--color-accent); color: white; }
.btn-submit:hover { background: var(--color-accent-light); }
</style>
