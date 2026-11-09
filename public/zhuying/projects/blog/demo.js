'use strict';

function installBlogDemo(examples) {
  const { fail, install, markdown, paginate, response } = CourseClassroom;
  const limit = (value, max) => String(value || '').trim().slice(0, max);
  const nextId = (items, counter) => Math.max(counter || 9000, ...items.map(item => item.id)) + 1;

  install('zhuying-classroom-blog-v1', { posts: [], categories: [] }, ({ url, method, body, session, data, save }) => {
    const [, , resource, rawId] = url.pathname.split('/');
    const id = Number(rawId);
    const search = url.searchParams;
    const user = session?.user;
    const posts = [...data.posts, ...examples.posts];
    const categories = [...examples.categories, ...data.categories];

    if (resource === 'me') return user ? response({ user }) : fail('请先登录课堂演示账号。', 401);
    if (resource === 'categories' && method === 'GET') {
      return response({ items: categories.map(category => ({
        ...category,
        post_count: posts.filter(post => post.category_id === category.id).length
      })) });
    }
    if (resource === 'categories') {
      const old = data.categories.find(category => category.id === id && category.creator_id === user.id);
      if (method !== 'POST' && !old) return fail('只能修改演示账号创建的分类。', 403);
      if (method === 'DELETE') {
        if (posts.some(post => post.category_id === id)) return fail('请先移动或删除该分类下的文章。');
        data.categories = data.categories.filter(category => category.id !== id);
        save();
        return response({});
      }
      const name = limit(body.name, 30);
      if (!name || categories.some(category => category.name === name && category !== old)) return fail('请输入未被使用的分类名称。');
      const item = { id: old?.id || nextId(categories, data.lastCategory), name, description: limit(body.description, 200), creator_id: user.id };
      if (old) Object.assign(old, item);
      else { data.categories.push(item); data.lastCategory = item.id; }
      save();
      return response({ item });
    }
    if (resource !== 'posts') return fail('课堂演示中没有这个功能。', 404);
    if (method === 'GET' && id) {
      const item = posts.find(post => post.id === id);
      return item ? response({ item: { ...item, category: categories.find(category => category.id === item.category_id)?.name || item.category } }) : fail('没有找到这篇文章。', 404);
    }
    if (method === 'GET') {
      const category = Number(search.get('category'));
      const keyword = (search.get('keyword') || '').trim().toLowerCase();
      const tag = search.get('tag');
      const mine = search.get('mine') === '1';
      if (mine && !user) return fail('请先登录课堂演示账号。', 401);
      const items = posts.filter(post => (!category || post.category_id === category)
        && (!tag || post.tags.includes(tag)) && (!mine || post.author_id === user.id)
        && `${post.title} ${post.content}`.toLowerCase().includes(keyword))
        .map(post => ({ ...post, category: categories.find(category => category.id === post.category_id)?.name || post.category }));
      return response(paginate(items, search.get('page')));
    }

    const old = data.posts.find(post => post.id === id && post.author_id === user.id);
    if (method !== 'POST' && !old) return fail('只能修改演示账号发布的文章。', 403);
    if (method === 'DELETE') {
      data.posts = data.posts.filter(post => post.id !== id);
      save();
      return response({});
    }
    const title = limit(body.title, 100);
    const content = limit(body.content, 50000);
    const category = categories.find(item => item.id === Number(body.category_id));
    if (!title || !content || !category) return fail('请填写标题、正文，并选择分类。');
    const tags = Array.isArray(body.tags) ? [...new Set(body.tags.map(tag => limit(tag, 24)).filter(Boolean))].slice(0, 8) : [];
    const now = new Date().toISOString();
    const item = {
      id: old?.id || nextId(posts, data.lastPost), title, content, tags, category: category.name, category_id: category.id,
      excerpt: content.replace(/[#*`]/g, '').slice(0, 94), content_html: markdown(content), cover: '',
      author: user.display_name || user.username, author_id: user.id, views: 0,
      created_at: old?.created_at || now, updated_at: now
    };
    if (old) Object.assign(old, item);
    else { data.posts.unshift(item); data.lastPost = item.id; }
    save();
    return response({ item });
  });
}
