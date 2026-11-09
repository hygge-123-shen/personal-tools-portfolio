'use strict';

const CourseClassroom = (() => {
  let handler;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function markdown(value) {
    const format = line => escape(line).replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return String(value).replace(/\r\n?/g, '\n').split(/(```[^\n]*\n[\s\S]*?```)/g).map((part, index) => {
      if (index % 2) return '<pre><code>' + escape(part.slice(part.indexOf('\n') + 1, -3).trimEnd()) + '</code></pre>';
      return part.trim().split(/\n{2,}/).filter(Boolean).map(block => {
        const lines = block.split('\n');
        if (lines.every(line => /^[-*] /.test(line))) return '<ul>' + lines.map(line => '<li>' + format(line.slice(2)) + '</li>').join('') + '</ul>';
        const heading = lines.length === 1 && block.match(/^(#{1,5}) (.+)$/);
        if (heading) {
          const level = heading[1].length + 1;
          return '<h' + level + '>' + format(heading[2]) + '</h' + level + '>';
        }
        return '<p>' + lines.map(format).join('<br>') + '</p>';
      }).join('');
    }).join('');
  }

  function response(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  }

  function fail(error, status = 400) {
    return response({ error }, status);
  }

  function paginate(items, page, pageSize = 10) {
    const pages = Math.max(1, Math.ceil(items.length / pageSize));
    const current = Math.min(pages, Math.max(1, Math.trunc(Number(page) || 1)));
    return { items: items.slice((current - 1) * pageSize, current * pageSize), total: items.length, page: current, pageSize, pages };
  }

  function install(key, defaults, handle) {
    handler = async (input, options = {}) => {
      const demoOrigin = 'https://classroom.invalid';
      const url = new URL(input, demoOrigin);
      if (url.origin !== demoOrigin || !url.pathname.startsWith('/api/')) return fail('课堂演示只处理本页的体验操作。', 404);
      const method = (options.method || 'GET').toUpperCase();
      const token = new Headers(options.headers).get('Authorization')?.replace(/^Bearer /, '');
      const session = window.ZhuyingDemo.isAuthorized(token) ? window.ZhuyingDemo.getSession() : null;
      let data = structuredClone(defaults);
      try {
        const value = localStorage.getItem(key);
        if (value) data = { ...data, ...JSON.parse(value) };
      } catch {
        // The examples can still be browsed if storage is unavailable.
      }

      try {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
        if (method === 'POST' && url.pathname === '/api/auth/login') {
          return response(window.ZhuyingDemo.login(body.username, body.password));
        }
        if (method !== 'GET' && !session) return fail('请先登录课堂演示账号。', 401);
        if (method === 'POST' && url.pathname === '/api/preview') return response({ html: markdown(String(body.content || '').slice(0, 50000)) });
        if (url.pathname === '/api/uploads') return fail('课堂演示使用文字内容，文件上传请在原项目体验。', 403);
        const save = () => {
          try { localStorage.setItem(key, JSON.stringify(data)); }
          catch { throw new Error('浏览器无法保存体验内容。请使用允许本站存储数据的浏览器窗口。'); }
        };
        return handle({ url, method, body, session, data, save });
      } catch (error) {
        return fail(error.message || '体验操作未能完成。');
      }
    };
  }

  async function request(path, options) {
    if (!handler) throw new Error('课堂演示未加载，请刷新页面后重试。');
    return handler(path, options);
  }

  return { fail, install, markdown, paginate, request, response };
})();
