# 技术设计

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS Vite 插件与项目级 CSS
- react-markdown + react-syntax-highlighter
- lucide-react 图标
- LocalStorage 保存本地演示数据
- Open-Meteo 地理编码与天气 API（无需密钥）

## 页面结构

src/
  App.tsx
  components/
    TodoApp.tsx
    NotesApp.tsx
    PomodoroApp.tsx
    WeatherApp.tsx
  data/
    profile.ts
  services/
    weather.ts
  styles.css
  main.tsx

所有内容由一个 Vite SPA 承载，使用 hash 导航切换五个演示，避免不同静态托管平台的深层路由回退差异。

## 数据管理

- 个人资料集中在 src/data/profile.ts，邮箱和主页链接留空时会隐藏对应按钮。
- 待办、笔记、番茄钟设置/记录和天气收藏使用独立的 LocalStorage key。
- 天气查询由 src/services/weather.ts 封装；输入城市先查询坐标，再获取当前天气与每日预报。
- Geolocation 只在用户点击定位按钮后触发；浏览器通知只在用户主动开启后申请权限。

## 部署设计

- Vite 输出静态文件至 dist/，项目使用相对资源路径，适用于仓库子路径下的 GitHub Pages。
- Vercel 从项目自动识别 Vite，输出目录为 dist。
- Netlify 使用根目录 netlify.toml 中的构建命令与发布目录。
- GitHub Pages 使用 .github/workflows/deploy.yml 构建并发布 dist。

