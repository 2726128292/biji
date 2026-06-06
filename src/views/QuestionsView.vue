<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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

async function loadBankName() {
  if (viewMode.value === 'bankDetail' || viewMode.value === 'folder') {
    const bank = await questionService.getBank(route.params.bankId as string)
    bankName.value = bank?.name || ''
  }
}

async function handleCreateBank() {
  const name = prompt('请输入题库名称：', '')
  if (name && name.trim()) {
    try {
      const bank = await questionService.createBank(name.trim())
      router.push(`/questions/${bank.id}`)
    } catch (e: any) {
      alert(e.message || '创建失败')
    }
  }
}

function handlePractice(sourceType: string, sourceId: string) {
  router.push({ path: '/practice', query: { sourceType, sourceId } })
}

onMounted(() => {
  loadBankName()
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
    <QuestionBankList v-if="viewMode === 'list'" @practice="handlePractice" @create="handleCreateBank" />

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
</style>
