import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  Baby,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
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
  X,
} from "lucide-react";
import "./styles.css";

const entryTypes = {
  feeding: { icon: Milk, color: "rose", fields: [{ name: "method", type: "select", options: ["breast", "bottle", "formula", "pumped"] }, { name: "amount", placeholder: { ar: "60 مل أو 20 دقيقة", en: "60 ml or 20 min" } }, { name: "side", type: "select", options: ["both", "left", "right", "na"] }] },
  diaper: { icon: Droplets, color: "teal", fields: [{ name: "diaperType", type: "select", options: ["wet", "dirty", "wetDirty", "dry"] }, { name: "rash", type: "select", options: ["normal", "redness", "cream"] }] },
  sleep: { icon: Moon, color: "indigo", fields: [{ name: "duration", placeholder: { ar: "45 دقيقة", en: "45 min" } }] },
  note: { icon: NotebookPen, color: "amber", fields: [{ name: "note", placeholder: { ar: "المزاج، الحرارة، الحمام، الموعد...", en: "Mood, temperature, bath, appointment..." } }] },
};

const copy = {
  ar: {
    appName: "متابعة يوم المواليد",
    headline: (name) => `يوم ${name}`,
    motherHeadline: (name) => `صفحة ${name}`,
    defaultBaby: "البيبي",
    mother: "الأم",
    motherAge: "عمر الأم",
    motherAgePlaceholder: "مثال: 28 سنة",
    motherMedicines: "أدوية الأم",
    children: "الأطفال",
    enterChild: "دخول صفحة الطفل",
    backToMother: "رجوع للأم",
    noChildren: "لا يوجد أطفال بعد. أضيفي بيانات الطفل للمتابعة.",
    careDate: "تاريخ اليوم",
    babies: "الأطفال",
    addBaby: "إضافة طفل",
    editBaby: "تعديل بيانات الطفل",
    saveBaby: "حفظ الطفل",
    updateBaby: "تحديث الطفل",
    cancel: "إلغاء",
    close: "إغلاق",
    babyName: "اسم الطفل",
    babyAge: "العمر",
    babyAgePlaceholder: "مثال: 3 أشهر",
    gender: "النوع",
    selected: "الحالي",
    deleteBaby: "حذف الطفل",
    todayTab: "اليوم",
    medsTab: "الأدوية",
    addEvent: "إضافة حدث",
    time: "الوقت",
    extraNote: "ملاحظة إضافية",
    notePlaceholder: "أي شيء مهم للشخص الذي سيرعى الطفل بعدك",
    addToDay: "إضافة لليوم",
    saving: "جار الحفظ...",
    timeline: "سجل اليوم",
    reset: "مسح اليوم",
    empty: "لا توجد أحداث لهذا الطفل في هذا اليوم.",
    loading: "جار التحميل...",
    synced: "تمت المزامنة",
    saved: "تم الحفظ",
    offline: "غير متصل",
    loadError: "لم نتمكن من تحميل البيانات. تأكدي من الاتصال.",
    babyError: "لم يتم حفظ بيانات الطفل.",
    lastBabyError: "يجب أن يبقى طفل واحد على الأقل.",
    saveEventError: "لم يتم حفظ هذا الحدث.",
    deleteEventError: "لم يتم حذف هذا الحدث.",
    resetError: "لم يتم مسح اليوم.",
    signIn: "تسجيل الدخول",
    register: "إنشاء حساب",
    name: "الاسم الكامل",
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
    medTitle: "جدول الأدوية",
    addMedicine: "إضافة دواء",
    editMedicine: "تعديل الدواء",
    updateMedicine: "تحديث الدواء",
    medicineName: "اسم الدواء",
    dose: "الجرعة",
    timesPerDay: "مرات في اليوم",
    intervalHours: "كل كام ساعة",
    durationDays: "لمدة كام يوم",
    startDate: "بداية العلاج",
    firstTime: "أول ميعاد",
    dueNow: "أدوية مستحقة الآن",
    noDueMeds: "لا توجد أدوية مستحقة الآن.",
    markTaken: "تم أخذ الدواء",
    activeMeds: "الأدوية المضافة",
    noMeds: "لا توجد أدوية مضافة لهذا الطفل.",
    medSaved: "تمت إضافة الدواء والمواعيد",
    medError: "لم يتم حفظ الدواء.",
    takenError: "لم يتم تأكيد الجرعة.",
    deleteMed: "حذف الدواء",
    type: { feeding: "رضاعة", diaper: "حفاض", sleep: "نوم", note: "ملاحظة", medicine: "دواء" },
    fields: { method: "الطريقة", amount: "الكمية", side: "الجهة", diaperType: "النوع", rash: "الجلد", duration: "المدة", place: "المكان", note: "ملاحظة", medicine: "الدواء", dose: "الجرعة" },
    genders: { girl: "بنت", boy: "ولد", other: "آخر" },
    options: { breast: "رضاعة طبيعية", bottle: "ببرونة", formula: "حليب صناعي", pumped: "حليب مشفوط", both: "الجهتان", left: "يسار", right: "يمين", na: "لا ينطبق", wet: "بول", dirty: "براز", wetDirty: "بول وبراز", dry: "فحص جاف", normal: "طبيعي", redness: "احمرار", cream: "تم استخدام كريم", bassinet: "سرير صغير", crib: "سرير", held: "على اليد", stroller: "عربة" },
  },
  en: {
    appName: "Newborn daily care",
    headline: (name) => `${name}'s day`,
    motherHeadline: (name) => `${name}'s page`,
    defaultBaby: "Baby",
    mother: "Mother",
    motherAge: "Mother age",
    motherAgePlaceholder: "Example: 28 years",
    motherMedicines: "Mother medicines",
    children: "Children",
    enterChild: "Open child page",
    backToMother: "Back to mother",
    noChildren: "No children yet. Add child details to start tracking.",
    careDate: "Care date",
    babies: "Babies",
    addBaby: "Add baby",
    editBaby: "Edit baby",
    saveBaby: "Save baby",
    updateBaby: "Update baby",
    cancel: "Cancel",
    close: "Close",
    babyName: "Baby name",
    babyAge: "Age",
    babyAgePlaceholder: "Example: 3 months",
    gender: "Gender",
    selected: "Selected",
    deleteBaby: "Delete baby",
    todayTab: "Today",
    medsTab: "Medicine",
    addEvent: "Add care event",
    time: "Time",
    extraNote: "Extra note",
    notePlaceholder: "Anything important for the next caregiver",
    addToDay: "Add to day",
    saving: "Saving...",
    timeline: "Today timeline",
    reset: "Reset",
    empty: "No events yet for this baby on this day.",
    loading: "Loading...",
    refreshing: "Refreshing...",
    pullRefresh: "Pull to refresh",
    releaseRefresh: "Release to refresh",
    synced: "Synced",
    saved: "Saved",
    offline: "Offline",
    notificationsReady: "Medicine reminders are ready",
    notificationTitle: "Medicine time",
    notificationBody: (name, dose) => `${name} - ${dose}`,
    loadError: "Could not load data. Check the connection.",
    babyError: "Baby details could not be saved.",
    lastBabyError: "At least one baby must remain.",
    saveEventError: "This event could not be saved.",
    deleteEventError: "This event could not be deleted.",
    resetError: "This day could not be reset.",
    signIn: "Sign in",
    register: "Register",
    name: "Full name",
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
    medTitle: "Medicine schedule",
    addMedicine: "Add medicine",
    editMedicine: "Edit medicine",
    updateMedicine: "Update medicine",
    medicineName: "Medicine name",
    dose: "Dose",
    timesPerDay: "Times per day",
    intervalHours: "Every how many hours",
    durationDays: "Treatment days",
    startDate: "Start date",
    firstTime: "First time",
    dueNow: "Medicine due now",
    noDueMeds: "No medicine is due now.",
    markTaken: "Mark as taken",
    activeMeds: "Added medicines",
    noMeds: "No medicines added for this baby.",
    medSaved: "Medicine and schedule added",
    medError: "Medicine could not be saved.",
    takenError: "Dose could not be confirmed.",
    deleteMed: "Delete medicine",
    type: { feeding: "Feeding", diaper: "Diaper", sleep: "Sleep", note: "Note", medicine: "Medicine" },
    fields: { method: "Method", amount: "Amount", side: "Side", diaperType: "Type", rash: "Skin", duration: "Duration", place: "Place", note: "Note", medicine: "Medicine", dose: "Dose" },
    genders: { girl: "Girl", boy: "Boy", other: "Other" },
    options: { breast: "Breast", bottle: "Bottle", formula: "Formula", pumped: "Pumped milk", both: "Both", left: "Left", right: "Right", na: "N/A", wet: "Wet", dirty: "Dirty", wetDirty: "Wet + dirty", dry: "Dry check", normal: "Normal", redness: "Redness", cream: "Rash cream used", bassinet: "Bassinet", crib: "Crib", held: "Held", stroller: "Stroller" },
  },
};

const blankBaby = { name: "", age: "", gender: "girl" };
const blankMedicine = { name: "", dose: "", timesPerDay: 1, durationDays: 1, startTime: "08:00" };
const medicineReminderChannelId = "medicine-reminders";

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
  const [authForm, setAuthForm] = useState({ name: "", age: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [babies, setBabies] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState("");
  const [babyForm, setBabyForm] = useState(blankBaby);
  const [editingBabyId, setEditingBabyId] = useState("");
  const [isBabyModalOpen, setBabyModalOpen] = useState(false);
  const [activePage, setActivePage] = useState("mother");
  const [view, setView] = useState("today");
  const [careDate, setCareDate] = useState(todayKey());
  const [activeType, setActiveType] = useState("feeding");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ time: currentTime(), note: "" });
  const [medicines, setMedicines] = useState([]);
  const [dueDoses, setDueDoses] = useState([]);
  const [allDueDoses, setAllDueDoses] = useState([]);
  const [reminderMedicines, setReminderMedicines] = useState([]);
  const [medicineOwner, setMedicineOwner] = useState("baby");
  const [medicineForm, setMedicineForm] = useState(blankMedicine);
  const [editingMedicineId, setEditingMedicineId] = useState("");
  const [status, setStatus] = useState(copy[language].loading);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartY = useRef(null);
  const notifiedDueDoseIds = useRef(new Set());

  const t = copy[language];
  const isRtl = language === "ar";
  const selectedBaby = babies.find((baby) => baby.id === selectedBabyId);
  const activeConfig = entryTypes[activeType];
  const ownerLabels = {
    baby: selectedBaby?.name || t.defaultBaby,
    mother: user?.name || t.mother,
  };

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
    if (!user) return;

    loadMedicineReminders();
    if (activePage === "mother") {
      loadMedicines("", "mother");
      return;
    }

    if (activePage === "child" && selectedBabyId) {
      loadDay(careDate, selectedBabyId);
      loadMedicines(selectedBabyId, "baby");
    }
  }, [activePage, careDate, selectedBabyId, user?.id]);

  useEffect(() => {
    if (!user) return;

    const refreshLiveData = () => {
      loadMedicineReminders();
      if (activePage === "mother") {
        loadMedicines("", "mother");
      } else if (selectedBabyId) {
        loadDay(careDate, selectedBabyId);
        loadMedicines(selectedBabyId, "baby");
      }
    };
    const intervalId = window.setInterval(refreshLiveData, 20000);
    const handleFocus = () => refreshLiveData();
    const handleVisibility = () => {
      if (!document.hidden) refreshLiveData();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activePage, careDate, selectedBabyId, user?.id]);

  useEffect(() => {
    notifyDueDoses(allDueDoses, t, notifiedDueDoseIds.current);
  }, [allDueDoses, t]);

  useEffect(() => {
    scheduleMedicineReminders(reminderMedicines, t).catch(() => null);
  }, [reminderMedicines, t]);

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
    try {
      const data = await apiRequest(`/api/day?date=${date}&babyId=${babyId}`);
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setStatus(t.synced);
    } catch {
      setEntries([]);
      setError(t.loadError);
    }
  }

  async function loadMedicines(babyId, ownerType = medicineOwner) {
    try {
      const query = ownerType === "mother" ? "ownerType=mother" : `ownerType=baby&babyId=${babyId}`;
      const data = await apiRequest(`/api/medicines?${query}`);
      setMedicines(data.medicines || []);
      setDueDoses(data.dueDoses || []);
    } catch {
      setError(t.loadError);
    }
  }

  async function loadMedicineReminders() {
    try {
      const data = await apiRequest("/api/medicines?ownerType=all");
      setReminderMedicines(data.medicines || []);
      setAllDueDoses(data.dueDoses || []);
    } catch {
      setError(t.loadError);
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
      setActivePage("mother");
      setMedicineOwner("mother");
      setAuthForm({ name: "", age: "", email: "", password: "" });
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
    setMedicines([]);
    setDueDoses([]);
    setAllDueDoses([]);
    setReminderMedicines([]);
    setSelectedBabyId("");
    setActivePage("mother");
    setMedicineOwner("mother");
  }

  function openBabyModal(baby = null) {
    if (baby) {
      setEditingBabyId(baby.id);
      setBabyForm({ name: baby.name, age: baby.age || "", gender: baby.gender || "girl" });
    } else {
      setEditingBabyId("");
      setBabyForm(blankBaby);
    }
    setBabyModalOpen(true);
  }

  async function saveBaby(event) {
    event.preventDefault();
    setIsBusy(true);
    setError("");
    const method = editingBabyId ? "PUT" : "POST";
    const body = editingBabyId ? { id: editingBabyId, ...babyForm } : babyForm;

    try {
      const data = await apiRequest("/api/babies", { method, body: JSON.stringify(body) });
      setBabies((current) => editingBabyId
        ? current.map((baby) => baby.id === data.baby.id ? data.baby : baby)
        : [...current, data.baby]
      );
      setSelectedBabyId(data.baby.id);
      setActivePage("child");
      setMedicineOwner("baby");
      setBabyForm(blankBaby);
      setEditingBabyId("");
      setBabyModalOpen(false);
      setStatus(t.saved);
    } catch {
      setError(t.babyError);
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteBaby(id) {
    setError("");
    try {
      await apiRequest(`/api/babies?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const nextBabies = babies.filter((baby) => baby.id !== id);
      setBabies(nextBabies);
      setSelectedBabyId(nextBabies[0]?.id || "");
      if (!nextBabies.length || selectedBabyId === id) {
        setActivePage("mother");
        setMedicineOwner("mother");
      }
      setEntries([]);
      setStatus(t.saved);
    } catch {
      setError(t.lastBabyError);
    }
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

  async function saveMedicine(event) {
    event.preventDefault();
    const ownerType = activePage === "child" ? "baby" : "mother";
    if (ownerType === "baby" && !selectedBabyId) return;
    setIsBusy(true);
    setError("");

    try {
      const method = editingMedicineId ? "PUT" : "POST";
      await apiRequest("/api/medicines", {
        method,
        body: JSON.stringify({
          ...medicineForm,
          action: editingMedicineId ? "update" : "create",
          id: editingMedicineId,
          babyId: ownerType === "baby" ? selectedBabyId : null,
          ownerType,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        }),
      });
      setMedicineForm(blankMedicine);
      setEditingMedicineId("");
      await loadMedicines(selectedBabyId, ownerType);
      await loadMedicineReminders();
      setStatus(t.medSaved);
    } catch {
      setError(t.medError);
    } finally {
      setIsBusy(false);
    }
  }

  async function markDoseTaken(doseId) {
    try {
      await apiRequest("/api/medicines", {
        method: "PUT",
        body: JSON.stringify({ doseId }),
      });
      await loadMedicines(selectedBabyId, activePage === "child" ? "baby" : "mother");
      await loadMedicineReminders();
      if (selectedBabyId) await loadDay(careDate, selectedBabyId);
      setStatus(t.saved);
    } catch {
      setError(t.takenError);
    }
  }

  async function deleteMedicine(id) {
    try {
      await apiRequest(`/api/medicines?id=${id}`, { method: "DELETE" });
      await loadMedicines(selectedBabyId, activePage === "child" ? "baby" : "mother");
      await loadMedicineReminders();
      setStatus(t.saved);
    } catch {
      setError(t.medError);
    }
  }

  async function refreshAll() {
    if (!user) return;

    setIsRefreshing(true);
    setError("");
    setStatus(t.refreshing || t.loading);

    try {
      await loadBabies();
      await loadMedicineReminders();
      if (activePage === "mother") {
        await loadMedicines("", "mother");
      } else if (selectedBabyId) {
        await Promise.all([loadDay(careDate, selectedBabyId), loadMedicines(selectedBabyId, "baby")]);
      }
      setStatus(t.synced);
    } catch {
      setError(t.loadError);
      setStatus(t.offline);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleTouchStart(event) {
    if (window.scrollY === 0) {
      pullStartY.current = event.touches[0].clientY;
    }
  }

  function handleTouchMove(event) {
    if (pullStartY.current === null || isRefreshing) return;

    const distance = event.touches[0].clientY - pullStartY.current;
    if (distance > 0) {
      setPullDistance(Math.min(86, Math.round(distance * 0.45)));
    }
  }

  async function handleTouchEnd() {
    const shouldRefresh = pullDistance >= 58;
    pullStartY.current = null;
    setPullDistance(0);
    if (shouldRefresh) await refreshAll();
  }

  function editMedicine(medicine) {
    setEditingMedicineId(medicine.id);
    setMedicineForm({
      name: medicine.name || "",
      dose: medicine.dose || "",
      timesPerDay: medicine.times_per_day || 1,
      durationDays: medicine.duration_days || 1,
      startTime: medicine.start_time || "08:00",
    });
    setMedicineOwner(medicine.owner_type === "mother" ? "mother" : "baby");
  }

  const summary = useMemo(() => Object.keys(entryTypes).reduce((acc, type) => {
    acc[type] = entries.filter((entry) => entry.type === type).length;
    return acc;
  }, { medicine: entries.filter((entry) => entry.type === "medicine").length }), [entries]);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => b.time.localeCompare(a.time)), [entries]);

  if (authLoading) {
    return <main className="shell auth-shell" dir={isRtl ? "rtl" : "ltr"}><div className="auth-card"><Baby size={38} /><p>{t.loading}</p></div></main>;
  }

  if (!user) {
    return <AuthScreen authError={authError} authForm={authForm} authMode={authMode} isBusy={isBusy} isRtl={isRtl} language={language} setAuthForm={setAuthForm} setAuthMode={setAuthMode} setLanguage={setLanguage} submitAuth={submitAuth} t={t} />;
  }

  return (
    <main
      className={`shell ${isRefreshing ? "refreshing" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div
        className={`pull-refresh ${pullDistance >= 58 ? "ready" : ""}`}
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        <RotateCcw size={17} />
        <span>{isRefreshing ? (t.refreshing || t.loading) : pullDistance >= 58 ? (t.releaseRefresh || "Release to refresh") : (t.pullRefresh || "Pull to refresh")}</span>
      </div>
      <section className="topbar" aria-label={t.appName}>
        <div className="brand-mark" aria-hidden="true">{activePage === "mother" ? <UserRound size={28} /> : <Baby size={28} />}</div>
        <div>
          <p className="eyebrow">{t.appName}</p>
          <h1>{activePage === "mother" ? t.motherHeadline(user.name || t.mother) : t.headline(selectedBaby?.name || t.defaultBaby)}</h1>
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

      <div className={`sync-banner ${error ? "error" : ""}`}><span>{error || status}</span></div>

      {isBabyModalOpen && (
        <Modal title={editingBabyId ? t.editBaby : t.addBaby} onClose={() => setBabyModalOpen(false)} t={t}>
          <form className="modal-form" onSubmit={saveBaby}>
            <label><span>{t.babyName}</span><input required value={babyForm.name} onChange={(event) => setBabyForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label><span>{t.babyAge}</span><input value={babyForm.age} placeholder={t.babyAgePlaceholder} onChange={(event) => setBabyForm((current) => ({ ...current, age: event.target.value }))} /></label>
            <label><span>{t.gender}</span><select value={babyForm.gender} onChange={(event) => setBabyForm((current) => ({ ...current, gender: event.target.value }))}>{Object.entries(t.genders).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <button className="primary-action" type="submit" disabled={isBusy}><Plus size={20} />{editingBabyId ? t.updateBaby : t.saveBaby}</button>
          </form>
        </Modal>
      )}

      {activePage === "mother" && allDueDoses.length > 0 && (
        <section className="due-warning">
          <div className="section-title"><Bell size={21} /><h2>{t.dueNow}</h2></div>
          <div className="due-list">
            {allDueDoses.map((dose) => (
              <article className="due-card" key={dose.id}>
                <div>
                  <strong>{dose.name}</strong>
                  <small>{dose.owner_type === "mother" ? ownerLabels.mother : ownerLabels.baby}</small>
                  <span>{dose.dose} - {formatDateTime(dose.scheduled_at, language)}</span>
                </div>
                <button className="primary-action compact-action" type="button" onClick={() => markDoseTaken(dose.id)}><CheckCircle2 size={18} />{t.markTaken}</button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activePage === "mother" ? (
        <MotherHome
          babies={babies}
          deleteBaby={deleteBaby}
          deleteMedicine={deleteMedicine}
          dueDoses={dueDoses}
          editMedicine={editMedicine}
          editingMedicineId={editingMedicineId}
          isBusy={isBusy}
          language={language}
          markDoseTaken={markDoseTaken}
          medicineForm={medicineForm}
          medicines={medicines}
          onAddBaby={() => openBabyModal()}
          onEditBaby={openBabyModal}
          onOpenChild={(baby) => {
            setSelectedBabyId(baby.id);
            setActivePage("child");
            setMedicineOwner("baby");
            setView("today");
            setMedicineForm(blankMedicine);
            setEditingMedicineId("");
          }}
          ownerLabels={ownerLabels}
          selectedBabyId={selectedBabyId}
          setEditingMedicineId={setEditingMedicineId}
          setMedicineForm={setMedicineForm}
          submitMedicine={saveMedicine}
          t={t}
          user={user}
        />
      ) : (
        <>
          <section className="baby-manager" aria-label={t.babies}>
            <div className="section-title split-title">
              <div className="section-title"><Baby size={20} /><h2>{selectedBaby?.name || t.defaultBaby}</h2></div>
              <button className="ghost-action" type="button" onClick={() => { setActivePage("mother"); setMedicineOwner("mother"); setMedicineForm(blankMedicine); setEditingMedicineId(""); }}><UserRound size={17} />{t.backToMother}</button>
            </div>
            {selectedBaby && (
              <article className="baby-card active">
                <button type="button" className="baby-select">
                  <strong>{selectedBaby.name}</strong>
                  <span>{[selectedBaby.age, t.genders[selectedBaby.gender]].filter(Boolean).join(" - ")}</span>
                </button>
                <div className="baby-actions">
                  <button className="icon-button" type="button" aria-label={t.editBaby} onClick={() => openBabyModal(selectedBaby)}><Pencil size={17} /></button>
                  <button className="icon-button" type="button" aria-label={t.deleteBaby} onClick={() => deleteBaby(selectedBaby.id)}><Trash2 size={17} /></button>
                </div>
              </article>
            )}
          </section>

          {selectedBaby && (
            <>
              <div className="view-tabs">
                <button className={view === "today" ? "active" : ""} type="button" onClick={() => setView("today")}><Clock3 size={18} />{t.todayTab}</button>
                <button className={view === "medicines" ? "active" : ""} type="button" onClick={() => setView("medicines")}><Pill size={18} />{t.medsTab}</button>
              </div>

              {view === "today" ? (
                <TodayView activeConfig={activeConfig} activeType={activeType} entries={sortedEntries} form={form} isBusy={isBusy} language={language} onAdd={addEntry} onRemove={removeEntry} onReset={resetDay} setActiveType={setActiveType} setForm={setForm} summary={summary} t={t} />
              ) : (
                <MedicineView deleteMedicine={deleteMedicine} editMedicine={editMedicine} editingMedicineId={editingMedicineId} dueDoses={dueDoses} isBusy={isBusy} language={language} markDoseTaken={markDoseTaken} medicineForm={medicineForm} medicines={medicines} ownerLabels={ownerLabels} setEditingMedicineId={setEditingMedicineId} setMedicineForm={setMedicineForm} submit={saveMedicine} t={t} />
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}

function MotherHome({ babies, deleteBaby, deleteMedicine, dueDoses, editMedicine, editingMedicineId, isBusy, language, markDoseTaken, medicineForm, medicines, onAddBaby, onEditBaby, onOpenChild, ownerLabels, setEditingMedicineId, setMedicineForm, submitMedicine, t, user }) {
  return (
    <>
      <section className="mother-panel">
        <div className="section-title"><UserRound size={20} /><h2>{t.mother}</h2></div>
        <div className="mother-details">
          <strong>{user.name}</strong>
          {user.age && <span>{t.motherAge}: {user.age}</span>}
          <small>{user.email}</small>
        </div>
      </section>

      <section className="baby-manager" aria-label={t.children}>
        <div className="section-title split-title">
          <div className="section-title"><Baby size={20} /><h2>{t.children}</h2></div>
          <button className="primary-action compact-action" type="button" onClick={onAddBaby}><Plus size={18} />{t.addBaby}</button>
        </div>
        {babies.length === 0 ? <div className="empty-state compact-empty"><p>{t.noChildren}</p></div> : (
          <div className="baby-list">
            {babies.map((baby) => (
              <article className="baby-card" key={baby.id}>
                <button type="button" className="baby-select" onClick={() => onOpenChild(baby)}>
                  <strong>{baby.name}</strong>
                  <span>{[baby.age, t.genders[baby.gender]].filter(Boolean).join(" - ")}</span>
                  <small>{t.enterChild}</small>
                </button>
                <div className="baby-actions">
                  <button className="icon-button" type="button" aria-label={t.editBaby} onClick={() => onEditBaby(baby)}><Pencil size={17} /></button>
                  <button className="icon-button" type="button" aria-label={t.deleteBaby} onClick={() => deleteBaby(baby.id)}><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <MedicineView
        deleteMedicine={deleteMedicine}
        editMedicine={editMedicine}
        editingMedicineId={editingMedicineId}
        dueDoses={dueDoses}
        isBusy={isBusy}
        language={language}
        markDoseTaken={markDoseTaken}
        medicineForm={medicineForm}
        medicines={medicines}
        ownerLabels={ownerLabels}
        setEditingMedicineId={setEditingMedicineId}
        setMedicineForm={setMedicineForm}
        submit={submitMedicine}
        t={{ ...t, addMedicine: t.motherMedicines, activeMeds: t.motherMedicines, noMeds: language === "ar" ? "لا توجد أدوية مضافة للأم." : "No medicines added for mother." }}
      />
    </>
  );
}

function TodayView({ activeConfig, activeType, entries, form, isBusy, language, onAdd, onRemove, onReset, setActiveType, setForm, summary, t }) {
  function updateForm(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <section className="baby-panel" aria-label={t.todayTab}>
        <div className="summary-strip">
          {[...Object.entries(entryTypes), ["medicine", { icon: Pill, color: "violet" }]].map(([type, config]) => {
            const Icon = config.icon;
            return <div className={`summary-item ${config.color}`} key={type}><Icon size={20} /><strong>{summary[type] || 0}</strong><span>{t.type[type]}</span></div>;
          })}
        </div>
      </section>
      <section className="workspace">
        <form className="logger" onSubmit={onAdd}>
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
              {field.type === "select" ? <select value={form[field.name] || field.options[0]} onChange={(event) => updateForm(field.name, event.target.value)}>{field.options.map((option) => <option key={option} value={option}>{t.options[option]}</option>)}</select> : <input value={form[field.name] || ""} placeholder={field.placeholder?.[language]} onChange={(event) => updateForm(field.name, event.target.value)} />}
            </label>
          ))}
          <label><span>{t.extraNote}</span><textarea value={form.note || ""} placeholder={t.notePlaceholder} onChange={(event) => updateForm("note", event.target.value)} /></label>
          <button className="primary-action" type="submit" disabled={isBusy}><Plus size={20} />{isBusy ? t.saving : t.addToDay}</button>
        </form>
        <section className="timeline" aria-label={t.timeline}>
          <div className="section-title timeline-title"><Clock3 size={20} /><h2>{t.timeline}</h2><button className="ghost-action" type="button" onClick={onReset}><RotateCcw size={17} />{t.reset}</button></div>
          {entries.length === 0 ? <div className="empty-state"><Baby size={34} /><p>{t.empty}</p></div> : <div className="event-list">{entries.map((entry) => <CareEvent entry={entry} key={entry.id} onRemove={onRemove} t={t} />)}</div>}
        </section>
      </section>
    </>
  );
}

function MedicineView({ deleteMedicine, editMedicine, editingMedicineId, dueDoses, isBusy, language, markDoseTaken, medicineForm, medicines, ownerLabels, setEditingMedicineId, setMedicineForm, submit, t }) {
  const ownerCopy = {
    owner: language === "ar" ? "صاحب العلاج" : "Medicine for",
    motherEmpty: language === "ar" ? "لا توجد أدوية مضافة للأم." : "No medicines added for mother.",
  };

  return (
    <section className="medicine-page">
      <form className="medicine-form" onSubmit={submit}>
        <div className="section-title"><Pill size={20} /><h2>{t.addMedicine}</h2></div>
        <label><span>{t.medicineName}</span><input required value={medicineForm.name} onChange={(event) => setMedicineForm((current) => ({ ...current, name: event.target.value }))} /></label>
        <label><span>{t.dose}</span><input required value={medicineForm.dose} onChange={(event) => setMedicineForm((current) => ({ ...current, dose: event.target.value }))} /></label>
        <label><span>{t.timesPerDay}</span><input min="1" max="12" type="number" value={medicineForm.timesPerDay} onChange={(event) => setMedicineForm((current) => ({ ...current, timesPerDay: event.target.value }))} /></label>
        <label><span>{t.durationDays}</span><input min="1" max="365" type="number" value={medicineForm.durationDays} onChange={(event) => setMedicineForm((current) => ({ ...current, durationDays: event.target.value }))} /></label>
        <label><span>{t.firstTime}</span><input type="time" value={medicineForm.startTime} onChange={(event) => setMedicineForm((current) => ({ ...current, startTime: event.target.value }))} /></label>
        <button className="primary-action" type="submit" disabled={isBusy}><Plus size={20} />{editingMedicineId ? t.updateMedicine : t.addMedicine}</button>
        {editingMedicineId && <button className="ghost-action" type="button" onClick={() => { setEditingMedicineId(""); setMedicineForm(blankMedicine); }}>{t.cancel}</button>}
      </form>

      <section className="medicine-list-panel">
        <div className="section-title"><Bell size={20} /><h2>{t.dueNow}</h2></div>
        {dueDoses.length === 0 ? <div className="empty-state compact-empty"><p>{t.noDueMeds}</p></div> : <div className="due-list">{dueDoses.map((dose) => <article className="due-card" key={dose.id}><div><strong>{dose.name}</strong><small>{dose.owner_type === "mother" ? ownerLabels.mother : ownerLabels.baby}</small><span>{dose.dose} - {formatDateTime(dose.scheduled_at, language)}</span></div><button className="primary-action compact-action" type="button" onClick={() => markDoseTaken(dose.id)}><CheckCircle2 size={18} />{t.markTaken}</button></article>)}</div>}
      </section>

      <section className="medicine-list-panel">
        <div className="section-title"><Pill size={20} /><h2>{t.activeMeds}</h2></div>
        {medicines.length === 0 ? <div className="empty-state compact-empty"><p>{t.noMeds}</p></div> : <div className="event-list">{medicines.map((medicine) => <article className="medicine-card" key={medicine.id}><div><strong>{medicine.name}</strong><span>{medicine.dose} - {t.timesPerDay}: {medicine.times_per_day} - {t.durationDays}: {medicine.duration_days}</span><small>{medicine.owner_type === "mother" ? ownerLabels.mother : ownerLabels.baby} - {t.firstTime}: {medicine.start_time}</small></div><div className="baby-actions"><button className="icon-button" type="button" aria-label={t.editMedicine} onClick={() => editMedicine(medicine)}><Pencil size={18} /></button><button className="icon-button" type="button" aria-label={t.deleteMed} onClick={() => deleteMedicine(medicine.id)}><Trash2 size={18} /></button></div></article>)}</div>}
      </section>
    </section>
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
          {authMode === "register" && <label><span>{t.name}</span><input required value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} /></label>}
          {authMode === "register" && <label><span>{t.motherAge}</span><input value={authForm.age} placeholder={t.motherAgePlaceholder} onChange={(event) => setAuthForm((current) => ({ ...current, age: event.target.value }))} /></label>}
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

function Modal({ children, onClose, title, t }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="modal-panel">
        <div className="section-title split-title"><h2>{title}</h2><button className="icon-button" type="button" aria-label={t.close} onClick={onClose}><X size={19} /></button></div>
        {children}
      </section>
    </div>
  );
}

function CareEvent({ entry, onRemove, t }) {
  const config = entryTypes[entry.type] || { icon: Pill, color: "violet" };
  const Icon = config.icon;
  const details = Object.entries(entry.details || {}).filter(([, value]) => value).map(([key, value]) => `${t.fields[key] || key}: ${t.options[value] || value}`).join(" - ");
  return <article className={`event ${config.color}`}><div className="event-icon"><Icon size={21} /></div><div className="event-body"><div className="event-heading"><strong>{t.type[entry.type]}</strong><time>{entry.time}</time></div>{details && <p>{details}</p>}{entry.note && <small>{entry.note}</small>}</div><button className="icon-button" type="button" aria-label={t.deleteEventError} onClick={() => onRemove(entry.id)}><Trash2 size={18} /></button></article>;
}

async function notifyDueDoses(dueDoses, t, notifiedIds) {
  if (!dueDoses.length) return;

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return;

  for (const dose of dueDoses) {
    if (notifiedIds.has(dose.id)) continue;
    notifiedIds.add(dose.id);

    const title = t.notificationTitle || "Medicine time";
    const body = typeof t.notificationBody === "function" ? t.notificationBody(dose.name, dose.dose) : `${dose.name} - ${dose.dose}`;

    if (isNativeApp()) {
      await ensureMedicineReminderChannel();
      await LocalNotifications.schedule({
        notifications: [{
          id: notificationId(`due-${dose.id}`),
          title,
          body,
          channelId: medicineReminderChannelId,
          schedule: { at: new Date(Date.now() + 800), allowWhileIdle: true },
          autoCancel: true,
        }],
      }).catch(() => null);
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }
}

async function scheduleMedicineReminders(medicines, t) {
  if (!isNativeApp() || !medicines.length) return;

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return;
  await ensureMedicineReminderChannel();

  const previousIds = readScheduledNotificationIds();
  if (previousIds.length) {
    await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) }).catch(() => null);
  }

  const notifications = buildMedicineNotifications(medicines, t);
  if (!notifications.length) {
    writeScheduledNotificationIds([]);
    return;
  }

  await LocalNotifications.schedule({ notifications }).catch(() => null);
  writeScheduledNotificationIds(notifications.map((notification) => notification.id));
}

function buildMedicineNotifications(medicines, t) {
  const now = Date.now();
  const title = t.notificationTitle || "Medicine time";
  const notifications = [];

  medicines.forEach((medicine) => {
    const startDate = String(medicine.start_date || todayDate());
    const startTime = String(medicine.start_time || "08:00");
    const [year, month, day] = startDate.split("-").map(Number);
    const [hours, minutes] = startTime.split(":").map(Number);
    const timesPerDay = clampLocal(Number(medicine.times_per_day || 1), 1, 12);
    const durationDays = clampLocal(Number(medicine.duration_days || 1), 1, 365);
    const intervalHours = Math.max(1, Math.floor(24 / timesPerDay));

    for (let dayIndex = 0; dayIndex < durationDays; dayIndex += 1) {
      for (let doseIndex = 0; doseIndex < timesPerDay; doseIndex += 1) {
        const at = new Date(year, month - 1, day + dayIndex, hours + doseIndex * intervalHours, minutes);
        if (at.getTime() <= now + 15000) continue;

        notifications.push({
          id: notificationId(`${medicine.id}-${at.toISOString()}`),
          title,
          body: typeof t.notificationBody === "function" ? t.notificationBody(medicine.name, medicine.dose) : `${medicine.name} - ${medicine.dose}`,
          channelId: medicineReminderChannelId,
          schedule: { at, allowWhileIdle: true },
          autoCancel: true,
        });
      }
    }
  });

  return notifications.sort((a, b) => a.schedule.at - b.schedule.at).slice(0, 64);
}

async function ensureMedicineReminderChannel() {
  if (!isNativeApp()) return;

  await LocalNotifications.createChannel({
    id: medicineReminderChannelId,
    name: "Medicine reminders",
    description: "Medicine dose reminders",
    importance: 5,
    visibility: 1,
    lights: true,
    lightColor: "#e75f76",
    vibration: true,
  }).catch(() => null);
}

async function requestNotificationPermission() {
  if (isNativeApp()) {
    const current = await LocalNotifications.checkPermissions().catch(() => ({ display: "denied" }));
    await LocalNotifications.checkExactNotificationSetting?.().catch(() => null);
    if (current.display === "granted") return "granted";
    const next = await LocalNotifications.requestPermissions().catch(() => ({ display: "denied" }));
    return next.display;
  }

  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "default") {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

function isNativeApp() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

function readScheduledNotificationIds() {
  try {
    return JSON.parse(localStorage.getItem("newborn-scheduled-notifications") || "[]");
  } catch {
    return [];
  }
}

function writeScheduledNotificationIds(ids) {
  localStorage.setItem("newborn-scheduled-notifications", JSON.stringify(ids));
}

function notificationId(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) + 1;
}

async function apiRequest(path, options = {}) {
  if (shouldUseLocalApi()) {
    return localApiRequest(path, options);
  }

  const response = await fetch(path, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

const localStoreKey = "newborn-local-app-data";

function shouldUseLocalApi() {
  if (window.location.protocol === "https:" || window.location.protocol === "http:") {
    return false;
  }

  return Boolean(
    window.Capacitor?.isNativePlatform?.()
    || window.location.protocol === "capacitor:"
    || (window.location.hostname === "localhost" && !window.location.port)
  );
}

async function localApiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const url = new URL(path, "https://local.app");
  const body = options.body ? JSON.parse(options.body) : {};
  const store = readLocalStore();

  if (url.pathname === "/api/auth") {
    if (method === "GET") return { user: store.user };

    if (method === "POST" && body.action === "logout") {
      store.user = null;
      writeLocalStore(store);
      return { ok: true };
    }

    if (method === "POST" && ["login", "register"].includes(body.action)) {
      const email = String(body.email || "local@app.test").trim().toLowerCase();
      const name = String(body.name || email.split("@")[0] || "Mama").trim();
      const age = String(body.age || "").trim();
      store.user = { id: "local-user", email, name, age };
      writeLocalStore(store);
      return { user: store.user };
    }
  }

  if (!store.user) {
    throw new Error("Local login required.");
  }

  if (url.pathname === "/api/babies") {
    if (method === "GET") {
      return { babies: store.babies };
    }

    if (method === "POST") {
      const baby = normalizeLocalBaby({ id: crypto.randomUUID(), ...body });
      store.babies.push(baby);
      writeLocalStore(store);
      return { baby };
    }

    if (method === "PUT") {
      const baby = normalizeLocalBaby(body);
      store.babies = store.babies.map((item) => item.id === baby.id ? baby : item);
      writeLocalStore(store);
      return { baby };
    }

    if (method === "DELETE") {
      const id = url.searchParams.get("id");
      store.babies = store.babies.filter((baby) => baby.id !== id);
      store.entries = store.entries.filter((entry) => entry.babyId !== id);
      store.medicines = store.medicines.filter((medicine) => medicine.babyId !== id);
      store.doses = store.doses.filter((dose) => dose.babyId !== id);
      writeLocalStore(store);
      return null;
    }
  }

  if (url.pathname === "/api/day") {
    if (method === "GET") {
      const careDate = url.searchParams.get("date");
      const babyId = url.searchParams.get("babyId");
      return {
        entries: store.entries
          .filter((entry) => entry.careDate === careDate && entry.babyId === babyId)
          .map(({ careDate: _careDate, babyId: _babyId, ...entry }) => entry),
      };
    }

    if (method === "POST") {
      const entry = { ...body.entry, careDate: body.careDate, babyId: body.babyId };
      store.entries.push(entry);
      writeLocalStore(store);
      const { careDate: _careDate, babyId: _babyId, ...savedEntry } = entry;
      return { entry: savedEntry };
    }

    if (method === "DELETE") {
      const id = url.searchParams.get("id");
      const careDate = url.searchParams.get("date");
      const babyId = url.searchParams.get("babyId");
      store.entries = id
        ? store.entries.filter((entry) => entry.id !== id)
        : store.entries.filter((entry) => entry.careDate !== careDate || entry.babyId !== babyId);
      writeLocalStore(store);
      return null;
    }
  }

  if (url.pathname === "/api/medicines") {
    if (method === "GET") {
      const babyId = url.searchParams.get("babyId");
      const ownerType = normalizeOwnerType(url.searchParams.get("ownerType"), "baby");
      const medicines = store.medicines.filter((medicine) => matchesMedicineOwner(medicine, ownerType, babyId)).map(toPublicMedicine);
      const now = new Date();
      const dueDoses = store.doses
        .filter((dose) => matchesMedicineOwner(dose, ownerType, babyId) && !dose.taken_at && new Date(dose.scheduled_at) <= now)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .filter((dose, index, doses) => doses.findIndex((item) => item.medicine_id === dose.medicine_id) === index)
        .map((dose) => {
          const medicine = store.medicines.find((item) => item.id === dose.medicine_id) || {};
          return { id: dose.id, medicine_id: dose.medicine_id, name: medicine.name, dose: medicine.dose, owner_type: medicine.owner_type || "baby", baby_id: medicine.babyId || null, scheduled_at: dose.scheduled_at };
        });
      return { medicines, dueDoses };
    }

    if (method === "POST") {
      const medicine = createLocalMedicine(body);
      store.medicines.push(medicine);
      store.doses.push(...buildLocalSchedule(medicine));
      writeLocalStore(store);
      return { medicine: toPublicMedicine(medicine) };
    }

    if (method === "PUT" && body.action === "update") {
      const medicine = createLocalMedicine(body, body.id);
      store.medicines = store.medicines.map((item) => item.id === medicine.id ? medicine : item);
      store.doses = store.doses.filter((dose) => dose.medicine_id !== medicine.id || dose.taken_at);
      store.doses.push(...buildLocalSchedule(medicine));
      writeLocalStore(store);
      return { medicine: toPublicMedicine(medicine) };
    }

    if (method === "PUT") {
      const dose = store.doses.find((item) => item.id === body.doseId);
      if (!dose) throw new Error("Dose not found.");
      dose.taken_at = new Date().toISOString();
      const medicine = store.medicines.find((item) => item.id === dose.medicine_id);
      if (medicine && (medicine.owner_type || "baby") === "baby") {
        store.entries.push({
          id: crypto.randomUUID(),
          babyId: dose.babyId,
          careDate: todayDate(),
          type: "medicine",
          time: dose.scheduled_at.slice(11, 16),
          details: { medicine: medicine.name, dose: medicine.dose },
          note: "Scheduled medicine taken",
        });
      }
      writeLocalStore(store);
      return { ok: true };
    }

    if (method === "DELETE") {
      const id = url.searchParams.get("id");
      store.medicines = store.medicines.filter((medicine) => medicine.id !== id);
      store.doses = store.doses.filter((dose) => dose.medicine_id !== id);
      writeLocalStore(store);
      return null;
    }
  }

  throw new Error(`Unsupported local route: ${method} ${url.pathname}`);
}

function readLocalStore() {
  const fallback = { user: null, babies: [], entries: [], medicines: [], doses: [] };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(localStoreKey) || "{}") };
  } catch {
    return fallback;
  }
}

function writeLocalStore(store) {
  localStorage.setItem(localStoreKey, JSON.stringify(store));
}

function ensureDefaultBaby(store) {
  if (!store.babies.length) {
    store.babies.push({ id: crypto.randomUUID(), name: "Baby girl", age: "", gender: "girl" });
  }
}

function normalizeLocalBaby(body) {
  return {
    id: String(body.id || crypto.randomUUID()),
    name: String(body.name || "Baby").trim().slice(0, 80),
    age: String(body.age || "").trim().slice(0, 40),
    gender: ["girl", "boy", "other"].includes(body.gender) ? body.gender : "girl",
  };
}

function createLocalMedicine(body, id = crypto.randomUUID()) {
  const timesPerDay = clampLocal(Number(body.timesPerDay || 1), 1, 12);
  const durationDays = clampLocal(Number(body.durationDays || 1), 1, 365);
  const ownerType = normalizeOwnerType(body.ownerType, "baby");
  return {
    id,
    babyId: ownerType === "baby" ? body.babyId : null,
    owner_type: ownerType,
    name: String(body.name || "").trim(),
    dose: String(body.dose || "").trim(),
    times_per_day: timesPerDay,
    duration_days: durationDays,
    start_date: todayDate(),
    start_time: String(body.startTime || "08:00"),
  };
}

function toPublicMedicine(medicine) {
  const { babyId: _babyId, ...publicMedicine } = medicine;
  return { ...publicMedicine, baby_id: medicine.babyId || null, owner_type: medicine.owner_type || "baby" };
}

function buildLocalSchedule(medicine) {
  const intervalHours = Math.max(1, Math.floor(24 / medicine.times_per_day));
  const [hours, minutes] = medicine.start_time.split(":").map(Number);
  const [year, month, day] = medicine.start_date.split("-").map(Number);
  const doses = [];

  for (let dayIndex = 0; dayIndex < medicine.duration_days; dayIndex += 1) {
    for (let doseIndex = 0; doseIndex < medicine.times_per_day; doseIndex += 1) {
      const scheduledAt = new Date(year, month - 1, day + dayIndex, hours + doseIndex * intervalHours, minutes);
      doses.push({
        id: crypto.randomUUID(),
        medicine_id: medicine.id,
        babyId: medicine.babyId,
        owner_type: medicine.owner_type || "baby",
        scheduled_at: scheduledAt.toISOString(),
        taken_at: null,
      });
    }
  }

  return doses;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function clampLocal(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeOwnerType(value, fallback = "baby") {
  if (value === "mother" || value === "all" || value === "baby") return value;
  return fallback;
}

function matchesMedicineOwner(item, ownerType, babyId) {
  const itemOwner = item.owner_type || "baby";
  if (ownerType === "all") return true;
  if (ownerType === "mother") return itemOwner === "mother";
  return itemOwner === "baby" && item.babyId === babyId;
}

function formatDateTime(value, language) {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

createRoot(document.getElementById("root")).render(<App />);
