import { db } from './db'
import type { QuestionBank, Question, QuestionOption, Folder, QuestionType } from '@/types/database'
import { generateId } from '@/utils/index'

export class QuestionService {
  // ===== 题库管理 =====

  async createBank(name: string): Promise<QuestionBank> {
    const now = Date.now()
    
    // 创建根章节
    const rootFolderId = generateId()
    await db.folders.add({
      id: rootFolderId,
      moduleType: 'questions',
      parentId: null,
      bankId: null,
      name: '全部题目',
      sortKey: 0
    })

    const bank: QuestionBank = {
      id: generateId(),
      name,
      rootFolderId,
      createdAt: now
    }
    
    await db.questionBanks.add(bank)
    // 更新根章节的bankId
    await db.folders.update(rootFolderId, { bankId: bank.id })
    
    return bank
  }

  async renameBank(id: string, name: string): Promise<void> {
    await db.questionBanks.update(id, { name })
  }

  async deleteBank(id: string): Promise<void> {
    const bank = await db.questionBanks.get(id)
    if (!bank) return

    await db.transaction('rw', [db.questionBanks, db.questions, db.folders, db.wrongBooks, db.wrongBookQuestionRefs], async () => {
      // 删除所有题目
      await db.questions.where({ bankId: id }).delete()
      // 删除所有章节（递归）
      await this.deleteFolderRecursive(bank.rootFolderId)
      // 删除题库
      await db.questionBanks.delete(id)
      // 处理以该题库为来源的错题本引用
      const relatedWrongBooks = await db.wrongBooks.where({ sourceId: id, sourceType: 'bank' }).toArray()
      for (const wb of relatedWrongBooks) {
        await db.wrongBookQuestionRefs.where({ wrongBookId: wb.id }).delete()
        await db.wrongBooks.delete(wb.id)
      }
    })
  }

  private async deleteFolderRecursive(folderId: string): Promise<void> {
    const children = await db.folders.where({ parentId: folderId }).toArray()
    for (const child of children) {
      await this.deleteFolderRecursive(child.id)
    }
    await db.folders.delete(folderId)
  }

  async getBanks(): Promise<QuestionBank[]> {
    return db.questionBanks.orderBy('createdAt').reverse().toArray()
  }

  async getBank(id: string): Promise<QuestionBank | undefined> {
    return db.questionBanks.get(id)
  }

  async getBankQuestionCount(bankId: string): Promise<number> {
    return db.questions.where({ bankId }).count()
  }

  // ===== 章节管理 =====

  async createChapter(bankId: string, parentId: string | null, name: string): Promise<Folder> {
    const siblings = parentId
      ? await db.folders.where({ parentId }).toArray()
      : await db.folders.where({ bankId, parentId: null }).toArray()

    const folder: Folder = {
      id: generateId(),
      moduleType: 'questions',
      parentId,
      bankId,
      name,
      sortKey: siblings.length
    }
    
    await db.folders.add(folder)
    return folder
  }

  async renameChapter(id: string, name: string): Promise<void> {
    await db.folders.update(id, { name })
  }

  async deleteChapter(id: string): Promise<void> {
    // 检查章节下是否有题目
    const questionCount = await db.questions.where({ folderId: id }).count()
    if (questionCount > 0) {
      throw new Error(`该章节下还有 ${questionCount} 道题目，请先移动或删除题目`)
    }
    
    const children = await db.folders.where({ parentId: id }).toArray()
    for (const child of children) {
      await this.deleteChapter(child.id)
    }
    
    await db.folders.delete(id)
  }

  async getChapters(bankId: string, parentId: string | null = null): Promise<Folder[]> {
    return db.folders
      .where({ bankId, parentId })
      .sortBy('sortKey')
  }

  async getChapterTree(bankId: string): Promise<any[]> {
    const allFolders = await db.folders.where({ bankId }).toArray()
    const bank = await db.questionBanks.get(bankId)
    if (!bank) return []

    function build(parentId: string | null): any[] {
      return allFolders
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(f => ({
          ...f,
          children: build(f.id)
        }))
    }

    return build(null)
  }

  // ===== 题目 CRUD =====

  async createQuestion(
    bankId: string,
    folderId: string,
    data: {
      type: QuestionType
      content: string
      options?: QuestionOption[]
      answer: boolean | string[] | string
      explanation: string
    }
  ): Promise<Question> {
    // 获取当前章节最大原题号
    const maxIndex = await db.questions
      .where({ folderId })
      .toArray()
      .then(qs => qs.reduce((max, q) => Math.max(max, q.originalIndex), 0))

    const question: Question = {
      id: generateId(),
      bankId,
      folderId,
      originalIndex: maxIndex + 1,
      type: data.type,
      content: data.content,
      options: data.options || [],
      answer: data.answer,
      explanation: data.explanation,
      stableKey: generateId()
    }

    await db.questions.add(question)
    return question
  }

  async updateQuestion(
    id: string,
    data: Partial<{
      type: QuestionType
      content: string
      options: QuestionOption[]
      answer: boolean | string[] | string
      explanation: string
    }>
  ): Promise<void> {
    await db.questions.update(id, data as any)
  }

  async deleteQuestion(id: string): Promise<void> {
    // 检查是否被错题本引用
    const refs = await db.wrongBookQuestionRefs.where({ questionId: id }).toArray()
    if (refs.length > 0) {
      throw new Error('QUESTION_HAS_WRONGBOOK_REFS')
    }
    
    await db.questions.delete(id)
  }

  /** 强制删除题目（级联删除错题引用） */
  async forceDeleteQuestion(id: string, action: 'remove' | 'snapshot'): Promise<void> {
    await db.transaction('rw', [db.questions, db.wrongBookQuestionRefs, db.practiceAnswers], async () => {
      if (action === 'remove') {
        await db.wrongBookQuestionRefs.where({ questionId: id }).delete()
      }
      // snapshot 模式保留引用（题目已删但引用还在）
      await db.questions.delete(id)
      await db.practiceAnswers.where({ questionId: id }).delete()
    })
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return db.questions.get(id)
  }

  async getQuestionsByFolder(folderId: string): Promise<Question[]> {
    return db.questions.where({ folderId }).sortBy('originalIndex')
  }

  async getQuestionsByBank(bankId: string): Promise<Question[]> {
    return db.questions.where({ bankId }).sortBy('originalIndex')
  }

  /** 获取某题库或章节下的所有题目ID */
  async getQuestionIds(sourceType: 'bank' | 'folder', sourceId: string): Promise<string[]> {
    if (sourceType === 'bank') {
      const questions = await db.questions.where({ bankId: sourceId }).toArray()
      return questions.map(q => q.id)
    } else {
      const questions = await db.questions.where({ folderId: sourceId }).toArray()
      return questions.map(q => q.id)
    }
  }

  /** 移动题目到其他章节 */
  async moveQuestion(questionId: string, newFolderId: string): Promise<void> {
    await db.questions.update(questionId, { folderId: newFolderId })
  }

  // ===== 导入导出（基础实现）=====

  exportToMarkdown(bankId: string): string {
    // 同步导出需要在调用前获取数据
    return '' // 由外部处理
  }
}

export const questionService = new QuestionService()
