<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Question, QuestionType, QuestionOption } from '@/types/database'
import { questionService } from '@/services/questionService'
import { getQuestionTypeName, getOptionLabel } from '@/utils/index'

const props = defineProps<{
  show: boolean
  mode: 'create' | 'edit'
  question?: Question
  bankId: string
  folderId: string
}>()

const emit = defineEmits<{
  close: []
  saved: [question: Question]
}>()

const formType = ref<QuestionType>('single')
const formContent = ref('')
const formOptions = ref<QuestionOption[]>([
  { label: 'A', text: '', isCorrect: false },
  { label: 'B', text: '', isCorrect: false }
])
const formAnswerBool = ref(true)
const formAnswerText = ref('')
const formExplanation = ref('')

// 初始化表单
watch(() => props.show, (val) => {
  if (val && props.mode === 'edit' && props.question) {
    formType.value = props.question.type
    formContent.value = props.question.content
    formOptions.value = props.question.options?.length
      ? props.question.options.map(o => ({ ...o }))
      : [{ label: 'A', text: '', isCorrect: false }, { label: 'B', text: '', isCorrect: false }]
    if (typeof props.question.answer === 'boolean') {
      formAnswerBool.value = props.question.answer
    } else {
      formAnswerText.value = Array.isArray(props.question.answer)
        ? (props.question.answer as string[]).join('||')
        : String(props.question.answer)
    }
    formExplanation.value = props.question.explanation
  } else if (val) {
    resetForm()
  }
})

function resetForm() {
  formType.value = 'single'
  formContent.value = ''
  formOptions.value = [
    { label: 'A', text: '', isCorrect: false },
    { label: 'B', text: '', isCorrect: false }
  ]
  formAnswerBool.value = true
  formAnswerText.value = ''
  formExplanation.value = ''
}

const isChoiceType = computed(() => formType.value === 'single' || formType.value === 'multiple')
const isTrueFalse = computed(() => formType.value === 'trueFalse')
const isBlank = computed(() => formType.value === 'blank')

function addOption() {
  if (formOptions.value.length >= 8) return
  const idx = formOptions.value.length
  formOptions.value.push({
    label: getOptionLabel(idx),
    text: '',
    isCorrect: false
  })
}

function removeOption(index: number) {
  if (formOptions.value.length <= 2) return
  formOptions.value.splice(index, 1)
  // 重新标记label
  formOptions.value.forEach((opt, i) => {
    opt.label = getOptionLabel(i)
  })
}

function setCorrectSingle(index: number) {
  formOptions.value.forEach((o, i) => {
    o.isCorrect = i === index
  })
}

function toggleCorrectMultiple(index: number) {
  formOptions.value[index].isCorrect = !formOptions.value[index].isCorrect
}

function validate(): boolean {
  if (!formContent.value.trim()) {
    alert('题干不能为空')
    return false
  }
  if (isChoiceType.value) {
    const hasCorrect = formOptions.value.some(o => o.isCorrect)
    if (!hasCorrect) {
      alert('请至少选择一个正确答案')
      return false
    }
    for (const opt of formOptions.value) {
      if (!opt.text.trim()) {
        alert('选项内容不能为空')
        return false
      }
    }
  }
  if (isBlank.value && !formAnswerText.value.trim()) {
    alert('填空题答案不能为空')
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return

  try {
    let answer: boolean | string[] | string

    if (formType.value === 'trueFalse') {
      answer = formAnswerBool.value
    } else if (isChoiceType.value) {
      answer = formOptions.value.map(() => '') // placeholder - real answer handled by options
    } else if (formType.value === 'blank') {
      answer = formAnswerText.value.split('||').map(s => s.trim())
    } else {
      answer = formAnswerText.value
    }

    const data = {
      type: formType.value,
      content: formContent.value.trim(),
      options: isChoiceType.value ? formOptions.value.filter(o => o.text.trim()) : [],
      answer,
      explanation: formExplanation.value.trim()
    }

    if (props.mode === 'create') {
      const q = await questionService.createQuestion(props.bankId, props.folderId, data)
      emit('saved', q)
    } else {
      await questionService.updateQuestion(props.question!.id, data)
      emit('saved', { ...props.question!, ...data })
    }

    emit('close')
  } catch (e: any) {
    alert(e.message || '保存失败')
  }
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ mode === 'create' ? '新建题目' : '编辑题目' }}</h3>
          <button class="close-btn" @click="handleClose">✕</button>
        </div>

        <div class="modal-body">
          <!-- 题型选择 -->
          <div class="form-group">
            <label class="form-label">题型</label>
            <div class="type-selector">
              <label
                v-for="t in (['single', 'multiple', 'trueFalse', 'blank', 'shortAnswer'] as QuestionType[])"
                :key="t"
                class="type-option"
                :class="{ active: formType === t }"
              >
                <input type="radio" :value="t" v-model="formType" />
                {{ getQuestionTypeName(t) }}
              </label>
            </div>
          </div>

          <!-- 题干 -->
          <div class="form-group">
            <label class="form-label">题干 <span class="required">*</span></label>
            <textarea
              v-model="formContent"
              class="form-textarea"
              rows="4"
              placeholder="请输入题干内容..."
            ></textarea>
          </div>

          <!-- 选项编辑区（仅选择题） -->
          <div v-if="isChoiceType" class="form-group">
            <label class="form-label">选项 <span class="required">*</span></label>
            <div class="options-list">
              <div v-for="(opt, index) in formOptions" :key="index" class="option-row">
                <span class="option-label">{{ opt.label }}</span>
                <input
                  v-model="opt.text"
                  class="option-input"
                  :placeholder="`选项 ${opt.label}`"
                />
                <label v-if="formType === 'single'" class="correct-radio">
                  <input type="radio" :checked="opt.isCorrect" @change="setCorrectSingle(index)" />
                </label>
                <label v-else class="correct-checkbox">
                  <input type="checkbox" :checked="opt.isCorrect" @change="toggleCorrectMultiple(index)" />
                </label>
                <button
                  class="remove-option-btn"
                  @click="removeOption(index)"
                  :disabled="formOptions.length <= 2"
                >✕</button>
              </div>
            </div>
            <button
              v-if="formOptions.length < 8"
              class="add-option-btn"
              @click="addOption"
            >+ 添加选项（最多8个）</button>
          </div>

          <!-- 答案设置 -->
          <div class="form-group">
            <label class="form-label">答案</label>
            <!-- 判断题 -->
            <div v-if="isTrueFalse" class="bool-answer">
              <label><input type="radio" :value="true" v-model="formAnswerBool" /> 正确</label>
              <label><input type="radio" :value="false" v-model="formAnswerBool" /> 错误</label>
            </div>
            <!-- 填空题 -->
            <div v-else-if="isBlank">
              <textarea
                v-model="formAnswerText"
                class="form-textarea"
                rows="2"
                placeholder="多个答案用 || 分隔，同义答案用 | 分隔"
              ></textarea>
            </div>
            <!-- 简答题 -->
            <div v-else-if="formType === 'shortAnswer'">
              <textarea
                v-model="formAnswerText"
                class="form-textarea"
                rows="3"
                placeholder="请输入参考答案..."
              ></textarea>
            </div>
          </div>

          <!-- 解析 -->
          <div class="form-group">
            <label class="form-label">解析</label>
            <textarea
              v-model="formExplanation"
              class="form-textarea"
              rows="3"
              placeholder="请输入解析内容（可选）..."
            ></textarea>
          </div>

          <!-- 预览区 -->
          <div class="preview-section">
            <label class="form-label">预览</label>
            <div class="preview-card">
              <span class="preview-type">{{ getQuestionTypeName(formType) }}</span>
              <p class="preview-content">{{ formContent || '(题干预览)' }}</p>
              <div v-if="isChoiceType && formOptions.some(o => o.text)" class="preview-options">
                <div v-for="opt in formOptions.filter(o => o.text)" :key="opt.label" class="preview-opt">
                  {{ opt.label }}. {{ opt.text }}
                  <span v-if="opt.isCorrect" class="correct-mark">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="handleClose">取消</button>
          <button class="btn btn-submit" @click="handleSubmit">{{ mode === 'create' ? '创建' : '保存' }}</button>
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
  width: 640px;
  max-width: 90vw;
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
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-muted);
  transition: background-color var(--transition-fast);
}
.close-btn:hover {
  background: var(--bg-hover);
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: var(--color-error);
}

.type-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-option {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-size: 13px;
  transition: all var(--transition-fast);
  background: var(--bg-secondary);
}

.type-option:hover {
  border-color: var(--color-primary-light);
}

.type-option.active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 500;
}

.type-option input[type="radio"] {
  display: none;
}

.form-textarea {
  width: 100%;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  padding: 7px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.option-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.correct-radio,
.correct-checkbox {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.remove-option-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-muted);
  transition: all var(--transition-fast);
  background: transparent;
  border: none;
  cursor: pointer;
}
.remove-option-btn:hover:not(:disabled) {
  background: var(--color-error-bg);
  color: var(--color-error);
}
.remove-option-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-option-btn {
  align-self: flex-start;
  padding: 5px 14px;
  border-radius: var(--border-radius-sm);
  border: 1px dashed var(--color-gray-300);
  background: transparent;
  color: var(--color-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.add-option-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.bool-answer {
  display: flex;
  gap: 20px;
  padding: 4px 0;
}
.bool-answer label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}

/* 预览区 */
.preview-section {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.preview-card {
  background: var(--color-gray-50);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
}

.preview-type {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  background: #dbeafe;
  color: #1d4ed8;
  margin-bottom: 8px;
}

.preview-content {
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.preview-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-opt {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 2px 0;
}

.correct-mark {
  color: var(--color-success);
  margin-left: 4px;
  font-weight: 700;
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

.btn:hover {
  transform: scale(1.02);
}

.btn-cancel {
  background: var(--color-gray-100);
  color: var(--text-secondary);
}
.btn-cancel:hover {
  background: var(--color-gray-200);
}

.btn-submit {
  background: var(--color-primary);
  color: white;
}
.btn-submit:hover {
  background: var(--color-primary-light);
}
</style>
