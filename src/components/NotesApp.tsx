import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Bold,
  FilePlus2,
  FileText,
  Heading2,
  List,
  Search,
  Trash2,
  X,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

const codeFence = String.fromCharCode(96).repeat(3);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("typescript", typescript);
const starterNotes: Note[] = [
  {
    id: "note-welcome",
    title: "欢迎来到灵感角落",
    body:
      "# 把想法写下来\n\n这里是你的 **Markdown 笔记本**。\n\n- 左侧编辑，右侧预览\n- 所有内容自动保存\n- 代码块支持语法高亮\n\n" +
      codeFence +
      "js\nconst idea = \"值得试一试\";\nconsole.log(idea);\n" +
      codeFence +
      "\n\n先写一句：今天我想完成什么？",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-plan",
    title: "一个小计划",
    body: "# 从小处开始\n\n> 一次专注一件事，比同时开始十件事更接近完成。\n\n1. 选定下一步\n2. 给它一点时间\n3. 完成后记下来\n",
    updatedAt: new Date().toISOString(),
  },
];

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-([a-zA-Z0-9_-]+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: "1rem 0", borderRadius: "12px", fontSize: "0.82rem" }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>{children}</code>
    );
  },
};

function formatUpdated(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(date);
}

export default function NotesApp() {
  const [notes, setNotes] = useLocalStorageState<Note[]>("folio-lab.notes", starterNotes);
  const [activeId, setActiveId] = useState(starterNotes[0].id);
  const [search, setSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeNote = notes.find((note) => note.id === activeId) ?? notes[0];
  const visibleNotes = useMemo(
    () => notes.filter((note) => note.title.toLowerCase().includes(search.trim().toLowerCase())),
    [notes, search],
  );

  const updateActive = (changes: Partial<Note>) => {
    if (!activeNote) return;
    setNotes((current) =>
      current.map((note) =>
        note.id === activeNote.id
          ? { ...note, ...changes, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  };

  const createNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "未命名笔记",
      body: "# 新笔记\n\n从这里开始记录你的想法。",
      updatedAt: new Date().toISOString(),
    };
    setNotes((current) => [note, ...current]);
    setActiveId(note.id);
  };

  const removeNote = (id: string) => {
    const next = notes.filter((note) => note.id !== id);
    setNotes(next);
    if (activeId === id) setActiveId(next[0]?.id ?? "");
  };

  const insertMarkdown = (kind: "bold" | "heading" | "list") => {
    const area = textareaRef.current;
    if (!area || !activeNote) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = activeNote.body.slice(start, end);
    const wrappers = {
      bold: ["**", "**", selected || "粗体文字"],
      heading: ["## ", "", selected || "二级标题"],
      list: ["- ", "", selected || "列表项目"],
    } as const;
    const [before, after, fallback] = wrappers[kind];
    const insert = before + (selected || fallback) + after;
    const body = activeNote.body.slice(0, start) + insert + activeNote.body.slice(end);
    updateActive({ body });
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + before.length, start + before.length + (selected || fallback).length);
    });
  };

  const handleEditorKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const area = event.currentTarget;
    if (event.key === "Tab") {
      event.preventDefault();
      const start = area.selectionStart;
      const end = area.selectionEnd;
      const body = (activeNote?.body ?? "").slice(0, start) + "  " + (activeNote?.body ?? "").slice(end);
      updateActive({ body });
      requestAnimationFrame(() => area.setSelectionRange(start + 2, start + 2));
    }
    if (event.ctrlKey && event.key.toLowerCase() === "b") {
      event.preventDefault();
      insertMarkdown("bold");
    }
  };

  return (
    <div className="notes-layout">
      <aside className="notes-sidebar panel">
        <div className="notes-side-head">
          <div><span className="notes-side-kicker">YOUR NOTEBOOK</span><h2>我的笔记 <span>{notes.length}</span></h2></div>
          <button className="add-note-button" onClick={createNote} aria-label="新建笔记"><FilePlus2 size={17} /></button>
        </div>
        <label className="notes-search">
          <Search size={15} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索笔记..." aria-label="搜索笔记" />
          {search && <button onClick={() => setSearch("")} aria-label="清空搜索"><X size={13} /></button>}
        </label>
        <div className="notes-list">
          {visibleNotes.length === 0 ? <p className="notes-empty">没有找到标题相符的笔记。</p> : visibleNotes.map((note) => (
            <button key={note.id} className={activeNote?.id === note.id ? "note-list-item selected" : "note-list-item"} onClick={() => setActiveId(note.id)}>
              <FileText size={16} />
              <span><strong>{note.title || "未命名笔记"}</strong><small>{formatUpdated(note.updatedAt)}</small></span>
            </button>
          ))}
        </div>
        <div className="notes-sidebar-foot"><span className="save-dot" />自动保存已开启</div>
      </aside>

      <section className="notes-editor-panel panel">
        {activeNote ? (
          <>
            <div className="notes-editor-header">
              <div className="notes-breadcrumb"><span>笔记</span><span>/</span><strong>{activeNote.title || "未命名笔记"}</strong></div>
              <button className="icon-button danger-hover" onClick={() => removeNote(activeNote.id)} aria-label="删除当前笔记"><Trash2 size={16} /></button>
            </div>
            <input className="note-title-input" value={activeNote.title} onChange={(event) => updateActive({ title: event.target.value })} placeholder="给这篇笔记起个名字" aria-label="笔记标题" />
            <div className="editor-toolbar">
              <div className="toolbar-actions">
                <button onClick={() => insertMarkdown("bold")} aria-label="加粗"><Bold size={15} /></button>
                <button onClick={() => insertMarkdown("heading")} aria-label="插入标题"><Heading2 size={16} /></button>
                <button onClick={() => insertMarkdown("list")} aria-label="插入列表"><List size={16} /></button>
              </div>
              <span>MARKDOWN <b>·</b> {formatUpdated(activeNote.updatedAt)}</span>
            </div>
            <div className="notes-split">
              <div className="editor-side">
                <span className="editor-label">EDITOR</span>
                <textarea
                  ref={textareaRef}
                  value={activeNote.body}
                  onChange={(event) => updateActive({ body: event.target.value })}
                  onKeyDown={handleEditorKey}
                  spellCheck={false}
                  aria-label="Markdown 编辑器"
                />
              </div>
              <div className="preview-side">
                <span className="editor-label">LIVE PREVIEW</span>
                <article className="markdown-preview">
                  <ReactMarkdown components={markdownComponents}>{activeNote.body}</ReactMarkdown>
                </article>
              </div>
            </div>
            <div className="notes-editor-foot"><span>TIP: 使用 Ctrl + B 加粗，Tab 缩进</span><span><span className="save-dot" /> 已保存在此设备</span></div>
          </>
        ) : (
          <div className="empty-note"><FileText size={34} /><h3>准备好记录了吗？</h3><p>创建一篇新笔记，写下你的想法。</p><button className="button button-primary" onClick={createNote}>创建第一篇笔记 <FilePlus2 size={15} /></button></div>
        )}
      </section>
    </div>
  );
}

