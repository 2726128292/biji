// 数据库表类型定义 - 对应 specs/data-model.md

export type ModuleType = 'notes' | 'questions'
export type QuestionType = 'single' | 'multiple' | 'trueFalse' | 'blank' | 'shortAnswer'
export type PracticeMode = 'memorize' | 'quiz'
export type PracticeStatus = 'active' | 'completed' | 'abandoned'
export type AnswerResult = 'correct' | 'wrong' | 'unknown'
export type WrongBookSourceType = 'bank' | 'wrongBook'
export type AddedReason = 'wrong' | 'unknown'

// ===== 文件夹 =====
export interface Folder {
  id: string
  moduleType: ModuleType
  parentId: string | null
  bankId: string | null
  name: string
  sortKey: number
}

// ===== 题库 =====
export interface QuestionBank {
  id: string
  name: string
  rootFolderId: string
  createdAt: number
}

// ===== 题目选项 =====
export interface QuestionOption {
  label: string
  text: string
  isCorrect?: boolean
}

// ===== 题目 =====
export interface Question {
  id: string
  bankId: string
  folderId: string
  originalIndex: number
  type: QuestionType
  content: string
  options: QuestionOption[]
  answer: boolean | string[] | string
  explanation: string
  stableKey: string
}

// ===== 笔记 =====
export interface Note {
  id: string
  folderId: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

// ===== 笔记历史版本 =====
export interface NoteVersion {
  id: string
  noteId: string
  content: string
  createdAt: number
}

// ===== 双向链接 =====
export interface NoteLink {
  id: string
  sourceNoteId: string
  targetNoteId: string
}

// ===== 标签 =====
export interface Tag {
  id: string
  name: string
  noteId: string
}

// ===== 错题本 =====
export interface WrongBook {
  id: string
  name: string
  sourceType: WrongBookSourceType
  sourceId: string
  createdAt: number
}

// ===== 错题本题目引用 =====
export interface WrongBookQuestionRef {
  id: string
  wrongBookId: string
  questionId: string
  addedReason: AddedReason
  originalFolderId: string
  originalIndex: number
  addedAt: number
  wrongCount: number
}

// ===== 练习会话 =====
export interface PracticeSession {
  id: string
  sourceType: 'bank' | 'wrongBook' | 'folder'
  sourceId: string
  targetWrongBookId: string | null
  mode: PracticeMode
  status: PracticeStatus
  startedAt: number
  completedAt: number | null
}

// ===== 练习作答记录 =====
export interface PracticeAnswer {
  id: string
  sessionId: string
  questionId: string
  submittedAnswer: any
  result: AnswerResult
  addedToTarget: boolean
  answeredAt: number
}

// ===== 应用设置 =====
export interface AppSettingsData {
  defaultModule: 'notes' | 'questions'
  autoSaveInterval: number
  editorFontSize: number
  editorTheme: string
  quizOrder: 'random' | 'sequential'
  autoAdvanceOnCorrect: boolean
  sidebarWidth: number
  themeMode?: string
  lineHeight?: number
  typewriterMode?: boolean
  focusMode?: boolean
  autoSave?: boolean
  historyVersions?: number
}

export interface AppSettings {
  id: string
  data: AppSettingsData
}

// ===== 树节点（UI用）=====
export interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
  isFolder: boolean
  sortKey: number
  parentId: string | null
  depth: number
  noteCount?: number
}

// ===== 镜像树节点 =====
export interface MirrorTreeNode {
  folderId: string
  name: string
  children: MirrorTreeNode[]
  questionCount: number
  path: string
}

// ===== 练习配置 =====
export interface PracticeConfig {
  sourceType: 'bank' | 'wrongBook' | 'folder'
  sourceId: string
  mode: PracticeMode
  order: 'random' | 'sequential'
  count?: number
  wrongBookAction: 'create' | 'join' | 'none'
  targetWrongBookId?: string
  newWrongBookName?: string
  scopeType?: 'bankAll' | 'folderTree' | 'chapters' | 'all'
  selectedChapterIds?: string[]
}

// ===== 练习报告 =====
export interface PracticeReport {
  sessionId: string
  startedAt: number
  completedAt?: number
  totalQuestions: number
  correctCount: number
  wrongCount: number
  unknownCount: number
  accuracy: number
  targetWrongBookName?: string
  sourceName?: string
  answers: (PracticeAnswer & { questionContent: string })[]
}

// ===== 带引用信息的错题 =====
export interface QuestionWithRef extends Question {
  refId: string
  addedReason: AddedReason
  wrongCount: number
  addedAt: number
}

// ===== 备份数据结构 =====
export const SCHEMA_VERSION = 1

export interface BackupData {
  schemaVersion: number
  exportedAt: number
  folders: Folder[]
  questionBanks: QuestionBank[]
  questions: Question[]
  notes: Note[]
  noteVersions: NoteVersion[]
  tags: Tag[]
  noteLinks: NoteLink[]
  wrongBooks: WrongBook[]
  wrongBookQuestionRefs: WrongBookQuestionRef[]
  practiceSessions: PracticeSession[]
  practiceAnswers: PracticeAnswer[]
  settings: AppSettings[]
}
