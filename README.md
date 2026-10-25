# 个人工具实验室

一个可以直接体验五个完整示例的个人作品集：

- 个人作品集
- 进阶待办事项
- Markdown 笔记
- 番茄钟
- 天气查询与收藏

## 本地运行

安装 Node.js 22 或更新版本后，在项目目录安装依赖并启动开发服务器：

    npm install
    npm run dev

生成生产版本：

    npm run build

## 更新个人资料

编辑 src/data/profile.ts。将称呼、简介、兴趣和联系链接替换为你希望公开的信息。邮箱和 GitHub 链接留空时会隐藏对应按钮。

## 部署方式

### Vercel

从 Vercel 导入代码仓库，框架选择 Vite 或使用自动识别，构建命令 npm run build，输出目录 dist。

### Netlify

从 Netlify 导入仓库。项目中的 netlify.toml 已设置构建命令和 dist 发布目录。

### GitHub Pages

将项目推送到 GitHub 仓库的 main 分支，并在仓库 Settings → Pages 中把发布来源设为 GitHub Actions。工作流会自动构建并发布。

## 部署方式差异记录

- Vercel：自动识别 Vite，预览部署和 Git 集成顺手，适合快速发布与持续更新。
- Netlify：通过 netlify.toml 显式固定构建设置，适合配置静态站点行为和部署预览。
- GitHub Pages：依靠 GitHub Actions 构建静态文件，和代码仓库紧密结合，配置步骤更多，但适合静态项目与学习 CI。

## 天气服务

天气模块使用 Open-Meteo 的公开地理编码与预报接口，不需要 API Key，可直接部署体验。定位功能仅在点击按钮后请求浏览器授权。

