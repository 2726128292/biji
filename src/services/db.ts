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
import { generateSampleQuestions } from '@/data/sampleQuestions'

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

  // ===== 示例题库：Python编程基础（500道题） =====
  const existingBanks = await db.questionBanks.count()
  if (existingBanks === 0) {
    await initSampleBank()
  }
}

/** 创建示例题库：Python编程基础（500道题） */
async function initSampleBank(): Promise<void> {
  const genId = () => crypto.randomUUID()

  // 创建题库 + 根章节
  const rootFolderId = genId()
  const bankId = genId()

  await db.folders.add({ id: rootFolderId, moduleType: 'questions', parentId: null, bankId: null, name: '全部题目', sortKey: 0 })
  await db.questionBanks.add({ id: bankId, name: 'Python编程基础', rootFolderId, createdAt: Date.now() - 86400000 })
  await db.folders.update(rootFolderId, { bankId })

  // 章节定义（与sampleQuestions.ts中的章节名一致）
  const chapterNames = [
    '第一章 基础语法',
    '第二章 字符串操作',
    '第三章 列表与元组',
    '第四章 字典与集合',
    '第五章 控制流程',
    '第六章 函数',
    '第七章 面向对象'
  ]

  const chapters: Record<string, string> = {}
  for (let i = 0; i < chapterNames.length; i++) {
    const folderId = genId()
    await db.folders.add({
      id: folderId,
      moduleType: 'questions',
      parentId: rootFolderId,
      bankId,
      name: chapterNames[i],
      sortKey: i
    })
    chapters[folderId] = chapterNames[i]
  }

  // 使用500题生成器
  const questions = generateSampleQuestions(bankId, chapters)
  await db.questions.bulkAdd(questions)

  // ===== 示例费曼笔记 =====
  const notesRootForNote = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
  if (notesRootForNote) {
    const noteId = genId()
    const now = Date.now() - 86400000

    await db.notes.add({
      id: noteId,
      folderId: notesRootForNote.id,
      title: 'TCP 三次握手',
      content: `## 问题
> 为什么 TCP 建立连接需要三次握手，而不是两次或四次？

## 重点
- **三次握手**是 TCP 建立可靠连接的核心机制
- 目的：**同步双方的初始序列号** + **确认双方都有收发能力**
- 关键状态：SYN_SENT → SYN_RCVD → ESTABLISHED

## 解释
想象两个人打电话确认对方能听到：

1. **第一次握手（客户端 → 服务端）**：发送 SYN 包
   - 客户端说："我想和你通话，我的初始序列号是 X"
   - 客户端进入 **SYN_SENT** 状态

2. **第二次握手（服务端 → 客户端）**：发送 SYN+ACK 包
   - 服务端说："我听到了，我确认你的序列号 X，我的初始序列号是 Y"
   - 服务端进入 **SYN_RCVD** 状态

3. **第三次握手（客户端 → 服务端）**：发送 ACK 包
   - 客户端说："我收到了你的序列号 Y"
   - 双方都进入 **ESTABLISHED** 状态，连接建立完成！

**为什么不能是两次？**
如果只有两次握手，服务端无法确认客户端是否收到了自己的确认包。可能导致"已失效的连接请求"突然到达服务端，造成资源浪费。

**为什么不需要四次？**
第三次握手的 ACK 可以和后续数据一起发送，合并后效率更高。

## 卡壳点
- 为什么需要序列号？→ 防止旧报文段干扰、保证有序接收
- 如果第三次握手丢失会怎样？→ 服务端会重传 SYN+ACK，客户端重传 ACK
- SYN Flood 攻击是什么？→ 恶意发送大量 SYN 包不完成三次握手，耗尽服务端资源

## 类比
**就像约朋友吃饭：**

| 步骤 | 动作 | 类比 |
|------|------|------|
| 第1次 | "周六有空吗？" | SYN（发起邀请） |
| 第2次 | "有啊，几点？" | SYN+ACK（确认+回应） |
| 第3次 | "那就6点见！" | ACK（最终确认） |

如果是两次握手：你发了"周六有空吗"，但不知道对方到底有没有收到。万一对方没收到呢？你就白等了。第三次握手就是确认"好的我知道你收到了"。

## 总结
> **三次握手 = 双向确认双方收发能力 + 同步初始序列号，用最少的次数实现可靠连接建立。**
`,
      createdAt: now,
      updatedAt: now
    })
  }
}
