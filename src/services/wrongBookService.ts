import { db } from './db'
import type {
  WrongBook,
  WrongBookQuestionRef,
  WrongBookSourceType,
  AddedReason,
  MirrorTreeNode,
  QuestionWithRef,
  Folder
} from '@/types/database'
import { generateId } from '@/utils/index'

export class WrongBookService {
  /** 创建错题本 */
  async createWrongBook(
    name: string,
    sourceType: WrongBookSourceType,
    sourceId: string
  ): Promise<WrongBook> {
    const wb: WrongBook = {
      id: generateId(),
      name,
      sourceType,
      sourceId,
      createdAt: Date.now()
    }
    await db.wrongBooks.add(wb)
    return wb
  }

  /** 添加错题引用（去重） */
  async addQuestionRef(
    wrongBookId: string,
    questionId: string,
    reason: AddedReason,
    folderId: string,
    index: number
  ): Promise<void> {
    const existing = await db.wrongBookQuestionRefs
      .where({ wrongBookId, questionId })
      .first()

    if (!existing) {
      await db.wrongBookQuestionRefs.add({
        id: generateId(),
        wrongBookId,
        questionId,
        addedReason: reason,
        originalFolderId: folderId,
        originalIndex: index,
        addedAt: Date.now(),
        wrongCount: 1
      })
    }
  }

  /** 获取镜像目录树 */
  async getMirrorTree(wrongBookId: string): Promise<MirrorTreeNode[]> {
    const refs = await db.wrongBookQuestionRefs
      .where({ wrongBookId })
      .toArray()

    if (refs.length === 0) return []

    // 收集所有涉及的folderId
    const folderIds = [...new Set(refs.map(r => r.originalFolderId))]
    const allFolders = await db.folders.bulkGet(folderIds).then(r => r.filter(Boolean) as Folder[])

    // 构建从根到各folder的路径
    function getPath(folderId: string): Folder[] {
      const path: Folder[] = []
      let current = allFolders.find(f => f.id === folderId)
      while (current) {
        path.unshift(current)
        current = allFolders.find(f => f.id === current!.parentId)
      }
      return path
    }

    // 构建树结构
    const rootNodes: MirrorTreeNode[] = []

    for (const ref of refs) {
      const path = getPath(ref.originalFolderId)
      let currentLevel = rootNodes

      for (let i = 0; i < path.length; i++) {
        const folder = path[i]
        let node = currentLevel.find(n => n.folderId === folder.id)

        if (!node) {
          node = {
            folderId: folder.id,
            name: folder.name,
            children: [],
            questionCount: 0,
            path: path.slice(0, i + 1).map(f => f.name).join(' / ')
          }
          currentLevel.push(node)
        }

        if (i === path.length - 1) {
          node.questionCount++
        }

        currentLevel = node.children
      }
    }

    return rootNodes
  }

  /** 获取错题本中的题目（含引用信息） */
  async getWrongQuestions(
    wrongBookId: string,
    folderId?: string
  ): Promise<QuestionWithRef[]> {
    let refs: WrongBookQuestionRef[]
    
    if (folderId) {
      refs = await db.wrongBookQuestionRefs
        .where({ wrongBookId, originalFolderId: folderId })
        .toArray()
    } else {
      refs = await db.wrongBookQuestionRefs
        .where({ wrongBookId })
        .toArray()
    }

    const results: QuestionWithRef[] = []
    for (const ref of refs) {
      const question = await db.questions.get(ref.questionId)
      if (question) {
        results.push({
          ...question,
          refId: ref.id,
          addedReason: ref.addedReason,
          wrongCount: ref.wrongCount,
          addedAt: ref.addedAt
        })
      }
    }

    return results.sort((a, b) => a.originalIndex - b.originalIndex)
  }

  /** 获取错题本中的题目ID列表 */
  async getWrongQuestionIds(wrongBookId: string): Promise<string[]> {
    const refs = await db.wrongBookQuestionRefs
      .where({ wrongBookId })
      .toArray()
    return refs.map(r => r.questionId)
  }

  /** 移除错题引用 */
  async removeQuestionRef(wrongBookId: string, questionId: string): Promise<void> {
    const ref = await db.wrongBookQuestionRefs
      .where({ wrongBookId, questionId })
      .first()
    if (ref) {
      await db.wrongBookQuestionRefs.delete(ref.id)
    }
  }

  /** 增加答错计数 */
  async incrementWrongCount(refId: string): Promise<void> {
    const ref = await db.wrongBookQuestionRefs.get(refId)
    if (ref) {
      await db.wrongBookQuestionRefs.update(refId, {
        wrongCount: ref.wrongCount + 1
      })
    }
  }

  /** 获取所有错题本 */
  async getAllWrongBooks(): Promise<WrongBook[]> {
    return db.wrongBooks.orderBy('createdAt').reverse().toArray()
  }

  /** 获取单个错题本 */
  async getWrongBook(id: string): Promise<WrongBook | undefined> {
    return db.wrongBooks.get(id)
  }

  /** 获取错题本中的题目总数 */
  async getWrongBookCount(wrongBookId: string): Promise<number> {
    return db.wrongBookQuestionRefs.where({ wrongBookId: wrongBookId }).count()
  }

  /** 删除错题本 */
  async deleteWrongBook(id: string): Promise<void> {
    await db.transaction('rw', [db.wrongBooks, db.wrongBookQuestionRefs], async () => {
      await db.wrongBookQuestionRefs.where({ wrongBookId: id }).delete()
      await db.wrongBooks.delete(id)
    })
  }

  /** 重命名错题本 */
  async renameWrongBook(id: string, name: string): Promise<void> {
    await db.wrongBooks.update(id, { name })
  }

  /** 原题删除时的级联处理 */
  async handleOriginalQuestionDelete(
    questionId: string,
    action: 'remove' | 'snapshot' | 'cancel'
  ): Promise<{ affectedWrongBooks: string[] }> {
    const refs = await db.wrongBookQuestionRefs
      .where({ questionId })
      .toArray()

    const affectedWrongBooks = [...new Set(refs.map(r => r.wrongBookId))]

    if (action === 'remove') {
      for (const ref of refs) {
        await db.wrongBookQuestionRefs.delete(ref.id)
      }
    }
    // snapshot: 保留引用不做任何操作
    // cancel: 不做操作

    return { affectedWrongBooks }
  }
}

export const wrongBookService = new WrongBookService()
