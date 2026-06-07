<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { wrongBookService } from '@/services/wrongBookService'
import { questionService } from '@/services/questionService'
import type { PracticeConfig, WrongBook } from '@/types/database'

const route = useRoute()

const props = defineProps<{
  show: boolean
  sourceType: string
  sourceId: string
}>()

const emit = defineEmits<{
  close: []
  start: [config: PracticeConfig]
}>()

// ===== 表单状态 =====
const order = ref<'random' | 'sequential'>('random')
// 从路由参数获取初始模式
const mode = ref<'memorize' | 'quiz'>(
  (route.query.mode as string) === 'memorize' ? 'memorize' : 'quiz'
)
const countMode = ref<'all' | 'custom'>('all')
const customCount = ref(20)
const scopeType = ref<'bankAll' | 'folderTree' | 'chapters' | 'all'>('bankAll')
const selectedChapterIds = ref<string[]>([])
const wrongBookAction = ref<'create' | 'join' | 'none'>('none')
const newWrongBookName = ref('')
const targetWrongBookId = ref('')
const wrongBooks = ref<WrongBook[]>([])

// 章节树（用于手动选择）
interface ChapterNode {
  id: string
  name: string
  children?: ChapterNode[]
}
const chapterTree = ref<ChapterNode[]>([])

async function loadWrongBooks() {
  wrongBooks.value = await wrongBookService.getAllWrongBooks()
}

/** 加载章节树供手动选择 */
async function loadChapterTree() {
  if (!props.sourceId) return
  try {
    const tree = await questionService.getChapterTree(props.sourceId)
    chapterTree.value = tree
  } catch {
    chapterTree.value = []
  }
}

function handleStart() {
  const config: PracticeConfig = {
    sourceType: props.sourceType as 'bank' | 'wrongBook' | 'folder',
    sourceId: props.sourceId,
    mode: mode.value,
    order: order.value,
    wrongBookAction: wrongBookAction.value,
    scopeType: scopeType.value
  }

  if (countMode.value === 'custom' && customCount.value > 0) {
    config.count = customCount.value
  }

  if (scopeType.value === 'chapters') {
    config.selectedChapterIds = selectedChapterIds.value
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

function toggleChapter(id: string) {
  const idx = selectedChapterIds.value.indexOf(id)
  if (idx >= 0) {
    selectedChapterIds.value.splice(idx, 1)
  } else {
    selectedChapterIds.value.push(id)
  }
}

watch(() => props.show, async (val) => {
  if (val) {
    await loadWrongBooks()
    await loadChapterTree()
  }
})

onMounted(() => {
  loadWrongBooks()
})
</script>

<template>
  <!-- 右侧面板（非弹窗） -->
  <Transition name="slide-panel">
    <div v-if="show" class="setup-panel">
      <div class="panel-header">
        <h3>练习设置</h3>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <div class="panel-body">
        <!-- 本次范围：4种选项 -->
        <div class="form-group">
          <label class="form-label">本次范围</label>
          <div class="scope-options">
            <label class="scope-option" :class="{ active: scopeType === 'bankAll' }">
              <input type="radio" value="bankAll" v-model="scopeType" />
              <span>当前题库全部题目</span>
            </label>
            <label class="scope-option" :class="{ active: scopeType === 'folderTree' }">
              <input type="radio" value="folderTree" v-model="scopeType" />
              <span>当前文件夹及子文件夹</span>
            </label>
            <label class="scope-option" :class="{ active: scopeType === 'chapters' }">
              <input type="radio" value="chapters" v-model="scopeType" />
              <span>手动选择章节</span>
            </label>
            <label class="scope-option" :class="{ active: scopeType === 'all' }">
              <input type="radio" value="all" v-model="scopeType" />
              <span>全部题库</span>
            </label>
          </div>

          <!-- 手动选择章节时的章节树 -->
          <div v-if="scopeType === 'chapters'" class="chapter-select-area">
            <template v-if="chapterTree.length > 0">
              <div
                v-for="chapter in chapterTree"
                :key="chapter.id"
                class="chapter-item"
              >
                <input
                  type="checkbox"
                  :checked="selectedChapterIds.includes(chapter.id)"
                  @change="toggleChapter(chapter.id)"
                  class="chapter-checkbox"
                />
                <label @click="toggleChapter(chapter.id)">{{ chapter.name }}</label>
              </div>
            </template>
            <p v-else class="no-chapters">该题库暂无章节</p>
          </div>
        </div>

        <!-- 题目顺序 -->
        <div class="form-group">
          <label class="form-label">题目顺序</label>
          <div class="radio-group">
            <label class="radio-option" :class="{ active: order === 'random' }">
              <input type="radio" value="random" v-model="order" />
              <span>随机顺序</span>
            </label>
            <label class="radio-option" :class="{ active: order === 'sequential' }">
              <input type="radio" value="sequential" v-model="order" />
              <span>按序练习</span>
            </label>
          </div>
        </div>

        <!-- 练习模式 -->
        <div class="form-group">
          <label class="form-label">练习模式</label>
          <div class="mode-cards">
            <label class="mode-card" :class="{ active: mode === 'quiz' }">
              <input type="radio" value="quiz" v-model="mode" />
              <strong>刷题模式</strong>
              <small>作答后即时反馈对错</small>
            </label>
            <label class="mode-card" :class="{ active: mode === 'memorize' }">
              <input type="radio" value="memorize" v-model="mode" />
              <strong>背题模式</strong>
              <small>浏览题目并标记掌握程度</small>
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
            <label class="radio-option custom-row" :class="{ active: countMode === 'custom' }">
              <input type="radio" value="custom" v-model="countMode" />
              自定义：
              <input
                type="number"
                v-model.number="customCount"
                min="1"
                max="500"
                class="count-input"
                :disabled="countMode !== 'custom'"
              /> 题
            </label>
          </div>
        </div>

        <!-- 错题处理方式 -->
        <div class="form-group">
          <label class="form-label">目标错题本</label>
          <div class="wb-options">
            <label class="wb-option" :class="{ active: wrongBookAction === 'none' }">
              <input type="radio" value="none" v-model="wrongBookAction" />
              不加入任何错题本
            </label>
            <label class="wb-option" :class="{ active: wrongBookAction === 'join' }">
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
            <label class="wb-option" :class="{ active: wrongBookAction === 'create' }">
              <input type="radio" value="create" v-model="wrongBookAction" />
              新建错题本
              <div v-if="wrongBookAction === 'create'" class="wb-name-row">
                <input
                  v-model="newWrongBookName"
                  placeholder="请输入错题本名称"
                  class="wb-input"
                />
                <span class="wb-hint">保持与原题库结构一一对应</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <button class="btn btn-cancel" @click="handleClose">取消</button>
        <button class="btn btn-submit" @click="handleStart">开始刷题</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ====== 右侧面板容器 ====== */
.setup-panel {
  width: 420px;
  min-width: 380px;
  height: 100%;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.close-btn {
  width: 30px; height: 30px;
  border-radius: var(--border-radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--text-muted);
  cursor: pointer; border: none; background: transparent;
  transition: background var(--transition-fast);
}
.close-btn:hover { background: var(--bg-hover); }

/* ====== 内容区 ====== */
.panel-body {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
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

/* ====== 范围选择（4选项）===== */
.scope-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scope-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13.5px;
  background: white;
}
.scope-option:hover { border-color: var(--color-primary-light); }
.scope-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 500;
}
.scope-option input[type="radio"] { accent-color: var(--color-primary); }

/* 章节选择区 */
.chapter-select-area {
  margin-top: 4px;
  padding: 10px 12px;
  background: var(--color-gray-50);
  border-radius: var(--border-radius);
  max-height: 160px;
  overflow-y: auto;
}
.chapter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}
.chapter-item:hover { color: var(--text-primary); }
.chapter-checkbox {
  accent-color: var(--color-primary);
}
.no-chapters {
  font-size: 12.5px;
  color: var(--text-muted);
  text-align: center;
  padding: 12px 0;
  margin: 0;
}

/* ====== 单选组 ====== */
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
  font-size: 13.5px;
  background: white;
}
.radio-option:hover { border-color: var(--color-primary-light); }
.radio-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 500;
}
.radio-option input[type="radio"] { accent-color: var(--color-primary); }

/* 模式卡片 */
.mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 10px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: white;
  text-align: center;
}
.mode-card strong {
  font-size: 13.5px;
  font-weight: 600;
}
.mode-card small {
  font-size: 11px;
  color: var(--text-muted);
}
.mode-card:hover { border-color: var(--color-primary-light); }
.mode-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}
.mode-card.active strong { color: var(--color-primary); }
.mode-card input[type="radio"] { display: none; }

/* 自定义数量 */
.custom-row {
  flex-wrap: wrap;
}
.count-input {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  text-align: center;
  font-family: inherit;
}
.count-input:focus { outline: none; border-color: var(--color-primary); }

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
.wb-input:focus { outline: none; border-color: var(--color-primary); }
.wb-name-row {
  width: calc(100% - 24px);
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wb-hint {
  font-size: 11.5px;
  color: var(--color-success);
  margin-left: 2px;
}

/* ====== 底部按钮 ====== */
.panel-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}
.btn {
  flex: 1;
  padding: 9px 20px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}
.btn-cancel {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.btn-cancel:hover { background: var(--color-gray-50); }
.btn-submit {
  background: var(--color-primary);
  color: white;
}
.btn-submit:hover { background: var(--color-primary-light); }

/* ====== 面板滑入动画 ====== */
.slide-panel-enter-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}
.slide-panel-leave-active {
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.slide-panel-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 767px) {
  .setup-panel {
    position: fixed;
    inset: 0;
    z-index: 100;
    width: 100%;
    min-width: unset;
    border-left: none;
  }
  .mode-cards {
    grid-template-columns: 1fr;
  }
}
</style>
