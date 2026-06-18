// 预设标签数据
export const TAG_CATEGORIES = [
  {
    id: 'age',
    label: '年龄段',
    icon: '🎂',
    type: 'single',
    options: ['00后', '95后', '90后', '85后', '80后及以上'],
  },
  {
    id: 'career',
    label: '职业方向',
    icon: '💼',
    type: 'single',
    options: ['技术', '设计', '产品', '运营', '市场', '学生', '自由职业', '其他'],
  },
  {
    id: 'hobbies',
    label: '兴趣爱好',
    icon: '🎯',
    type: 'multi',
    maxSelect: 5,
    options: [
      '游戏', '音乐', '阅读', '运动', '旅行', '美食',
      '摄影', '编程', '追剧', '手工', '社交', '独处',
      '写作', '画画', '户外', '宠物',
    ],
  },
  {
    id: 'social',
    label: '社交偏好',
    icon: '👥',
    type: 'single',
    options: ['大型聚会嗨起来', '三五好友小聚', '独来独往最舒服'],
  },
  {
    id: 'decision',
    label: '做决定的方式',
    icon: '🧠',
    type: 'single',
    options: ['理性分析利弊', '跟着感觉走', '看情况，都有'],
  },
  {
    id: 'lifestyle',
    label: '生活节奏',
    icon: '⏰',
    type: 'single',
    options: ['计划控，提前安排好一切', '随性派，走到哪算哪', '大方向有计划，细节随意'],
  },
]

// 用于结束对话的关键词
export const END_KEYWORDS = [
  '结束', '终止', '停止', '不聊了', '出报告', '生成报告',
  '可以了', '够了', '就到这', '就这样', '结束吧', '好了',
  'end', 'stop', 'finish', 'done', 'quit',
]
