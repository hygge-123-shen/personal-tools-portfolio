'use strict';

const seed = {
  tasks: [
    { id: 'task-quiz', title: '做一个性格趣味测试', category: '编程基础', level: '入门', duration: '30 分钟', emoji: '🧩', color: 'lavender', summary: '用条件判断和变量，制作一个有趣的互动问答。', knowledge: ['变量与数据类型', '条件判断', '用户输入'], steps: ['设计 3 到 5 个问题和选项', '为不同答案设置分值或类型', '根据结果展示个性化结论'] },
    { id: 'task-pattern', title: '让代码画出规律', category: '编程基础', level: '入门', duration: '40 分钟', emoji: '🎨', color: 'peach', summary: '用循环发现数字规律，并把规律变成图案。', knowledge: ['循环结构', '计数器', '规律观察'], steps: ['选择一个重复的图形或数字规律', '找出重复次数和变化规则', '用循环思路描述生成过程'] },
    { id: 'task-data', title: '班级数据小看板', category: '数据应用', level: '进阶', duration: '60 分钟', emoji: '📊', color: 'mint', summary: '整理一组简单数据，用图表讲清楚一个发现。', knowledge: ['数据整理', '平均值与占比', '图表表达'], steps: ['选择一组适合展示的数据', '计算总数、平均值或占比', '选合适的图表并写一句发现'] },
    { id: 'task-ai', title: '设计一个智能小帮手', category: '智能应用', level: '进阶', duration: '60 分钟', emoji: '🤖', color: 'blue', summary: '构思一个 AI 助手，明确它能帮谁解决什么问题。', knowledge: ['人工智能应用', '提示词设计', '隐私与责任'], steps: ['确定目标用户和使用场景', '写出助手的输入、处理和输出', '思考准确性、隐私和使用边界'] }
  ],
  works: [
    { id: 'demo-1', title: '今天的心情气象站', author: '小林同学', taskId: 'task-quiz', description: '回答三个小问题，看看今天更像晴天、微风还是彩虹。把条件判断变成了一个轻松的小测试！', link: '', image: '', tags: ['条件判断', '互动设计'], createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), likes: 12, favorites: 4 },
    { id: 'demo-2', title: '校园午餐偏好图', author: '阿哲', taskId: 'task-data', description: '收集了 28 位同学的午餐偏好，用条形图发现米饭套餐最受欢迎。数据也能讲故事。', link: '', image: '', tags: ['数据可视化', '校园生活'], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), likes: 9, favorites: 3 },
    { id: 'demo-3', title: '专注力番茄伙伴', author: 'Mia', taskId: 'task-ai', description: '一个温柔提醒休息的学习助手构想：它根据专注时长提醒喝水、活动，也会尊重用户自己安排的节奏。', link: '', image: '', tags: ['人工智能', '学习工具'], createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), likes: 15, favorites: 7 }
  ],
  interactions: []
};

const workshopStore = 'zhuying-demo-creative-workshop';
let workshopData = structuredClone(seed);
try {
  const savedWorkshop = localStorage.getItem(workshopStore);
  if (savedWorkshop) workshopData = JSON.parse(savedWorkshop);
} catch {
  // Keep the original demo content when browser storage is unavailable.
}

function saveWorkshop() {
  try {
    localStorage.setItem(workshopStore, JSON.stringify(workshopData));
  } catch {
    // The current preview stays usable with in-memory data.
  }
}

function workshopLocalApi(path, { method = 'GET', body, query = '' } = {}) {
  const { tasks, works, interactions } = workshopData;
  if (method === 'GET' && path === '/api/tasks') return tasks;
  if (method === 'GET' && path === '/api/works') {
    const keyword = query.trim().toLowerCase();
    return works.filter(work => `${work.title} ${work.author} ${work.description} ${work.tags.join(' ')}`.toLowerCase().includes(keyword))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const fields = body ? JSON.parse(body) : {};
  if (method === 'POST' && path === '/api/works') {
    const { title, description, author, taskId, link } = fields;
    const task = tasks.find(item => item.id === taskId);
    if (!title?.trim() || !description?.trim() || !task) {
      throw new Error('请填写作品名称、作品介绍，并选择有效任务');
    }
    if (link && !/^https?:\/\//i.test(link.trim())) throw new Error('作品链接请以 http:// 或 https:// 开头');

    const work = {
      id: crypto.randomUUID(), title: title.trim().slice(0, 80), description: description.trim().slice(0, 1200),
      author: author || '我', taskId, link: (link || '').trim().slice(0, 500),
      tags: task.knowledge.slice(0, 2), createdAt: new Date().toISOString(), likes: 0, favorites: 0
    };
    works.push(work);
    saveWorkshop();
    return work;
  }

  const interaction = path.match(/^\/api\/works\/([^/]+)\/(like|favorite)$/);
  if (method === 'POST' && interaction) {
    const [, id, type] = interaction;
    const work = works.find(item => item.id === decodeURIComponent(id));
    if (!work) throw new Error('没有找到这个作品');
    const user = fields.user || '访客';
    const index = interactions.findIndex(item => item.workId === work.id && item.user === user && item.type === type);
    const counter = type === 'like' ? 'likes' : 'favorites';
    if (index >= 0) {
      interactions.splice(index, 1);
      work[counter] = Math.max(0, work[counter] - 1);
    } else {
      interactions.push({ workId: work.id, user, type });
      work[counter]++;
    }
    saveWorkshop();
    return { work, active: index < 0 };
  }

  throw new Error('该操作在本地演示中不可用');
}
