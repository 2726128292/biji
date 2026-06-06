import { db } from './db'
import type {
  PracticeSession,
  PracticeAnswer,
  PracticeConfig,
  PracticeReport,
  Question,
  AnswerResult,
  WrongBookQuestionRef
} from '@/types/database'
import { generateId } from '@/utils/index'
import { judgeAnswer } from '@/utils/questionJudge'

export class PracticeService {
  /** 创建练习会话 */
  async createSession(config: PracticeConfig): Promise<PracticeSession> {
    const now = Date.now()
    let targetWrongBookId: string | null = null

    // 如果需要创建或加入错题本
    if (config.wrongBookAction === 'create' && config.newWrongBookName) {
      const wb = await db.wrongBooks.add({
        id: generateId(),
        name: config.newWrongBookName,
        sourceType: config.sourceType === 'wrongBook' ? 'wrongBook' : 'bank',
        sourceId: config.sourceId,
        createdAt: now
      })
      targetWrongBookId = (await db.wrongBooks.get(wb))!.id
    } else if (config.wrongBookAction === 'join' && config.targetWrongBookId) {
      targetWrongBookId = config.targetWrongBookId
    }

    const session: PracticeSession = {
      id: generateId(),
      sourceType: config.sourceType,
      sourceId: config.sourceId,
      targetWrongBookId,
      mode: config.mode,
      status: 'active',
      startedAt: now,
      completedAt: null
    }

    await db.practiceSessions.add(session)
    return session
  }

  /** 获取题目队列 */
  async getQuestionQueue(session: PracticeSession): Promise<Question[]> {
    let questionIds: string[]

    if (session.sourceType === 'bank') {
      const questions = await db.questions.where({ bankId: session.sourceId }).toArray()
      questionIds = questions.map(q => q.id)
    } else if (session.sourceType === 'folder') {
      const questions = await db.questions.where({ folderId: session.sourceId }).toArray()
      questionIds = questions.map(q => q.id)
    } else {
      // 从错题本获取
      const refs = await db.wrongBookQuestionRefs
        .where({ wrongBookId: session.sourceId })
        .toArray()
      questionIds = refs.map(r => r.questionId)
    }

    // 获取完整题目对象
    const questions: Question[] = []
    for (const id of questionIds) {
      const q = await db.questions.get(id)
      if (q) questions.push(q)
    }

    return questions
  }

  /** 提交答案 */
  async submitAnswer(
    sessionId: string,
    question: Question,
    submittedAnswer: any
  ): Promise<{ answer: PracticeAnswer; result: AnswerResult }> {
    const result = judgeAnswer(question, submittedAnswer)
    const session = await db.practiceSessions.get(sessionId)
    if (!session) throw new Error('会话不存在')

    let addedToTarget = false

    // 答错时加入目标错题本
    if ((result === 'wrong' || result === 'unknown') && session.targetWrongBookId) {
      const existingRef = await db.wrongBookQuestionRefs
        .where({ wrongBookId: session.targetWrongBookId, questionId: question.id })
        .first()

      if (!existingRef) {
        await db.wrongBookQuestionRefs.add({
          id: generateId(),
          wrongBookId: session.targetWrongBookId,
          questionId: question.id,
          addedReason: result,
          originalFolderId: question.folderId,
          originalIndex: question.originalIndex,
          addedAt: Date.now(),
          wrongCount: 1
        })
        addedToTarget = true
      } else {
        // 已存在则增加答错次数
        await db.wrongBookQuestionRefs.update(existingRef.id, {
          wrongCount: existingRef.wrongCount + 1
        })
      }
    }

    const answer: PracticeAnswer = {
      id: generateId(),
      sessionId,
      questionId: question.id,
      submittedAnswer,
      result,
      addedToTarget,
      answeredAt: Date.now()
    }

    await db.practiceAnswers.add(answer)
    return { answer, result }
  }

  /** 标记不会 */
  async markUnknown(
    sessionId: string,
    question: Question
  ): Promise<PracticeAnswer> {
    return (await this.submitAnswer(sessionId, question, '__UNKNOWN__')).answer
  }

  /** 标记重点 */
  async markStarred(
    sessionId: string,
    question: Question
  ): Promise<PracticeAnswer> {
    const answer: PracticeAnswer = {
      id: generateId(),
      sessionId,
      questionId: question.id,
      submittedAnswer: '__STARRED__',
      result: 'correct',
      addedToTarget: false,
      answeredAt: Date.now()
    }
    await db.practiceAnswers.add(answer)
    return answer
  }

  /** 完成练习 */
  async completeSession(sessionId: string): Promise<PracticeSession> {
    await db.practiceSessions.update(sessionId, {
      status: 'completed',
      completedAt: Date.now()
    })
    const session = await db.practiceSessions.get(sessionId)!
    return session!
  }

  /** 放弃练习 */
  async abandonSession(sessionId: string): Promise<void> {
    await db.practiceSessions.update(sessionId, { status: 'abandoned' })
  }

  /** 获取报告 */
  async getReport(sessionId: string): Promise<PracticeReport> {
    const session = await db.practiceSessions.get(sessionId)
    if (!session) throw new Error('会话不存在')

    const answers = await db.practiceAnswers.where({ sessionId }).toArray()
    
    const correctCount = answers.filter(a => a.result === 'correct' && a.submittedAnswer !== '__STARRED__').length
    const wrongCount = answers.filter(a => a.result === 'wrong').length
    const unknownCount = answers.filter(a => a.result === 'unknown' || a.submittedAnswer === '__UNKNOWN__').length

    // 关联题目内容
    const enrichedAnswers = await Promise.all(
      answers.map(async (a) => {
        const q = await db.questions.get(a.questionId)
        return {
          ...a,
          questionContent: q ? q.content : '(题目已删除)'
        }
      })
    )

    return {
      sessionId,
      totalQuestions: answers.length,
      correctCount,
      wrongCount,
      unknownCount,
      accuracy: answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0,
      answers: enrichedAnswers
    }
  }
}

export const practiceService = new PracticeService()
