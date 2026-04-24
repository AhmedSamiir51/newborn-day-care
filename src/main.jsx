import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Baby,
  CalendarDays,
  Clock3,
  Cloud,
  Droplets,
  Languages,
  LogOut,
  Milk,
  Moon,
  NotebookPen,
  Pencil,
  Pill,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import "./styles.css";

const entryTypes = {
  feeding: { icon: Milk, color: "rose", fields: [{ name: "method", type: "select", options: ["breast", "bottle", "formula", "pumped"] }, { name: "amount", placeholder: { ar: "60 مل أو 20 دقيقة", en: "60 ml or 20 min" } }, { name: "side", type: "select", options: ["both", "left", "right", "na"] }] },
  diaper: { icon: Droplets, color: "teal", fields: [{ name: "diaperType", type: "select", options: ["wet", "dirty", "wetDirty", "dry"] }, { name: "rash", type: "select", options: ["normal", "redness", "cream"] }] },
  medicine: { icon: Pill, color: "violet", fields: [{ name: "medicine", placeholder: { ar: "فيتامين د", en: "Vitamin D" } }, { name: "dose", placeholder: { ar: "نقطة واحدة أو 0.5 مل", en: "1 drop or 0.5 ml" } }] },
  sleep: { icon: Moon, color: "indigo", fields: [{ name: "duration", placeholder: { ar: "45 دقيقة", en: "45 min" } }, { name: "place", type: "select", options: ["bassinet", "crib", "held", "stroller"] }] },
  note: { icon: NotebookPen, color: "amber", fields: [{ name: "note", placeholder: { ar: "المزاج، الحرارة، الحمام، الموعد...", en: "Mood, temperature, bath, appointment..." } }] },
};

const copy = {
  ar: {
    appName: "متابعة يوم المواليد",
    headline: (name) => `يوم ${name}`,
    defaultBaby: "البيبي",
    careDate: "تاريخ اليوم",
    babies: "الأطفال",
    addBaby: "إضافة طفل",
    editBaby: "تعديل بيانات الطفل",
    saveBaby: "حفظ الطفل",
    updateBaby: "تحديث الطفل",
    cancel: "إلغاء",
    babyName: "اسم الطفل",
    babyAge: "العمر",
    babyAgePlaceholder: "مثال: 3 أشهر",
    gender: "النوع",
    selected: "الحالي",
    deleteBaby: "حذف الطفل",
    addEvent: "إضافة حدث",
    time: "الوقت",
    extraNote: "ملاحظة إضافية",
    notePlaceholder: "أي شيء مهم للشخص الذي سيرعى الطفل بعدك",
    addToDay: "إضافة لليوم",
    saving: "جار الحفظ...",
    timeline: "سجل اليوم",
    reset: "مسح اليوم",
    empty: "لا توجد أحداث لهذا الطفل في هذا اليوم.",
    loading: "جار التحميل من Neon...",
    synced: "تمت المزامنة مع Neon",
    saved: "تم الحفظ في Neon",
    offline: "غير متصل",
    loadError: "لم نتمكن من تحميل البيانات. تأكدي من اتصال قاعدة البيانات.",
    babyError: "لم يتم حفظ بيانات الطفل.",
    lastBabyError: "يجب أن يبقى طفل واحد على الأقل.",
    saveEventError: "لم يتم حفظ هذا الحدث.",
    deleteEventError: "لم يتم حذف هذا الحدث.",
    resetError: "لم يتم مسح اليوم.",
    signIn: "تسجيل الدخول",
    register: "إنشاء حساب",
    name: "الاسم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    authTitle: "ادخلي لحسابك",
    authSubtitle: "كل حساب يرى بيانات أطفاله فقط.",
    createAccount: "إنشاء الحساب",
    enterAccount: "دخول",
    logout: "خروج",
    language: "English",
    authError: "لم تنجح العملية. تأكدي من البريد وكلمة المرور.",
    passwordHint: "كلمة المرور 6 أحرف على الأقل.",
    type: { feeding: "رضاعة", diaper: "حفاض", medicine: "دواء", sleep: "نوم", note: "ملاحظة" },
    fields: { method: "الطريقة", amount: "الكمية", side: "الجهة", diaperType: "النوع", rash: "الجلد", medicine: "الدواء", dose: "الجرعة", duration: "المدة", place: "المكان", note: "ملاحظة" },
    genders: { girl: "بنت", boy: "ولد", other: "آخر" },
    options: { breast: "رضاعة طبيعية", bottle: "ببرونة", formula: "حليب صناعي", pumped: "حليب مشفوط", both: "الجهتان", left: "يسار", right: "يمين", na: "لا ينطبق", wet: "بول", dirty: "براز", wetDirty: "بول وبراز", dry: "فحص جاف", normal: "طبيعي", redness: "احمرار", cream: "تم استخدام كريم", bassinet: "سرير صغير", crib: "سرير", held: "على اليد", stroller: "عربة" },
  },
  en: {
    appName: "Newborn daily care",
    headline: (name) => `${name}'s day`,
    defaultBaby: "Baby",
    careDate: "Care date",
    babies: "Babies",
    addBaby: "Add baby",
    editBaby: "Edit baby",
    saveBaby: "Save baby",
    updateBaby: "Update baby",
    cancel: "Cancel",
    babyName: "Baby name",
    babyAge: "Age",
    babyAgePlaceholder: "Example: 3 months",
    gender: "Gender",
    selected: "Selected",
    deleteBaby: "Delete baby",
    addEvent: "Add care event",
    time: "Time",
    extraNote: "Extra note",
    notePlaceholder: "Anything important for the next caregiver",
    addToDay: "Add to day",
    saving: "Saving...",
    timeline: "Today timeline",
    reset: "Reset",
    empty: "No events yet for this baby on this day.",
    loading: "Loading from Neon...",
    synced: "Synced with Neon",
    saved: "Saved to Neon",
    offline: "Offline",
    loadError: "Could not load data. Check the database connection.",
    babyError: "Baby details could not be saved.",
    lastBabyError: "At least one baby must remain.",
    saveEventError: "This event could not be saved.",
    deleteEventError: "This event could not be deleted.",
    resetError: "This day could not be reset.",
    signIn: "Sign in",
    register: "Register",
    name: "Name",
    email: "Email",
    password: "Password",
    authTitle: "Enter your account",
    authSubtitle: "Each account only sees data for its own babies.",
    createAccount: "Create account",
    enterAccount: "Sign in",
    logout: "Logout",
    language: "العربية",
    authError: "Authentication failed. Check your email and password.",
    passwordHint: "Password must be at least 6 characters.",
    type: { feeding: "Feeding", diaper: "Diaper", medicine: "Medicine", sleep: "Sleep", note: "Note" },
    fields: { method: "Method", amount: "Amount", side: "Side", diaperType: "Type", rash: "Skin", medicine: "Medicine", dose: "Dose", duration: "Duration", place: "Place", note: "Note" },
    genders: { girl: "Girl", boy: "Boy", other: "Other" },
    options: { breast: "Breast", bottle: "Bottle", formula: "Formula", pumped: "Pumped milk", both: "Both", left: "Left", right: "Right", na: "N/A", wet: "Wet", dirty: "Dirty", wetDirty: "Wet + dirty", dry: "Dry check", normal: "Normal", redness: "Redness", cream: "Rash cream used", bassinet: "Bassinet", crib: "Crib", held: "Held", stroller: "Stroller" },
  },
};

const blankBaby = { name: "", age: "", gender: "girl" };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem("newborn-language") || "ar");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [babies, setBabies] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState("");
  const [babyForm, setBabyForm] = useState(blankBaby);
  const [editingBabyId, setEditingBabyId] = useState("");
  const [careDate, setCareDate] = useState(todayKey());
  const [activeType, setActiveType] = useState("feeding");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ time: currentTime(), note: "" });
  const [status, setStatus] = useState(copy[language].loading);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const t = copy[language];
  const isRtl = language === "ar";
  const selectedBaby = babies.find((baby) => baby.id === selectedBabyId);
  const activeConfig = entryTypes[activeType];

  useEffect(() => {
    localStorage.setItem("newborn-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [language, isRtl]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user) loadBabies();
  }, [user?.id]);

  useEffect(() => {
    if (user && selectedBabyId) loadDay(careDate, selectedBabyId);
  }, [careDate, selectedBabyId, user?.id]);

  async function checkSession() {
    setAuthLoading(true);
    try {
      const data = await apiRequest("/api/auth");
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadBabies() {
    setStatus(t.loading);
    setError("");
    try {
      const data = await apiRequest("/api/babies");
      const nextBabies = data.babies || [];
      setBabies(nextBabies);
      setSelectedBabyId((current) => current && nextBabies.some((baby) => baby.id === current) ? current : nextBabies[0]?.id || "");
      setStatus(t.synced);
    } catch {
      setError(t.loadError);
      setStatus(t.offline);
    }
  }

  async function loadDay(date, babyId) {
    setStatus(t.loading);
    setError("");
    try {
      const data = await apiRequest(`/api/day?date=${date}&babyId=${babyId}`);
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setStatus(t.synced);
    } catch {
      setEntries([]);
      setError(t.loadError);
      setStatus(t.offline);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthError("");
    setIsBusy(true);
    try {
      const data = await apiRequest("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: authMode === "register" ? "register" : "login", ...authForm }),
      });
      setUser(data.user);
      setAuthForm({ name: "", email: "", password: "" });
    } catch {
      setAuthError(t.authError);
    } finally {
      setIsBusy(false);
    }
  }

  async function logout() {
    await apiRequest("/api/auth", { method: "POST", body: JSON.stringify({ action: "logout" }) }).catch(() => null);
    setUser(null);
    setBabies([]);
    setEntries([]);
    setSelectedBabyId("");
  }

  async function saveBaby(event) {
    event.preventDefault();
    setIsBusy(true);
    setError("");
    const method = editingBabyId ? "PUT" : "POST";
    const body = editingBabyId ? { id: editingBabyId, ...babyForm } : babyForm;

    try {
      const data = await apiRequest("/api/babies", { method, body: JSON.stringify(body) });
      setBabies((current) => {
        if (editingBabyId) {
          return current.map((baby) => baby.id === data.baby.id ? data.baby : baby);
        }
        return [...current, data.baby];
      });
      setSelectedBabyId(data.baby.id);
      setBabyForm(blankBaby);
      setEditingBabyId("");
      setStatus(t.saved);
    } catch {
      setError(t.babyError);
    } finally {
      setIsBusy(false);
    }
  }

  function editBaby(baby) {
    setEditingBabyId(baby.id);
    setBabyForm({ name: baby.name, age: baby.age || "", gender: baby.gender || "girl" });
  }

  async function deleteBaby(id) {
    setError("");
    try {
      await apiRequest(`/api/babies?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const nextBabies = babies.filter((baby) => baby.id !== id);
      setBabies(nextBabies);
      setSelectedBabyId(nextBabies[0]?.id || "");
      setEntries([]);
      setStatus(t.saved);
    } catch {
      setError(t.lastBabyError);
    }
  }

  function updateForm(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function addEntry(event) {
    event.preventDefault();
    if (!selectedBabyId) return;
    setIsBusy(true);
    setError("");

    const details = {};
    activeConfig.fields.forEach((field) => {
      details[field.name] = form[field.name] || field.options?.[0] || "";
    });

    const entry = { id: crypto.randomUUID(), type: activeType, time: form.time || currentTime(), details, note: form.note || "" };

    try {
      const data = await apiRequest("/api/day", {
        method: "POST",
        body: JSON.stringify({ careDate, babyId: selectedBabyId, entry }),
      });
      setEntries((current) => [...current, data.entry]);
      setForm({ time: currentTime(), note: "" });
      setStatus(t.saved);
    } catch {
      setError(t.saveEventError);
    } finally {
      setIsBusy(false);
    }
  }

  async function removeEntry(id) {
    const previousEntries = entries;
    setEntries((current) => current.filter((entry) => entry.id !== id));
    try {
      await apiRequest(`/api/day?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setStatus(t.saved);
    } catch {
      setEntries(previousEntries);
      setError(t.deleteEventError);
    }
  }

  async function resetDay() {
    const previousEntries = entries;
    setEntries([]);
    try {
      await apiRequest(`/api/day?date=${careDate}&babyId=${selectedBabyId}`, { method: "DELETE" });
      setForm({ time: currentTime(), note: "" });
      setStatus(t.saved);
    } catch {
      setEntries(previousEntries);
      setError(t.resetError);
    }
  }

  const summary = useMemo(() => Object.keys(entryTypes).reduce((acc, type) => {
    acc[type] = entries.filter((entry) => entry.type === type).length;
    return acc;
  }, {}), [entries]);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => b.time.localeCompare(a.time)), [entries]);

  if (authLoading) {
    return <main className="shell auth-shell" dir={isRtl ? "rtl" : "ltr"}><div className="auth-card"><Baby size={38} /><p>{t.loading}</p></div></main>;
  }

  if (!user) {
    return <AuthScreen authError={authError} authForm={authForm} authMode={authMode} isBusy={isBusy} isRtl={isRtl} language={language} setAuthForm={setAuthForm} setAuthMode={setAuthMode} setLanguage={setLanguage} submitAuth={submitAuth} t={t} />;
  }

  return (
    <main className="shell" dir={isRtl ? "rtl" : "ltr"}>
      <section className="topbar" aria-label={t.appName}>
        <div className="brand-mark" aria-hidden="true"><Baby size={28} /></div>
        <div>
          <p className="eyebrow">{t.appName}</p>
          <h1>{t.headline(selectedBaby?.name || t.defaultBaby)}</h1>
        </div>
        <div className="header-actions">
          <button className="ghost-action" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={17} />{t.language}</button>
          <button className="ghost-action" type="button" onClick={logout}><LogOut size={17} />{t.logout}</button>
        </div>
        <div className="date-pill">
          <CalendarDays size={18} />
          <input aria-label={t.careDate} type="date" value={careDate} onChange={(event) => setCareDate(event.target.value)} />
        </div>
      </section>

      <div className={`sync-banner ${error ? "error" : ""}`}><Cloud size={18} /><span>{error || status}</span></div>

      <section className="baby-manager" aria-label={t.babies}>
        <div className="section-title"><Baby size={20} /><h2>{t.babies}</h2></div>
        <div className="baby-list">
          {babies.map((baby) => (
            <article className={`baby-card ${selectedBabyId === baby.id ? "active" : ""}`} key={baby.id}>
              <button type="button" className="baby-select" onClick={() => setSelectedBabyId(baby.id)}>
                <strong>{baby.name}</strong>
                <span>{[baby.age, t.genders[baby.gender]].filter(Boolean).join(" - ")}</span>
                {selectedBabyId === baby.id && <small>{t.selected}</small>}
              </button>
              <div className="baby-actions">
                <button className="icon-button" type="button" aria-label={t.editBaby} onClick={() => editBaby(baby)}><Pencil size={17} /></button>
                <button className="icon-button" type="button" aria-label={t.deleteBaby} onClick={() => deleteBaby(baby.id)}><Trash2 size={17} /></button>
              </div>
            </article>
          ))}
        </div>
        <form className="baby-form" onSubmit={saveBaby}>
          <label><span>{t.babyName}</span><input required value={babyForm.name} onChange={(event) => setBabyForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label><span>{t.babyAge}</span><input value={babyForm.age} placeholder={t.babyAgePlaceholder} onChange={(event) => setBabyForm((current) => ({ ...current, age: event.target.value }))} /></label>
          <label><span>{t.gender}</span><select value={babyForm.gender} onChange={(event) => setBabyForm((current) => ({ ...current, gender: event.target.value }))}>{Object.entries(t.genders).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <button className="primary-action" type="submit" disabled={isBusy}><Plus size={20} />{editingBabyId ? t.updateBaby : t.saveBaby}</button>
          {editingBabyId && <button className="ghost-action" type="button" onClick={() => { setEditingBabyId(""); setBabyForm(blankBaby); }}>{t.cancel}</button>}
        </form>
      </section>

      <section className="baby-panel" aria-label={t.babies}>
        <div className="summary-strip">
          {Object.entries(entryTypes).map(([type, config]) => {
            const Icon = config.icon;
            return <div className={`summary-item ${config.color}`} key={type}><Icon size={20} /><strong>{summary[type] || 0}</strong><span>{t.type[type]}</span></div>;
          })}
        </div>
      </section>

      <section className="workspace">
        <form className="logger" onSubmit={addEntry}>
          <div className="section-title"><Sparkles size={20} /><h2>{t.addEvent}</h2></div>
          <div className="type-grid" role="tablist" aria-label={t.addEvent}>
            {Object.entries(entryTypes).map(([type, config]) => {
              const Icon = config.icon;
              return <button className={`type-button ${activeType === type ? "active" : ""}`} type="button" key={type} onClick={() => { setActiveType(type); setForm({ time: currentTime(), note: "" }); }}><Icon size={20} /><span>{t.type[type]}</span></button>;
            })}
          </div>
          <label><span>{t.time}</span><input type="time" value={form.time || ""} onChange={(event) => updateForm("time", event.target.value)} /></label>
          {activeConfig.fields.map((field) => (
            <label key={field.name}>
              <span>{t.fields[field.name]}</span>
              {field.type === "select" ? (
                <select value={form[field.name] || field.options[0]} onChange={(event) => updateForm(field.name, event.target.value)}>
                  {field.options.map((option) => <option key={option} value={option}>{t.options[option]}</option>)}
                </select>
              ) : (
                <input value={form[field.name] || ""} placeholder={field.placeholder?.[language]} onChange={(event) => updateForm(field.name, event.target.value)} />
              )}
            </label>
          ))}
          <label><span>{t.extraNote}</span><textarea value={form.note || ""} placeholder={t.notePlaceholder} onChange={(event) => updateForm("note", event.target.value)} /></label>
          <button className="primary-action" type="submit" disabled={isBusy || !selectedBabyId}><Plus size={20} />{isBusy ? t.saving : t.addToDay}</button>
        </form>

        <section className="timeline" aria-label={t.timeline}>
          <div className="section-title timeline-title"><Clock3 size={20} /><h2>{t.timeline}</h2><button className="ghost-action" type="button" onClick={resetDay} disabled={!selectedBabyId}><RotateCcw size={17} />{t.reset}</button></div>
          {sortedEntries.length === 0 ? <div className="empty-state"><Baby size={34} /><p>{t.empty}</p></div> : <div className="event-list">{sortedEntries.map((entry) => <CareEvent entry={entry} key={entry.id} onRemove={removeEntry} t={t} />)}</div>}
        </section>
      </section>
    </main>
  );
}

function AuthScreen({ authError, authForm, authMode, isBusy, isRtl, language, setAuthForm, setAuthMode, setLanguage, submitAuth, t }) {
  return (
    <main className="shell auth-shell" dir={isRtl ? "rtl" : "ltr"}>
      <section className="auth-card">
        <div className="auth-top"><div className="brand-mark" aria-hidden="true"><Baby size={28} /></div><button className="ghost-action" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={17} />{t.language}</button></div>
        <p className="eyebrow">{t.appName}</p>
        <h1>{t.authTitle}</h1>
        <p className="auth-copy">{t.authSubtitle}</p>
        <div className="auth-tabs"><button className={authMode === "login" ? "active" : ""} type="button" onClick={() => setAuthMode("login")}>{t.signIn}</button><button className={authMode === "register" ? "active" : ""} type="button" onClick={() => setAuthMode("register")}>{t.register}</button></div>
        <form className="auth-form" onSubmit={submitAuth}>
          {authMode === "register" && <label><span>{t.name}</span><input value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} /></label>}
          <label><span>{t.email}</span><input autoComplete="email" type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} /></label>
          <label><span>{t.password}</span><input autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength={6} type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} /></label>
          <small>{t.passwordHint}</small>
          {authError && <div className="auth-error">{authError}</div>}
          <button className="primary-action" type="submit" disabled={isBusy}><UserRound size={20} />{authMode === "register" ? t.createAccount : t.enterAccount}</button>
        </form>
      </section>
    </main>
  );
}

function CareEvent({ entry, onRemove, t }) {
  const config = entryTypes[entry.type];
  const Icon = config.icon;
  const details = Object.entries(entry.details || {}).filter(([, value]) => value).map(([key, value]) => `${t.fields[key] || humanize(key)}: ${t.options[value] || value}`).join(" - ");
  return <article className={`event ${config.color}`}><div className="event-icon"><Icon size={21} /></div><div className="event-body"><div className="event-heading"><strong>{t.type[entry.type]}</strong><time>{entry.time}</time></div>{details && <p>{details}</p>}{entry.note && <small>{entry.note}</small>}</div><button className="icon-button" type="button" aria-label={t.deleteEventError} onClick={() => onRemove(entry.id)}><Trash2 size={18} /></button></article>;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

function humanize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

createRoot(document.getElementById("root")).render(<App />);
