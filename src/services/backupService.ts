import JSZip from 'jszip'
import { db } from './db'
import type { BackupData } from '@/types/database'
import { SCHEMA_VERSION } from '@/types/database'

export class BackupService {
  /** 创建完整备份（ZIP格式） */
  async createBackup(): Promise<Blob> {
    const data = await this.exportAllData()
    const zip = new JSZip()

    zip.file('backup.json', JSON.stringify(data, null, 2))

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
    return blob
  }

  /** 创建JSON备份 */
  async createJSONBackup(): Promise<string> {
    const data = await this.exportAllData()
    return JSON.stringify(data, null, 2)
  }

  /** 导出全部数据 */
  private async exportAllData(): Promise<BackupData> {
    const [
      folders,
      questionBanks,
      questions,
      notes,
      noteVersions,
      tags,
      noteLinks,
      wrongBooks,
      wrongBookQuestionRefs,
      practiceSessions,
      practiceAnswers,
      settings
    ] = await Promise.all([
      db.folders.toArray(),
      db.questionBanks.toArray(),
      db.questions.toArray(),
      db.notes.toArray(),
      db.noteVersions.toArray(),
      db.tags.toArray(),
      db.noteLinks.toArray(),
      db.wrongBooks.toArray(),
      db.wrongBookQuestionRefs.toArray(),
      db.practiceSessions.toArray(),
      db.practiceAnswers.toArray(),
      db.settings.toArray()
    ])

    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: Date.now(),
      folders,
      questionBanks,
      questions,
      notes,
      noteVersions,
      tags,
      noteLinks,
      wrongBooks,
      wrongBookQuestionRefs,
      practiceSessions,
      practiceAnswers,
      settings
    }
  }

  /** 恢复备份 */
  async restoreBackup(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await file.text()
      let data: BackupData

      // 尝试解析ZIP
      if (file.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file)
        const jsonFile = zip.file('backup.json')
        if (!jsonFile) {
          return { success: false, message: '无效的备份文件：缺少 backup.json' }
        }
        data = JSON.parse(await jsonFile.async('text'))
      } else {
        data = JSON.parse(text)
      }

      // 验证schemaVersion
      if (data.schemaVersion === undefined) {
        return { success: false, message: '无效的备份数据格式' }
      }

      // 清空现有数据并导入
      await db.transaction('rw', db.tables, async () => {
        for (const table of db.tables) {
          await table.clear()
        }

        if (data.folders?.length) await db.folders.bulkAdd(data.folders)
        if (data.questionBanks?.length) await db.questionBanks.bulkAdd(data.questionBanks)
        if (data.questions?.length) await db.questions.bulkAdd(data.questions)
        if (data.notes?.length) await db.notes.bulkAdd(data.notes)
        if (data.noteVersions?.length) await db.noteVersions.bulkAdd(data.noteVersions)
        if (data.tags?.length) await db.tags.bulkAdd(data.tags)
        if (data.noteLinks?.length) await db.noteLinks.bulkAdd(data.noteLinks)
        if (data.wrongBooks?.length) await db.wrongBooks.bulkAdd(data.wrongBooks)
        if (data.wrongBookQuestionRefs?.length) await db.wrongBookQuestionRefs.bulkAdd(data.wrongBookQuestionRefs)
        if (data.practiceSessions?.length) await db.practiceSessions.bulkAdd(data.practiceSessions)
        if (data.practiceAnswers?.length) await db.practiceAnswers.bulkAdd(data.practiceAnswers)
        if (data.settings?.length) await db.settings.bulkAdd(data.settings)
      })

      return { success: true, message: '恢复成功！共恢复数据如下：' +
        `${data.notes?.length ?? 0} 条笔记, ` +
        `${data.questions?.length ?? 0} 道题目, ` +
        `${data.wrongBooks?.length ?? 0} 个错题本`
      }
    } catch (e: any) {
      console.error('恢复失败:', e)
      return { success: false, message: `恢复失败: ${e.message}` }
    }
  }

  /** 获取存储估算 */
  async getStorageEstimate(): Promise<{ used: string; quota: string }> {
    if ('storage' in navigator && 'estimate' in (navigator as any).storage) {
      try {
        const estimate = await (navigator as any).storage.estimate()
        return {
          used: this.formatBytes(estimate.usage || 0),
          quota: this.formatBytes(estimate.quota || 0)
        }
      } catch {
        return { used: '未知', quota: '未知' }
      }
    }
    return { used: '不支持', quota: '不支持' }
  }

  /** 申请持久化存储 */
  async requestPersistence(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in (navigator as any).storage) {
      try {
        return await (navigator as any).storage.persist()
      } catch {
        return false
      }
    }
    return false
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

export const backupService = new BackupService()
