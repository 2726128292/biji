import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettingsData } from '@/types/database'
import { db } from '@/services/db'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettingsData>({
    defaultModule: 'notes',
    autoSaveInterval: 500,
    editorFontSize: 15,
    editorTheme: 'light',
    quizOrder: 'random',
    autoAdvanceOnCorrect: false,
    sidebarWidth: 240
  })

  const isLoaded = ref(false)

  async function loadSettings() {
    try {
      const s = await db.settings.get('default')
      if (s) {
        settings.value = { ...settings.value, ...s.data }
      }
      isLoaded.value = true
    } catch (e) {
      console.error('加载设置失败:', e)
      isLoaded.value = true
    }
  }

  async function saveSettings(data: Partial<AppSettingsData>) {
    settings.value = { ...settings.value, ...data }
    await db.settings.update('default', { data: settings.value })
  }

  const defaultModule = computed(() => settings.value.defaultModule)

  return {
    settings,
    isLoaded,
    loadSettings,
    saveSettings,
    defaultModule
  }
})
