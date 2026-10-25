import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  Check,
  Clock3,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  X,
} from "lucide-react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

type Mode = "work" | "break";
type Settings = { workMinutes: number; breakMinutes: number };

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function isThisWeek(value: string) {
  const current = new Date();
  const day = (current.getDay() + 6) % 7;
  const monday = new Date(current.getFullYear(), current.getMonth(), current.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return new Date(value).getTime() >= monday.getTime();
}

function playChime(context: AudioContext | null) {
  if (!context || context.state !== "running") return;
  const now = context.currentTime;
  [0, 0.22, 0.44].forEach((offset, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = [660, 880, 990][index];
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.24);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.25);
  });
}

export default function PomodoroApp() {
  const [settings, setSettings] = useLocalStorageState<Settings>("folio-lab.pomodoro-settings", {
    workMinutes: 25,
    breakMinutes: 5,
  });
  const [completedAt, setCompletedAt] = useLocalStorageState<string[]>("folio-lab.pomodoro-records", []);
  const [mode, setMode] = useState<Mode>("work");
  const [remaining, setRemaining] = useState(settings.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted",
  );
  const deadlineRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const totalSeconds = (mode === "work" ? settings.workMinutes : settings.breakMinutes) * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
  const todayCount = completedAt.filter((item) => item === localDateKey(new Date())).length;
  const weekCount = completedAt.filter(isThisWeek).length;
  const formatted = useMemo(() => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }, [remaining]);

  useEffect(() => {
    if (!running) return;
    deadlineRef.current = Date.now() + remaining * 1000;
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil(((deadlineRef.current ?? Date.now()) - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setRunning(false);
        deadlineRef.current = null;
        if (mode === "work") {
          setCompletedAt((current) => [...current, localDateKey(new Date())]);
        }
        const nextMode: Mode = mode === "work" ? "break" : "work";
        setMode(nextMode);
        setRemaining((nextMode === "work" ? settings.workMinutes : settings.breakMinutes) * 60);
        playChime(audioRef.current);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("番茄钟", {
            body: mode === "work" ? "专注结束，起来休息一下吧。" : "休息结束，准备好继续专注了吗？",
          });
        }
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running, remaining, mode, settings.workMinutes, settings.breakMinutes, setCompletedAt]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = running ? formatted + " · " + (mode === "work" ? "专注中" : "休息中") : previousTitle;
    return () => { document.title = previousTitle; };
  }, [running, formatted, mode]);

  const setCurrentMode = (nextMode: Mode) => {
    setRunning(false);
    setMode(nextMode);
    setRemaining((nextMode === "work" ? settings.workMinutes : settings.breakMinutes) * 60);
  };

  const toggleRunning = async () => {
    if (!running) {
      if (!audioRef.current && "AudioContext" in window) {
        audioRef.current = new AudioContext();
      }
      if (audioRef.current?.state === "suspended") await audioRef.current.resume();
    }
    setRunning((current) => !current);
  };

  const resetTimer = () => {
    setRunning(false);
    setRemaining(totalSeconds);
  };

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      setNotificationEnabled(true);
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationEnabled(permission === "granted");
  };

  const updateDuration = (field: keyof Settings, value: string) => {
    const nextValue = Math.max(1, Math.min(90, Number(value) || 1));
    const nextSettings = { ...settings, [field]: nextValue };
    setSettings(nextSettings);
    if (!running) {
      setRemaining((mode === "work" ? nextSettings.workMinutes : nextSettings.breakMinutes) * 60);
    }
  };

  return (
    <div className="pomodoro-layout">
      <section className="focus-panel panel">
        <div className="focus-topline">
          <div><div className="eyebrow"><span className="eyebrow-line" />让注意力回来</div><h2>一个时段，<span className="muted">只做一件事。</span></h2></div>
          <button className="icon-button" onClick={() => setShowSettings((current) => !current)} aria-label="计时设置"><SlidersHorizontal size={17} /></button>
        </div>

        <div className="mode-switch" role="group" aria-label="计时模式">
          <button className={mode === "work" ? "mode-button active" : "mode-button"} onClick={() => setCurrentMode("work")}><Clock3 size={15} />专注时段</button>
          <button className={mode === "break" ? "mode-button active break-active" : "mode-button"} onClick={() => setCurrentMode("break")}><Coffee size={15} />休息时间</button>
        </div>

        <div className="timer-wrap">
          <div className={"timer-ring " + (mode === "break" ? "ring-break" : "")} style={{ background: "conic-gradient(from -90deg, var(--accent) " + progress + "%, rgba(255,255,255,.07) " + progress + "%)" }}>
            <div className="timer-inner">
              <span className="timer-mode-label">{mode === "work" ? "FOCUS SESSION" : "TAKE A BREATH"}</span>
              <strong>{formatted}</strong>
              <span className="timer-caption">{running ? "保持节奏，正在计时" : "准备好了就开始"}</span>
            </div>
          </div>
          <span className="timer-decoration decor-top">✳</span>
          <span className="timer-decoration decor-bottom">✦</span>
        </div>

        <div className="timer-controls">
          <button className="button button-primary timer-start" onClick={toggleRunning}>{running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}{running ? "暂停" : "开始专注"}</button>
          <button className="button button-ghost timer-reset" onClick={resetTimer}><RotateCcw size={15} />重置</button>
        </div>

        {showSettings && (
          <div className="timer-settings">
            <div className="settings-head"><strong>时长设置</strong><button onClick={() => setShowSettings(false)} aria-label="关闭设置"><X size={15} /></button></div>
            <label>专注时长<input type="number" min="1" max="90" value={settings.workMinutes} onChange={(event) => updateDuration("workMinutes", event.target.value)} /><span>分钟</span></label>
            <label>休息时长<input type="number" min="1" max="90" value={settings.breakMinutes} onChange={(event) => updateDuration("breakMinutes", event.target.value)} /><span>分钟</span></label>
          </div>
        )}

        <div className="timer-footnote"><span><Volume2 size={14} /> 结束时播放轻提示音</span><span>你可以切换标签页，计时会继续</span></div>
      </section>

      <aside className="focus-side">
        <section className="stats-panel panel">
          <div className="eyebrow"><span className="eyebrow-line" />专注记录</div>
          <h2>每一步，都算数。</h2>
          <div className="focus-stat-row"><span>今天完成</span><strong>{todayCount}<small>个番茄</small></strong></div>
          <div className="focus-stat-row"><span>本周完成</span><strong>{weekCount}<small>个番茄</small></strong></div>
          <div className="week-dots" aria-label="本周完成番茄钟数量">
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + index);
              const count = completedAt.filter((item) => item === localDateKey(date)).length;
              return <span key={index} className={count > 0 ? "week-day done" : "week-day"}><i style={{ height: Math.min(40, 10 + count * 8) + "px" }} /><small>{"一二三四五六日"[index]}</small></span>;
            })}
          </div>
          <div className="focus-stat-note"><Check size={14} />每完成一个专注时段，记录会自动更新</div>
        </section>
        <section className="notification-card">
          <div className="notification-icon">{notificationEnabled ? <BellRing size={18} /> : <Bell size={18} />}</div>
          <div><strong>{notificationEnabled ? "桌面提醒已开启" : "不错过结束提醒"}</strong><p>{notificationEnabled ? "计时结束时会发送系统通知。" : "开启浏览器通知，计时结束时提醒你。"}</p></div>
          {!notificationEnabled && <button onClick={requestNotifications} aria-label="开启桌面通知">开启 <Check size={13} /></button>}
        </section>
      </aside>
    </div>
  );
}

