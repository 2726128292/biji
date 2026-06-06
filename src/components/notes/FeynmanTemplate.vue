<script setup lang="ts">
import { FEYNMAN_TEMPLATE } from '@/services/noteService'

defineOptions({ name: 'FeynmanTemplate' })

const templateSections = [
  { label: '问题', desc: '描述你要理解的问题或概念' },
  { label: '重点', desc: '核心要点是什么？' },
  { label: '解释', desc: '用自己的话解释，像在教初学者' },
  { label: '卡壳点', desc: '哪些地方卡住了？不够清晰？' },
  { label: '类比', desc: '用日常生活中的类比帮助理解' },
  { label: '总结', desc: '一句话总结概念的本质' }
]
</script>

<template>
  <div class="feynman-template-preview">
    <h3 class="template-title">费曼学习法 · 笔记模板</h3>
    <p class="template-desc">通过"以教促学"的方式深入理解知识</p>

    <div class="template-sections">
      <div
        v-for="(section, index) in templateSections"
        :key="index"
        class="section-card"
        :class="`section-${section.label}`"
      >
        <span class="section-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <div class="section-info">
          <h4 class="section-label">{{ section.label }}</h4>
          <p class="section-desc">{{ section.desc }}</p>
        </div>
      </div>
    </div>

    <pre class="template-code"><code>{{ FEYNMAN_TEMPLATE.trim() }}</code></pre>
  </div>
</template>

<style scoped>
.feynman-template-preview {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.template-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 6px;
}

.template-desc {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 24px;
}

.template-sections {
  display: grid;
  gap: 10px;
  margin-bottom: 24px;
}

.section-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--color-accent);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.section-card:hover {
  transform: translateX(2px);
  box-shadow: var(--shadow);
}

.section-问题 { border-left-color: #f59e0b; }
.section-重点 { border-left-color: #3b82f6; }
.section-解释 { border-left-color: #22c55e; }
.section-卡壳点 { border-left-color: #ef4444; }
.section-类比 { border-left-color: #a855f7; }
.section-总结 { border-left-color: #06b6d4; }

.section-number {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--color-gray-100);
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.6;
  flex-shrink: 0;
}

.section-info {
  flex: 1;
  min-width: 0;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.section-desc {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.4;
}

.template-code {
  background: var(--color-gray-900);
  color: #e2e8f0;
  padding: 16px;
  border-radius: var(--border-radius);
  font-size: 12.5px;
  line-height: 1.7;
  overflow-x: auto;
  font-family: var(--font-mono);
}
</style>
