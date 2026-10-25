import { useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  CheckCheck,
  Circle,
  Edit3,
  ListFilter,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

type Priority = "low" | "medium" | "high";
type Todo = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
};

const categories = ["学习", "生活", "项目", "游戏"];
const priorityNames: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const seedTodos: Todo[] = [
  {
    id: "seed-1",
    title: "整理本周的学习清单",
    description: "把大任务拆成今天能完成的小步骤。",
    category: "学习",
    priority: "high",
    dueDate: "",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "给项目页面做一次复盘",
    description: "看看哪些交互可以更简单。",
    category: "项目",
    priority: "medium",
    dueDate: "",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "留一点时间玩游戏",
    description: "休息也是认真生活的一部分。",
    category: "游戏",
    priority: "low",
    dueDate: "",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

const blankForm = {
  title: "",
  description: "",
  category: "学习",
  priority: "medium" as Priority,
  dueDate: "",
};

export default function TodoApp() {
  const [todos, setTodos] = useLocalStorageState<Todo[]>("folio-lab.todos", seedTodos);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [priorityFilter, setPriorityFilter] = useState("全部");

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;
  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return todos.filter((todo) => {
      const matchesQuery =
        !normalizedQuery ||
        (todo.title + " " + todo.description).toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "全部" ||
        (statusFilter === "未完成" && !todo.completed) ||
        (statusFilter === "已完成" && todo.completed);
      const matchesCategory = categoryFilter === "全部" || todo.category === categoryFilter;
      const matchesPriority = priorityFilter === "全部" || todo.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [todos, query, statusFilter, categoryFilter, priorityFilter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      setTodos((current) =>
        current.map((todo) =>
          todo.id === editingId ? { ...todo, ...form, title: form.title.trim() } : todo,
        ),
      );
    } else {
      const newTodo: Todo = {
        ...form,
        title: form.title.trim(),
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos((current) => [newTodo, ...current]);
    }
    setForm(blankForm);
    setEditingId(null);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setForm({
      title: todo.title,
      description: todo.description,
      category: todo.category,
      priority: todo.priority,
      dueDate: todo.dueDate,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(blankForm);
  };

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("全部");
    setCategoryFilter("全部");
    setPriorityFilter("全部");
  };

  return (
    <div className="todo-layout">
      <section className="todo-main panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" />今天的计划</div>
            <h2>把要做的事，<span className="muted">放在眼前。</span></h2>
          </div>
          <span className="count-pill">{activeCount} 项待办</span>
        </div>

        <div className="todo-stats">
          <div className="todo-stat">
            <span>全部任务</span><strong>{todos.length.toString().padStart(2, "0")}</strong>
          </div>
          <div className="todo-stat">
            <span>尚未完成</span><strong>{activeCount.toString().padStart(2, "0")}</strong>
          </div>
          <div className="todo-stat progress-stat">
            <span>完成进度 <b>{progress}%</b></span>
            <div className="progress-track"><span style={{ width: progress + "%" }} /></div>
          </div>
        </div>

        <div className="todo-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索任务或描述..."
              aria-label="搜索任务"
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索"><X size={14} /></button>}
          </label>
          <div className="filter-group">
            <label className="select-wrap"><ListFilter size={14} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="按状态筛选"><option>全部</option><option>未完成</option><option>已完成</option></select></label>
            <label className="select-wrap"><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="按分类筛选"><option>全部</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="select-wrap"><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="按优先级筛选"><option value="全部">全部优先级</option><option value="high">高优先级</option><option value="medium">中优先级</option><option value="low">低优先级</option></select></label>
            <button type="button" className="quiet-button" onClick={resetFilters}>重置</button>
          </div>
        </div>

        <div className="todo-list">
          {visibleTodos.length === 0 ? (
            <div className="empty-state"><Search size={22} /><strong>没有找到匹配的任务</strong><span>换个关键词，或重置筛选条件。</span></div>
          ) : visibleTodos.map((todo) => (
            <article className={todo.completed ? "todo-item completed" : "todo-item"} key={todo.id}>
              <button
                type="button"
                className="todo-check"
                onClick={() => setTodos((current) => current.map((item) => item.id === todo.id ? { ...item, completed: !item.completed } : item))}
                aria-label={todo.completed ? "标记为未完成" : "标记为已完成"}
              >
                {todo.completed ? <Check size={15} /> : <span />}
              </button>
              <div className="todo-content">
                <div className="todo-title-row"><h3>{todo.title}</h3><span className={"priority-badge priority-" + todo.priority}><i />{priorityNames[todo.priority]}优先级</span></div>
                {todo.description && <p>{todo.description}</p>}
                <div className="todo-meta"><span className="category-tag">{todo.category}</span>{todo.dueDate && <span className="due-tag"><CalendarDays size={12} />{todo.dueDate}</span>}</div>
              </div>
              <div className="todo-actions">
                <button type="button" onClick={() => startEdit(todo)} aria-label="编辑任务"><Edit3 size={15} /></button>
                <button type="button" onClick={() => setTodos((current) => current.filter((item) => item.id !== todo.id))} aria-label="删除任务"><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
        <div className="todo-list-footer"><span><CheckCheck size={14} /> 已完成 {completedCount} 项</span><span>任务只保存在这台设备的浏览器中</span></div>
      </section>

      <aside className="todo-side">
        <section className="panel add-panel">
          <div className="panel-header compact">
            <div><div className="eyebrow"><span className="eyebrow-line" />{editingId ? "编辑任务" : "新任务"}</div><h2>{editingId ? "更新任务" : "添加待办"}</h2></div>
            {editingId ? <button className="icon-button" onClick={cancelEdit} aria-label="取消编辑"><X size={17} /></button> : <span className="add-icon"><Plus size={18} /></span>}
          </div>
          <form className="todo-form" onSubmit={submit}>
            <label>任务标题<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="例如：完成课程练习" required /></label>
            <label>描述 <span>可选</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="补充一点细节..." rows={3} /></label>
            <div className="form-row">
              <label>分类<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>优先级<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select></label>
            </div>
            <label>截止日期 <span>可选</span><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
            <button className="button button-primary full-button" type="submit">{editingId ? "保存修改" : "添加到清单"} <Plus size={16} /></button>
          </form>
        </section>
        <section className="todo-tip">
          <div className="tip-symbol"><Circle size={16} /></div>
          <div><strong>小提示</strong><p>把大目标拆成 20 分钟内能开始的下一步，行动会变容易。</p></div>
        </section>
      </aside>
    </div>
  );
}

