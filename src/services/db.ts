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

  // ===== 示例题库：Python编程基础 =====
  const existingBanks = await db.questionBanks.count()
  if (existingBanks === 0) {
    await initSampleBank()
  }
}

/** 创建示例题库：Python编程基础（20道题） */
async function initSampleBank(): Promise<void> {
  const genId = () => crypto.randomUUID()

  // 创建题库 + 根章节
  const rootFolderId = genId()
  const bankId = genId()

  await db.folders.add({ id: rootFolderId, moduleType: 'questions', parentId: null, bankId: null, name: '全部题目', sortKey: 0 })

  await db.questionBanks.add({ id: bankId, name: 'Python编程基础', rootFolderId, createdAt: Date.now() - 86400000 })
  await db.folders.update(rootFolderId, { bankId: bankId })

  // 章节定义
  const ch1 = genId()
  const ch2 = genId()
  const ch3 = genId()
  const ch4 = genId()

  const folderData = [
    { id: ch1, moduleType: 'questions' as const, parentId: rootFolderId, bankId, name: '第一章 基础语法', sortKey: 0 },
    { id: ch2, moduleType: 'questions' as const, parentId: rootFolderId, bankId, name: '第二章 数据结构', sortKey: 1 },
    { id: ch3, moduleType: 'questions' as const, parentId: rootFolderId, bankId, name: '第三章 函数与模块', sortKey: 2 },
    { id: ch4, moduleType: 'questions' as const, parentId: rootFolderId, bankId, name: '第四章 面向对象', sortKey: 3 }
  ]
  for (const f of folderData) {
    await db.folders.add(f)
  }

  // 20道Python题目
  const questions: any[] = [
    // ========== 第一章 基础语法（6题） ==========
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 1,
      type: 'single' as const,
      content: 'Python中以下哪个是合法的变量名？',
      options: [
        { label: 'A', text: '2myVar', isCorrect: false },
        { label: 'B', text: 'my_var', isCorrect: true },
        { label: 'C', text: 'my-var', isCorrect: false },
        { label: 'D', text: 'my var', isCorrect: false }
      ],
      answer: true,
      explanation: 'Python变量名只能包含字母、数字和下划线，且不能以数字开头。连字符和空格都不允许。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 2,
      type: 'single' as const,
      content: '以下代码的输出是什么？\nprint(5 // 2)',
      options: [
        { label: 'A', text: '2.5', isCorrect: false },
        { label: 'B', text: '2', isCorrect: true },
        { label: 'C', text: '3', isCorrect: false },
        { label: 'D', text: '2.0', isCorrect: false }
      ],
      answer: true,
      explanation: '`//` 是地板除（整除）运算符，返回商的整数部分。5 // 2 = 2。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 3,
      type: 'multiple' as const,
      content: '以下哪些是Python的不可变数据类型？（多选）',
      options: [
        { label: 'A', text: 'int（整数）', isCorrect: true },
        { label: 'B', text: 'list（列表）', isCorrect: false },
        { label: 'C', text: 'tuple（元组）', isCorrect: true },
        { label: 'D', text: 'str（字符串）', isCorrect: true }
      ],
      answer: ['A', 'C', 'D'],
      explanation: 'int、tuple、str是不可变类型；list是可变类型，可以修改其元素。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 4,
      type: 'trueFalse' as const,
      content: 'Python中，空字符串、空列表、数字0都被视为False。',
      options: [],
      answer: true,
      explanation: '在布尔上下文中，False、None、0、0.0、""、[]、{}、()、set() 都被视为假值。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 5,
      type: 'blank' as const,
      content: 'Python中用于获取用户输入的函数的名称是 ___。',
      options: [],
      answer: ['input'],
      explanation: 'input()函数用于从标准输入读取一行字符串。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 6,
      type: 'single' as const,
      content: '以下代码的输出是什么？\nprint(3 ** 2)',
      options: [
        { label: 'A', text: '6', isCorrect: false },
        { label: 'B', text: '9', isCorrect: true },
        { label: 'C', text: '8', isCorrect: false },
        { label: 'D', text: '32', isCorrect: false }
      ],
      answer: true,
      explanation: '`**` 是幂运算运算符，3 ** 2 = 3² = 9。',
      stableKey: genId()
    },

    // ========== 第二章 数据结构（5题） ==========
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 1,
      type: 'single' as const,
      content: '执行以下代码后，my_list的值是什么？\nmy_list = [1, 2, 3]\nmy_list.append(4)\nprint(my_list)',
      options: [
        { label: 'A', text: '[1, 2, 3]', isCorrect: false },
        { label: 'B', text: '[1, 2, 3, 4]', isCorrect: true },
        { label: 'C', text: '[4, 1, 2, 3]', isCorrect: false },
        { label: 'D', text: '报错', isCorrect: false }
      ],
      answer: true,
      explanation: 'append()方法在列表末尾添加元素，不返回新列表，直接修改原列表。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 2,
      type: 'multiple' as const,
      content: '以下哪些是Python字典的合法操作？（多选）',
      options: [
        { label: 'A', text: 'd["key"] = value', isCorrect: true },
        { label: 'B', text: 'd.keys()', isCorrect: true },
        { label: 'C', text: 'd[0] 访问第一个元素', isCorrect: false },
        { label: 'D', text: 'd.get("key", "默认值")', isCorrect: true }
      ],
      answer: ['A', 'B', 'D'],
      explanation: '字典是无序的键值对集合，不能用索引访问。get()方法在键不存在时返回默认值。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 3,
      type: 'trueFalse' as const,
      content: 'Python的集合(set)可以包含重复元素。',
      options: [],
      answer: false,
      explanation: '集合(set)中的元素是唯一的，不允许重复。重复元素会被自动去重。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 4,
      type: 'blank' as const,
      content: '列表推导式 `[x*2 for x in range(5)]` 的结果是 ___。',
      options: [],
      answer: ['[0, 2, 4, 6, 8]'],
      explanation: 'range(5)生成0,1,2,3,4，每个乘以2得到0,2,4,6,8。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 5,
      type: 'shortAnswer' as const,
      content: '请简述Python中列表(list)和元组(tuple)的主要区别。',
      options: [],
      answer: '1. 列表是可变的（可以增删改元素），元组是不可变的；2. 列表用方括号[]，元组用圆括号()；3. 元组可以作为字典的键，列表不能；4. 元组通常用于存储异构数据，列表用于存储同构数据。',
      explanation: '不可变性是元组和列表最本质的区别，也决定了它们的适用场景不同。',
      stableKey: genId()
    },

    // ========== 第三章 函数与模块（5题） ==========
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 1,
      type: 'single' as const,
      content: 'Python中定义函数的关键字是什么？',
      options: [
        { label: 'A', text: 'function', isCorrect: false },
        { label: 'B', text: 'def', isCorrect: true },
        { label: 'C', text: 'func', isCorrect: false },
        { label: 'D', text: 'define', isCorrect: false }
      ],
      answer: true,
      explanation: 'Python使用`def`关键字定义函数，语法为：def 函数名(参数):',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 2,
      type: 'single' as const,
      content: '以下代码的输出是什么？\ndef foo(x, y=2):\n    return x + y\nprint(foo(3))',
      options: [
        { label: 'A', text: '5', isCorrect: true },
        { label: 'B', text: '3', isCorrect: false },
        { label: 'C', text: '报错', isCorrect: false },
        { label: 'D', text: 'None', isCorrect: false }
      ],
      answer: true,
      explanation: 'y=2是默认参数，调用foo(3)时x=3, y使用默认值2，返回3+2=5。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 3,
      type: 'multiple' as const,
      content: '以下关于Python函数的说法正确的有？（多选）',
      options: [
        { label: 'A', text: '可以使用*args接收任意数量的位置参数', isCorrect: true },
        { label: 'B', text: '可以使用**kwargs接收任意数量的关键字参数', isCorrect: true },
        { label: 'C', text: '函数内可以定义嵌套函数', isCorrect: true },
        { label: 'D', text: 'Python不支持递归函数', isCorrect: false }
      ],
      answer: ['A', 'B', 'C'],
      explanation: 'Python完全支持递归函数，且支持闭包和嵌套函数定义。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 4,
      type: 'trueFalse' as const,
      content: 'Python中，import语句只能放在文件顶部。',
      options: [],
      answer: false,
      explanation: 'import语句可以放在任何位置，包括函数内部。但通常建议放在文件顶部。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 5,
      type: 'blank' as const,
      content: 'Python中，lambda函数又称为匿名函数，其语法为：lambda 参数: ___。',
      options: [],
      answer: ['表达式'],
      explanation: 'lambda函数只能包含一个表达式，不能包含语句。例如：lambda x: x * 2。',
      stableKey: genId()
    },

    // ========== 第四章 面向对象（4题） ==========
    {
      id: genId(), bankId, folderId: ch4, originalIndex: 1,
      type: 'single' as const,
      content: '以下代码的输出是什么？\nclass A:\n    def __init__(self):\n        self.x = 1\na = A()\nprint(a.x)',
      options: [
        { label: 'A', text: '1', isCorrect: true },
        { label: 'B', text: '0', isCorrect: false },
        { label: 'C', text: 'None', isCorrect: false },
        { label: 'D', text: '报错', isCorrect: false }
      ],
      answer: true,
      explanation: '__init__是构造函数，在创建对象时自动调用。self.x = 1为实例属性赋值。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch4, originalIndex: 2,
      type: 'multiple' as const,
      content: '以下关于Python面向对象的说法正确的有？（多选）',
      options: [
        { label: 'A', text: 'Python支持多重继承', isCorrect: true },
        { label: 'B', text: '__init__是构造函数', isCorrect: true },
        { label: 'C', text: '所有类默认继承自object', isCorrect: true },
        { label: 'D', text: 'Python不支持私有属性', isCorrect: false }
      ],
      answer: ['A', 'B', 'C'],
      explanation: 'Python通过命名约定（双下划线前缀）实现私有属性，如__name会被名称改写为_ClassName__name。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch4, originalIndex: 3,
      type: 'trueFalse' as const,
      content: 'Python中，子类可以重写父类的方法，这称为方法覆盖。',
      options: [],
      answer: true,
      explanation: '方法覆盖（Method Overriding）是面向对象编程的核心特性之一，子类定义同名方法即可覆盖父类方法。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch4, originalIndex: 4,
      type: 'shortAnswer' as const,
      content: '请简述Python中`self`参数的作用。',
      options: [],
      answer: 'self代表类的实例对象本身。在类的方法中，self作为第一个参数，用于访问实例的属性和其他方法。调用方法时，Python会自动将实例对象传递给self参数，不需要手动传入。',
      explanation: 'self不是Python关键字，可以使用其他名称，但约定俗成使用self。',
      stableKey: genId()
    }
  ]

  await db.questions.bulkAdd(questions)

  // ===== 示例费曼笔记 =====
  const notesRoot = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
  if (notesRoot) {
    const noteId = genId()
    const now = Date.now() - 86400000

    await db.notes.add({
      id: noteId,
      folderId: notesRoot.id,
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
