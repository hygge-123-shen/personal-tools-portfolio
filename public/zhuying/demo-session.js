(() => {
  const key = 'zhuying-classroom-session-v1';
  const username = "hygge070209@gmail.com";
  const password = '12345678';
  const user = { id: 9001, username: 'teacher', email: 'teacher@example.invalid', display_name: '课堂演示', nickname: '课堂演示', bio: '', avatar: '', points: 0 };

  function getSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (typeof saved?.token === 'string' && saved.expiresAt > Date.now()) {
        return { token: saved.token, user: { ...user } };
      }
    } catch { /* A browser with storage disabled stays in guest mode. */ }
    return null;
  }

  function login(account, secret) {
    if (typeof account !== 'string' || account.trim().toLowerCase() !== username.toLowerCase() || secret !== password) {
      throw new Error('演示账号或密码有误。');
    }
    const token = crypto.randomUUID();
    try {
      localStorage.setItem(key, JSON.stringify({ token, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }));
    } catch {
      throw new Error('当前浏览器无法保存演示登录，请允许站点存储后重试。');
    }
    return { token, user: { ...user } };
  }

  function logout() {
    localStorage.removeItem(key);
  }

  window.ZhuyingDemo = Object.freeze({
    USERNAME: username, PASSWORD: password, getSession, login, logout,
    isAuthorized: token => !!token && getSession()?.token === token,
  });
})();
