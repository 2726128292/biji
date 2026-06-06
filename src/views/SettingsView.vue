<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'

const ui = useUIStore()
</script>

<template>
  <div class="settings-page">
    <SettingsPanel @close="$router.push('/')" />
  </div>
</template>

<style scoped>
.settings-page {
  height: 100%;
}
</style>
