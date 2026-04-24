import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Baby,
  CalendarDays,
  Clock3,
  Droplets,
  Milk,
  Moon,
  NotebookPen,
  Pill,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "newborn-day-care-v1";

const entryTypes = {
  feeding: {
    label: "Feeding",
    icon: Milk,
    color: "rose",
    fields: [
      { name: "method", label: "Method", type: "select", options: ["Breast", "Bottle", "Formula", "Pumped milk"] },
      { name: "amount", label: "Amount", placeholder: "60 ml or 20 min" },
      { name: "side", label: "Side", type: "select", options: ["Both", "Left", "Right", "N/A"] },
    ],
  },
  diaper: {
    label: "Diaper",
    icon: Droplets,
    color: "teal",
    fields: [
      { name: "diaperType", label: "Type", type: "select", options: ["Wet", "Dirty", "Wet + dirty", "Dry check"] },
      { name: "rash", label: "Skin", type: "select", options: ["Normal", "Redness", "Rash cream used"] },
    ],
  },
  medicine: {
    label: "Medicine",
    icon: Pill,
    color: "violet",
    fields: [
      { name: "medicine", label: "Medicine", placeholder: "Vitamin D" },
      { name: "dose", label: "Dose", placeholder: "1 drop or 0.5 ml" },
    ],
  },
  sleep: {
    label: "Sleep",
    icon: Moon,
    color: "indigo",
    fields: [
      { name: "duration", label: "Duration", placeholder: "45 min" },
      { name: "place", label: "Place", type: "select", options: ["Bassinet", "Crib", "Held", "Stroller"] },
    ],
  },
  note: {
    label: "Note",
    icon: NotebookPen,
    color: "amber",
    fields: [{ name: "note", label: "Note", placeholder: "Mood, temperature, bath, appointment..." }],
  },
};

const defaultEntries = [
  {
    id: "sample-1",
    type: "feeding",
    time: "06:30",
    details: { method: "Breast", amount: "18 min", side: "Both" },
    note: "Morning feed",
  },
  {
    id: "sample-2",
    type: "diaper",
    time: "07:05",
    details: { diaperType: "Wet", rash: "Normal" },
    note: "",
  },
  {
    id: "sample-3",
    type: "medicine",
    time: "09:00",
    details: { medicine: "Vitamin D", dose: "As prescribed" },
    note: "Confirm dose with pediatrician",
  },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function App() {
  const [careDate, setCareDate] = useState(todayKey());
  const [babyName, setBabyName] = useState("Baby girl");
  const [activeType, setActiveType] = useState("feeding");
  const [entries, setEntries] = useState(defaultEntries);
  const [form, setForm] = useState({ time: currentTime(), note: "" });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setCareDate(parsed.careDate || todayKey());
      setBabyName(parsed.babyName || "Baby girl");
      setEntries(Array.isArray(parsed.entries) ? parsed.entries : defaultEntries);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ careDate, babyName, entries }));
  }, [careDate, babyName, entries]);

  const summary = useMemo(() => {
    return Object.keys(entryTypes).reduce((acc, type) => {
      acc[type] = entries.filter((entry) => entry.type === type).length;
      return acc;
    }, {});
  }, [entries]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.time.localeCompare(a.time)),
    [entries]
  );

  const activeConfig = entryTypes[activeType];

  function updateForm(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function addEntry(event) {
    event.preventDefault();
    const details = {};
    activeConfig.fields.forEach((field) => {
      details[field.name] = form[field.name] || field.options?.[0] || "";
    });

    setEntries((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type: activeType,
        time: form.time || currentTime(),
        details,
        note: form.note || "",
      },
    ]);

    setForm({ time: currentTime(), note: "" });
  }

  function removeEntry(id) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function resetDay() {
    setEntries([]);
    setForm({ time: currentTime(), note: "" });
  }

  return (
    <main className="shell">
      <section className="topbar" aria-label="Daily care header">
        <div className="brand-mark" aria-hidden="true">
          <Baby size={28} />
        </div>
        <div>
          <p className="eyebrow">Newborn daily care</p>
          <h1>{babyName}'s day</h1>
        </div>
        <div className="date-pill">
          <CalendarDays size={18} />
          <input
            aria-label="Care date"
            type="date"
            value={careDate}
            onChange={(event) => setCareDate(event.target.value)}
          />
        </div>
      </section>

      <section className="baby-panel" aria-label="Baby profile and summary">
        <label className="name-field">
          <span>Baby name</span>
          <input value={babyName} onChange={(event) => setBabyName(event.target.value)} />
        </label>
        <div className="summary-strip">
          {Object.entries(entryTypes).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div className={`summary-item ${config.color}`} key={type}>
                <Icon size={20} />
                <strong>{summary[type] || 0}</strong>
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="workspace">
        <form className="logger" onSubmit={addEntry}>
          <div className="section-title">
            <Sparkles size={20} />
            <h2>Add care event</h2>
          </div>

          <div className="type-grid" role="tablist" aria-label="Care event type">
            {Object.entries(entryTypes).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <button
                  className={`type-button ${activeType === type ? "active" : ""}`}
                  type="button"
                  key={type}
                  onClick={() => {
                    setActiveType(type);
                    setForm({ time: currentTime(), note: "" });
                  }}
                >
                  <Icon size={20} />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          <label>
            <span>Time</span>
            <input type="time" value={form.time || ""} onChange={(event) => updateForm("time", event.target.value)} />
          </label>

          {activeConfig.fields.map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>
              {field.type === "select" ? (
                <select value={form[field.name] || field.options[0]} onChange={(event) => updateForm(field.name, event.target.value)}>
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form[field.name] || ""}
                  placeholder={field.placeholder}
                  onChange={(event) => updateForm(field.name, event.target.value)}
                />
              )}
            </label>
          ))}

          <label>
            <span>Extra note</span>
            <textarea
              value={form.note || ""}
              placeholder="Anything important for the next caregiver"
              onChange={(event) => updateForm("note", event.target.value)}
            />
          </label>

          <button className="primary-action" type="submit">
            <Plus size={20} />
            Add to day
          </button>
        </form>

        <section className="timeline" aria-label="Daily timeline">
          <div className="section-title timeline-title">
            <Clock3 size={20} />
            <h2>Today timeline</h2>
            <button className="ghost-action" type="button" onClick={resetDay}>
              <RotateCcw size={17} />
              Reset
            </button>
          </div>

          {sortedEntries.length === 0 ? (
            <div className="empty-state">
              <Baby size={34} />
              <p>No events yet for this day.</p>
            </div>
          ) : (
            <div className="event-list">
              {sortedEntries.map((entry) => (
                <CareEvent entry={entry} key={entry.id} onRemove={removeEntry} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function CareEvent({ entry, onRemove }) {
  const config = entryTypes[entry.type];
  const Icon = config.icon;
  const details = Object.entries(entry.details || {})
    .filter(([, value]) => value)
    .map(([key, value]) => `${humanize(key)}: ${value}`)
    .join(" · ");

  return (
    <article className={`event ${config.color}`}>
      <div className="event-icon">
        <Icon size={21} />
      </div>
      <div className="event-body">
        <div className="event-heading">
          <strong>{config.label}</strong>
          <time>{entry.time}</time>
        </div>
        {details && <p>{details}</p>}
        {entry.note && <small>{entry.note}</small>}
      </div>
      <button className="icon-button" type="button" aria-label={`Delete ${config.label} entry`} onClick={() => onRemove(entry.id)}>
        <Trash2 size={18} />
      </button>
    </article>
  );
}

function humanize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

createRoot(document.getElementById("root")).render(<App />);
