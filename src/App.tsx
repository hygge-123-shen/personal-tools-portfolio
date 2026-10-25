import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Circle,
  Clock3,
  Code2,
  Compass,
  FileText,
  Gamepad2,
  Heart,
  Layers3,
  ListTodo,
  Mail,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";
import { profile } from "./data/profile";
import TodoApp from "./components/TodoApp";
import NotesApp from "./components/NotesApp";
import PomodoroApp from "./components/PomodoroApp";
import WeatherApp from "./components/WeatherApp";

type View = "home" | "tasks" | "notes" | "focus" | "weather";
type ToolView = Exclude<View, "home">;

const tools: Array<{
  id: View;
  number: string;
  title: string;
  description: string;
  detail: string;
  icon: typeof ListTodo;
  tone: string;
}> = [
  {
    id: "home",
    number: "01",
    title: "个人作品集",
    description: "把学习中的实践，整理成一张清楚的名片。",
    detail: "个人介绍 · 技能 · 项目",
    icon: Layers3,
    tone: "mint",
  },
  {
    id: "tasks",
    number: "02",
    title: "进阶待办",
    description: "分类、优先级、截止日期与搜索，一页掌控。",
    detail: "创建 · 筛选 · 统计",
    icon: ListTodo,
    tone: "lime",
  },
  {
    id: "notes",
    number: "03",
    title: "Markdown 笔记",
    description: "左边写，右边看；灵感不必离开当前页面。",
    detail: "实时预览 · 语法高亮",
    icon: FileText,
    tone: "blue",
  },
  {
    id: "focus",
    number: "04",
    title: "番茄钟",
    description: "给专注一个边界，让休息也成为计划的一部分。",
    detail: "计时 · 提醒 · 记录",
    icon: Clock3,
    tone: "coral",
  },
  {
    id: "weather",
    number: "05",
    title: "天气查询",
    description: "查看眼前的天气，也看看接下来几天的变化。",
    detail: "天气 · 预报 · 收藏",
    icon: Sun,
    tone: "amber",
  },
];

function viewFromHash(): View {
  const hash = window.location.hash.replace("#", "");
  return ["tasks", "notes", "focus", "weather"].includes(hash)
    ? (hash as ToolView)
    : "home";
}

export default function App() {
  const [view, setView] = useState<View>(() =>
    typeof window === "undefined" ? "home" : viewFromHash(),
  );

  useEffect(() => {
    const sync = () => setView(viewFromHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = (next: View) => {
    if (next === "home") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      setView("home");
    } else {
      window.location.hash = next;
      setView(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedTool = tools.find((tool) => tool.id === view);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand-mark" onClick={() => navigate("home")} aria-label="返回首页">
          <span className="brand-symbol">F.</span>
        </button>
        <div className="side-rule" />
        <nav className="side-nav" aria-label="主导航">
          <button
            className={view === "home" ? "side-link active" : "side-link"}
            onClick={() => navigate("home")}
            aria-label="个人作品集"
            title="个人作品集"
          >
            <Compass size={19} />
          </button>
          {tools.slice(1).map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                className={view === tool.id ? "side-link active" : "side-link"}
                onClick={() => navigate(tool.id)}
                aria-label={tool.title}
                title={tool.title}
              >
                <Icon size={19} />
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <span className="online-dot" title="可交互演示" />
          <span className="mono tiny">LAB / 25</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="wordmark" onClick={() => navigate("home")}>
            <span>个人工具实验室</span>
            <span className="wordmark-divider">/</span>
            <span className="wordmark-en">PORTFOLIO</span>
          </button>
          <nav className="top-links" aria-label="页面导航">
            <button onClick={() => navigate("home")}>作品</button>
            <a href="#about" onClick={() => view !== "home" && navigate("home")}>关于</a>
            <a href="#contact" onClick={() => view !== "home" && navigate("home")}>联系</a>
          </nav>
          <a className="top-contact" href={"mailto:" + profile.email}>
            <span>联系我</span>
            <ArrowUpRight size={15} />
          </a>
        </header>

        {view === "home" ? (
          <HomePage onNavigate={navigate} />
        ) : (
          <ToolPage
            title={selectedTool?.title ?? ""}
            description={selectedTool?.description ?? ""}
            number={selectedTool?.number ?? ""}
            onBack={() => navigate("home")}
          >
            {view === "tasks" && <TodoApp />}
            {view === "notes" && <NotesApp />}
            {view === "focus" && <PomodoroApp />}
            {view === "weather" && <WeatherApp />}
          </ToolPage>
        )}
      </main>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />个人作品集 · 2026</div>
          <h1>
            让想法落地，
            <br />
            <span className="hero-emphasis">让工具好用。</span>
          </h1>
          <p className="hero-intro">{profile.intro}</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => onNavigate("tasks")}>
              探索项目 <ArrowRight size={16} />
            </button>
            <a className="text-link" href="#about">认识我 <ArrowDown size={15} /></a>
          </div>
          <div className="hero-meta">
            <span className="meta-avatar"><UserRound size={17} /></span>
            <span><strong>{profile.name}</strong><small>{profile.headline}</small></span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-grid" />
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-star star-a">✳</div>
          <div className="art-star star-b">✦</div>
          <div className="art-card">
            <div className="art-card-top"><span className="mini-dot" /><span className="mini-dot" /><span className="mini-dot" /><span className="mono">DAILY / LOG</span></div>
            <div className="art-card-title">今天，做一点<br /><i>有用的东西。</i></div>
            <div className="art-progress"><span /></div>
            <div className="art-card-foot"><span>FOCUS SESSION</span><strong>25:00</strong></div>
          </div>
          <div className="floating-note"><Sparkles size={16} /><span>Build something<br />useful.</span></div>
          <div className="art-caption mono">IDEAS → SMALL TOOLS → EVERYDAY</div>
        </div>
        <div className="hero-bottomline"><span>01 / 05</span><span>从这里开始，随便逛逛 ↓</span><span>SCROLL TO EXPLORE</span></div>
      </section>

      <section className="section-block projects-section" id="work">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" />精选项目</div>
            <h2>五个小工具，<span className="muted">五种日常。</span></h2>
          </div>
          <p>都是可以直接使用的交互演示。试着点开一个，看看它能不能帮上忙。</p>
        </div>
        <div className="project-grid">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                className={"project-card " + tool.tone}
                onClick={() => onNavigate(tool.id)}
              >
                <div className="project-card-top">
                  <span className="project-number mono">{tool.number} / 05</span>
                  <span className="project-icon"><Icon size={20} /></span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <div className="project-card-bottom"><span>{tool.detail}</span><span className="circle-arrow"><ArrowUpRight size={16} /></span></div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="about-section section-block" id="about">
        <div className="about-label">
          <div className="eyebrow"><span className="eyebrow-line" />关于我</div>
          <span className="about-index mono">A LITTLE ABOUT ME</span>
        </div>
        <div className="about-main">
          <h2>认真做小事，<br /><span className="hero-emphasis">也认真玩游戏。</span></h2>
          <p>你好，我是<strong>{profile.name}</strong>，一名大学生。正在把课程里学到的前端、数据存储与 API 调用，变成可以亲手操作的小项目。做工具像打游戏：先找到目标，再一关一关推进。</p>
          <div className="skill-groups">
            <div className="skill-group">
              <span className="skill-label"><Gamepad2 size={15} />兴趣技能</span>
              <div className="skill-pills">{profile.interests.map((skill) => <span key={skill} className="skill-pill">{skill}</span>)}</div>
            </div>
            <div className="skill-group">
              <span className="skill-label"><Code2 size={15} />本次实践</span>
              <div className="skill-pills">{profile.practiceSkills.map((skill) => <span key={skill} className="skill-pill subdued">{skill}</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-copy">
          <div className="eyebrow"><span className="eyebrow-line" />保持联系</div>
          <h2>有想法，<span className="hero-emphasis">欢迎来聊。</span></h2>
          <p>想交流游戏、工具，或者一起把某个点子做出来？发我一封邮件。</p>
        </div>
        <a className="contact-email" href={"mailto:" + profile.email}>
          <span className="contact-email-icon"><Mail size={18} /></span>
          <span>{profile.email}</span>
          <ArrowUpRight size={18} />
        </a>
        <div className="contact-spark">✳</div>
      </section>

      <footer className="site-footer">
        <span>© 2026 {profile.name}</span>
        <span>MADE WITH CURIOSITY <Heart size={12} fill="currentColor" /></span>
        <button onClick={() => onNavigate("home")}>回到顶部 ↑</button>
      </footer>
    </div>
  );
}

function ToolPage({
  title,
  description,
  number,
  onBack,
  children,
}: {
  title: string;
  description: string;
  number: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="tool-page">
      <div className="tool-page-heading">
        <button className="back-link" onClick={onBack}><ArrowLeft size={15} />返回作品集</button>
        <div className="tool-title-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" />PROJECT {number} / 05</div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <span className="tool-status"><Circle size={7} fill="currentColor" />可交互演示</span>
        </div>
      </div>
      <div className="tool-workspace">{children}</div>
      <footer className="tool-footer">
        <span>PERSONAL TOOL LAB</span>
        <button onClick={onBack}>其他项目 <ArrowRight size={14} /></button>
      </footer>
    </div>
  );
}

