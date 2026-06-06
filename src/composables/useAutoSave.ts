import { ref, watch, onUnmounted } from 'vue'
import { noteService } from '@/services/noteService'

export function useAutoSave(noteId: string | null) {
  const isSaving = ref(false)
  const lastSavedAt = ref<number | null>(null)

  function save(content: string) {
    if (!noteId) return
    isSaving.value = true
    noteService.debouncedSave(noteId, content)
    lastSavedAt.value = Date.now()
    setTimeout(() => { isSaving.value = false }, 500)
  }

  function forceSave(content: string) {
    if (!noteId) return
    noteService.forceSave(noteId, content)
    lastSavedAt.value = Date.now()
  }

  return { isSaving, lastSavedAt, save, forceSave }
}
