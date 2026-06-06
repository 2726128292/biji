import { db } from './db'
import type { Note, NoteVersion, NoteLink, Tag, Folder, TreeNode, ModuleType } from '@/types/database'
import { generateId, debounce } from '@/utils/index'

// ===== 费曼模板文本 =====
export const FEYNMAN_TEMPLATE = `## 问题
> 在这里描述你要理解的问题或概念

## 重点
> 核心要点是什么？

## 解释
> 用自己的话解释这个概念，就像在教一个初学者

## 卡壳点
> 哪些地方你卡住了？哪些地方不够清晰？

## 类比
> 用一个日常生活中的类比来帮助理解

## 总结
> 一句话总结这个概念的本质
`

export class NoteService {
  private saveTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

  // ===== 笔记 CRUD =====

  async createNote(folderId: string, title: string): Promise<Note> {
    const now = Date.now()
    const note: Note = {
      id: generateId(),
      folderId,
      title,
      content: '',
      createdAt: now,
      updatedAt: now
    }
    await db.notes.add(note)
    return note
  }

  async getNote(id: string): Promise<Note | undefined> {
    return db.notes.get(id)
  }

  async updateNote(id: string, content: string): Promise<void> {
    await db.notes.update(id, { content, updatedAt: Date.now() })
  }

  async updateNoteTitle(id: string, title: string): Promise<void> {
    await db.notes.update(id, { title, updatedAt: Date.now() })
  }

  async deleteNote(id: string): Promise<void> {
    await db.transaction('rw', [db.notes, db.noteVersions, db.noteLinks, db.tags], async () => {
      await db.notes.delete(id)
      await db.noteVersions.where({ noteId: id }).delete()
      await db.noteLinks.where({ sourceNoteId: id }).delete()
      await db.noteLinks.where({ targetNoteId: id }).delete()
      await db.tags.where({ noteId: id }).delete()
    })
  }

  async getNotesByFolder(folderId: string): Promise<Note[]> {
    return db.notes.where({ folderId }).sortBy('updatedAt')
  }

  // ===== 目录操作 =====

  async createFolder(parentId: string | null, name: string, moduleType: ModuleType): Promise<Folder> {
    const siblings = parentId
      ? await db.folders.where({ moduleType, parentId }).toArray()
      : await db.folders.where({ moduleType, parentId: null }).toArray()
    
    const folder: Folder = {
      id: generateId(),
      moduleType,
      parentId,
      bankId: null,
      name,
      sortKey: siblings.length
    }
    await db.folders.add(folder)
    return folder
  }

  async renameFolder(id: string, name: string): Promise<void> {
    await db.folders.update(id, { name })
  }

  async deleteFolder(id: string): Promise<void> {
    // 递归删除子文件夹和笔记
    const children = await db.folders.where({ parentId: id }).toArray()
    for (const child of children) {
      await this.deleteFolder(child.id)
    }
    
    // 删除文件夹下的笔记
    const notes = await db.notes.where({ folderId: id }).toArray()
    for (const note of notes) {
      await this.deleteNote(note.id)
    }
    
    await db.folders.delete(id)
  }

  async moveFolder(id: string, newParentId: string | null): Promise<void> {
    await db.folders.update(id, { parentId: newParentId })
  }

  async moveNote(noteId: string, newFolderId: string): Promise<void> {
    await db.notes.update(noteId, { folderId: newFolderId, updatedAt: Date.now() })
  }

  /** 构建目录树 */
  async getTree(rootParentId: string | null, moduleType: ModuleType): Promise<TreeNode[]> {
    const allFolders = await db.folders
      .where({ moduleType })
      .toArray()
    
    // 获取每个文件夹下的笔记数量
    const folderIds = allFolders.map(f => f.id)
    const notesInFolders = await db.notes.bulkGet(folderIds.length > 0 ? folderIds : ['__empty__'])
    
    const notesCountMap = new Map<string, number>()
    if (Array.isArray(notesInFolders)) {
      for (const folderId of folderIds) {
        const count = await db.notes.where({ folderId: folderId }).count()
        notesCountMap.set(folderId, count)
      }
    }

    function buildTree(parentId: string | null, depth: number = 0): TreeNode[] {
      const children = allFolders
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.sortKey - b.sortKey)
      
      return children.map(f => ({
        id: f.id,
        name: f.name,
        children: buildTree(f.id, depth + 1),
        isFolder: true,
        sortKey: f.sortKey,
        parentId: f.parentId,
        depth
      }))
    }

    return buildTree(rootParentId)
  }

  /** 获取完整树（含笔记节点） */
  async getFullTree(rootParentId: string | null, moduleType: ModuleType): Promise<(TreeNode & { isFolder: boolean; noteCount?: number })[]> {
    const folders = await db.folders.where({ moduleType }).toArray()
    const notes = await db.notes.toArray()

    function build(parentId: string | null, depth: number = 0): (TreeNode & { isFolder: boolean; noteCount?: number })[] {
      const childFolders = folders
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.sortKey - b.sortKey)

      const result: (TreeNode & { isFolder: boolean; noteCount?: number })[] = []

      for (const f of childFolders) {
        const folderNotes = notes.filter(n => n.folderId === f.id).sort((a, b) => b.updatedAt - a.updatedAt)
        result.push({
          id: f.id,
          name: f.name,
          isFolder: true,
          sortKey: f.sortKey,
          parentId: f.parentId,
          depth,
          noteCount: folderNotes.length,
          children: build(f.id, depth + 1)
        })

        for (const note of folderNotes) {
          result.push({
            id: note.id,
            name: note.title || '无标题笔记',
            isFolder: false,
            sortKey: 0,
            parentId: f.id,
            depth: depth + 1
          })
        }
      }

      return result
    }

    return build(rootParentId)
  }

  // ===== 双向链接 =====

  parseLinks(content: string): { links: Array<{ targetName: string }>; cleanedText: string } {
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const links: Array<{ targetName: string }> = []
    let match
    
    while ((match = linkRegex.exec(content)) !== null) {
      links.push({ targetName: match[1] })
    }
    
    return {
      links,
      cleanedText: content.replace(linkRegex, '[[$1]]')
    }
  }

  async resolveLink(targetName: string): Promise<string | undefined> {
    const note = await db.notes.where('title').equals(targetName).first()
    return note?.id
  }

  async saveLinks(noteId: string, content: string): Promise<void> {
    const { links } = this.parseLinks(content)

    await db.transaction('rw', [db.noteLinks], async () => {
      await db.noteLinks.where({ sourceNoteId: noteId }).delete()

      for (const link of links) {
        const targetId = await this.resolveLink(link.targetName)
        if (targetId) {
          await db.noteLinks.add({
            id: generateId(),
            sourceNoteId: noteId,
            targetNoteId: targetId
          })
        }
      }
    })
  }

  async getBackLinks(noteId: string): Promise<Array<{ sourceNote: Note }>> {
    const refs = await db.noteLinks.where({ targetNoteId: noteId }).toArray()
    const results: Array<{ sourceNote: Note }> = []
    
    for (const ref of refs) {
      const sourceNote = await db.notes.get(ref.sourceNoteId)
      if (sourceNote) {
        results.push({ sourceNote })
      }
    }
    
    return results
  }

  // ===== 标签 =====

  parseTags(content: string): string[] {
    const tagRegex = /#([^\s#]+)/g
    const tags: string[] = []
    let match
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1])
    }
    return [...new Set(tags)]
  }

  async saveTags(noteId: string, content: string): Promise<void> {
    const tagNames = this.parseTags(content)
    
    await db.transaction('rw', [db.tags], async () => {
      await db.tags.where({ noteId }).delete()
      
      for (const name of tagNames) {
        await db.tags.add({
          id: generateId(),
          name,
          noteId
        })
      }
    })
  }

  // ===== 历史版本 =====

  async saveVersion(noteId: string, content: string): Promise<NoteVersion> {
    // 限制最多10个版本
    const existingVersions = await db.noteVersions
      .where({ noteId })
      .orderBy('createdAt')
      .reverse()
      .toArray()
    
    if (existingVersions.length >= 10) {
      const toDelete = existingVersions.slice(10)
      for (const v of toDelete) {
        await db.noteVersions.delete(v.id)
      }
    }

    const version: NoteVersion = {
      id: generateId(),
      noteId,
      content,
      createdAt: Date.now()
    }
    
    await db.noteVersions.add(version)
    return version
  }

  async getVersions(noteId: string): Promise<NoteVersion[]> {
    return db.noteVersions
      .where({ noteId })
      .orderBy('createdAt')
      .reverse()
      .toArray()
  }

  async restoreVersion(noteId: string, versionId: string): Promise<void> {
    const version = await db.noteVersions.get(versionId)
    if (version) {
      await db.notes.update(noteId, {
        content: version.content,
        updatedAt: Date.now()
      })
    }
  }

  // ===== 自动保存 =====

  debouncedSave(noteId: string, content: string): void {
    const timer = this.saveTimers.get(noteId)
    if (timer) clearTimeout(timer)
    
    this.saveTimers.set(noteId, setTimeout(async () => {
      try {
        await this.updateNote(noteId, content)
        await this.saveLinks(noteId, content)
        await this.saveTags(noteId, content)
      } catch (e) {
        console.error('自动保存失败:', e)
      }
    }, 500))
  }

  forceSave(noteId: string, content: string): void {
    const timer = this.saveTimers.get(noteId)
    if (timer) clearTimeout(timer)
    this.updateNote(noteId, content)
    this.saveLinks(noteId, content)
    this.saveTags(noteId, content)
  }
}

export const noteService = new NoteService()
