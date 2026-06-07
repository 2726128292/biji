<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import QuestionBankList from '@/components/questions/QuestionBankList.vue'
import QuestionBankView from '@/components/questions/QuestionBankView.vue'
import WrongBookMirrorTree from '@/components/wrongbook/WrongBookMirrorTree.vue'
import { questionService } from '@/services/questionService'

const ui = useUIStore()
const route = useRoute()
const router = useRouter()

const viewMode = computed(() => {
  if (route.name === 'wrongbook' && route.params.wrongBookId) return 'wrongbook'
  if (route.params.bankId) {
    return route.params.folderId ? 'folder' : 'bankDetail'
  }
  return 'list'
})

const bankName = ref('')
// 题库列表引用（用于刷新）
const bankListRef = ref<InstanceType<typeof QuestionBankList> | null>(null)

// ===== 创建题库弹窗（替代 prompt，兼容移动端 PWA） =====
const showCreateDialog = ref(false)
const createBankName = ref('')
const createError = ref('')

function openCreateDialog() {
  createBankName.value = ''
  createError.value = ''
  showCreateDialog.value = true
}

function closeCreateDialog() {
  showCreateDialog.value = false
}

async function confirmCreateBank() {
  const name = createBankName.value.trim()
  if (!name) {
    createError.value = '请输入题库名称'
    return
  }
  try {
    const bank = await questionService.createBank(name)
    showCreateDialog.value = false
    router.push(`/questions/${bank.id}`)
  } catch (e: any) {
    createError.value = e.message || '创建失败'
  }
}

async function loadBankName() {
  if (viewMode.value === 'bankDetail' || viewMode.value === 'folder') {
    const bank = await questionService.getBank(route.params.bankId as string)
    bankName.value = bank?.name || ''
  }
}

async function handleCreateBank() {
  // 使用自定义弹窗替代 prompt（兼容移动端 PWA）
  openCreateDialog()
}

function handlePractice(sourceType: string, sourceId: string, mode?: string) {
  router.push({ path: '/practice', query: { sourceType, sourceId, ...(mode ? { mode } : {}) } })
}

/** 导入题库 - 触发文件选择，解析JSON并创建题库 */
function handleImportBank() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      // 支持两种格式：{name, questions: [...]} 或 [{...}]
      let bankName = file.name.replace(/\.json$/i, '')
      let questions: any[]
      if (Array.isArray(data)) {
        questions = data
      } else if (data.name && Array.isArray(data.questions)) {
        bankName = data.name
        questions = data.questions
      } else {
        alert('JSON格式不正确。请使用 [{type, content, options, answer, explanation}] 或 {name, questions: [...]} 格式')
        return
      }
      if (questions.length === 0) { alert('文件中没有题目'); return }

      const bank = await questionService.createBank(bankName)
      const rootFolder = (await questionService.getChapterTree(bank.id))[0]
      const folderId = rootFolder?.id || ''

      let count = 0
      for (const item of questions) {
        if (!item.content) continue
        await questionService.createQuestion(bank.id, folderId, {
          type: item.type || 'single',
          content: item.content,
          options: item.options || [],
          answer: item.answer ?? true,
          explanation: item.explanation || ''
        })
        count++
      }
      alert(`成功创建题库「${bankName}」，导入 ${count} 道题目`)
      router.push(`/questions/${bank.id}`)
    } catch (e: any) {
      alert('导入失败：' + e.message)
    }
  }
  input.click()
}

/** 移动端底部菜单操作处理 */
function handleBottomSheetAction(e: Event) {
  const detail = (e as CustomEvent).detail
  const { action, targetId, targetType } = detail

  switch (action) {
    case 'memorize':
      router.push({ path: '/practice', query: { sourceType: 'bank', sourceId: targetId, mode: 'memorize' } })
      break
    case 'quiz':
      router.push({ path: '/practice', query: { sourceType: 'bank', sourceId: targetId, mode: 'quiz' } })
      break
    case 'rename':
      handleRenameBank(targetId)
      break
    case 'delete':
      handleDeleteBank(targetId)
      break
  }
}

async function handleRenameBank(id: string) {
  const bank = await questionService.getBank(id)
  if (!bank) return
  const newName = prompt('请输入新名称：', bank.name)
  if (newName && newName.trim()) {
    await questionService.renameBank(id, newName.trim())
    // 刷新列表
    router.replace({ path: '/questions' })
  }
}

async function handleDeleteBank(id: string) {
  const bank = await questionService.getBank(id)
  if (!bank) return
  if (!confirm(`确定要删除题库「${bank.name}」吗？此操作不可恢复。`)) return
  await questionService.deleteBank(id)
  router.replace({ path: '/questions' })
}

onMounted(() => {
  loadBankName()
  window.addEventListener('bottomsheet-action', handleBottomSheetAction)
})

onUnmounted(() => {
  window.removeEventListener('bottomsheet-action', handleBottomSheetAction)
})

watch(() => route.params, () => {
  loadBankName()
})
</script>

<template>
  <div class="questions-view">
    <!-- 顶部工具栏 -->
    <div class="toolbar" v-if="viewMode === 'list'">
      <h2 class="toolbar-title">题库管理</h2>
      <div class="toolbar-actions">
        <button class="btn btn-primary" @click="handleCreateBank">
          <span class="btn-icon">+</span>
          新建题库
        </button>
      </div>
    </div>

    <!-- 题库列表 -->
    <QuestionBankList v-if="viewMode === 'list'" @practice="handlePractice" @create="handleCreateBank" @importBank="handleImportBank" />

    <!-- 题库详情/章节题目 -->
    <QuestionBankView
      v-else-if="viewMode === 'bankDetail' || viewMode === 'folder'"
      :bank-id="route.params.bankId as string"
      :folder-id="route.params.folderId as string | undefined"
      @practice="handlePractice"
    />

    <!-- 错题本镜像视图 -->
    <WrongBookMirrorTree
      v-else-if="viewMode === 'wrongbook'"
      :wrong-book-id="route.params.wrongBookId as string"
      @practice="handlePractice"
    />

    <!-- 创建题库弹窗（替代prompt，兼容移动端PWA） -->
    <Teleport to="body">
      <div v-if="showCreateDialog" class="create-dialog-overlay" @click.self="closeCreateDialog">
        <div class="create-dialog">
          <h3 class="dialog-title">新建题库</h3>
          <input
            v-model="createBankName"
            class="dialog-input"
            type="text"
            placeholder="请输入题库名称"
            autofocus
            @keyup.enter="confirmCreateBank"
          />
          <p v-if="createError" class="dialog-error">{{ createError }}</p>
          <div class="dialog-actions">
            <button class="btn btn-cancel" @click="closeCreateDialog">取消</button>
            <button class="btn btn-primary" @click="confirmCreateBank">创建</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.questions-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  transition: transform var(--transition-fast), background-color var(--transition-fast);
}

.btn:hover {
  transform: scale(1.02);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-light);
}

.btn-icon {
  font-size: 16px;
  font-weight: 700;
}

/* ===== 创建题库弹窗 ===== */
.create-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.15s ease;
}

.create-dialog {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 400px;
  max-width: 90vw;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.2s ease;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.dialog-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: border-color var(--transition-fast);
}

.dialog-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

.dialog-error {
  color: var(--color-error);
  font-size: 13px;
  margin: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: var(--color-gray-100);
  color: var(--text-secondary);
  border: none;
}

.btn-cancel:hover {
  background: var(--color-gray-200);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
