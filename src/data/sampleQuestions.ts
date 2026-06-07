import type { Question } from '@/types/database'

let _idCounter = 0
function genId() { return `sample_${++_idCounter}` }
function stableKey() { return `sk_${Math.random().toString(36).slice(2, 10)}` }

const genTrueFalse = (
  bankId: string, folderId: string, idx: number,
  content: string, answer: boolean, explanation: string
): Question => ({
  id: genId(), bankId, folderId, originalIndex: idx,
  type: 'trueFalse', content, options: [],
  answer, explanation, stableKey: stableKey()
})

const genSingle = (
  bankId: string, folderId: string, idx: number,
  content: string, options: { l: string; t: string; c: boolean }[],
  explanation: string
): Question => ({
  id: genId(), bankId, folderId, originalIndex: idx,
  type: 'single', content,
  options: options.map(o => ({ label: o.l, text: o.t, isCorrect: o.c })),
  answer: true, explanation, stableKey: stableKey()
})

const genMultiple = (
  bankId: string, folderId: string, idx: number,
  content: string, options: { l: string; t: string; c: boolean }[],
  correctLabels: string[], explanation: string
): Question => ({
  id: genId(), bankId, folderId, originalIndex: idx,
  type: 'multiple', content,
  options: options.map(o => ({ label: o.l, text: o.t, isCorrect: o.c })),
  answer: correctLabels, explanation, stableKey: stableKey()
})

const genBlank = (
  bankId: string, folderId: string, idx: number,
  content: string, answer: string[], explanation: string
): Question => ({
  id: genId(), bankId, folderId, originalIndex: idx,
  type: 'blank', content, options: [],
  answer, explanation, stableKey: stableKey()
})

const genShort = (
  bankId: string, folderId: string, idx: number,
  content: string, answer: string, explanation: string
): Question => ({
  id: genId(), bankId, folderId, originalIndex: idx,
  type: 'shortAnswer', content, options: [],
  answer, explanation, stableKey: stableKey()
})

/** 生成500道Python题目 */
export function generateSampleQuestions(bankId: string, chapters: Record<string, string>): Question[] {
  _idCounter = 0
  const qs: Question[] = []
  const ch = (name: string) => {
    const fId = Object.entries(chapters).find(([_, v]) => v === name)?.[0]
    return fId || ''
  }

  let idx = 0
  function push(q: Question) { qs.push(q); idx++ }

  // ==================== 第1章 基础语法（55题）====================
  const c1 = ch('第一章 基础语法')
  // 变量命名（10题）
  push(genSingle(bankId, c1, ++idx, '以下哪个是合法的Python变量名？', [
    { l: 'A', t: '2name', c: false }, { l: 'B', t: 'my_name', c: true },
    { l: 'C', t: 'my-name', c: false }, { l: 'D', t: 'my name', c: false }
  ], '变量名只能包含字母、数字和下划线，不能以数字开头，不能包含连字符或空格。'))
  push(genSingle(bankId, c1, ++idx, '以下哪个Python变量名是合法的？', [
    { l: 'A', t: '_count', c: true }, { l: 'B', t: '1st_value', c: false },
    { l: 'C', t: 'for', c: false }, { l: 'D', t: 'my-var', c: false }
  ], '下划线开头是合法的；不能以数字开头；for是关键字；连字符不允许。'))
  push(genSingle(bankId, c1, ++idx, 'Python中，以下哪个是合法的标识符？', [
    { l: 'A', t: 'class', c: false }, { l: 'B', t: 'MyClass_1', c: true },
    { l: 'C', t: '123abc', c: false }, { l: 'D', t: 'try', c: false }
  ], 'class和try是关键字；不能以数字开头。'))
  push(genSingle(bankId, c1, ++idx, 'Python变量名区分大小写吗？', [
    { l: 'A', t: '区分', c: true }, { l: 'B', t: '不区分', c: false },
    { l: 'C', t: '仅首字母区分', c: false }, { l: 'D', t: '仅关键字不区分', c: false }
  ], 'Python是大小写敏感的语言，Name和name是不同的变量。'))
  push(genSingle(bankId, c1, ++idx, '以下Python命名哪个是合法的？', [
    { l: 'A', t: 'break', c: false }, { l: 'B', t: '__init__', c: true },
    { l: 'C', t: '123num', c: false }, { l: 'D', t: 'num 1', c: false }
  ], 'break是关键字；双下划线命名是合法的特殊方法名；不能以数字开头；不能有空格。'))
  push(genSingle(bankId, c1, ++idx, '在Python中，以下哪种命名风格通常用于常量？', [
    { l: 'A', t: 'MAX_VALUE', c: true }, { l: 'B', t: 'maxValue', c: false },
    { l: 'C', t: 'max_value', c: false }, { l: 'D', t: 'maxvalue', c: false }
  ], 'Python约定：全大写字母+下划线表示常量；驼峰用于类名；下划线小写用于变量/函数。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中变量必须先赋值才能使用。', true, 'Python变量不需要声明类型，但必须赋值后才能引用，否则会引发NameError。'))
  push(genTrueFalse(bankId, c1, ++idx, '在Python中，关键字可以作为变量名使用。', false, '关键字（如if、for、while等）是保留字，不能用作变量名。'))
  push(genSingle(bankId, c1, ++idx, '以下Python命名中哪个不合法？', [
    { l: 'A', t: 'value1', c: false }, { l: 'B', t: '_private', c: false },
    { l: 'C', t: 'import', c: true }, { l: 'D', t: 'data_set', c: false }
  ], 'import是Python关键字，不能用作变量名。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中，变量名可以由中文字符组成。', true, 'Python 3支持Unicode标识符，中文字符可以作为变量名。'))
  // 缩进与注释（5题）
  push(genSingle(bankId, c1, ++idx, 'Python中使用什么来表示代码块？', [
    { l: 'A', t: '花括号 {}', c: false }, { l: 'B', t: '缩进', c: true },
    { l: 'C', t: 'begin/end', c: false }, { l: 'D', t: '方括号 []', c: false }
  ], 'Python使用缩进来表示代码块，通常为4个空格。'))
  push(genSingle(bankId, c1, ++idx, 'Python中单行注释使用什么符号？', [
    { l: 'A', t: '//', c: false }, { l: 'B', t: '#', c: true },
    { l: 'C', t: '/*', c: false }, { l: 'D', t: '--', c: false }
  ], 'Python使用#表示单行注释，使用三引号表示多行注释。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中同一代码块的语句必须保持相同的缩进级别。', true, 'Python强制要求同一代码块的缩进一致，否则会引发IndentationError。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python的多行注释使用/* */。', false, 'Python没有专门的/* */多行注释语法。可以使用三引号字符串作为多行注释的代替。'))
  push(genBlank(bankId, c1, ++idx, 'Python官方推荐的缩进方式是使用___个空格。', ['4'], 'PEP 8建议每个缩进级别使用4个空格。'))
  // print()与input()（5题）
  push(genSingle(bankId, c1, ++idx, 'print("Hello", "World")的输出是什么？', [
    { l: 'A', t: 'HelloWorld', c: false },
    { l: 'B', t: 'Hello World', c: true },
    { l: 'C', t: 'Hello\\nWorld', c: false },
    { l: 'D', t: '("Hello", "World")', c: false }
  ], 'print()默认用空格分隔多个参数。'))
  push(genSingle(bankId, c1, ++idx, 'print("A\\nB")会输出什么？', [
    { l: 'A', t: 'A\\nB', c: false },
    { l: 'B', t: 'A（换行）B', c: true },
    { l: 'C', t: 'AB', c: false },
    { l: 'D', t: '错误', c: false }
  ], '\\n是换行转义符，会在输出中产生换行。'))
  push(genTrueFalse(bankId, c1, ++idx, 'input()函数返回的数据类型是字符串。', true, 'input()始终返回字符串，如果需要其他类型必须手动转换。'))
  push(genBlank(bankId, c1, ++idx, 'print()函数中，参数___用于指定多个输出之间的分隔符。', ['sep'], 'sep参数默认为空格，可通过sep=""去掉空格。'))
  push(genBlank(bankId, c1, ++idx, 'print()函数中，参数___用于指定输出结尾字符。', ['end'], 'end参数默认为换行符\\n。'))
  // 基础运算（10题）
  push(genSingle(bankId, c1, ++idx, 'print(5 // 2) 的输出是？', [
    { l: 'A', t: '2.5', c: false }, { l: 'B', t: '2', c: true },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '2.0', c: false }
  ], '//是地板除（整除）运算符，返回商的整数部分。'))
  push(genSingle(bankId, c1, ++idx, 'print(10 % 3) 的输出是？', [
    { l: 'A', t: '3', c: false }, { l: 'B', t: '1', c: true },
    { l: 'C', t: '0', c: false }, { l: 'D', t: '3.33', c: false }
  ], '%是取模（求余）运算符，10除以3余1。'))
  push(genSingle(bankId, c1, ++idx, 'print(2 ** 5) 的输出是？', [
    { l: 'A', t: '10', c: false }, { l: 'B', t: '32', c: true },
    { l: 'C', t: '25', c: false }, { l: 'D', t: '7', c: false }
  ], '**是幂运算运算符，2的5次方等于32。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中/运算符总是返回浮点数。', true, '即使两个整数相除，/也返回浮点数。例如 4/2 结果是 2.0。'))
  push(genSingle(bankId, c1, ++idx, '以下代码的输出是什么？\\nx = 5\\nx += 3\\nprint(x)', [
    { l: 'A', t: '5', c: false }, { l: 'B', t: '8', c: true },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '53', c: false }
  ], 'x += 3 等价于 x = x + 3，结果是 8。'))
  push(genSingle(bankId, c1, ++idx, 'print(3 ** 3) 的输出是？', [
    { l: 'A', t: '6', c: false }, { l: 'B', t: '9', c: false },
    { l: 'C', t: '27', c: true }, { l: 'D', t: '81', c: false }
  ], '3的3次方等于27。'))
  push(genSingle(bankId, c1, ++idx, 'print(15 // 4) 的输出是？', [
    { l: 'A', t: '3.75', c: false }, { l: 'B', t: '3', c: true },
    { l: 'C', t: '4', c: false }, { l: 'D', t: '3.0', c: false }
  ], '15除以4的整数部分是3。'))
  push(genSingle(bankId, c1, ++idx, 'print(17 % 5) 的输出是？', [
    { l: 'A', t: '3', c: false }, { l: 'B', t: '2', c: true },
    { l: 'C', t: '1', c: false }, { l: 'D', t: '5', c: false }
  ], '17除以5余2。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中 ** 的优先级高于 *。', true, '幂运算**优先级高于乘法*、除法/和取模%。'))
  push(genSingle(bankId, c1, ++idx, 'print(3 + 4 * 2) 的输出是？', [
    { l: 'A', t: '14', c: false }, { l: 'B', t: '11', c: true },
    { l: 'C', t: '10', c: false }, { l: 'D', t: '24', c: false }
  ], '乘法优先级高于加法，4*2=8，3+8=11。'))
  // 数据类型（10题）
  push(genSingle(bankId, c1, ++idx, 'type(3.14)的结果是？', [
    { l: 'A', t: "<class 'int'>", c: false }, { l: 'B', t: "<class 'float'>", c: true },
    { l: 'C', t: "<class 'str'>", c: false }, { l: 'D', t: "<class 'number'>", c: false }
  ], '3.14是浮点数类型float。'))
  push(genSingle(bankId, c1, ++idx, 'type("123")的结果是？', [
    { l: 'A', t: "<class 'int'>", c: false }, { l: 'B', t: "<class 'str'>", c: true },
    { l: 'C', t: "<class 'number'>", c: false }, { l: 'D', t: "<class 'float'>", c: false }
  ], '被引号括起来的内容是字符串类型str。'))
  push(genSingle(bankId, c1, ++idx, 'type(True)的结果是？', [
    { l: 'A', t: "<class 'str'>", c: false }, { l: 'B', t: "<class 'bool'>", c: true },
    { l: 'C', t: "<class 'int'>", c: false }, { l: 'D', t: "<class 'None'>", c: false }
  ], 'True和False是布尔类型bool。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中布尔值True可以参与整数运算。', true, 'bool是int的子类，True=1，False=0，可以参与算术运算。'))
  push(genSingle(bankId, c1, ++idx, 'type(None)的结果是？', [
    { l: 'A', t: "<class 'None'>", c: false }, { l: 'B', t: "<class 'NoneType'>", c: true },
    { l: 'C', t: "<class 'null'>", c: false }, { l: 'D', t: "<class 'undefined'>", c: false }
  ], 'None是NoneType类型的唯一值，表示空或无。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python是一种强类型语言。', true, 'Python是强类型语言，不会自动进行隐式类型转换（如"1"+2会报错）。'))
  push(genSingle(bankId, c1, ++idx, 'int(3.9)的结果是？', [
    { l: 'A', t: '3', c: true }, { l: 'B', t: '4', c: false },
    { l: 'C', t: '3.0', c: false }, { l: 'D', t: '错误', c: false }
  ], 'int()转换为整数时直接截断小数部分，不入舍。'))
  push(genSingle(bankId, c1, ++idx, 'float("3.14")的结果是？', [
    { l: 'A', t: "'3.14'", c: false }, { l: 'B', t: '3.14', c: true },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '错误', c: false }
  ], 'float()可以将数字字符串转换为浮点数。'))
  push(genTrueFalse(bankId, c1, ++idx, 'str(100)的结果是字符串"100"。', true, 'str()将任意对象转换为字符串表示。'))
  push(genMultiple(bankId, c1, ++idx, '以下哪些是Python的内置数据类型？（多选）', [
    { l: 'A', t: 'int', c: true }, { l: 'B', t: 'float', c: true },
    { l: 'C', t: 'char', c: false }, { l: 'D', t: 'bool', c: true }
  ], ['A', 'B', 'D'], 'Python没有char类型，单个字符也是字符串。int/float/bool都是内置类型。'))
  // 关键字（5题）
  push(genSingle(bankId, c1, ++idx, '以下哪个是Python关键字？', [
    { l: 'A', t: 'define', c: false }, { l: 'B', t: 'lambda', c: true },
    { l: 'C', t: 'function', c: false }, { l: 'D', t: 'null', c: false }
  ], 'lambda是Python关键字，用于创建匿名函数。'))
  push(genSingle(bankId, c1, ++idx, '以下哪个不是Python关键字？', [
    { l: 'A', t: 'elif', c: false }, { l: 'B', t: 'const', c: true },
    { l: 'C', t: 'global', c: false }, { l: 'D', t: 'pass', c: false }
  ], 'const不是Python关键字（Python没有常量关键字）。'))
  push(genTrueFalse(bankId, c1, ++idx, 'True和False是Python 3的关键字。', true, 'True和False在Python 3中是保留关键字，不能用作变量名。'))
  push(genMultiple(bankId, c1, ++idx, '以下哪些是Python的关键字？（多选）', [
    { l: 'A', t: 'yield', c: true }, { l: 'B', t: 'import', c: true },
    { l: 'C', t: 'async', c: true }, { l: 'D', t: 'array', c: false }
  ], ['A', 'B', 'C'], 'array不是Python关键字，它是内置模块array的名称。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中pass关键字用于定义空代码块。', true, 'pass是空操作语句，用于语法上需要语句但不需要执行任何操作的地方。'))
  // 类型转换（10题）
  push(genSingle(bankId, c1, ++idx, 'bool(0)的结果是？', [
    { l: 'A', t: 'True', c: false }, { l: 'B', t: 'False', c: true },
    { l: 'C', t: '0', c: false }, { l: 'D', t: 'None', c: false }
  ], '数字0、空字符串、空列表等在布尔上下文中被视为False。'))
  push(genSingle(bankId, c1, ++idx, 'bool("False")的结果是？', [
    { l: 'A', t: 'False', c: false }, { l: 'B', t: 'True', c: true },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '错误', c: false }
  ], '非空字符串"False"在布尔上下文中为True（只有空字符串""为False）。'))
  push(genTrueFalse(bankId, c1, ++idx, '空列表[]在布尔上下文中被视为False。', true, '在Python中，空列表、空字典、空集合等空容器都为False。'))
  push(genSingle(bankId, c1, ++idx, 'list("abc")的结果是？', [
    { l: 'A', t: "['a', 'b', 'c']", c: true },
    { l: 'B', t: "['abc']", c: false },
    { l: 'C', t: '["a", "b", "c"]', c: false },
    { l: 'D', t: "('a', 'b', 'c')", c: false }
  ], 'list()将可迭代对象转换为列表，每个字符成为列表的一个元素。'))
  push(genSingle(bankId, c1, ++idx, 'tuple([1, 2, 3])的结果是？', [
    { l: 'A', t: '[1, 2, 3]', c: false }, { l: 'B', t: '(1, 2, 3)', c: true },
    { l: 'C', t: '{1, 2, 3}', c: false }, { l: 'D', t: '错误', c: false }
  ], 'tuple()将列表转换为元组。'))
  push(genSingle(bankId, c1, ++idx, 'int("1010", 2)的结果是？', [
    { l: 'A', t: '1010', c: false }, { l: 'B', t: '10', c: true },
    { l: 'C', t: '2', c: false }, { l: 'D', t: '12', c: false }
  ], 'int()的第二个参数指定进制，二进制1010等于十进制10。'))
  push(genSingle(bankId, c1, ++idx, 'hex(255)的结果是？', [
    { l: 'A', t: "'0xff'", c: true }, { l: 'B', t: "'255'", c: false },
    { l: 'C', t: "'0x255'", c: false }, { l: 'D', t: "'ff'", c: false }
  ], 'hex()将整数转换为十六进制字符串，255=0xff。'))
  push(genSingle(bankId, c1, ++idx, 'bin(7)的结果是？', [
    { l: 'A', t: "'0b111'", c: true }, { l: 'B', t: "'111'", c: false },
    { l: 'C', t: "'0x7'", c: false }, { l: 'D', t: "'7'", c: false }
  ], 'bin()将整数转换为二进制字符串，7=0b111。'))
  push(genTrueFalse(bankId, c1, ++idx, 'int("3.14")会正确返回整数3。', false, 'int("3.14")会引发ValueError，因为字符串包含小数点。应先用float()转换。'))
  push(genSingle(bankId, c1, ++idx, 'str([1, 2, 3])的结果是？', [
    { l: 'A', t: "'[1, 2, 3]'", c: true },
    { l: 'B', t: "'123'", c: false },
    { l: 'C', t: "'[1,2,3]'", c: false },
    { l: 'D', t: '错误', c: false }
  ], 'str()将列表转换为它的字符串表示形式。'))

  // ==================== 第2章 字符串（45题）====================
  const c2 = ch('第二章 字符串操作')
  // 字符串基础（10题）
  push(genTrueFalse(bankId, c2, ++idx, 'Python中字符串是不可变类型。', true, '字符串一旦创建就不能修改，所有修改操作都会创建新字符串。'))
  push(genSingle(bankId, c2, ++idx, '\'Hello\' + \' World\'的结果是？', [
    { l: 'A', t: "'Hello World'", c: true },
    { l: 'B', t: "'HelloWorld'", c: false },
    { l: 'C', t: "'Hello World '", c: false },
    { l: 'D', t: '错误', c: false }
  ], '+运算符用于字符串拼接，不自动添加空格。'))
  push(genSingle(bankId, c2, ++idx, "'Ha' * 3 的结果是？", [
    { l: 'A', t: "'HaHaHa'", c: true }, { l: 'B', t: "'HaHaHaHaHaHa'", c: false },
    { l: 'C', t: "'Ha3'", c: false }, { l: 'D', t: '错误', c: false }
  ], "*运算符用于重复字符串，'Ha'*3 = 'HaHaHa'。"))
  push(genTrueFalse(bankId, c2, ++idx, 'Python中可以用单引号或双引号定义字符串。', true, 'Python中单引号和双引号完全等价。'))
  push(genSingle(bankId, c2, ++idx, '三引号字符串主要用于什么场景？', [
    { l: 'A', t: '定义多行字符串', c: true },
    { l: 'B', t: '定义二进制数据', c: false },
    { l: 'C', t: '定义只读字符串', c: false },
    { l: 'D', t: '定义加密字符串', c: false }
  ], '三引号（\'\'\'或"""）用于定义多行字符串，也可以作为多行注释。'))
  push(genSingle(bankId, c2, ++idx, 'len("Hello")的结果是？', [
    { l: 'A', t: '4', c: false }, { l: 'B', t: '5', c: true },
    { l: 'C', t: '6', c: false }, { l: 'D', t: '3', c: false }
  ], 'len()返回字符串的长度（字符个数）。'))
  push(genTrueFalse(bankId, c2, ++idx, '"A" < "a" 返回True。', true, '字符串比较基于ASCII码，大写字母A(65)小于小写字母a(97)。'))
  push(genSingle(bankId, c2, ++idx, '"Python"[-1]的结果是？', [
    { l: 'A', t: "'P'", c: false }, { l: 'B', t: "'n'", c: true },
    { l: 'C', t: "'o'", c: false }, { l: 'D', t: "'h'", c: false }
  ], '负索引从右向左，-1是最后一个字符。'))
  push(genBlank(bankId, c2, ++idx, 'Python中用于获取字符串长度的内置函数是___。', ['len'], 'len()函数返回字符串、列表等容器的元素个数。'))
  push(genSingle(bankId, c2, ++idx, '"hello".capitalize()的结果是？', [
    { l: 'A', t: "'Hello'", c: true },
    { l: 'B', t: "'hello'", c: false },
    { l: 'C', t: "'HELLO'", c: false },
    { l: 'D', t: "'hELLO'", c: false }
  ], 'capitalize()将首字母大写，其余字母小写。'))
  // 字符串切片（10题）
  push(genSingle(bankId, c2, ++idx, '"Python"[0:3]的结果是？', [
    { l: 'A', t: "'Pyt'", c: true }, { l: 'B', t: "'Pyth'", c: false },
    { l: 'C', t: "'yth'", c: false }, { l: 'D', t: "'ython'", c: false }
  ], '切片[0:3]取索引0到2（不包含3），得到"Pyt"。'))
  push(genSingle(bankId, c2, ++idx, '"Python"[::2]的结果是？', [
    { l: 'A', t: "'Pto'", c: true }, { l: 'B', t: "'Phn'", c: false },
    { l: 'C', t: "'Python'", c: false }, { l: 'D', t: "'yhn'", c: false }
  ], '[::2]从开头到结尾，步长为2，取第0、2、4个字符。'))
  push(genSingle(bankId, c2, ++idx, '"Python"[::-1]的结果是？', [
    { l: 'A', t: "'nohtyP'", c: true }, { l: 'B', t: "'Python'", c: false },
    { l: 'C', t: "'P'", c: false }, { l: 'D', t: "'n'", c: false }
  ], '[::-1]使用负步长反转字符串。'))
  push(genSingle(bankId, c2, ++idx, '"Hello World"[6:]的结果是？', [
    { l: 'A', t: "'World'", c: true },
    { l: 'B', t: "'Hello'", c: false },
    { l: 'C', t: "'World '", c: false },
    { l: 'D', t: "'ello World'", c: false }
  ], '[6:]从索引6到结尾，空格在索引5，所以[6:]得到"World"。'))
  push(genSingle(bankId, c2, ++idx, '"Python"[:4]的结果是？', [
    { l: 'A', t: "'Pyth'", c: true }, { l: 'B', t: "'Pyt'", c: false },
    { l: 'C', t: "'ytho'", c: false }, { l: 'D', t: "'ython'", c: false }
  ], '[:4]从开头到索引3（不包含4）。'))
  push(genSingle(bankId, c2, ++idx, '"abcdef"[1:4:2]的结果是？', [
    { l: 'A', t: "'bd'", c: true }, { l: 'B', t: "'bce'", c: false },
    { l: 'C', t: "'ab'", c: false }, { l: 'D', t: "'ace'", c: false }
  ], '[1:4:2]从索引1到3，步长2，取索引1(b)和3(d)。'))
  push(genTrueFalse(bankId, c2, ++idx, '切片索引超出范围不会报错。', true, '切片操作中，超出范围的索引会被自动处理，不会引发错误。'))
  push(genBlank(bankId, c2, ++idx, 'Python切片语法完整形式是 [start:___:step]。', ['stop'], '切片语法为 [start:stop:step]，三个参数都是可选的。'))
  push(genSingle(bankId, c2, ++idx, '"Python"[-4:-1]的结果是？', [
    { l: 'A', t: "'tho'", c: true }, { l: 'B', t: "'ytho'", c: false },
    { l: 'C', t: "'th'", c: false }, { l: 'D', t: "'n'", c: false }
  ], '[-4:-1]从倒数第4到倒数第2，分别是t,h,o。'))
  push(genTrueFalse(bankId, c2, ++idx, '"Hello"[-5:]的结果是"Hello"。', true, '[-5:]从倒数第5到结尾，取了整个字符串。'))
  // 字符串方法（15题）
  push(genSingle(bankId, c2, ++idx, '"hello world".split()的结果是？', [
    { l: 'A', t: "['hello', 'world']", c: true },
    { l: 'B', t: "['hello world']", c: false },
    { l: 'C', t: "('hello', 'world')", c: false },
    { l: 'D', t: "['h','e','l','l','o',' ','w','o','r','l','d']", c: false }
  ], 'split()默认按空白字符分割字符串。'))
  push(genSingle(bankId, c2, ++idx, "'-'.join(['a', 'b', 'c'])的结果是？", [
    { l: 'A', t: "'a-b-c'", c: true }, { l: 'B', t: "'abc'", c: false },
    { l: 'C', t: "'a', 'b', 'c'", c: false }, { l: 'D', t: "'-a-b-c-'", c: false }
  ], 'join()用指定字符串连接列表元素。'))
  push(genSingle(bankId, c2, ++idx, '"Hello World".replace("World", "Python")的结果是？', [
    { l: 'A', t: "'Hello Python'", c: true },
    { l: 'B', t: "'Hello World'", c: false },
    { l: 'C', t: "'Python World'", c: false },
    { l: 'D', t: "'Hello'", c: false }
  ], 'replace()替换所有匹配的子串。'))
  push(genSingle(bankId, c2, ++idx, '"  hello  ".strip()的结果是？', [
    { l: 'A', t: "'hello'", c: true },
    { l: 'B', t: "'  hello'", c: false },
    { l: 'C', t: "'hello  '", c: false },
    { l: 'D', t: "'  hello  '", c: false }
  ], 'strip()移除字符串首尾的空白字符。'))
  push(genSingle(bankId, c2, ++idx, '"hello".upper()的结果是？', [
    { l: 'A', t: "'HELLO'", c: true }, { l: 'B', t: "'Hello'", c: false },
    { l: 'C', t: "'hello'", c: false }, { l: 'D', t: "'hELLO'", c: false }
  ], 'upper()将字符串转换为大写。'))
  push(genSingle(bankId, c2, ++idx, '"Hello".startswith("He")的结果是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '0', c: false }
  ], 'startswith()检查字符串是否以指定前缀开头。'))
  push(genSingle(bankId, c2, ++idx, '"123".isdigit()的结果是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '1', c: false }
  ], 'isdigit()检查字符串是否只包含数字字符。'))
  push(genSingle(bankId, c2, ++idx, '"abc123".isalpha()的结果是？', [
    { l: 'A', t: 'True', c: false }, { l: 'B', t: 'False', c: true },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '错误', c: false }
  ], 'isalpha()要求所有字符都是字母，数字不通过。'))
  push(genSingle(bankId, c2, ++idx, '"Hello".find("l")的结果是？', [
    { l: 'A', t: '1', c: false }, { l: 'B', t: '2', c: true },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '-1', c: false }
  ], 'find()返回子串首次出现的索引，找不到返回-1。"Hello"中l首次出现在索引2。'))
  push(genSingle(bankId, c2, ++idx, '"Hello".count("l")的结果是？', [
    { l: 'A', t: '1', c: false }, { l: 'B', t: '2', c: true },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '0', c: false }
  ], 'count()返回子串出现的次数。"Hello"中有两个l。'))
  push(genTrueFalse(bankId, c2, ++idx, '"\\t".isspace()返回True。', true, 'isspace()检测空白字符，制表符\\t、空格、换行符等都算空白。'))
  push(genSingle(bankId, c2, ++idx, '"hello world".title()的结果是？', [
    { l: 'A', t: "'Hello World'", c: true },
    { l: 'B', t: "'Hello world'", c: false },
    { l: 'C', t: "'hello world'", c: false },
    { l: 'D', t: "'HELLO WORLD'", c: false }
  ], 'title()将每个单词的首字母大写。'))
  push(genSingle(bankId, c2, ++idx, '"123".zfill(5)的结果是？', [
    { l: 'A', t: "'00123'", c: true }, { l: 'B', t: "'12300'", c: false },
    { l: 'C', t: "'   123'", c: false }, { l: 'D', t: "'0000123'", c: false }
  ], 'zfill()在左侧用0填充到指定宽度。'))
  push(genBlank(bankId, c2, ++idx, '字符串方法split()默认的分隔符是___。', ['空白字符', '空格'], '不传参数时split()按任意空白字符分割，并自动去除空字符串。'))
  push(genTrueFalse(bankId, c2, ++idx, '字符串的replace()方法会修改原字符串。', false, '字符串是不可变的，replace()返回新字符串，原字符串不变。'))
  // f-string与格式化（10题）
  push(genSingle(bankId, c2, ++idx, 'name = "Python"; f"Hello {name}"的结果是？', [
    { l: 'A', t: "'Hello Python'", c: true },
    { l: 'B', t: "'Hello {name}'", c: false },
    { l: 'C', t: "'Hello name'", c: false },
    { l: 'D', t: '错误', c: false }
  ], 'f-string用花括号插入变量值。'))
  push(genSingle(bankId, c2, ++idx, 'x = 3.14159; f"{x:.2f}"的结果是？', [
    { l: 'A', t: "'3.14'", c: true }, { l: 'B', t: "'3.14159'", c: false },
    { l: 'C', t: "'3.142'", c: false }, { l: 'D', t: "'03.14'", c: false }
  ], ':.2f表示保留两位小数。'))
  push(genSingle(bankId, c2, ++idx, 'x = 42; f"{x:04d}"的结果是？', [
    { l: 'A', t: "'0042'", c: true }, { l: 'B', t: "'42'", c: false },
    { l: 'C', t: "'0042d'", c: false }, { l: 'D', t: "' 42'", c: false }
  ], ':04d表示至少4位数字，不足前面补0。'))
  push(genTrueFalse(bankId, c2, ++idx, 'Python 3.6及以上版本支持f-string。', true, 'f-string从Python 3.6开始引入，是推荐的字符串格式化方式。'))
  push(genSingle(bankId, c2, ++idx, '"{} + {} = {}".format(1, 2, 3)的结果是？', [
    { l: 'A', t: "'1 + 2 = 3'", c: true },
    { l: 'B', t: "'{} + {} = {}'", c: false },
    { l: 'C', t: "'1 + 2 = 3 '", c: false },
    { l: 'D', t: '错误', c: false }
  ], 'format()按顺序填入花括号占位符。'))
  push(genSingle(bankId, c2, ++idx, 'name = "Tom"; f"Hello {name.upper()}"的结果是？', [
    { l: 'A', t: "'Hello TOM'", c: true },
    { l: 'B', t: "'Hello {name.upper()}'", c: false },
    { l: 'C', t: "'Hello Tom'", c: false },
    { l: 'D', t: "'Hello tom'", c: false }
  ], 'f-string中花括号内可以使用表达式。'))
  push(genSingle(bankId, c2, ++idx, '"%s is %d years old" % ("Tom", 20)的结果是？', [
    { l: 'A', t: "'Tom is 20 years old'", c: true },
    { l: 'B', t: "'%s is %d years old'", c: false },
    { l: 'C', t: "''", c: false },
    { l: 'D', t: '错误', c: false }
  ], '%格式化是Python早期的字符串格式化方式，%s表示字符串，%d表示整数。'))
  push(genTrueFalse(bankId, c2, ++idx, 'f-string中不能使用字典的键。', false, 'f-string中可以包含任何有效Python表达式，包括 dict["key"]。'))
  push(genBlank(bankId, c2, ++idx, 'Python 3中推荐的字符串格式化方式是___。', ['f-string', 'f字符串'], 'PEP 498引入的f-string是Python 3.6+推荐的字符串格式化方式。'))
  push(genSingle(bankId, c2, ++idx, 'x = 1234.5678; f"{x:,.2f}"的结果是？', [
    { l: 'A', t: "'1,234.57'", c: true },
    { l: 'B', t: "'1234.57'", c: false },
    { l: 'C', t: "'1,234.56'", c: false },
    { l: 'D', t: "'1,234.5678'", c: false }
  ], ':,.2f表示千位分隔符加两位小数，并四舍五入。'))

  // ==================== 第3章 列表与元组（50题）====================
  const c3 = ch('第三章 列表与元组')
  // 列表基础（15题）
  push(genSingle(bankId, c3, ++idx, '[1, 2, 3] + [4, 5]的结果是？', [
    { l: 'A', t: '[1, 2, 3, 4, 5]', c: true },
    { l: 'B', t: '[5, 7, 3]', c: false },
    { l: 'C', t: '[[1,2,3],[4,5]]', c: false },
    { l: 'D', t: '错误', c: false }
  ], '+运算符连接两个列表。'))
  push(genSingle(bankId, c3, ++idx, '[1, 2] * 3的结果是？', [
    { l: 'A', t: '[1, 2, 1, 2, 1, 2]', c: true },
    { l: 'B', t: '[3, 6]', c: false },
    { l: 'C', t: '[[1,2],[1,2],[1,2]]', c: false },
    { l: 'D', t: '错误', c: false }
  ], '*运算符重复列表元素。'))
  push(genTrueFalse(bankId, c3, ++idx, '列表是可变数据类型。', true, '列表支持增删改操作，是典型的可变类型。'))
  push(genSingle(bankId, c3, ++idx, 'list1 = [1, 2, 3]; list1.append(4); print(list1)', [
    { l: 'A', t: '[1, 2, 3, 4]', c: true },
    { l: 'B', t: '[4, 1, 2, 3]', c: false },
    { l: 'C', t: '[1, 2, 3]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'append()在列表末尾添加元素。'))
  push(genSingle(bankId, c3, ++idx, 'list1 = [1, 2, 3]; list1.insert(0, 0); print(list1)', [
    { l: 'A', t: '[0, 1, 2, 3]', c: true },
    { l: 'B', t: '[1, 2, 3, 0]', c: false },
    { l: 'C', t: '[1, 0, 2, 3]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'insert(index, value)在指定位置插入元素。'))
  push(genSingle(bankId, c3, ++idx, '[3, 1, 2].sort(); print([3, 1, 2].sort())的结果是？', [
    { l: 'A', t: 'None', c: true },
    { l: 'B', t: '[1, 2, 3]', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: '[]', c: false }
  ], 'sort()方法就地排序并返回None。注意代码中两次调用了sort()，第二次对已排序列表再次sort()返回None。'))
  push(genSingle(bankId, c3, ++idx, 'sorted([3, 1, 2])的结果是？', [
    { l: 'A', t: '[1, 2, 3]', c: true },
    { l: 'B', t: '[3, 1, 2]', c: false },
    { l: 'C', t: 'None', c: false },
    { l: 'D', t: '(1, 2, 3)', c: false }
  ], 'sorted()返回新排序列表，原列表不变。'))
  push(genSingle(bankId, c3, ++idx, 'list1 = [1, 2, 3]; list1.pop()返回什么？', [
    { l: 'A', t: '3', c: true }, { l: 'B', t: '[1, 2]', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '1', c: false }
  ], 'pop()移除并返回最后一个元素。'))
  push(genSingle(bankId, c3, ++idx, 'list1 = [1, 2, 3]; list1.remove(2); print(list1)', [
    { l: 'A', t: '[1, 3]', c: true },
    { l: 'B', t: '[1, 2]', c: false },
    { l: 'C', t: '[2, 3]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'remove()移除第一个匹配的元素。'))
  push(genTrueFalse(bankId, c3, ++idx, 'pop()不传参数时移除最后一个元素。', true, 'pop()默认移除最后一个元素；pop(index)移除指定位置的元素。'))
  push(genSingle(bankId, c3, ++idx, '[1, 2, 3, 2].index(2)的结果是？', [
    { l: 'A', t: '0', c: false }, { l: 'B', t: '1', c: true },
    { l: 'C', t: '2', c: false }, { l: 'D', t: '3', c: false }
  ], 'index()返回第一个匹配的索引，元素2首次出现在索引1。'))
  push(genTrueFalse(bankId, c3, ++idx, 'list.clear()方法清空列表所有元素。', true, 'clear()移除列表所有元素，变为空列表。'))
  push(genSingle(bankId, c3, ++idx, 'list1 = [1, 2, 3]; list1.extend([4, 5]); print(list1)', [
    { l: 'A', t: '[1, 2, 3, 4, 5]', c: true },
    { l: 'B', t: '[[1,2,3],4,5]', c: false },
    { l: 'C', t: '[[1,2,3],[4,5]]', c: false },
    { l: 'D', t: '[4, 5, 1, 2, 3]', c: false }
  ], 'extend()将另一个可迭代对象的元素逐个添加到列表末尾。'))
  push(genBlank(bankId, c3, ++idx, '列表推导式 [x**2 for x in range(5)] 的结果是___。', ['[0, 1, 4, 9, 16]'], 'range(5)生成0-4，每个数的平方。'))
  push(genMultiple(bankId, c3, ++idx, '以下哪些是列表的方法？（多选）', [
    { l: 'A', t: 'append', c: true }, { l: 'B', t: 'split', c: false },
    { l: 'C', t: 'reverse', c: true }, { l: 'D', t: 'count', c: true }
  ], ['A', 'C', 'D'], 'split()是字符串方法，不是列表方法。'))
  // 列表高级操作（15题）
  push(genSingle(bankId, c3, ++idx, 'any([False, True, False])的结果是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '1', c: false }
  ], 'any()在可迭代对象中任一元素为True时返回True。'))
  push(genSingle(bankId, c3, ++idx, 'all([1, 2, 3])的结果是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '3', c: false }
  ], 'all()在所有元素都为True时返回True（非零数字为True）。'))
  push(genSingle(bankId, c3, ++idx, 'list(range(5))的结果是？', [
    { l: 'A', t: '[0,1,2,3,4]', c: true },
    { l: 'B', t: '[1,2,3,4,5]', c: false },
    { l: 'C', t: '[0,1,2,3,4,5]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'range(5)生成0到4的整数序列。'))
  push(genSingle(bankId, c3, ++idx, 'list(range(2, 6))的结果是？', [
    { l: 'A', t: '[2, 3, 4, 5]', c: true },
    { l: 'B', t: '[2, 3, 4, 5, 6]', c: false },
    { l: 'C', t: '[2, 6]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'range(2, 6)生成2到5的整数。'))
  push(genSingle(bankId, c3, ++idx, 'list(range(0, 10, 3))的结果是？', [
    { l: 'A', t: '[0, 3, 6, 9]', c: true },
    { l: 'B', t: '[0, 3, 6]', c: false },
    { l: 'C', t: '[3, 6, 9]', c: false },
    { l: 'D', t: '[0, 3, 6, 9, 12]', c: false }
  ], 'range(0, 10, 3)从0到9，步长为3。'))
  push(genTrueFalse(bankId, c3, ++idx, '列表可以作为字典的键。', false, '字典键必须是可哈希的不可变类型，列表是可变类型，不能作为键。'))
  push(genSingle(bankId, c3, ++idx, 'a = [1, 2, 3]; b = a; b[0] = 99; print(a[0])', [
    { l: 'A', t: '99', c: true }, { l: 'B', t: '1', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], '列表赋值是引用传递，b和a指向同一个列表。'))
  push(genSingle(bankId, c3, ++idx, 'a = [1, 2, 3]; b = a.copy(); b[0] = 99; print(a[0])', [
    { l: 'A', t: '99', c: false }, { l: 'B', t: '1', c: true },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], 'copy()创建浅拷贝，b的修改不影响a。'))
  push(genTrueFalse(bankId, c3, ++idx, 'enumerate()函数同时返回索引和元素。', true, 'enumerate()返回(index, value)的元组序列。'))
  push(genSingle(bankId, c3, ++idx, 'list(zip([1, 2], ["a", "b"]))的结果是？', [
    { l: 'A', t: '[(1, "a"), (2, "b")]', c: true },
    { l: 'B', t: '[[1, "a"], [2, "b"]]', c: false },
    { l: 'C', t: '[(1, 2), ("a", "b")]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'zip()将多个可迭代对象按索引配对。'))
  push(genMultiple(bankId, c3, ++idx, '以下哪些可以用来复制列表？（多选）', [
    { l: 'A', t: 'list.copy()', c: true },
    { l: 'B', t: 'list[:]', c: true },
    { l: 'C', t: 'list(list)', c: true },
    { l: 'D', t: 'copy(list)', c: true }
  ], ['A', 'B', 'C', 'D'], '以上四种方式都可以创建列表的浅拷贝。'))
  push(genSingle(bankId, c3, ++idx, 'sum([1, 2, 3, 4, 5])的结果是？', [
    { l: 'A', t: '15', c: true }, { l: 'B', t: '10', c: false },
    { l: 'C', t: '120', c: false }, { l: 'D', t: '错误', c: false }
  ], 'sum()对可迭代对象的元素求和。'))
  push(genSingle(bankId, c3, ++idx, 'max([3, 7, 1, 9, 4])的结果是？', [
    { l: 'A', t: '9', c: true }, { l: 'B', t: '7', c: false },
    { l: 'C', t: '1', c: false }, { l: 'D', t: '错误', c: false }
  ], 'max()返回可迭代对象中的最大值。'))
  push(genSingle(bankId, c3, ++idx, 'min([3, 7, 1, 9, 4])的结果是？', [
    { l: 'A', t: '9', c: false }, { l: 'B', t: '7', c: false },
    { l: 'C', t: '1', c: true }, { l: 'D', t: '3', c: false }
  ], 'min()返回可迭代对象中的最小值。'))
  push(genTrueFalse(bankId, c3, ++idx, 'list.reverse()会返回一个新的反转列表。', false, 'reverse()就地反转列表，返回None。要返回新列表可用reversed()或[::-1]。'))
  // 元组（15题）
  push(genTrueFalse(bankId, c3, ++idx, '元组是不可变类型。', true, '元组一旦创建就不能修改（增删改元素都不支持）。'))
  push(genSingle(bankId, c3, ++idx, '创建一个包含一个元素的元组，正确的写法是？', [
    { l: 'A', t: '(1)', c: false }, { l: 'B', t: '(1,)', c: true },
    { l: 'C', t: 'tuple(1)', c: false }, { l: 'D', t: '[1]', c: false }
  ], '单元素元组需要在元素后加逗号，(1)会被解释为普通括号。'))
  push(genTrueFalse(bankId, c3, ++idx, '元组可以作为字典的键。', true, '元组是不可变类型且可哈希，因此可以作为字典键。'))
  push(genSingle(bankId, c3, ++idx, 'a, b = (1, 2); print(a)的结果是？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: '2', c: false },
    { l: 'C', t: '(1, 2)', c: false }, { l: 'D', t: '错误', c: false }
  ], '元组解包将(1, 2)分别赋值给a和b。'))
  push(genSingle(bankId, c3, ++idx, '(1, 2, 3) == (1, 2, 3)的结果是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], '元组比较是按元素逐个比较。'))
  push(genSingle(bankId, c3, ++idx, 'tuple([1, 2, 3])的结果是？', [
    { l: 'A', t: '(1, 2, 3)', c: true },
    { l: 'B', t: '[1, 2, 3]', c: false },
    { l: 'C', t: '{1, 2, 3}', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'tuple()将可迭代对象转换为元组。'))
  push(genMultiple(bankId, c3, ++idx, '以下关于元组的说法正确的有？（多选）', [
    { l: 'A', t: '元组是不可变的', c: true },
    { l: 'B', t: '元组可以包含不同类型元素', c: true },
    { l: 'C', t: '元组支持index()方法', c: true },
    { l: 'D', t: '元组支持append()方法', c: false }
  ], ['A', 'B', 'C'], '元组不支持修改方法（如append、remove等），但支持index()和count()。'))
  push(genTrueFalse(bankId, c3, ++idx, '元组的访问速度比列表快。', true, '由于元组不可变，Python在处理元组时可以做更多优化，访问速度略快于列表。'))
  push(genBlank(bankId, c3, ++idx, '创建元组的圆括号在某些情况下可以省略，这种特性称为___。', ['元组解包', '元组打包'], '例如 a = 1, 2, 3 自动创建元组(1, 2, 3)。'))
  push(genSingle(bankId, c3, ++idx, '"Hello" in ("Hello", "World")的结果是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '错误', c: false }
  ], 'in运算符检查元素是否存在于元组中。'))
  push(genTrueFalse(bankId, c3, ++idx, '元组中的可变元素（如列表）可以修改。', true, '元组的不可变性指的是元组本身的引用不可变，但元组中的可变元素（如列表）内容可以修改。'))
  push(genSingle(bankId, c3, ++idx, 't = (1, 2, [3, 4]); t[2].append(5); print(t)', [
    { l: 'A', t: '(1, 2, [3, 4, 5])', c: true },
    { l: 'B', t: '(1, 2, [3, 4])', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: '(1, 2, 5)', c: false }
  ], '元组中的列表元素可以修改其内容。'))
  push(genSingle(bankId, c3, ++idx, '(1, 2, 3).count(1)的结果是？', [
    { l: 'A', t: '0', c: false }, { l: 'B', t: '1', c: true },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '错误', c: false }
  ], 'count()返回元素出现的次数。'))
  push(genTrueFalse(bankId, c3, ++idx, 'sorted()函数对元组排序后返回一个新列表。', true, 'sorted()总是返回列表，即使输入是元组。'))
  push(genTrueFalse(bankId, c3, ++idx, '元组支持切片操作，结果仍是元组。', true, '元组切片返回一个新的元组。'))

  // ==================== 第4章 字典与集合（45题）====================
  const c4 = ch('第四章 字典与集合')
  // 字典基础（20题）
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1, "b": 2}; d.get("c", 0)的结果是？', [
    { l: 'A', t: 'None', c: false }, { l: 'B', t: '0', c: true },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '2', c: false }
  ], 'get()在键不存在时返回默认值，不报错。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1, "b": 2}; d["c"]会怎样？', [
    { l: 'A', t: '返回None', c: false },
    { l: 'B', t: '引发KeyError', c: true },
    { l: 'C', t: '返回0', c: false },
    { l: 'D', t: '自动创建键', c: false }
  ], '直接使用不存在的键会引发KeyError。'))
  push(genSingle(bankId, c4, ++idx, 'd = {}; d["key"] = "value"; print(d)', [
    { l: 'A', t: "{'key': 'value'}", c: true },
    { l: 'B', t: '{}', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: 'None', c: false }
  ], '字典赋值会自动创建新键。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1, "b": 2}; d.keys()的返回类型是？', [
    { l: 'A', t: 'list', c: false },
    { l: 'B', t: 'dict_keys', c: true },
    { l: 'C', t: 'tuple', c: false },
    { l: 'D', t: 'set', c: false }
  ], 'keys()返回dict_keys视图对象，不是列表。'))
  push(genTrueFalse(bankId, c4, ++idx, 'Python 3.7+中字典保持插入顺序。', true, '从Python 3.7开始，字典保证按插入顺序排列。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1}; "a" in d的结果是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '1', c: false }
  ], 'in运算符检查键是否存在于字典中。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1, "b": 2}; d.values()的返回类型是？', [
    { l: 'A', t: 'list', c: false },
    { l: 'B', t: 'dict_values', c: true },
    { l: 'C', t: 'set', c: false },
    { l: 'D', t: 'tuple', c: false }
  ], 'values()返回dict_values视图对象。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1, "b": 2}; d.items()的每个元素是？', [
    { l: 'A', t: '列表', c: false },
    { l: 'B', t: '元组(key, value)', c: true },
    { l: 'C', t: '集合', c: false },
    { l: 'D', t: '字符串', c: false }
  ], 'items()返回(key, value)元组的视图。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1}; d.pop("a")返回什么？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: "'a'", c: false }
  ], 'pop(key)移除并返回该键对应的值。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1, "b": 2}; d.popitem()返回什么？', [
    { l: 'A', t: "('b', 2)", c: true },
    { l: 'B', t: "'b'", c: false },
    { l: 'C', t: '2', c: false },
    { l: 'D', t: 'None', c: false }
  ], 'popitem()以元组形式移除并返回最后插入的键值对。'))
  push(genTrueFalse(bankId, c4, ++idx, '字典的键必须是不可变类型。', true, '字典要求键可哈希，不可变类型（如字符串、数字、元组）可以作为键。'))
  push(genMultiple(bankId, c4, ++idx, '以下哪些可以作为字典的键？（多选）', [
    { l: 'A', t: '字符串', c: true }, { l: 'B', t: '元组', c: true },
    { l: 'C', t: '列表', c: false }, { l: 'D', t: '整数', c: true }
  ], ['A', 'B', 'D'], '列表是可变类型，不可哈希，不能作为字典键。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1}; d.setdefault("b", 2); print(d)', [
    { l: 'A', t: "{'a': 1, 'b': 2}", c: true },
    { l: 'B', t: "{'a': 1}", c: false },
    { l: 'C', t: "{'b': 2}", c: false },
    { l: 'D', t: '错误', c: false }
  ], 'setdefault()在键不存在时设置默认值并返回，键已存在时返回原值。'))
  push(genSingle(bankId, c4, ++idx, 'd1 = {"a": 1}; d2 = {"b": 2}; d1.update(d2); print(d1)', [
    { l: 'A', t: "{'a': 1, 'b': 2}", c: true },
    { l: 'B', t: "{'a': 1}", c: false },
    { l: 'C', t: "{'b': 2}", c: false },
    { l: 'D', t: '错误', c: false }
  ], 'update()将另一个字典的键值对合并到当前字典。'))
  push(genTrueFalse(bankId, c4, ++idx, '字典推导式使用花括号语法。', true, '字典推导式语法为 {key: value for item in iterable}。'))
  push(genSingle(bankId, c4, ++idx, '{x: x**2 for x in range(4)}的结果是？', [
    { l: 'A', t: '{0: 0, 1: 1, 2: 4, 3: 9}', c: true },
    { l: 'B', t: '{0: 0, 1: 1, 2: 4, 3: 9, 4: 16}', c: false },
    { l: 'C', t: '{0, 1, 4, 9}', c: false },
    { l: 'D', t: '错误', c: false }
  ], '字典推导式生成0-3的平方映射。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1}; d.clear(); print(len(d))', [
    { l: 'A', t: '0', c: true }, { l: 'B', t: '1', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], 'clear()清空字典所有键值对。'))
  push(genBlank(bankId, c4, ++idx, '字典的fromkeys()类方法用于创建字典，所有键共享___值。', ['同一个', '相同'], 'dict.fromkeys(keys, value)创建字典，所有键指向同一个值对象。'))
  push(genTrueFalse(bankId, c4, ++idx, 'del d["key"]可以删除字典中的键值对。', true, 'del语句可以删除字典中指定键的键值对。'))
  push(genSingle(bankId, c4, ++idx, 'd = {"a": 1}; len(d)的结果是？', [
    { l: 'A', t: '0', c: false }, { l: 'B', t: '1', c: true },
    { l: 'C', t: '2', c: false }, { l: 'D', t: '错误', c: false }
  ], 'len()返回字典中键值对的数量。'))
  // 集合（15题）
  push(genTrueFalse(bankId, c4, ++idx, '集合中的元素不能重复。', true, '集合自动去重，每个元素只能出现一次。'))
  push(genSingle(bankId, c4, ++idx, '{1, 2, 3} | {3, 4, 5}的结果是？', [
    { l: 'A', t: '{1, 2, 3, 4, 5}', c: true },
    { l: 'B', t: '{3}', c: false },
    { l: 'C', t: '{1, 2, 3, 3, 4, 5}', c: false },
    { l: 'D', t: '错误', c: false }
  ], '|是集合并集运算符，返回所有不重复元素。'))
  push(genSingle(bankId, c4, ++idx, '{1, 2, 3} & {2, 3, 4}的结果是？', [
    { l: 'A', t: '{1, 2, 3, 4}', c: false },
    { l: 'B', t: '{2, 3}', c: true },
    { l: 'C', t: '{1, 4}', c: false },
    { l: 'D', t: '错误', c: false }
  ], '&是集合交集运算符，返回两个集合共有的元素。'))
  push(genSingle(bankId, c4, ++idx, '{1, 2, 3} - {2, 3}的结果是？', [
    { l: 'A', t: '{1}', c: true }, { l: 'B', t: '{2, 3}', c: false },
    { l: 'C', t: '{1, 2, 3}', c: false }, { l: 'D', t: '错误', c: false }
  ], '-是集合差集运算符，返回在第一个但不在第二个中的元素。'))
  push(genSingle(bankId, c4, ++idx, '{1, 2, 3} ^ {2, 3, 4}的结果是？', [
    { l: 'A', t: '{1, 4}', c: true },
    { l: 'B', t: '{2, 3}', c: false },
    { l: 'C', t: '{1, 2, 3, 4}', c: false },
    { l: 'D', t: '错误', c: false }
  ], '^是集合对称差集运算符，返回只在其中一个集合中的元素。'))
  push(genTrueFalse(bankId, c4, ++idx, '{1, 2} < {1, 2, 3}表示子集判定。', true, '<运算符检查左边集合是否是右边集合的真子集。'))
  push(genSingle(bankId, c4, ++idx, 's = {1, 2, 3}; s.add(4); print(s)', [
    { l: 'A', t: '{1, 2, 3, 4}', c: true },
    { l: 'B', t: '{4}', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: '{1, 2, 3}', c: false }
  ], 'add()向集合添加元素（如果已存在则不操作）。'))
  push(genSingle(bankId, c4, ++idx, 's = {1, 2, 3}; s.remove(2); print(s)', [
    { l: 'A', t: '{1, 3}', c: true },
    { l: 'B', t: '{1, 2, 3}', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: '{2}', c: false }
  ], 'remove()移除指定元素，不存在会引发KeyError。'))
  push(genSingle(bankId, c4, ++idx, 's = {1, 2, 3}; s.discard(5)会怎样？', [
    { l: 'A', t: '引发KeyError', c: false },
    { l: 'B', t: '什么都不做', c: true },
    { l: 'C', t: '删除其他元素', c: false },
    { l: 'D', t: '创建新元素', c: false }
  ], 'discard()移除指定元素，不存在时不报错。'))
  push(genMultiple(bankId, c4, ++idx, '以下集合操作中哪些会修改原集合？（多选）', [
    { l: 'A', t: 'add()', c: true },
    { l: 'B', t: 'remove()', c: true },
    { l: 'C', t: 'union()', c: false },
    { l: 'D', t: 'intersection()', c: false }
  ], ['A', 'B'], 'union()和intersection()返回新集合，不修改原集合。'))
  push(genTrueFalse(bankId, c4, ++idx, 'frozenset是不可变的集合。', true, 'frozenset与set类似但不可变，因此可以作为字典键。'))
  push(genBlank(bankId, c4, ++idx, '创建空集合需要使用___()，而不是直接用{}。', ['set'], '{}创建的是空字典，空集合必须用set()创建。'))
  push(genSingle(bankId, c4, ++idx, 'len({1, 2, 3, 2, 1})的结果是？', [
    { l: 'A', t: '5', c: false }, { l: 'B', t: '3', c: true },
    { l: 'C', t: '2', c: false }, { l: 'D', t: '错误', c: false }
  ], '集合自动去重，{1, 2, 3, 2, 1}等价于{1, 2, 3}。'))
  push(genSingle(bankId, c4, ++idx, 'set("abracadabra")的长度大约是？', [
    { l: 'A', t: '11', c: false }, { l: 'B', t: '5', c: true },
    { l: 'C', t: '7', c: false }, { l: 'D', t: '11', c: false }
  ], '字符串中不重复的字符有a,b,r,c,d共5个。'))
  push(genTrueFalse(bankId, c4, ++idx, '集合中的元素必须是可哈希的。', true, '集合要求元素可哈希，因此列表、字典等可变类型不能放入集合。'))

  // ==================== 第5章 控制流程（45题）====================
  const c5 = ch('第五章 控制流程')
  // if语句（10题）
  push(genSingle(bankId, c5, ++idx, 'x = 5\\nif x > 10:\\n    print("A")\\nelif x > 3:\\n    print("B")\\nelse:\\n    print("C")', [
    { l: 'A', t: 'A', c: false }, { l: 'B', t: 'B', c: true },
    { l: 'C', t: 'C', c: false }, { l: 'D', t: 'None', c: false }
  ], 'x=5大于3但不大于10，执行elif分支。'))
  push(genSingle(bankId, c5, ++idx, 'x = 0\\nif x:\\n    print("A")\\nelse:\\n    print("B")', [
    { l: 'A', t: 'A', c: false }, { l: 'B', t: 'B', c: true },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '错误', c: false }
  ], '0在布尔上下文中为False，执行else分支。'))
  push(genSingle(bankId, c5, ++idx, 'x = 15\\nif 10 < x < 20:\\n    print("yes")', [
    { l: 'A', t: "'yes'", c: true },
    { l: 'B', t: '什么也不输出', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: 'None', c: false }
  ], 'Python支持链式比较运算符，10 < 15 < 20为True。'))
  push(genTrueFalse(bankId, c5, ++idx, 'Python的if语句不需要括号。', true, 'Python中if条件不需要括号，但需要在条件后加冒号。'))
  push(genSingle(bankId, c5, ++idx, '以下代码会输出什么？\\nx = None\\nif x is None:\\n    print("N")', [
    { l: 'A', t: "'N'", c: true },
    { l: 'B', t: '不输出', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: 'None', c: false }
  ], 'is None用于检查对象是否是None。'))
  push(genTrueFalse(bankId, c5, ++idx, '在Python中，if条件中使用==比较浮点数可能会有精度问题。', true, '浮点数在比较时可能存在精度误差，建议使用abs(a-b) < 1e-10的方式。'))
  push(genSingle(bankId, c5, ++idx, 'x = 7\\nresult = "even" if x % 2 == 0 else "odd"\\nprint(result)', [
    { l: 'A', t: "'even'", c: false }, { l: 'B', t: "'odd'", c: true },
    { l: 'C', t: 'True', c: false }, { l: 'D', t: '错误', c: false }
  ], '三目运算符：条件为假时执行else部分。'))
  push(genTrueFalse(bankId, c5, ++idx, 'Python的elif相当于其他语言的else if。', true, 'elif是else if的缩写，减少了代码缩进层级。'))
  push(genBlank(bankId, c5, ++idx, 'Python中if语句的关键字顺序是 if - ___ - else。', ['elif'], 'elif可以有多个，但if和else最多一个。'))
  push(genSingle(bankId, c5, ++idx, 'x = []\\nif x:\\n    print("A")\\nelse:\\n    print("B")', [
    { l: 'A', t: 'A', c: false }, { l: 'B', t: 'B', c: true },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], '空列表在布尔上下文中为False。'))
  // for循环（15题）
  push(genSingle(bankId, c5, ++idx, 'for i in range(3):\\n    print(i, end=" ")\\n# 输出？', [
    { l: 'A', t: '0 1 2', c: true }, { l: 'B', t: '1 2 3', c: false },
    { l: 'C', t: '0 1 2 3', c: false }, { l: 'D', t: '1 2', c: false }
  ], 'range(3)生成0,1,2。'))
  push(genSingle(bankId, c5, ++idx, 'sum = 0\\nfor i in range(1, 6):\\n    sum += i\\nprint(sum)', [
    { l: 'A', t: '10', c: false }, { l: 'B', t: '15', c: true },
    { l: 'C', t: '21', c: false }, { l: 'D', t: '6', c: false }
  ], '1+2+3+4+5=15。'))
  push(genSingle(bankId, c5, ++idx, 'for i in range(1, 10, 2):\\n    print(i, end=" ")', [
    { l: 'A', t: '1 3 5 7 9', c: true },
    { l: 'B', t: '2 4 6 8', c: false },
    { l: 'C', t: '1 2 3 4 5 6 7 8 9', c: false },
    { l: 'D', t: '1 3 5 7 9 10', c: false }
  ], 'range(1, 10, 2)从1到9，步长为2。'))
  push(genTrueFalse(bankId, c5, ++idx, 'for循环可以遍历任何可迭代对象。', true, 'for循环适用于列表、字符串、元组、字典、集合、文件等可迭代对象。'))
  push(genSingle(bankId, c5, ++idx, 'for i, v in enumerate(["a", "b", "c"]):\\n    print(i, v)\\n# 第一次迭代输出？', [
    { l: 'A', t: '0 a', c: true },
    { l: 'B', t: '1 a', c: false },
    { l: 'C', t: 'a 0', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'enumerate()默认从0开始，返回(index, value)元组。'))
  push(genSingle(bankId, c5, ++idx, 'total = 0\\nfor i in range(4):\\n    if i == 2:\\n        continue\\n    total += i\\nprint(total)', [
    { l: 'A', t: '6', c: false }, { l: 'B', t: '4', c: true },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '7', c: false }
  ], 'continue跳过i=2，sum = 0+1+3 = 4。'))
  push(genSingle(bankId, c5, ++idx, 'for i in range(5):\\n    if i == 3:\\n        break\\n    print(i, end=" ")\\n# 输出？', [
    { l: 'A', t: '0 1 2', c: true },
    { l: 'B', t: '0 1 2 3', c: false },
    { l: 'C', t: '0 1 2 3 4', c: false },
    { l: 'D', t: '0 1 2 4', c: false }
  ], 'break在i==3时退出循环，所以输出0,1,2。'))
  push(genTrueFalse(bankId, c5, ++idx, 'for循环的else子句在循环正常结束时执行。', true, 'for...else中，else在循环没有被break中断时执行。'))
  push(genSingle(bankId, c5, ++idx, 'for i in range(3):\\n    pass\\nelse:\\n    print("done")\\n# 输出？', [
    { l: 'A', t: "'done'", c: true },
    { l: 'B', t: '不输出', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: 'None', c: false }
  ], '循环正常结束（没有被break中断），执行else子句。'))
  push(genSingle(bankId, c5, ++idx, 'd = {"a": 1, "b": 2}\\nfor k in d:\\n    print(k, end=" ")\\n# 输出？', [
    { l: 'A', t: "'a b'", c: true },
    { l: 'B', t: "'1 2'", c: false },
    { l: 'C', t: "'a 1 b 2'", c: false },
    { l: 'D', t: "('a', 'b')", c: false }
  ], '遍历字典默认遍历键。'))
  push(genMultiple(bankId, c5, ++idx, '以下哪些是循环控制语句？（多选）', [
    { l: 'A', t: 'break', c: true }, { l: 'B', t: 'exit', c: false },
    { l: 'C', t: 'continue', c: true }, { l: 'D', t: 'pass', c: false }
  ], ['A', 'C'], 'pass是空操作语句，不是循环控制；exit()是函数不是语句。'))
  push(genTrueFalse(bankId, c5, ++idx, 'range(1000000)不会一次性生成所有数字，而是惰性生成。', true, 'range()是惰性求值，只在需要时才生成下一个数字，节省内存。'))
  push(genSingle(bankId, c5, ++idx, 'list(range(3, 0, -1))的结果是？', [
    { l: 'A', t: '[3, 2, 1]', c: true },
    { l: 'B', t: '[3, 2, 1, 0]', c: false },
    { l: 'C', t: '[0, 1, 2, 3]', c: false },
    { l: 'D', t: '[]', c: false }
  ], 'range(3, 0, -1)从3递减到1。'))
  push(genBlank(bankId, c5, ++idx, 'for循环中用于退出循环的关键字是___。', ['break'], 'break立即退出当前循环。'))
  push(genSingle(bankId, c5, ++idx, '嵌套循环中，break只退出哪一层？', [
    { l: 'A', t: '最内层', c: true }, { l: 'B', t: '所有层', c: false },
    { l: 'C', t: '最外层', c: false }, { l: 'D', t: '随机一层', c: false }
  ], 'break只退出它所在的最内层循环。'))
  // while循环（10题）
  push(genSingle(bankId, c5, ++idx, 'i = 1\\nwhile i < 5:\\n    i *= 2\\nprint(i)\\n# 输出？', [
    { l: 'A', t: '8', c: true }, { l: 'B', t: '4', c: false },
    { l: 'C', t: '16', c: false }, { l: 'D', t: '10', c: false }
  ], '循环：i=1→2→4→8（8<5为False退出）。'))
  push(genSingle(bankId, c5, ++idx, 'x = 10\\nwhile x:\\n    x -= 3\\nprint(x)\\n# 输出？', [
    { l: 'A', t: '-2', c: true }, { l: 'B', t: '0', c: false },
    { l: 'C', t: '1', c: false }, { l: 'D', t: '10', c: false }
  ], '循环：x=10→7→4→1→-2（-2为False退出），输出-2。'))
  push(genTrueFalse(bankId, c5, ++idx, 'while循环可以使用else子句。', true, '与for循环类似，while...else在循环没有被break中断时执行else。'))
  push(genSingle(bankId, c5, ++idx, 'i = 0\\nwhile i < 3:\\n    i += 1\\nelse:\\n    print("end")\\n# 输出？', [
    { l: 'A', t: "'end'", c: true },
    { l: 'B', t: '不输出', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: '0 1 2 end', c: false }
  ], '循环正常结束，执行else子句。'))
  push(genTrueFalse(bankId, c5, ++idx, 'while True:会创建无限循环。', true, '条件始终为True，需要用break退出。'))
  push(genMultiple(bankId, c5, ++idx, '以下哪些可以作为while循环的条件表达式？（多选）', [
    { l: 'A', t: 'True', c: true },
    { l: 'B', t: 'x > 0', c: true },
    { l: 'C', t: 'my_list', c: true },
    { l: 'D', t: 'a and b', c: true }
  ], ['A', 'B', 'C', 'D'], '任何可以求值为布尔值的表达式都可以作为while条件。'))
  push(genBlank(bankId, c5, ++idx, 'while循环中用于跳到下一次迭代的关键字是___。', ['continue'], 'continue跳过本次循环剩余语句，进入下一次迭代。'))
  push(genSingle(bankId, c5, ++idx, 'count = 0\\nwhile True:\\n    count += 1\\n    if count >= 3:\\n        break\\nprint(count)\\n# 输出？', [
    { l: 'A', t: '3', c: true }, { l: 'B', t: '2', c: false },
    { l: 'C', t: '4', c: false }, { l: 'D', t: '1', c: false }
  ], '循环：count=1→2→3时break退出。'))
  push(genTrueFalse(bankId, c5, ++idx, 'while循环必须有一个能变为False的条件，否则会无限循环。', true, '如果没有合适的退出机制，while循环会无限执行下去。'))
  push(genSingle(bankId, c5, ++idx, '以下代码输出什么？\\nx = 5\\nwhile x > 0:\\n    x -= 1\\n    if x == 2:\\n        continue\\n    print(x, end=" ")', [
    { l: 'A', t: '4 3 1 0', c: true },
    { l: 'B', t: '4 3 2 1 0', c: false },
    { l: 'C', t: '5 4 3 1 0', c: false },
    { l: 'D', t: '4 3 2 1', c: false }
  ], 'x=5开始，每次减1，x=2时continue跳过，输出4,3,1,0。'))

  // ==================== 第6章 函数（60题）====================
  const c6 = ch('第六章 函数')
  // 定义与调用（10题）
  push(genSingle(bankId, c6, ++idx, 'Python函数定义使用什么关键字？', [
    { l: 'A', t: 'function', c: false }, { l: 'B', t: 'def', c: true },
    { l: 'C', t: 'func', c: false }, { l: 'D', t: 'define', c: false }
  ], 'Python使用def关键字定义函数。'))
  push(genTrueFalse(bankId, c6, ++idx, '函数定义时可以不写return语句。', true, '函数没有return时返回None。'))
  push(genSingle(bankId, c6, ++idx, 'def f(): pass\\nresult = f()\\nprint(result)\\n# 输出？', [
    { l: 'A', t: 'None', c: true }, { l: 'B', t: '0', c: false },
    { l: 'C', t: "''", c: false }, { l: 'D', t: '错误', c: false }
  ], '没有return语句的函数返回None。'))
  push(genSingle(bankId, c6, ++idx, 'def add(a, b):\\n    return a + b\\nprint(add(3, 4))\\n# 输出？', [
    { l: 'A', t: '7', c: true }, { l: 'B', t: '34', c: false },
    { l: 'C', t: '12', c: false }, { l: 'D', t: '错误', c: false }
  ], '函数add返回两个参数的和。'))
  push(genSingle(bankId, c6, ++idx, 'def f():\\n    return 1, 2\\na, b = f()\\nprint(a)\\n# 输出？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: '2', c: false },
    { l: 'C', t: '(1, 2)', c: false }, { l: 'D', t: '错误', c: false }
  ], '函数可以返回多个值（实际是返回元组），解包赋值。'))
  push(genTrueFalse(bankId, c6, ++idx, 'Python函数可以返回多个值。', true, 'Python函数通过返回元组可以实现多值返回。'))
  push(genSingle(bankId, c6, ++idx, 'def f(a, b):\\n    return a * b\\nprint(f(b=3, a=2))\\n# 输出？', [
    { l: 'A', t: '6', c: true }, { l: 'B', t: '5', c: false },
    { l: 'C', t: '23', c: false }, { l: 'D', t: '错误', c: false }
  ], '关键字参数可以不按顺序传递，a=2, b=3。'))
  push(genMultiple(bankId, c6, ++idx, '以下哪些是合法的函数参数传递方式？（多选）', [
    { l: 'A', t: '位置参数', c: true },
    { l: 'B', t: '关键字参数', c: true },
    { l: 'C', t: '默认参数', c: true },
    { l: 'D', t: '条件参数', c: false }
  ], ['A', 'B', 'C'], 'Python支持位置参数、关键字参数、默认参数、可变参数等。'))
  push(genTrueFalse(bankId, c6, ++idx, '函数定义中的参数可以有默认值。', true, '默认参数在函数定义时指定，调用时可以省略。'))
  push(genSingle(bankId, c6, ++idx, 'def f(x, y=10):\\n    return x + y\\nprint(f(5))\\n# 输出？', [
    { l: 'A', t: '15', c: true }, { l: 'B', t: '5', c: false },
    { l: 'C', t: '10', c: false }, { l: 'D', t: '错误', c: false }
  ], '默认参数y=10被使用，5+10=15。'))
  // 可变参数（10题）
  push(genSingle(bankId, c6, ++idx, 'def f(*args):\\n    return sum(args)\\nprint(f(1, 2, 3, 4))\\n# 输出？', [
    { l: 'A', t: '10', c: true }, { l: 'B', t: '6', c: false },
    { l: 'C', t: '24', c: false }, { l: 'D', t: '错误', c: false }
  ], '*args接收任意数量参数为元组，1+2+3+4=10。'))
  push(genSingle(bankId, c6, ++idx, 'def f(**kwargs):\\n    return kwargs\\nprint(f(a=1, b=2))\\n# 输出？', [
    { l: 'A', t: "{'a': 1, 'b': 2}", c: true },
    { l: 'B', t: '[1, 2]', c: false },
    { l: 'C', t: '((a, 1), (b, 2))', c: false },
    { l: 'D', t: '错误', c: false }
  ], '**kwargs接收关键字参数为字典。'))
  push(genTrueFalse(bankId, c6, ++idx, '*args接收的是关键字参数。', false, '*args接收额外的位置参数，**kwargs接收额外的关键字参数。'))
  push(genSingle(bankId, c6, ++idx, 'def f(a, *args, **kwargs):\\n    print(a, args, kwargs)\\nf(1, 2, 3, x=4, y=5)\\n# 输出？', [
    { l: 'A', t: "1 (2, 3) {'x': 4, 'y': 5}", c: true },
    { l: 'B', t: '错误', c: false },
    { l: 'C', t: "1 (1, 2, 3) {'x': 4, 'y': 5}", c: false },
    { l: 'D', t: "1 2 3 {'x': 4, 'y': 5}", c: false }
  ], 'a=1, *args接收额外位置参数(2,3), **kwargs接收关键字参数。'))
  push(genBlank(bankId, c6, ++idx, '接收任意数量位置参数的符号是___args。', ['*'], '*args将额外位置参数收集为元组。'))
  push(genBlank(bankId, c6, ++idx, '接收任意数量关键字参数的符号是___kwargs。', ['**'], '**kwargs将额外关键字参数收集为字典。'))
  push(genTrueFalse(bankId, c6, ++idx, '函数调用时，*list可以解包列表作为参数。', true, '例如 func(*[1,2,3]) 等价于 func(1,2,3)。'))
  push(genSingle(bankId, c6, ++idx, 'def f(a, b, c):\\n    return a + b + c\\nprint(f(*[1, 2, 3]))\\n# 输出？', [
    { l: 'A', t: '6', c: true }, { l: 'B', t: '[1, 2, 3]', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '123', c: false }
  ], '*[1,2,3]解包为1,2,3三个参数，1+2+3=6。'))
  push(genTrueFalse(bankId, c6, ++idx, '函数参数中，默认参数必须放在位置参数之前。', false, '默认参数必须放在位置参数之后，否则会引发语法错误。'))
  push(genSingle(bankId, c6, ++idx, 'def f(*, a, b):\\n    return a + b\\n# f(1, 2)会出错，正确的调用方式是？', [
    { l: 'A', t: 'f(a=1, b=2)', c: true },
    { l: 'B', t: 'f(1, 2)', c: false },
    { l: 'C', t: 'f(1, b=2)', c: false },
    { l: 'D', t: 'f(*[1,2])', c: false }
  ], '*后面的参数是仅关键字参数（keyword-only argument），必须用关键字传递。'))
  // 作用域（10题）
  push(genSingle(bankId, c6, ++idx, 'x = 10\\ndef f():\\n    x = 5\\nf()\\nprint(x)\\n# 输出？', [
    { l: 'A', t: '10', c: true }, { l: 'B', t: '5', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], '函数内的x是局部变量，不影响全局变量x。'))
  push(genSingle(bankId, c6, ++idx, 'x = 10\\ndef f():\\n    global x\\n    x = 5\\nf()\\nprint(x)\\n# 输出？', [
    { l: 'A', t: '10', c: false }, { l: 'B', t: '5', c: true },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], 'global声明后，函数内修改的是全局变量。'))
  push(genTrueFalse(bankId, c6, ++idx, '函数内部可以访问外层变量。', true, 'Python遵循LEGB作用域规则，内部可以访问外层的变量。'))
  push(genSingle(bankId, c6, ++idx, 'def outer():\\n    x = 1\\n    def inner():\\n        return x\\n    return inner()\\nprint(outer())\\n# 输出？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '函数', c: false }
  ], 'inner函数可以访问outer函数的局部变量x，这是闭包的基础。'))
  push(genBlank(bankId, c6, ++idx, 'Python中声明使用全局变量的关键字是___。', ['global'], 'global关键字用于在函数内部修改全局变量。'))
  push(genTrueFalse(bankId, c6, ++idx, '在嵌套函数中，nonlocal关键字用于修改外层函数的局部变量。', true, 'nonlocal用于在内层函数中修改外层（非全局）函数的变量。'))
  push(genSingle(bankId, c6, ++idx, 'def outer():\\n    x = 1\\n    def inner():\\n        nonlocal x\\n        x = 2\\n    inner()\\n    return x\\nprint(outer())\\n# 输出？', [
    { l: 'A', t: '2', c: true }, { l: 'B', t: '1', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], 'nonlocal x允许inner修改outer的x变量。'))
  push(genTrueFalse(bankId, c6, ++idx, 'Python的函数作用域是在编译时确定的。', true, 'Python使用静态作用域（词法作用域），作用域在函数定义时确定。'))
  push(genSingle(bankId, c6, ++idx, 'LEGB作用域规则中，E代表什么？', [
    { l: 'A', t: 'Enclosing', c: true }, { l: 'B', t: 'External', c: false },
    { l: 'C', t: 'Extra', c: false }, { l: 'D', t: 'Error', c: false }
  ], 'LEGB: Local → Enclosing → Global → Built-in。'))
  push(genTrueFalse(bankId, c6, ++idx, '函数内部访问变量时，如果本地没有会直接报错。', false, '变量查找按照LEGB规则逐层查找，都找不到才报NameError。'))
  // Lambda（10题）
  push(genSingle(bankId, c6, ++idx, 'lambda x: x * 2 是什么？', [
    { l: 'A', t: '匿名函数', c: true },
    { l: 'B', t: '普通函数', c: false },
    { l: 'C', t: '类定义', c: false },
    { l: 'D', t: '装饰器', c: false }
  ], 'lambda创建匿名函数（没有名称的函数）。'))
  push(genSingle(bankId, c6, ++idx, 'f = lambda a, b: a + b\\nprint(f(3, 4))\\n# 输出？', [
    { l: 'A', t: '7', c: true }, { l: 'B', t: '12', c: false },
    { l: 'C', t: '34', c: false }, { l: 'D', t: '错误', c: false }
  ], 'lambda可以接收多个参数并返回表达式结果。'))
  push(genTrueFalse(bankId, c6, ++idx, 'lambda表达式只能包含一条语句。', true, 'lambda只能包含一个表达式，不能包含语句（如if/for/print）。'))
  push(genSingle(bankId, c6, ++idx, 'sorted([(1, 3), (2, 1), (3, 2)], key=lambda x: x[1])的结果是？', [
    { l: 'A', t: '[(2, 1), (3, 2), (1, 3)]', c: true },
    { l: 'B', t: '[(1, 3), (2, 1), (3, 2)]', c: false },
    { l: 'C', t: '[(3, 2), (2, 1), (1, 3)]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'key=lambda x: x[1]按第二个元素排序。'))
  push(genSingle(bankId, c6, ++idx, 'list(map(lambda x: x**2, [1, 2, 3, 4]))的结果是？', [
    { l: 'A', t: '[1, 4, 9, 16]', c: true },
    { l: 'B', t: '[1, 2, 3, 4]', c: false },
    { l: 'C', t: '(1, 4, 9, 16)', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'map()对每个元素应用lambda函数。'))
  push(genSingle(bankId, c6, ++idx, 'list(filter(lambda x: x > 2, [1, 2, 3, 4]))的结果是？', [
    { l: 'A', t: '[3, 4]', c: true },
    { l: 'B', t: '[1, 2]', c: false },
    { l: 'C', t: '[2, 3, 4]', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'filter()保留满足条件的元素。'))
  push(genTrueFalse(bankId, c6, ++idx, 'lambda函数体内可以使用return语句。', false, 'lambda隐式返回表达式的结果，不需要也不能使用return。'))
  push(genBlank(bankId, c6, ++idx, 'lambda函数的语法是：lambda ___ : 表达式。', ['参数', 'arguments'], '参数可以有多个，用逗号分隔。'))
  push(genTrueFalse(bankId, c6, ++idx, 'lambda函数的执行效率与普通def函数相同。', false, 'lambda和def创建的函数功能相同，性能差异可以忽略不计，但不是完全相同。'))
  push(genSingle(bankId, c6, ++idx, '以下代码输出什么？\\nf = lambda x: "even" if x % 2 == 0 else "odd"\\nprint(f(3))', [
    { l: 'A', t: "'odd'", c: true },
    { l: 'B', t: "'even'", c: false },
    { l: 'C', t: 'True', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'lambda内可以使用三目运算符。'))
  // 装饰器（10题）
  push(genTrueFalse(bankId, c6, ++idx, '装饰器本质上是一个接受函数并返回新函数的函数。', true, '装饰器是函数式编程的重要特性，用于在不修改原函数代码的情况下增强功能。'))
  push(genSingle(bankId, c6, ++idx, '@staticmethod 的作用是什么？', [
    { l: 'A', t: '定义静态方法', c: true },
    { l: 'B', t: '定义类方法', c: false },
    { l: 'C', t: '定义属性', c: false },
    { l: 'D', t: '定义抽象方法', c: false }
  ], '@staticmethod装饰器将方法变为静态方法，不需要self参数。'))
  push(genSingle(bankId, c6, ++idx, '@classmethod 的方法第一个参数是？', [
    { l: 'A', t: 'self', c: false }, { l: 'B', t: 'cls', c: true },
    { l: 'C', t: 'class', c: false }, { l: 'D', t: '无需参数', c: false }
  ], '类方法的第一个参数是类本身，约定名称为cls。'))
  push(genTrueFalse(bankId, c6, ++idx, '@property装饰器可以将方法变成属性调用。', true, '@property让方法可以像属性一样访问，不需要加括号。'))
  push(genMultiple(bankId, c6, ++idx, '以下哪些是Python内置的装饰器？（多选）', [
    { l: 'A', t: '@staticmethod', c: true },
    { l: 'B', t: '@classmethod', c: true },
    { l: 'C', t: '@property', c: true },
    { l: 'D', t: '@abstractmethod', c: true }
  ], ['A', 'B', 'C', 'D'], '以上全部是Python内置装饰器，分别用于静态方法、类方法、属性和抽象方法。'))
  push(genSingle(bankId, c6, ++idx, 'def deco(f):\\n    def wrapper(){\\n        print("before")\\n        f()\\n        print("after")\\n    return wrapper\\n@deco\\ndef hello():\\n    print("hello")\\nhello()\\n# 输出？', [
    { l: 'A', t: 'before\\nhello\\nafter', c: true },
    { l: 'B', t: 'hello', c: false },
    { l: 'C', t: 'before\\nafter', c: false },
    { l: 'D', t: '错误', c: false }
  ], '@deco等价于hello = deco(hello)，调用hello()实际执行wrapper()。'))
  push(genTrueFalse(bankId, c6, ++idx, '多个装饰器的执行顺序是从下到上。', true, '离函数定义最近的装饰器先应用（先包装），调用时从最外层开始执行。'))
  push(genBlank(bankId, c6, ++idx, 'functools模块中用于保留原函数元数据的装饰器是___。', ['wraps'], 'functools.wraps将原函数的__name__、__doc__等属性复制到包装函数。'))
  push(genTrueFalse(bankId, c6, ++idx, '装饰器必须有参数。', false, '装饰器可以是无参数形式（@deco）或有参数形式（@deco(args)），前者接收函数作为参数。'))
  push(genSingle(bankId, c6, ++idx, '以下哪项不是装饰器的常见用途？', [
    { l: 'A', t: '日志记录', c: false },
    { l: 'B', t: '性能计时', c: false },
    { l: 'C', t: '类型声明', c: true },
    { l: 'D', t: '权限校验', c: false }
  ], '类型声明由类型注解完成，不是装饰器的用途。'))
  // 生成器与迭代器（10题）
  push(genTrueFalse(bankId, c6, ++idx, '生成器函数使用yield关键字。', true, '包含yield关键字的函数是生成器函数，调用时返回生成器对象。'))
  push(genSingle(bankId, c6, ++idx, 'def gen():\\n    yield 1\\n    yield 2\\n    yield 3\\ng = gen()\\nprint(next(g))\\n# 输出？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: '2', c: false },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '错误', c: false }
  ], 'next()从生成器中获取下一个值，第一次调用返回第一个yield的值。'))
  push(genSingle(bankId, c6, ++idx, '(x**2 for x in range(4))创建的是什么？', [
    { l: 'A', t: '生成器表达式', c: true },
    { l: 'B', t: '列表推导式', c: false },
    { l: 'C', t: '字典推导式', c: false },
    { l: 'D', t: '集合推导式', c: false }
  ], '圆括号表示生成器表达式，方括号才是列表推导式。'))
  push(genTrueFalse(bankId, c6, ++idx, '生成器在内存中一次只生成一个值。', true, '生成器是惰性求值的，每次只生成一个值，节省大量内存。'))
  push(genSingle(bankId, c6, ++idx, 'sum(x**2 for x in range(1000000))与列表推导式相比的优势是？', [
    { l: 'A', t: '更节省内存', c: true },
    { l: 'B', t: '运行速度更快', c: false },
    { l: 'C', t: '代码更短', c: false },
    { l: 'D', t: '没有区别', c: false }
  ], '生成器表达式不一次性创建全部数据，内存占用极低。'))
  push(genTrueFalse(bankId, c6, ++idx, '生成器可以被遍历多次。', false, '生成器是一次性不可逆的，遍历完就会耗尽。'))
  push(genSingle(bankId, c6, ++idx, 'def count(){\\n    i = 0\\n    while True:\\n        yield i\\n        i += 1\\n# 这个生成器有什么特点？', [
    { l: 'A', t: '无限生成器', c: true },
    { l: 'B', t: '有限生成器', c: false },
    { l: 'C', t: '空生成器', c: false },
    { l: 'D', t: '错误', c: false }
  ], 'while True永不为False，所以是无限生成器。'))
  push(genBlank(bankId, c6, ++idx, '迭代器协议要求实现___()方法。', ['__next__', 'next'], '迭代器需要实现__next__()方法（Python 3），以及__iter__()返回自身。'))
  push(genTrueFalse(bankId, c6, ++idx, '所有可迭代对象都是迭代器。', false, '可迭代对象实现了__iter__()，迭代器还实现了__next__()。例如列表是可迭代但不是迭代器。'))
  push(genSingle(bankId, c6, ++idx, 'iter([1, 2, 3])返回的是什么？', [
    { l: 'A', t: '迭代器', c: true },
    { l: 'B', t: '列表', c: false },
    { l: 'C', t: '生成器', c: false },
    { l: 'D', t: '元组', c: false }
  ], 'iter()将可迭代对象转换为迭代器。'))

  // ==================== 第7章 面向对象（50题）====================
  const c7 = ch('第七章 面向对象')
  // 类与对象（15题）
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    pass\\na = A()\\ntype(a)的结果是？', [
    { l: 'A', t: "<class 'A'>", c: true },
    { l: 'B', t: "<class 'type'>", c: false },
    { l: 'C', t: "'A'", c: false },
    { l: 'D', t: '错误', c: false }
  ], 'type()返回创建该对象的类。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    x = 1\\nprint(A.x)\\n# 输出？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '0', c: false }
  ], 'x是类属性，直接通过类名访问。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __init__(self):\\n        self.x = 10\\na = A()\\nprint(a.x)\\n# 输出？', [
    { l: 'A', t: '10', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '0', c: false }
  ], '__init__是构造函数，在创建对象时初始化实例属性。'))
  push(genTrueFalse(bankId, c7, ++idx, '__init__方法在对象创建后自动调用。', true, 'Python在创建对象后自动调用__init__方法。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __init__(self, v):\\n        self.value = v\\na = A(5)\\nprint(a.value)\\n# 输出？', [
    { l: 'A', t: '5', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: 'v', c: false }, { l: 'D', t: '错误', c: false }
  ], '__init__可以接收参数来初始化实例。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    count = 0\\n    def __init__(self):\\n        A.count += 1\\na1 = A()\\na2 = A()\\nprint(A.count)\\n# 输出？', [
    { l: 'A', t: '2', c: true }, { l: 'B', t: '1', c: false },
    { l: 'C', t: '0', c: false }, { l: 'D', t: '错误', c: false }
  ], '类属性count被所有实例共享，创建两个实例后count=2。'))
  push(genTrueFalse(bankId, c7, ++idx, '实例方法必须包含self参数。', true, '实例方法的第一个参数是self，代表实例对象本身。'))
  push(genTrueFalse(bankId, c7, ++idx, 'self不是Python关键字，可以使用其他名称。', true, 'self只是约定名称，不是关键字，但强烈建议遵守约定使用self。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    pass\\na = A()\\nprint(isinstance(a, A))\\n# 输出？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '错误', c: false }
  ], 'isinstance()检查对象是否是某个类的实例。'))
  push(genMultiple(bankId, c7, ++idx, '以下哪些是类的特殊方法（魔术方法）？（多选）', [
    { l: 'A', t: '__init__', c: true },
    { l: 'B', t: '__str__', c: true },
    { l: 'C', t: '__add__', c: true },
    { l: 'D', t: '__func__', c: false }
  ], ['A', 'B', 'C'], '__func__不是Python的特殊方法。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __str__(self):\\n        return "A instance"\\nprint(str(A()))\\n# 输出？', [
    { l: 'A', t: "'A instance'", c: true },
    { l: 'B', t: "'A'", c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: "'instance'", c: false }
  ], '__str__定义了对象的字符串表示。'))
  push(genTrueFalse(bankId, c7, ++idx, '__repr__与__str__的区别在于__repr__面向开发者。', true, '__repr__用于调试，__str__用于用户展示。'))
  push(genBlank(bankId, c7, ++idx, 'Python中用于创建对象的特殊方法是___。', ['__new__', '__init__'], '__new__创建对象，__init__初始化对象。但通常只需要实现__init__。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    pass\\nprint(type(A))\\n# 输出？', [
    { l: 'A', t: "<class 'type'>", c: true },
    { l: 'B', t: "<class 'A'>", c: false },
    { l: 'C', t: "<class 'class'>", c: false },
    { l: 'D', t: '错误', c: false }
  ], '类的类型是type，类是type的实例。'))
  push(genTrueFalse(bankId, c7, ++idx, 'Python中一切皆对象，包括类和函数。', true, '在Python中，类、函数、模块等都是对象，都可以被传递和操作。'))
  // 继承（15题）
  push(genSingle(bankId, c7, ++idx, 'class A: pass\\nclass B(A): pass\\nprint(issubclass(B, A))\\n# 输出？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '错误', c: false }
  ], 'issubclass()检查是否是子类关系。'))
  push(genTrueFalse(bankId, c7, ++idx, 'Python支持多重继承。', true, 'Python允许一个类继承多个父类。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def f(self):\\n        return "A"\\nclass B(A):\\n    def f(self):\\n        return "B"\\nb = B()\\nprint(b.f())\\n# 输出？', [
    { l: 'A', t: "'B'", c: true }, { l: 'B', t: "'A'", c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: "'A B'", c: false }
  ], '子类重写（override）了父类的方法。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def f(self):\\n        return "A"\\nclass B(A):\\n    def f(self):\\n        return super().f() + "B"\\nb = B()\\nprint(b.f())\\n# 输出？', [
    { l: 'A', t: "'AB'", c: true }, { l: 'B', t: "'A'", c: false },
    { l: 'C', t: "'B'", c: false }, { l: 'D', t: '错误', c: false }
  ], 'super()调用父类的方法。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    x = 1\\nclass B(A):\\n    pass\\nprint(B.x)\\n# 输出？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '0', c: false }
  ], '子类继承了父类的类属性。'))
  push(genTrueFalse(bankId, c7, ++idx, 'Python中所有类都直接或间接继承自object。', true, '在Python 3中，所有类都隐式继承自object。'))
  push(genSingle(bankId, c7, ++idx, '多重继承中，方法解析顺序由什么决定？', [
    { l: 'A', t: 'MRO算法', c: true },
    { l: 'B', t: '随机选择', c: false },
    { l: 'C', t: '字母顺序', c: false },
    { l: 'D', t: '定义时间', c: false }
  ], 'Python使用C3线性化算法确定方法解析顺序（MRO）。'))
  push(genSingle(bankId, c7, ++idx, 'class A: pass\\nclass B: pass\\nclass C(B, A): pass\\nprint(C.__mro__)中，A和B的顺序？', [
    { l: 'A', t: 'C, B, A, object', c: true },
    { l: 'B', t: 'C, A, B, object', c: false },
    { l: 'C', t: 'A, B, C', c: false },
    { l: 'D', t: 'C, object', c: false }
  ], 'MRO按继承顺序：C → B → A → object。'))
  push(genBlank(bankId, c7, ++idx, '查看类的MRO可以使用类名.__mro__或___()函数。', ['mro'], 'mro()方法返回MRO列表。'))
  push(genTrueFalse(bankId, c7, ++idx, '抽象类不能实例化。', true, '使用ABC模块的abstractmethod装饰器定义的抽象类不能直接实例化。'))
  push(genSingle(bankId, c7, ++idx, 'from abc import ABC, abstractmethod\\nclass A(ABC):\\n    @abstractmethod\\n    def f(self): pass\\nclass B(A):\\n    pass  # 不实现f\\nb = B()\\n# 结果？', [
    { l: 'A', t: '实例化失败', c: true },
    { l: 'B', t: '成功创建', c: false },
    { l: 'C', t: 'b.f()报错', c: false },
    { l: 'D', t: '创建b成功，调用f报错', c: false }
  ], '没有实现所有抽象方法的子类不能实例化。'))
  push(genTrueFalse(bankId, c7, ++idx, 'super()可以解决菱形继承问题。', true, 'super()结合MRO正确处理多重继承中父类方法调用问题。'))
  push(genMultiple(bankId, c7, ++idx, '以下哪些是Python继承的特点？（多选）', [
    { l: 'A', t: '支持单继承', c: true },
    { l: 'B', t: '支持多重继承', c: true },
    { l: 'C', t: '子类可以重写父类方法', c: true },
    { l: 'D', t: '子类不能访问私有属性', c: false }
  ], ['A', 'B', 'C'], '通过名字改写，子类仍然可以访问父类的私有属性（_ClassName__attr）。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __private(self):\\n        return 1\\n    def public(self):\\n        return self.__private()\\nprint(A().public())\\n# 输出？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '0', c: false }
  ], '名称改写后的私有方法仍可在类内部调用。'))
  push(genTrueFalse(bankId, c7, ++idx, '子类可以通过super().__init__()调用父类的构造函数。', true, '子类可以通过super().__init__()显式调用父类的构造函数。'))
  // 特殊方法（10题）
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __len__(self):\\n        return 5\\nprint(len(A()))\\n# 输出？', [
    { l: 'A', t: '5', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: '0', c: false }
  ], '实现__len__后，对象可以使用len()函数。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __add__(self, other):\\n        return 10\\nprint(A() + A())\\n# 输出？', [
    { l: 'A', t: '10', c: true }, { l: 'B', t: '错误', c: false },
    { l: 'C', t: '对象', c: false }, { l: 'D', t: 'None', c: false }
  ], '__add__定义了+运算符的行为。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __eq__(self, other):\\n        return True\\nprint(A() == A())\\n# 输出？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: '错误', c: false }, { l: 'D', t: 'None', c: false }
  ], '__eq__定义了==运算符的行为。'))
  push(genTrueFalse(bankId, c7, ++idx, '__getitem__使对象支持索引访问。', true, '实现__getitem__后对象支持obj[key]语法。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __iter__(self):\\n        self.n = 0\\n        return self\\n    def __next__(self):\\n        self.n += 1\\n        if self.n > 3:\\n            raise StopIteration\\n        return self.n\\nprint(list(A()))\\n# 输出？', [
    { l: 'A', t: '[1, 2, 3]', c: true },
    { l: 'B', t: '[0, 1, 2, 3]', c: false },
    { l: 'C', t: '错误', c: false },
    { l: 'D', t: '[]', c: false }
  ], '实现__iter__和__next__使对象可迭代。'))
  push(genSingle(bankId, c7, ++idx, 'class A:\\n    def __call__(self):\\n        return "called"\\nprint(A()())\\n# 输出？', [
    { l: 'A', t: "'called'", c: true },
    { l: 'B', t: '错误', c: false },
    { l: 'C', t: 'None', c: false },
    { l: 'D', t: "'called' without quotes", c: false }
  ], '实现__call__使对象可以像函数一样被调用。'))

  // ===== 补充题目至500题 =====

  // ===== 第1章 基础语法（补充+20题）=====
  push(genSingle(bankId, c1, ++idx, 'Python中，执行`print(0.1 + 0.2 == 0.3)`的结果是？', [
    { l: 'A', t: 'True', c: false }, { l: 'B', t: 'False', c: true },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: 'None', c: false }
  ], '浮点数存在精度问题，0.1+0.2实际为0.30000000000000004。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中"and"的优先级高于"or"。', true, 'and优先级高于or，与大多数语言一致。'))
  push(genSingle(bankId, c1, ++idx, '`print(type(3.14))`的输出是什么？', [
    { l: 'A', t: "<class 'int'>", c: false }, { l: 'B', t: "<class 'float'>", c: true },
    { l: 'C', t: "<class 'str'>", c: false }, { l: 'D', t: "<class 'decimal'>", c: false }
  ], '3.14是浮点数，类型为float。'))
  push(genBlank(bankId, c1, ++idx, 'Python中表示空值的保留字是___。', ['None'], 'None是Python中表示空值的特殊常量。'))
  push(genMultiple(bankId, c1, ++idx, '以下哪些是Python中的保留字/关键字？', [
    { l: 'A', t: 'lambda', c: true }, { l: 'B', t: 'async', c: true },
    { l: 'C', t: 'array', c: false }, { l: 'D', t: 'yield', c: true }
  ], ['A', 'B', 'D'], 'lambda、async、yield都是关键字，array不是。'))
  push(genSingle(bankId, c1, ++idx, '`print(0b1010)`的输出是？', [
    { l: 'A', t: '0b1010', c: false }, { l: 'B', t: '10', c: true },
    { l: 'C', t: '1010', c: false }, { l: 'D', t: '12', c: false }
  ], '0b1010是二进制字面量，十进制为10。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中可以使用`global`关键字在函数内部修改全局变量。', true, 'global声明后可在函数内修改全局变量。'))
  push(genSingle(bankId, c1, ++idx, '`print(1_000_000)`的输出是？', [
    { l: 'A', t: '1000000', c: true }, { l: 'B', t: '1_000_000', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: '1000001', c: false }
  ], 'Python 3.6+支持下划线分隔数字字面量。'))
  push(genBlank(bankId, c1, ++idx, '获取变量a的内存地址使用内置函数___。', ['id'], 'id()返回对象的唯一标识符（内存地址）。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中`is`运算符比较的是两个对象的值是否相等。', false, 'is比较的是对象的身份（id），而非值。'))
  push(genSingle(bankId, c1, ++idx, '`print(3 ** 2 ** 3)`的输出是？', [
    { l: 'A', t: '729', c: false }, { l: 'B', t: '6561', c: true },
    { l: 'C', t: '512', c: false }, { l: 'D', t: '19683', c: false }
  ], '**是右结合，2**3=8，3**8=6561。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中`not`的优先级高于`and`和`or`。', true, 'not优先级最高，其次是and，最后是or。'))
  push(genBlank(bankId, c1, ++idx, '将字符串转换为整数的内置函数是___。', ['int'], 'int()可将数字字符串转换为整数。'))
  push(genSingle(bankId, c1, ++idx, '`print(10 // 3, 10 % 3)`的输出是？', [
    { l: 'A', t: '3 1', c: true }, { l: 'B', t: '3.33 1', c: false },
    { l: 'C', t: '3 0', c: false }, { l: 'D', t: '3.33 0', c: false }
  ], '//为整除，%为取余。'))
  push(genSingle(bankId, c1, ++idx, '`print(round(2.5))`的输出是？', [
    { l: 'A', t: '2', c: false }, { l: 'B', t: '3', c: true },
    { l: 'C', t: '2.5', c: false }, { l: 'D', t: '报错', c: false }
  ], 'round(2.5)在Python 3中采用银行家舍入，但2.5恰好在中间，结果为3。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中可以使用`del`关键字删除变量。', true, 'del可以删除变量引用。'))
  push(genBlank(bankId, c1, ++idx, 'Python中获取一个对象所有属性名的方法名是___。', ['dir'], 'dir()返回对象所有属性和方法的列表。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中`0o17`是合法的八进制字面量。', true, '0o前缀表示八进制，0o17=15。'))
  push(genMultiple(bankId, c1, ++idx, '以下哪些方式可以交换Python变量a和b的值？', [
    { l: 'A', t: 'a, b = b, a', c: true }, { l: 'B', t: 'temp = a; a = b; b = temp', c: true },
    { l: 'C', t: 'a = b; b = a', c: false }, { l: 'D', t: 'a ^= b; b ^= a; a ^= b', c: true }
  ], ['A', 'B', 'D'], 'Python中a,b=b,a是元组解包的语法糖。'))

  // ===== 第2章 字符串（补充+20题）=====
  push(genSingle(bankId, c2, ++idx, '`"abc".find("")`的返回值是？', [
    { l: 'A', t: '0', c: true }, { l: 'B', t: '-1', c: false },
    { l: 'C', t: '3', c: false }, { l: 'D', t: '报错', c: false }
  ], '空字符串在所有位置都能匹配，find返回起始索引0。'))
  push(genTrueFalse(bankId, c2, ++idx, 'Python中字符串是不可变类型。', true, '字符串一旦创建就不能修改。'))
  push(genSingle(bankId, c2, ++idx, '`"hello".ljust(10, "*")`的结果是？', [
    { l: 'A', t: '"hello*****"', c: true }, { l: 'B', t: '"*****hello"', c: false },
    { l: 'C', t: '"hello "', c: false }, { l: 'D', t: '"*hello*"', c: false }
  ], 'ljust左对齐，右侧填充指定字符。'))
  push(genBlank(bankId, c2, ++idx, '将列表中字符串连接为一个字符串的方法名是___。', ['join'], '" ".join(list)可将列表元素连接为字符串。'))
  push(genTrueFalse(bankId, c2, ++idx, '`"abc".isalpha()`返回True。', true, 'isalpha()判断是否全为字母。'))
  push(genSingle(bankId, c2, ++idx, '`"  hello  ".strip()`的结果是？', [
    { l: 'A', t: '"hello"', c: true }, { l: 'B', t: '"  hello  "', c: false },
    { l: 'C', t: '"hello  "', c: false }, { l: 'D', t: '"  hello"', c: false }
  ], 'strip()去除首尾空白字符。'))
  push(genTrueFalse(bankId, c2, ++idx, '`"abc123".isalnum()`返回True。', true, 'isalnum()判断是否全为字母或数字。'))
  push(genSingle(bankId, c2, ++idx, '`"ab.cd.ef".rsplit(".", 1)`的结果是？', [
    { l: 'A', t: '["ab.cd", "ef"]', c: true }, { l: 'B', t: '["ab", "cd.ef"]', c: false },
    { l: 'C', t: '["ab", "cd", "ef"]', c: false }, { l: 'D', t: '报错', c: false }
  ], 'rsplit从右侧开始分割，maxsplit=1只分一次。'))
  push(genBlank(bankId, c2, ++idx, '`"Hello {name}"`格式化填充name变量，应使用___方法。', ['format'], '"Hello {name}".format(name="World")。'))
  push(genSingle(bankId, c2, ++idx, '`"abc".center(7, "-")`的结果是？', [
    { l: 'A', t: '"--abc--"', c: true }, { l: 'B', t: '"abc----"', c: false },
    { l: 'C', t: '"----abc"', c: false }, { l: 'D', t: '"-abc---"', c: false }
  ], 'center居中填充，总长7，两边各填2个-。'))
  push(genTrueFalse(bankId, c2, ++idx, '`"123".isdigit()`和`"123".isnumeric()`都返回True。', true, 'isdigit和isnumeric对纯数字字符串都返回True。'))
  push(genMultiple(bankId, c2, ++idx, '以下哪些字符串方法返回布尔值？', [
    { l: 'A', t: 'startswith', c: true }, { l: 'B', t: 'isspace', c: true },
    { l: 'C', t: 'zfill', c: false }, { l: 'D', t: 'endswith', c: true }
  ], ['A', 'B', 'D'], 'startswith、isspace、endswith返回布尔值；zfill返回填充后的字符串。'))
  push(genSingle(bankId, c2, ++idx, '`"a\\tb\\tc".expandtabs(4)`中tab被替换为几个空格？', [
    { l: 'A', t: '4', c: true }, { l: 'B', t: '1', c: false },
    { l: 'C', t: '8', c: false }, { l: 'D', t: '0', c: false }
  ], 'expandtabs将tab替换为指定数量的空格。'))
  push(genTrueFalse(bankId, c2, ++idx, '`"Hello\\nWorld".splitlines()`返回["Hello", "World"]。', true, 'splitlines按行分割。'))
  push(genSingle(bankId, c2, ++idx, '`"abc".ljust(3)`的结果长度是多少？', [
    { l: 'A', t: '3', c: true }, { l: 'B', t: '5', c: false },
    { l: 'C', t: '0', c: false }, { l: 'D', t: '6', c: false }
  ], 'ljust(3)指定总长3，原字符串已满，不填充。'))
  push(genBlank(bankId, c2, ++idx, '判断字符串s是否全为大写应使用s.___。', ['isupper'], 'isupper()检测字符串是否全为大写。'))
  push(genTrueFalse(bankId, c2, ++idx, '`"abc".replace("", "-")`返回"-a-b-c-"。', true, '空字符串匹配每个字符间的位置。'))
  push(genSingle(bankId, c2, ++idx, '`"123".zfill(5)`的结果是？', [
    { l: 'A', t: '"00123"', c: true }, { l: 'B', t: '"12300"', c: false },
    { l: 'C', t: '"123"', c: false }, { l: 'D', t: '"000123"', c: false }
  ], 'zfill在左侧用0填充至指定宽度。'))
  push(genTrueFalse(bankId, c2, ++idx, '`"Hello"`和`b"Hello"`在Python中是相同的类型。', false, '前者是str，后者是bytes。'))

  // ===== 第3章 列表与元组（补充+20题）=====
  push(genTrueFalse(bankId, c3, ++idx, '列表的`sort()`方法会返回一个新列表。', false, 'sort()原地排序，返回None。'))
  push(genSingle(bankId, c3, ++idx, '`[1, 2] * 3`的结果是？', [
    { l: 'A', t: '[1, 2, 1, 2, 1, 2]', c: true }, { l: 'B', t: '[3, 6]', c: false },
    { l: 'C', t: '[1, 2, 3]', c: false }, { l: 'D', t: '报错', c: false }
  ], '列表的*运算符用于重复拼接。'))
  push(genBlank(bankId, c3, ++idx, '删除列表末尾元素的方法名是___。', ['pop'], 'list.pop()删除并返回最后一个元素。'))
  push(genSingle(bankId, c3, ++idx, '`[x**2 for x in range(4)]`的结果是？', [
    { l: 'A', t: '[0, 1, 4, 9]', c: true }, { l: 'B', t: '[1, 4, 9, 16]', c: false },
    { l: 'C', t: '[0, 2, 4, 6]', c: false }, { l: 'D', t: '[0, 1, 2, 3]', c: false }
  ], '列表推导式，0^2=0,1^2=1,2^2=4,3^2=9。'))
  push(genTrueFalse(bankId, c3, ++idx, '元组是不可变类型，因此元组不能作为字典的键。', false, '元组是不可变的，可以作为字典的键。'))
  push(genSingle(bankId, c3, ++idx, '`(1, 2, 3)[:2]`的结果是？', [
    { l: 'A', t: '(1, 2)', c: true }, { l: 'B', t: '[1, 2]', c: false },
    { l: 'C', t: '(1,)', c: false }, { l: 'D', t: '(2, 3)', c: false }
  ], '元组切片返回元组。'))
  push(genBlank(bankId, c3, ++idx, '创建只有一个元素1的元组应写为___。', ['(1,)'], '单元素元组需要在元素后加逗号。'))
  push(genTrueFalse(bankId, c3, ++idx, '`list.reverse()`会返回反转后的新列表。', false, 'reverse()原地反转，返回None。'))
  push(genSingle(bankId, c3, ++idx, '`[1, 2, 3].count(2)`的值是？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: '2', c: false },
    { l: 'C', t: '0', c: false }, { l: 'D', t: '3', c: false }
  ], 'count统计元素出现次数。'))
  push(genTrueFalse(bankId, c3, ++idx, '`a, b = b, a`的实现依赖于元组打包和解包。', true, '右侧(b,a)打包为元组，左侧解包赋值。'))
  push(genSingle(bankId, c3, ++idx, '`[1, 2, 3].insert(0, 0)`后列表变为？', [
    { l: 'A', t: '[0, 1, 2, 3]', c: true }, { l: 'B', t: '[1, 0, 2, 3]', c: false },
    { l: 'C', t: '[1, 2, 3, 0]', c: false }, { l: 'D', t: '报错', c: false }
  ], 'insert(0,0)在索引0处插入元素0。'))
  push(genMultiple(bankId, c3, ++idx, '以下哪些方法可以复制一个列表？', [
    { l: 'A', t: 'list.copy()', c: true }, { l: 'B', t: 'list[:]', c: true },
    { l: 'C', t: 'list.deepcopy()', c: false }, { l: 'D', t: 'list(list)', c: true }
  ], ['A', 'B', 'D'], 'copy()、切片、list()都可以创建浅拷贝。'))
  push(genTrueFalse(bankId, c3, ++idx, '`del list[0]`会删除列表的第一个元素。', true, 'del可以删除指定索引的元素。'))
  push(genBlank(bankId, c3, ++idx, '返回列表list中最大值的索引的表达式是___。', ['list.index(max(list))'], '先max找最大值，再用index找索引。'))
  push(genSingle(bankId, c3, ++idx, '`sorted([3, 1, 2], reverse=True)`的结果是？', [
    { l: 'A', t: '[3, 2, 1]', c: true }, { l: 'B', t: '[1, 2, 3]', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '报错', c: false }
  ], 'sorted返回新列表，reverse=True降序。'))

  // ===== 第4章 字典与集合（补充+20题）=====
  push(genTrueFalse(bankId, c4, ++idx, '字典的键必须是不可变类型。', true, '字典键要求可哈希，即不可变类型。'))
  push(genSingle(bankId, c4, ++idx, '`{1, 2, 3} | {2, 3, 4}`的结果是？', [
    { l: 'A', t: '{1, 2, 3, 4}', c: true }, { l: 'B', t: '{2, 3}', c: false },
    { l: 'C', t: '{1, 4}', c: false }, { l: 'D', t: '报错', c: false }
  ], '|运算符计算集合的并集。'))
  push(genBlank(bankId, c4, ++idx, '字典d中获取键"name"的值且不抛出异常的方法调用是d.___。', ['get("name")'], 'd.get("name")在键不存在时返回None而非抛出异常。'))
  push(genTrueFalse(bankId, c4, ++idx, '`{}`表示一个空集合。', false, '{}表示空字典，空集合应使用set()。'))
  push(genSingle(bankId, c4, ++idx, '`{1, 2, 3} & {2, 3, 4}`的结果是？', [
    { l: 'A', t: '{2, 3}', c: true }, { l: 'B', t: '{1, 4}', c: false },
    { l: 'C', t: '{1, 2, 3, 4}', c: false }, { l: 'D', t: '报错', c: false }
  ], '&运算符计算集合的交集。'))
  push(genBlank(bankId, c4, ++idx, '向集合s中添加元素的方法名是___。', ['add'], 's.add(x)向集合添加元素。'))
  push(genMultiple(bankId, c4, ++idx, '以下哪些集合运算方法存在？', [
    { l: 'A', t: 'union', c: true }, { l: 'B', t: 'difference', c: true },
    { l: 'C', t: 'symmetric_difference', c: true }, { l: 'D', t: 'cross', c: false }
  ], ['A', 'B', 'C'], 'union、difference、symmetric_difference都是集合方法。'))
  push(genTrueFalse(bankId, c4, ++idx, '字典的`keys()`方法返回一个列表。', false, 'keys()返回dict_keys视图对象，不是列表。'))
  push(genSingle(bankId, c4, ++idx, '`{"a": 1, "b": 2}.get("c", 0)`的值是？', [
    { l: 'A', t: '0', c: true }, { l: 'B', t: 'None', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: '2', c: false }
  ], 'get第二个参数指定默认值，键不存在时返回默认值。'))
  push(genTrueFalse(bankId, c4, ++idx, '集合的元素可以是列表。', false, '集合元素必须可哈希，列表可变不可哈希。'))
  push(genSingle(bankId, c4, ++idx, '`{1, 2}.issubset({1, 2, 3})`的值是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: 'None', c: false }
  ], 'issubset判断是否为子集。'))
  push(genBlank(bankId, c4, ++idx, '字典中遍历键值对使用items()方法，每次返回一个___。', ['元组'], 'items()返回(key, value)元组。'))
  push(genSingle(bankId, c4, ++idx, '`{1: "a", 2: "b"} | {2: "c", 3: "d"}`的结果中键2的值是？', [
    { l: 'A', t: '"c"', c: true }, { l: 'B', t: '"b"', c: false },
    { l: 'C', t: '["b", "c"]', c: false }, { l: 'D', t: '报错', c: false }
  ], 'Python 3.9+的|运算符合并字典，右侧的值覆盖左侧。'))
  push(genTrueFalse(bankId, c4, ++idx, '`frozenset`是集合的不可变版本，可以作为字典的键。', true, 'frozenset是不可变的，可以哈希。'))

  // ===== 第5章 控制流程（补充+20题）=====
  push(genTrueFalse(bankId, c5, ++idx, '`for i in range(5)`中i的取值范围是0到4。', true, 'range(5)生成0,1,2,3,4。'))
  push(genSingle(bankId, c5, ++idx, '`range(1, 10, 2)`生成的序列是？', [
    { l: 'A', t: '[1, 3, 5, 7, 9]', c: true }, { l: 'B', t: '[1, 3, 5, 7]', c: false },
    { l: 'C', t: '[2, 4, 6, 8, 10]', c: false }, { l: 'D', t: '[1, 2, 3, 4, 5]', c: false }
  ], 'range(1,10,2)从1开始步长为2，不包含10。'))
  push(genBlank(bankId, c5, ++idx, '跳出当前循环的关键字是___。', ['break'], 'break立即跳出当前循环。'))
  push(genTrueFalse(bankId, c5, ++idx, '`while`循环可以和`else`子句配合使用。', true, '当循环条件为False时执行else。'))
  push(genSingle(bankId, c5, ++idx, '`for i in range(3): print(i, end=" ")`的输出是？', [
    { l: 'A', t: '"0 1 2 "', c: true }, { l: 'B', t: '"0 1 2"', c: false },
    { l: 'C', t: '"1 2 3 "', c: false }, { l: 'D', t: '"1 2 3"', c: false }
  ], 'range(3)生成0,1,2；end=" "使输出末尾有空格。'))
  push(genBlank(bankId, c5, ++idx, '跳过本轮循环进入下一次的关键字是___。', ['continue'], 'continue跳过当前迭代，进入下一轮。'))
  push(genTrueFalse(bankId, c5, ++idx, '`if`条件判断中非零数字被视为True。', true, 'Python中0为False，其他数字为True。'))
  push(genSingle(bankId, c5, ++idx, '`[i for i in range(10) if i % 2 == 0]`生成的是？', [
    { l: 'A', t: '[0, 2, 4, 6, 8]', c: true }, { l: 'B', t: '[1, 3, 5, 7, 9]', c: false },
    { l: 'C', t: '[0, 1, 2, 3, 4]', c: false }, { l: 'D', t: '[2, 4, 6, 8]', c: false }
  ], '筛选出0-9中的偶数。'))
  push(genMultiple(bankId, c5, ++idx, '以下哪些是Python循环控制关键字？', [
    { l: 'A', t: 'break', c: true }, { l: 'B', t: 'continue', c: true },
    { l: 'C', t: 'pass', c: true }, { l: 'D', t: 'exit', c: false }
  ], ['A', 'B', 'C'], 'break、continue、pass都是，exit是函数。'))
  push(genTrueFalse(bankId, c5, ++idx, '`for-else`中的else只有在循环正常结束时才会执行。', true, '如果循环被break中断，else不会执行。'))

  // ===== 第6章 函数（补充+25题）=====
  push(genTrueFalse(bankId, c6, ++idx, '函数定义中的默认参数在函数定义时就被求值。', true, '默认参数只被求值一次，可变默认参数有陷阱。'))
  push(genSingle(bankId, c6, ++idx, '`lambda x, y: x + y(1, 2)`的结果是？', [
    { l: 'A', t: '3', c: true }, { l: 'B', t: '(1, 2)', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: '12', c: false }
  ], 'lambda定义匿名函数，直接调用并传参。'))
  push(genBlank(bankId, c6, ++idx, '定义一个不接收任何参数的装饰器，其内层函数接收的参数名通常为___。', ['func'], '装饰器内层接收被装饰函数作为参数。'))
  push(genSingle(bankId, c6, ++idx, '`def f(a, b=[]): b.append(a); return b`调用两次f(1)和f(2)后结果是？', [
    { l: 'A', t: '[1, 2]', c: true }, { l: 'B', t: '[1]和[2]', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: '[2]', c: false }
  ], '默认参数b是可变对象，多次调用共享同一列表。'))
  push(genTrueFalse(bankId, c6, ++idx, '`*args`用于接收任意数量的位置参数。', true, '*args将多余位置参数打包为元组。'))
  push(genBlank(bankId, c6, ++idx, '`**kwargs`中kwargs的类型是___。', ['dict'], '**kwargs将关键字参数打包为字典。'))
  push(genSingle(bankId, c6, ++idx, '`def f(a, *args, **kwargs):`调用f(1, 2, 3, x=4)中a的值是？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: '(1, 2, 3)', c: false },
    { l: 'C', t: '2', c: false }, { l: 'D', t: '4', c: false }
  ], 'a接收第1个位置参数。'))
  push(genTrueFalse(bankId, c6, ++idx, '`nonlocal`关键字用于在嵌套函数中修改外层局部变量。', true, 'nonlocal用于闭包中修改外层变量。'))
  push(genSingle(bankId, c6, ++idx, '`def f(): pass`中函数的返回值是？', [
    { l: 'A', t: 'None', c: true }, { l: 'B', t: '0', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: 'True', c: false }
  ], '没有return语句的函数默认返回None。'))
  push(genTrueFalse(bankId, c6, ++idx, '闭包是指内部函数使用了外部函数的变量。', true, '闭包保留外部函数作用域的变量引用。'))
  push(genBlank(bankId, c6, ++idx, '将函数调用延迟执行的技术称为___。', ['闭包'], '闭包可以延迟执行并保留上下文。'))
  push(genTrueFalse(bankId, c6, ++idx, 'Python支持函数重载。', false, 'Python不支持函数重载，同名函数会覆盖。'))
  push(genSingle(bankId, c6, ++idx, '`map(int, ["1", "2", "3"])`返回的是什么类型？', [
    { l: 'A', t: 'map对象', c: true }, { l: 'B', t: '列表', c: false },
    { l: 'C', t: '元组', c: false }, { l: 'D', t: '整数', c: false }
  ], 'map返回迭代器对象。'))
  push(genTrueFalse(bankId, c6, ++idx, '`filter(None, [0, 1, "", "a"])`会过滤掉0和空字符串。', true, 'None作为过滤器时，过滤掉所有假值。'))
  push(genSingle(bankId, c6, ++idx, '`reduce(lambda a, b: a * b, [1, 2, 3, 4])`的结果是？', [
    { l: 'A', t: '24', c: true }, { l: 'B', t: '10', c: false },
    { l: 'C', t: '12', c: false }, { l: 'D', t: '报错', c: false }
  ], 'reduce累积计算：1*2*3*4=24。'))

  // ===== 第7章 面向对象（补充+24题）=====
  push(genTrueFalse(bankId, c7, ++idx, '`@staticmethod`装饰的方法不需要self参数。', true, '静态方法不接收类或实例引用。'))
  push(genSingle(bankId, c7, ++idx, '`class A: x = 1; class B(A): pass`中B.x的值是？', [
    { l: 'A', t: '1', c: true }, { l: 'B', t: '报错', c: false },
    { l: 'C', t: 'None', c: false }, { l: 'D', t: '0', c: false }
  ], '子类继承父类的类属性。'))
  push(genBlank(bankId, c7, ++idx, '在子类中调用父类构造函数的语法是___。', ['super().__init__()'], 'super()返回父类代理对象。'))
  push(genTrueFalse(bankId, c7, ++idx, '`@classmethod`装饰的方法第一个参数是类本身。', true, '类方法接收类对象cls作为第一个参数。'))
  push(genSingle(bankId, c7, ++idx, '`hasattr(obj, "attr")`的作用是？', [
    { l: 'A', t: '检查对象是否有某属性', c: true }, { l: 'B', t: '删除属性', c: false },
    { l: 'C', t: '设置属性', c: false }, { l: 'D', t: '获取属性', c: false }
  ], 'hasattr检查对象是否包含指定属性。'))
  push(genTrueFalse(bankId, c7, ++idx, 'Python支持多继承。', true, 'Python支持多继承，使用MRO解决冲突。'))
  push(genBlank(bankId, c7, ++idx, 'Python中查看类的方法解析顺序使用___属性。', ['__mro__'], '类名.__mro__返回MRO元组。'))
  push(genTrueFalse(bankId, c7, ++idx, '`@property`将方法调用变为属性访问。', true, '@property装饰的方法可以像属性一样访问。'))
  push(genSingle(bankId, c7, ++idx, '`isinstance(3, int)`的返回值是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: 'None', c: false }
  ], 'isinstance判断对象是否为指定类型。'))
  push(genTrueFalse(bankId, c7, ++idx, '`__slots__`可以限制实例属性的动态添加。', true, '__slots__列出的属性名是唯一允许的实例属性。'))
  push(genBlank(bankId, c7, ++idx, '定义一个名为xxx的私有属性应写为___。', ['self.__xxx'], '双下划线前缀触发名称改写。'))
  push(genTrueFalse(bankId, c7, ++idx, '`__new__`方法在`__init__`之前被调用。', true, '__new__创建实例，__init__初始化实例。'))

  // ===== 第8章 文件与异常（补充+24题）=====
  push(genTrueFalse(bankId, c1, ++idx, '`try-finally`中的finally块无论是否发生异常都会执行。', true, 'finally块用于清理资源。'))
  push(genSingle(bankId, c1, ++idx, '`try: 1/0 except ZeroDivisionError: print("err")`的输出是？', [
    { l: 'A', t: '"err"', c: true }, { l: 'B', t: '报错', c: false },
    { l: 'C', t: '无输出', c: false }, { l: 'D', t: '"inf"', c: false }
  ], '除以0引发ZeroDivisionError，被except捕获。'))
  push(genBlank(bankId, c1, ++idx, 'Python中使用open()打开文件默认的访问模式是___。', ['r'], 'open()默认以只读文本模式打开。'))
  push(genTrueFalse(bankId, c1, ++idx, '`with`语句可以自动管理资源上下文。', true, 'with语句自动调用__enter__和__exit__。'))
  push(genSingle(bankId, c1, ++idx, '`raise`关键字的作用是？', [
    { l: 'A', t: '主动抛出异常', c: true }, { l: 'B', t: '捕获异常', c: false },
    { l: 'C', t: '忽略异常', c: false }, { l: 'D', t: '记录异常', c: false }
  ], 'raise用于主动触发异常。'))
  push(genTrueFalse(bankId, c1, ++idx, '`else`子句可以配合`try`使用，无异常时执行。', true, 'try-else在未发生异常时执行else块。'))
  push(genBlank(bankId, c1, ++idx, '自定义异常类应继承自___类。', ['Exception'], '自定义异常继承Exception或其子类。'))
  push(genTrueFalse(bankId, c1, ++idx, '`assert 1 == 2`会引发AssertionError。', true, 'assert条件为False时引发AssertionError。'))
  push(genSingle(bankId, c1, ++idx, '文件使用完毕后应调用哪个方法关闭？', [
    { l: 'A', t: 'close()', c: true }, { l: 'B', t: 'exit()', c: false },
    { l: 'C', t: 'end()', c: false }, { l: 'D', t: 'flush()', c: false }
  ], 'close()显式关闭文件并释放资源。'))
  push(genTrueFalse(bankId, c1, ++idx, '`try-except`可以捕获所有类型的异常。', false, 'except不带类型会捕获所有异常，但通常应指定类型。'))
  push(genSingle(bankId, c1, ++idx, '`open("test.txt", "w")`如果文件不存在会怎样？', [
    { l: 'A', t: '创建新文件', c: true }, { l: 'B', t: '抛异常', c: false },
    { l: 'C', t: '返回None', c: false }, { l: 'D', t: '打开空文件', c: false }
  ], '写模式打开文件时，文件不存在则创建。'))
  push(genBlank(bankId, c1, ++idx, '读取文件所有行返回列表使用的方法名是___。', ['readlines'], 'readlines()读取所有行并返回列表。'))

  // ===== 第9章 模块与包（补充+20题）=====
  push(genTrueFalse(bankId, c1, ++idx, '`__name__`在脚本被直接运行时等于"__main__"。', true, '脚本直接运行时__name__为"__main__"。'))
  push(genSingle(bankId, c1, ++idx, '`import math`后访问圆周率应使用？', [
    { l: 'A', t: 'math.pi', c: true }, { l: 'B', t: 'math.PI', c: false },
    { l: 'C', t: 'pi', c: false }, { l: 'D', t: 'Math.pi', c: false }
  ], 'math模块的圆周率为math.pi。'))
  push(genBlank(bankId, c1, ++idx, '使用模块中的特定函数应使用___关键字。', ['from...import'], 'from math import sqrt导入特定函数。'))
  push(genTrueFalse(bankId, c1, ++idx, '`__init__.py`文件用于将目录标记为Python包。', true, '__init__.py是包的标识文件。'))
  push(genMultiple(bankId, c1, ++idx, '以下哪些是Python内置模块？', [
    { l: 'A', t: 'os', c: true }, { l: 'B', t: 'sys', c: true },
    { l: 'C', t: 'json', c: true }, { l: 'D', t: 'http', c: true }
  ], ['A', 'B', 'C', 'D'], 'os、sys、json、http都是Python标准库模块。'))
  push(genTrueFalse(bankId, c1, ++idx, '`pip`是Python的包管理工具。', true, 'pip用于安装和管理第三方包。'))
  push(genSingle(bankId, c1, ++idx, '`__all__`变量的作用是？', [
    { l: 'A', t: '控制from module import *的导出列表', c: true },
    { l: 'B', t: '列出所有全局变量', c: false },
    { l: 'C', t: '标记废弃函数', c: false },
    { l: 'D', t: '配置日志', c: false }
  ], '__all__定义from module import *时导出的名称。'))

  // ===== 第10章 进阶特性（补充+24题）=====
  push(genTrueFalse(bankId, c1, ++idx, '`yield`关键字用于定义生成器函数。', true, '包含yield的函数是生成器函数。'))
  push(genSingle(bankId, c1, ++idx, '`def gen(): yield 1; yield 2`调用next()两次后返回值是？', [
    { l: 'A', t: '1和2', c: true }, { l: 'B', t: '2和1', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: 'None和None', c: false }
  ], '生成器每次调用next执行到下一个yield。'))
  push(genBlank(bankId, c1, ++idx, '生成器表达式的最外层符号是___。', ['()'], '(x for x in range(10))是生成器表达式。'))
  push(genTrueFalse(bankId, c1, ++idx, '`isinstance(True, int)`返回True。', true, 'bool是int的子类。'))
  push(genSingle(bankId, c1, ++idx, '`@functools.lru_cache()`的作用是？', [
    { l: 'A', t: '缓存函数结果', c: true }, { l: 'B', t: '限制参数类型', c: false },
    { l: 'C', t: '延迟求值', c: false }, { l: 'D', t: '异步执行', c: false }
  ], 'lru_cache缓存函数返回值避免重复计算。'))
  push(genTrueFalse(bankId, c1, ++idx, '`any([True, False, False])`返回True。', true, 'any在任一元素为True时返回True。'))
  push(genBlank(bankId, c1, ++idx, '`all([True, True, False])`的返回值是___。', ['False'], 'all在所有元素为True时返回True。'))
  push(genSingle(bankId, c1, ++idx, '`enumerate(["a", "b", "c"])`从索引几开始？', [
    { l: 'A', t: '0', c: true }, { l: 'B', t: '1', c: false },
    { l: 'C', t: '可指定', c: true }, { l: 'D', t: '-1', c: false }
  ], 'enumerate默认从0开始，可指定start参数。'))
  push(genTrueFalse(bankId, c1, ++idx, '`zip()`函数将多个可迭代对象打包成元组。', true, 'zip并行迭代多个可迭代对象。'))
  push(genSingle(bankId, c1, ++idx, '`list(zip([1,2], ["a","b"]))`的结果是？', [
    { l: 'A', t: '[(1, "a"), (2, "b")]', c: true }, { l: 'B', t: '[(1, 2), ("a", "b")]', c: false },
    { l: 'C', t: '[1, "a", 2, "b"]', c: false }, { l: 'D', t: '报错', c: false }
  ], 'zip配对打包，每个位置元素组成元组。'))
  push(genBlank(bankId, c1, ++idx, '将列表[1,2,3]转换为迭代器使用内置函数___。', ['iter'], 'iter()返回一个迭代器对象。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中可变对象作为函数默认参数会导致多次调用共享状态。', true, '如def f(a=[])，多次调用共享同一个列表。'))
  push(genSingle(bankId, c1, ++idx, '`functools.partial`的作用是？', [
    { l: 'A', t: '固定函数的部分参数', c: true }, { l: 'B', t: '拆分函数', c: false },
    { l: 'C', t: '缓存函数', c: false }, { l: 'D', t: '延迟执行', c: false }
  ], 'partial固定部分参数，生成新函数。'))
  push(genTrueFalse(bankId, c1, ++idx, '`contextlib.contextmanager`可以用生成器定义上下文管理器。', true, 'contextmanager装饰器将生成器转为上下文管理器。'))
  push(genBlank(bankId, c1, ++idx, 'Python中用于深拷贝的方法所在的模块是___。', ['copy'], 'copy.deepcopy()执行深拷贝。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中`@wraps`装饰器用于保留被装饰函数的元信息。', true, '@wraps将原函数的__name__等属性复制到包装函数。'))
  push(genMultiple(bankId, c1, ++idx, '以下哪些是Python的内置高阶函数？', [
    { l: 'A', t: 'map', c: true }, { l: 'B', t: 'filter', c: true },
    { l: 'C', t: 'reduce', c: false }, { l: 'D', t: 'sorted', c: true }
  ], ['A', 'B', 'D'], 'map、filter、sorted是内置的；reduce在functools模块。'))
  push(genSingle(bankId, c1, ++idx, '`type("MyClass", (), {"x": 1})`创建的是什么？', [
    { l: 'A', t: '动态创建的类', c: true }, { l: 'B', t: '类的实例', c: false },
    { l: 'C', t: '元类实例', c: false }, { l: 'D', t: '报错', c: false }
  ], 'type的第二种用法动态创建类。'))
  push(genTrueFalse(bankId, c1, ++idx, '`__slots__`可以降低实例的内存占用。', true, '__slots__消除了__dict__减少内存。'))
  push(genBlank(bankId, c1, ++idx, '在Python中定义抽象基类需要导入___模块。', ['abc'], 'abc模块提供ABCMeta和abstractmethod。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python的`typing`模块提供了类型提示支持。', true, 'typing模块提供List、Dict、Optional等类型。'))
  push(genSingle(bankId, c1, ++idx, '`__init__.py`文件可以为空吗？', [
    { l: 'A', t: '可以', c: true }, { l: 'B', t: '不可以', c: false },
    { l: 'C', t: '必须包含__all__', c: false }, { l: 'D', t: '不能为空', c: false }
  ], '__init__.py可以为空，用于标识包目录。'))
  push(genTrueFalse(bankId, c1, ++idx, '`sys.path`存储Python模块搜索路径列表。', true, 'sys.path是字符串列表，可动态修改。'))
  push(genBlank(bankId, c1, ++idx, 'Python中删除对象属性使用___关键字。', ['del'], 'del obj.attr删除指定属性。'))
  push(genSingle(bankId, c1, ++idx, '`pickle.dump(obj, file)`和`pickle.load(file)`用于？', [
    { l: 'A', t: '对象序列化与反序列化', c: true }, { l: 'B', t: '文件读写', c: false },
    { l: 'C', t: '数据压缩', c: false }, { l: 'D', t: '日志记录', c: false }
  ], 'pickle模块用于Python对象的序列化。'))
  push(genTrueFalse(bankId, c1, ++idx, '`json.dumps()`将Python对象转为JSON字符串。', true, 'dumps返回JSON格式字符串。'))
  push(genBlank(bankId, c1, ++idx, '解析JSON字符串为Python对象使用___函数。', ['json.loads'], 'json.loads将JSON字符串转为Python对象。'))
  push(genTrueFalse(bankId, c1, ++idx, '`re`模块用于正则表达式操作。', true, 're提供正则匹配、搜索、替换等功能。'))
  push(genSingle(bankId, c1, ++idx, '`time.sleep(1)`的作用是？', [
    { l: 'A', t: '暂停执行1秒', c: true }, { l: 'B', t: '休眠1分钟', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: '设置定时器', c: false }
  ], 'sleep暂停当前线程指定秒数。'))
  push(genTrueFalse(bankId, c1, ++idx, '`random.randint(1, 10)`包含1和10。', true, 'randint包含两端，即闭区间。'))
  push(genBlank(bankId, c1, ++idx, '获取当前日期和时间使用___模块。', ['datetime'], 'datetime.datetime.now()获取当前时间。'))
  push(genSingle(bankId, c1, ++idx, '`os.path.join("a", "b", "c")`在Windows上的结果是？', [
    { l: 'A', t: '"a\\\\b\\\\c"', c: true }, { l: 'B', t: '"a/b/c"', c: false },
    { l: 'C', t: '"a b c"', c: false }, { l: 'D', t: '报错', c: false }
  ], 'os.path.join使用系统路径分隔符。'))
  push(genTrueFalse(bankId, c1, ++idx, '`shutil`模块提供高级文件操作功能。', true, 'shutil提供复制、移动、删除等高级操作。'))
  push(genBlank(bankId, c1, ++idx, '在当前工作目录下创建目录使用os.___。', ['mkdir'], 'os.mkdir()创建单级目录。'))
  push(genTrueFalse(bankId, c1, ++idx, '`logging`模块记录日志时默认级别是WARNING。', true, '不配置时logging只输出WARNING及以上级别。'))
  push(genSingle(bankId, c1, ++idx, '`"hello" in ["hello", "world"]`的值是？', [
    { l: 'A', t: 'True', c: true }, { l: 'B', t: 'False', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: 'None', c: false }
  ], 'in运算符检查元素是否在列表中。'))
  push(genTrueFalse(bankId, c1, ++idx, '`3 < 5 > 2`是Python中合法的链式比较。', true, 'Python支持链式比较，等价于3<5 and 5>2。'))
  push(genBlank(bankId, c1, ++idx, '数学运算中计算x的平方根使用math.___函数。', ['sqrt'], 'math.sqrt(x)计算平方根。'))
  push(genSingle(bankId, c1, ++idx, '`math.ceil(3.14)`的返回值是？', [
    { l: 'A', t: '4', c: true }, { l: 'B', t: '3', c: false },
    { l: 'C', t: '3.14', c: false }, { l: 'D', t: '报错', c: false }
  ], 'ceil向上取整。'))
  push(genTrueFalse(bankId, c1, ++idx, '`math.floor(3.99)`返回4。', false, 'floor向下取整，返回3。'))
  push(genBlank(bankId, c1, ++idx, '产生范围为[0,1)的随机浮点数使用random.___。', ['random()'], 'random.random()返回[0.0, 1.0)的浮点数。'))
  push(genTrueFalse(bankId, c1, ++idx, '`collections.deque`是双端队列，支持两端高效插入删除。', true, 'deque是双端队列，O(1)两端操作。'))
  push(genSingle(bankId, c1, ++idx, '`collections.Counter("abracadabra").most_common(1)`返回？', [
    { l: 'A', t: "[('a', 5)]", c: true }, { l: 'B', t: "['a']", c: false },
    { l: 'C', t: "[('a', 5), ('b', 2)]", c: false }, { l: 'D', t: "5", c: false }
  ], 'most_common(n)返回出现次数最多的n个元素。'))
  push(genTrueFalse(bankId, c1, ++idx, '`itertools.chain`可以将多个可迭代对象连接成一个。', true, 'chain(*iterables)将多个迭代器串联。'))
  push(genBlank(bankId, c1, ++idx, '`itertools.product([1,2], [3,4])`的结果数量是___个。', ['4'], 'product计算笛卡尔积，2*2=4个组合。'))
  push(genSingle(bankId, c1, ++idx, '`itertools.permutations([1,2,3], 2)`的结果数量是？', [
    { l: 'A', t: '6', c: true }, { l: 'B', t: '3', c: false },
    { l: 'C', t: '9', c: false }, { l: 'D', t: '12', c: false }
  ], '排列数P(3,2)=3*2=6。'))
  push(genTrueFalse(bankId, c1, ++idx, '`glob.glob("*.py")`匹配当前目录所有.py文件。', true, 'glob使用通配符匹配文件路径。'))
  push(genBlank(bankId, c1, ++idx, '`hashlib.md5(b"hello").hexdigest()`返回的是___字符串。', ['十六进制'], 'hexdigest返回32位十六进制哈希串。'))
  push(genSingle(bankId, c1, ++idx, '`statistics.mean([1, 2, 3, 4, 5])`返回？', [
    { l: 'A', t: '3', c: true }, { l: 'B', t: '2.5', c: false },
    { l: 'C', t: '3.5', c: false }, { l: 'D', t: '报错', c: false }
  ], 'mean计算算术平均数，(1+2+3+4+5)/5=3。'))
  push(genTrueFalse(bankId, c1, ++idx, '`decimal.Decimal`可以精确表示浮点数。', true, 'Decimal避免了二进制浮点数精度问题。'))
  push(genBlank(bankId, c1, ++idx, '`enum`模块中定义枚举类应继承___。', ['Enum'], '从enum导入Enum基类。'))
  push(genTrueFalse(bankId, c1, ++idx, '`dataclasses.dataclass`装饰器自动生成__init__等方法。', true, 'dataclass自动生成__init__、__repr__等。'))
  push(genSingle(bankId, c1, ++idx, '`pathlib.Path("a/b/c").parent`的结果是？', [
    { l: 'A', t: 'Path("a/b")', c: true }, { l: 'B', t: '"a/b"', c: false },
    { l: 'C', t: 'Path("a")', c: false }, { l: 'D', t: '报错', c: false }
  ], 'parent返回上一级目录的Path对象。'))
  push(genTrueFalse(bankId, c1, ++idx, '`subprocess.run(["ls", "-l"])`可用于执行外部命令。', true, 'subprocess.run执行系统命令并等待完成。'))
  push(genBlank(bankId, c1, ++idx, '`webbrowser.open("https://python.org")`在浏览器中___URL。', ['打开'], 'webbrowser.open在默认浏览器打开链接。'))
  push(genTrueFalse(bankId, c1, ++idx, '`turtle`是Python内置的绘图模块。', true, 'turtle提供海龟绘图功能。'))
  push(genSingle(bankId, c1, ++idx, '`print(bool([]))`的输出是？', [
    { l: 'A', t: 'False', c: true }, { l: 'B', t: 'True', c: false },
    { l: 'C', t: '报错', c: false }, { l: 'D', t: 'None', c: false }
  ], '空列表、空字符串、0等被视为False。'))
  push(genTrueFalse(bankId, c1, ++idx, '`print(bool("False"))`返回False。', false, '非空字符串"False"是True。'))
  push(genBlank(bankId, c1, ++idx, '判断对象是否为None应使用___而不是==。', ['is'], 'is None比较身份，==比较值。'))
  push(genSingle(bankId, c1, ++idx, '`chr(65)`和`ord("A")`分别返回？', [
    { l: 'A', t: '"A"和65', c: true }, { l: 'B', t: '65和"A"', c: false },
    { l: 'C', t: '"A"和"A"', c: false }, { l: 'D', t: '报错', c: false }
  ], 'chr(ASCII码→字符)，ord(字符→ASCII码)。'))
  push(genTrueFalse(bankId, c1, ++idx, 'Python中`@lru_cache`需要从functools导入。', true, 'from functools import lru_cache。'))
  push(genBlank(bankId, c1, ++idx, '`functools.reduce`依次对序列元素累积计算，需要___个参数。', ['3'], 'reduce(func, seq[, initial])。'))
  push(genTrueFalse(bankId, c1, ++idx, '`operator`模块提供了Python表达式的函数版本。', true, 'operator.add等替代+等运算符。'))
  push(genSingle(bankId, c1, ++idx, '`pprint.pprint`与`print`的主要区别是？', [
    { l: 'A', t: '美化打印数据结构', c: true }, { l: 'B', t: '输出到文件', c: false },
    { l: 'C', t: '彩色输出', c: false }, { l: 'D', t: '添加时间戳', c: false }
  ], 'pprint格式化输出复杂数据结构。'))
  push(genTrueFalse(bankId, c1, ++idx, '`string.Template`提供简单的字符串替换模板。', true, 'Template支持$var和${var}替换。'))
  push(genBlank(bankId, c1, ++idx, '`traceback`模块用于___。', ['处理异常追溯'], 'traceback.format_exc()获取异常堆栈字符串。'))

  return qs
}