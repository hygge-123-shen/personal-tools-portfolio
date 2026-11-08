'use strict';

function installCoursePreview(project, examples) {
  const previewOnly = '这是只读作品预览。完整互动需启动原项目。';
  const exampleMissing = '没有找到这条演示记录。';

  function result(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  }

  function itemById(records, id) {
    const item = records.find(record => record.id === Number(id));
    return item ? result({ item }) : result({ error: exampleMissing }, 404);
  }

  function paginate(items, search, size) {
    const pages = Math.max(1, Math.ceil(items.length / size));
    const page = Math.max(1, Math.min(pages, Number(search.get('page')) || 1));
    return { items: items.slice((page - 1) * size, page * size), total: items.length, page, pageSize: size, pages };
  }

  function includes(value, search) {
    return value.toLowerCase().includes((search || '').trim().toLowerCase());
  }

  window.fetch = async (input, options = {}) => {
    const url = new URL(input, 'http://preview.invalid');
    const [, apiPrefix, resource, id] = url.pathname.split('/');
    const search = url.searchParams;
    if (apiPrefix !== 'api' || (options.method || 'GET').toUpperCase() !== 'GET') {
      return result({ error: previewOnly }, 403);
    }

    if (project === 'blog') {
      if (resource === 'categories') {
        const items = examples.categories.map(category => ({
          ...category,
          post_count: examples.posts.filter(post => post.category_id === category.id).length
        }));
        return result({ items });
      }
      if (resource === 'posts') {
        if (id) return itemById(examples.posts, id);
        const category = Number(search.get('category'));
        const tag = search.get('tag');
        const filtered = examples.posts.filter(post => (!category || post.category_id === category)
          && (!tag || post.tags.includes(tag))
          && includes(`${post.title} ${post.content} ${post.tags.join(' ')}`, search.get('q') || search.get('keyword')));
        return result(paginate(filtered, search, 10));
      }
    }

    if (project === 'questions') {
      const { questions, answers } = examples;
      if (resource === 'community') {
        const counts = new Map();
        for (const question of questions) {
          for (const tag of question.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
        }
        const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
        return result({ tags, leaders: [{ username: 'helper', points: 140 }, { username: 'demo', points: 125 }],
          stats: { questions: questions.length, answers: answers.length, solved: questions.filter(question => question.is_solved).length, members: 2 } });
      }
      if (resource === 'questions' && id) {
        const item = questions.find(question => question.id === Number(id));
        if (!item) return result({ error: exampleMissing }, 404);
        const thread = answers.filter(answer => answer.question_id === item.id);
        return result({ item, answers: thread, answerTotal: thread.length, answerPage: 1, answerPageSize: 10 });
      }
      if (resource === 'questions') {
        const tag = search.get('tag');
        const sort = search.get('sort');
        const filtered = questions.filter(question => (sort !== 'unsolved' || !question.is_solved)
          && (!tag || question.tags.includes(tag))
          && includes(`${question.title} ${question.content} ${question.tags.join(' ')}`, search.get('keyword')));
        if (sort === 'hot') filtered.sort((a, b) => b.votes - a.votes || b.views - a.views);
        return result(paginate(filtered, search, 10));
      }
    }

    if (project === 'shop' && resource === 'products') {
      if (id) return itemById(examples.products, id);
      const category = search.get('category');
      const categories = [...new Set(examples.products.map(product => product.category))];
      const filtered = examples.products.filter(product => (!category || product.category === category)
        && includes(`${product.name} ${product.description}`, search.get('keyword')));
      return result({ ...paginate(filtered, search, 12), categories });
    }

    return result({ error: previewOnly }, 403);
  };
}
