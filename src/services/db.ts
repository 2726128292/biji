import Dexie, { type EntityTable } from 'dexie'
import type {
  Folder,
  QuestionBank,
  Question,
  Note,
  NoteVersion,
  NoteLink,
  Tag,
  WrongBook,
  WrongBookQuestionRef,
  PracticeSession,
  PracticeAnswer,
  AppSettings
} from '@/types/database'

class ZhixingNotesDB extends Dexie {
  folders!: EntityTable<Folder, 'id'>
  questionBanks!: EntityTable<QuestionBank, 'id'>
  questions!: EntityTable<Question, 'id'>
  notes!: EntityTable<Note, 'id'>
  noteVersions!: EntityTable<NoteVersion, 'id'>
  noteLinks!: EntityTable<NoteLink, 'id'>
  tags!: EntityTable<Tag, 'id'>
  wrongBooks!: EntityTable<WrongBook, 'id'>
  wrongBookQuestionRefs!: EntityTable<WrongBookQuestionRef, 'id'>
  practiceSessions!: EntityTable<PracticeSession, 'id'>
  practiceAnswers!: EntityTable<PracticeAnswer, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('ZhixingNotesDB')

    this.version(1).stores({
      folders: 'id, moduleType, parentId, bankId',
      questionBanks: 'id',
      questions: 'id, bankId, folderId',
      notes: 'id, folderId',
      noteVersions: 'id, noteId',
      noteLinks: 'id, sourceNoteId, targetNoteId',
      tags: 'id, name, noteId',
      wrongBooks: 'id, sourceType, sourceId',
      wrongBookQuestionRefs: 'id, wrongBookId, questionId',
      practiceSessions: 'id, sourceType, sourceId, status',
      practiceAnswers: 'id, sessionId, questionId',
      settings: 'id'
    })
  }
}

export const db = new ZhixingNotesDB()

// 初始化默认数据
export async function initDefaultData(): Promise<void> {
  const settingsCount = await db.settings.count()
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      data: {
        defaultModule: 'notes',
        autoSaveInterval: 500,
        editorFontSize: 15,
        editorTheme: 'light',
        quizOrder: 'random',
        autoAdvanceOnCorrect: false,
        sidebarWidth: 240
      }
    })
  }

  // 检查是否有"我的笔记"根目录
  const notesRoot = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
  if (!notesRoot) {
    await db.folders.add({
      id: crypto.randomUUID(),
      moduleType: 'notes',
      parentId: null,
      bankId: null,
      name: '我的笔记',
      sortKey: 0
    })
  }

  // 检查是否有"我的题库"根目录
  const questionsRoot = await db.folders.where({ moduleType: 'questions', parentId: null }).first()
  if (!questionsRoot) {
    await db.folders.add({
      id: crypto.randomUUID(),
      moduleType: 'questions',
      parentId: null,
      bankId: null,
      name: '我的题库',
      sortKey: 0
    })
  }
}
