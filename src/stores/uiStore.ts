import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 侧边栏状态
  const sidebarOpen = ref(true)
  const sidebarWidth = ref(240)
  
  // 当前模块
  const currentModule = ref<'notes' | 'questions'>('notes')
  
  // 模态框状态
  const showSettings = ref(false)
  const showBackupRestore = ref(false)
  const showQuestionForm = ref(false)
  const showPracticeSetup = ref(false)
  const showVersionHistory = ref(false)
  
  // 编辑中的实体ID
  const editingNoteId = ref<string | null>(null)
  const editingQuestionId = ref<string | null>(null)
  const selectedBankId = ref<string | null>(null)
  const selectedFolderId = ref<string | null>(null)
  const selectedWrongBookId = ref<string | null>(null)
  
  // 练习相关
  const activeSessionId = ref<string | null>(null)
  const practiceMode = ref<'memorize' | 'quiz' | null>(null)
  
  // 右键菜单
  const contextMenu = ref<{
    visible: boolean
    x: number
    y: number
    items: Array<{ label: string; action: string; icon?: string }>
    targetId: string
    targetType: 'folder' | 'note' | 'question' | 'bank' | 'wrongbook' | 'chapter'
  }>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
    targetId: '',
    targetType: 'folder'
  })

  // 移动端底部菜单
  const bottomSheet = ref<{
    visible: boolean
    title: string
    items: Array<{ label: string; action: string; icon?: string; danger?: boolean }>
    targetId: string
    targetType: string
  }>({
    visible: false,
    title: '',
    items: [],
    targetId: '',
    targetType: ''
  })

  // PWA更新提示
  const showUpdatePrompt = ref(false)
  const swRegistration = ref<ServiceWorkerRegistration | null>(null)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function openSidebar() {
    sidebarOpen.value = true
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function setSidebarWidth(width: number) {
    sidebarWidth.value = Math.max(150, Math.min(350, width))
  }

  function setModule(module: 'notes' | 'questions') {
    currentModule.value = module
  }

  function showContextMenu(x: number, y: number, items: any[], targetId: string, targetType: any) {
    contextMenu.value = { visible: true, x, y, items, targetId, targetType }
  }

  function hideContextMenu() {
    contextMenu.value.visible = false
  }

  function showBottomSheet(title: string, items: any[], targetId: string, targetType: string) {
    bottomSheet.value = { visible: true, title, items, targetId, targetType }
  }

  function hideBottomSheet() {
    bottomSheet.value.visible = false
  }

  return {
    sidebarOpen,
    sidebarWidth,
    currentModule,
    showSettings,
    showBackupRestore,
    showQuestionForm,
    showPracticeSetup,
    showVersionHistory,
    editingNoteId,
    editingQuestionId,
    selectedBankId,
    selectedFolderId,
    selectedWrongBookId,
    activeSessionId,
    practiceMode,
    contextMenu,
    bottomSheet,
    showUpdatePrompt,
    swRegistration,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setSidebarWidth,
    setModule,
    showContextMenu,
    hideContextMenu,
    showBottomSheet,
    hideBottomSheet
  }
})
