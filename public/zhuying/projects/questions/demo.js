'use strict';

function installQuestionDemo(examples) {
  const { fail, install, markdown, paginate, response } = CourseClassroom;
  const limit = (value, max) => String(value || '').trim().slice(0, max);

  install('zhuying-classroom-questions-v1', { questions: [], answers: [], votes: [], accepted: {}, points: 30 }, ({ url, method, body, session, data, save }) => {
    const [, , resource, rawId, action] = url.pathname.split('/');
    const id = Number(rawId);
    const search = url.searchParams;
    const user = session?.user;
    const questions = [...data.questions, ...examples.questions];
    const answers = [...data.answers, ...examples.answers];

    function withVotes(item, type) {
      const liked = data.votes.includes(type + ':' + item.id);
      return { ...item, liked: Boolean(user && liked), votes: (item.votes || 0) + Number(liked) };
    }

    function questionDetail(question) {
      const acceptedId = data.accepted[question.id];
      return { ...withVotes(question, 'questions'), answers_count: answers.filter(answer => answer.question_id === question.id).length,
        is_solved: Boolean(question.is_solved || acceptedId) };
    }

    if (resource === 'me') return user ? response({ user: { ...user, points: data.points } }) : fail('请先登录课堂演示账号。', 401);
    if (method === 'GET' && resource === 'community') {
      const tags = new Map();
      for (const question of questions) {
        for (const tag of question.tags) tags.set(tag, (tags.get(tag) || 0) + 1);
      }
      return response({ tags: [...tags].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
        leaders: [{ username: 'helper', points: 140 }, { username: 'demo', points: 125 }],
        stats: { questions: questions.length, answers: answers.length, solved: questions.filter(question => questionDetail(question).is_solved).length, members: 2 + Number(data.questions.length > 0 || data.answers.length > 0) } });
    }
    if (method === 'GET' && resource === 'questions' && id) {
      const question = questions.find(item => item.id === id);
      if (!question) return fail('没有找到这个问题。', 404);
      const item = questionDetail(question);
      const thread = answers.filter(answer => answer.question_id === id)
        .map(answer => ({ ...withVotes(answer, 'answers'), is_accepted: Boolean(answer.is_accepted || data.accepted[id] === answer.id),
          author_points: answer.author_id === user?.id ? data.points : answer.author_points }))
        .sort((a, b) => Number(b.is_accepted) - Number(a.is_accepted) || b.votes - a.votes);
      const page = paginate(thread, search.get('answerPage'));
      return response({ item, answers: page.items, answerTotal: page.total, answerPage: page.page, answerPageSize: page.pageSize });
    }
    if (method === 'GET' && resource === 'questions') {
      const sort = search.get('sort');
      const tag = search.get('tag');
      const keyword = (search.get('keyword') || '').toLowerCase();
      const items = questions.map(questionDetail).filter(question => (sort !== 'unsolved' || !question.is_solved)
        && (!tag || question.tags.includes(tag)) && `${question.title} ${question.content} ${question.tags.join(' ')}`.toLowerCase().includes(keyword));
      if (sort === 'hot') items.sort((a, b) => b.votes - a.votes || b.views - a.views);
      return response(paginate(items, search.get('page')));
    }
    if (method !== 'POST') return fail('课堂演示中没有这个功能。', 404);
    if (resource === 'questions' && !rawId) {
      const title = limit(body.title, 120);
      const content = limit(body.content, 20000);
      if (title.length < 5 || content.length < 10) return fail('标题至少 5 个字，描述至少 10 个字。');
      if (data.points < 5) return fail('积分不足。可以先回答一个示例问题。');
      const tags = Array.isArray(body.tags) ? [...new Set(body.tags.map(tag => limit(tag, 24)).filter(Boolean))].slice(0, 8) : [];
      const newId = Math.max(9000, ...questions.map(question => question.id)) + 1;
      data.questions.unshift({ id: newId, title, content, tags, content_html: markdown(content),
        author: user.display_name || user.username, author_id: user.id, votes: 0, views: 0, created_at: new Date().toISOString() });
      data.points -= 5;
      save();
      return response({ id: newId, message: '问题已发布' });
    }
    if (resource === 'questions' && action === 'answers') {
      const content = limit(body.content, 20000);
      if (!questions.some(question => question.id === id)) return fail('没有找到这个问题。', 404);
      if (content.length < 5) return fail('回答至少 5 个字。');
      const newId = Math.max(9000, ...answers.map(answer => answer.id)) + 1;
      data.points += 10;
      data.answers.push({ id: newId, question_id: id, content, content_html: markdown(content),
        author: user.display_name || user.username, author_id: user.id, author_points: data.points, votes: 0, created_at: new Date().toISOString() });
      save();
      return response({ id: newId, message: '回答已发布' });
    }
    if (action === 'vote' && (resource === 'questions' || resource === 'answers')) {
      const item = (resource === 'questions' ? questions : answers).find(record => record.id === id);
      if (!item) return fail('没有找到这条分享。', 404);
      if (item.author_id === user.id) return fail('可以给示例问题或其他作者的回答点赞。');
      const vote = resource + ':' + id;
      const liked = !data.votes.includes(vote);
      if (liked) data.votes.push(vote);
      else data.votes = data.votes.filter(key => key !== vote);
      save();
      return response({ liked });
    }
    if (resource === 'answers' && action === 'accept') {
      const answer = answers.find(item => item.id === id);
      const question = answer && data.questions.find(item => item.id === answer.question_id && item.author_id === user.id);
      if (!question || data.accepted[question.id]) return fail('只能为自己尚未解决的问题采纳一个答案。', 403);
      data.accepted[question.id] = id;
      if (answer.author_id === user.id) data.points += 30;
      save();
      return response({ message: '已采纳为最佳答案' });
    }
    return fail('课堂演示中没有这个功能。', 404);
  });
}
