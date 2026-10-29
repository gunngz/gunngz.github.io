import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { cards, getPages, matchesSearch, renderMarkdown, unitInfo } from "./content.js";
import "./style.css";

const isChemistry = /^\/ap-chemistry(?:\/|$)/.test(window.location.pathname);
const isHistory = /^\/us-history(?:\/|$)/.test(window.location.pathname);
const isUsaco = /^\/usaco(?:\/|$)/.test(window.location.pathname);
const availableUnits = isChemistry
  ? ["chem1", "chem2"]
  : isHistory ? ["ushist3"] : isUsaco ? ["usaco"] : ["u1p1", "u1p2", "u2p1"];
const u2p1PrimaryCategoryByDay = {
  1: "Two Categorical Variables",
  2: "Simulation",
  3: "Probability Basics",
  4: "Conditional Probability",
  5: "Diagnostic Testing",
};

function EyeIcon({ crossed = false }) {
  return (
    <svg className="icon eye-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.2 12s3.4-6.2 9.8-6.2 9.8 6.2 9.8 6.2-3.4 6.2-9.8 6.2S2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="2.7" />
      {crossed ? <path className="icon-slash" d="M4 4 20 20" /> : null}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="icon search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg className="icon menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />}
    </svg>
  );
}

function RichText({ value, inline = false, query = "", className = "" }) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(value, inline, query) }}
    />
  );
}

function blurIdsForCard(card) {
  return [card.id];
}

function StudyCard({ card, blurredIds, onToggleBlur, query = "", isChemistry = false }) {
  const blurred = blurredIds.has(card.id);
  const hasDiagram = card.answer.includes("](./diagrams/");
  return (
    <article className={"study-card" + (isChemistry ? " study-card--chemistry" : "") + (card.unit === "usaco" ? " study-card--patterns" : "") + (card.unit === "ushist3" ? " study-card--history" : "") + (hasDiagram ? " study-card--diagram" : "") + (blurred ? " is-blurred" : "")}>
      <div className="question-side">
        <h3><RichText value={card.title} inline query={query} /></h3>
      </div>
      <div className="answer-side">
        <button
          className="icon-button card-blur-button"
          type="button"
          aria-pressed={blurred}
          aria-label={blurred ? "Reveal answer" : "Blur answer"}
          title={blurred ? "Reveal answer" : "Blur answer"}
          onClick={() => onToggleBlur(card.id)}
        >
          <EyeIcon crossed={blurred} />
        </button>
        <RichText value={card.answer} query={query} className="answer-content" />
      </div>
    </article>
  );
}

function App() {
  const [unit, setUnit] = useState(availableUnits[0]);
  const [kind, setKind] = useState(isChemistry ? "template" : isUsaco ? "patterns" : "vocabulary");
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(!isChemistry && availableUnits.length > 1);
  const [blurredIds, setBlurredIds] = useState(() => new Set());
  const [sidebarDismissed, setSidebarDismissed] = useState(false);
  const contentRef = useRef(null);

  const pages = useMemo(() => {
    const unitPages = getPages(unit, kind);
    return unit === "u2p1" && day !== "all"
      ? unitPages.filter((page) => page.cards.some((card) => card.days.includes(day)))
      : unitPages;
  }, [unit, kind, day]);
  const activeCategory = pages.some((page) => page.category === category)
    ? category
    : pages[0]?.category || "";
  const activePage = pages.find((page) => page.category === activeCategory);
  const visibleCards = (activePage?.cards || []).filter((card) => day === "all" || card.days.includes(day));
  const searchResults = query.trim()
    ? cards.filter((card) => availableUnits.includes(card.unit) && matchesSearch(card, query))
    : [];
  const currentCards = query.trim() ? searchResults : visibleCards;
  const visibleBlurIds = currentCards.flatMap(blurIdsForCard);
  const allVisibleBlurred = visibleBlurIds.length > 0 && visibleBlurIds.every((id) => blurredIds.has(id));
  const bulkBlurLabel = allVisibleBlurred ? "Reveal all answers" : "Blur all answers";

  useEffect(() => {
    if (category !== activeCategory) setCategory(activeCategory);
  }, [category, activeCategory]);

  useEffect(() => {
    document.title = `${unitInfo[unit]?.heading || "Study Guide"} Study Guide`;
  }, [unit]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    let active = true;
    let queued = Promise.resolve();

    const typeset = () => {
      queued = queued.then(async () => {
        const mathJax = window.MathJax;
        if (!active || !mathJax?.typesetPromise) return;
        await mathJax.startup?.promise;
        if (!active) return;
        mathJax.typesetClear?.([root]);
        await mathJax.typesetPromise([root]);
      }).catch(() => {});
    };

    window.addEventListener("mathjax-ready", typeset);
    if (window.MathJax?.typesetPromise) typeset();

    return () => {
      active = false;
      window.removeEventListener("mathjax-ready", typeset);
      window.MathJax?.typesetClear?.([root]);
    };
  }, [unit, kind, day, activeCategory, query]);

  function updateBlur(ids, shouldBlur) {
    setBlurredIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (shouldBlur) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function toggleCard(id) {
    setBlurredIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllAnswers() {
    updateBlur(visibleBlurIds, !allVisibleBlurred);
  }

  function selectUnit(nextUnit) {
    setUnit(nextUnit);
    if (isChemistry) setKind("template");
    setDay("all");
    setCategory("");
    setQuery("");
    setSidebarDismissed(false);
    if (window.matchMedia("(max-width: 1486px)").matches) setSidebarOpen(false);
  }

  function selectKind(nextKind) {
    setKind(nextKind);
    setDay("all");
    setCategory("");
  }

  const isSearching = Boolean(query.trim());
  const dayCount = unit === "u2p1" ? 5 : 6;
  const dayButtons = ["all", ...Array.from({ length: dayCount }, (_, index) => String(index + 1))];

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="title-row">
            <h1>{unitInfo[unit]?.heading || "Study Guide"}</h1>
          </div>
        </div>
      </header>

      <div className="sticky-navigation">
        <div className="sticky-navigation-inner">
          <nav className="primary-nav" aria-label="Study controls">
            <div className="mode-nav" role="group" aria-label="Content type">
              {availableUnits.length > 1 ? (
                <button
                  className="icon-button sidebar-toggle"
                  type="button"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  aria-expanded={sidebarOpen}
                  title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  onClick={() => {
                    setSidebarOpen((open) => !open);
                    setSidebarDismissed(false);
                  }}
                >
                  <MenuIcon open={sidebarOpen} />
                </button>
              ) : null}
              {isChemistry ? (
                unit === "chem2" ? (
                  <>
                    <button className="nav-button mode-button" type="button" aria-pressed={kind === "template"} onClick={() => selectKind("template")}>Answer templates</button>
                    <button className="nav-button mode-button" type="button" aria-pressed={kind === "lab-review"} onClick={() => selectKind("lab-review")}>Lab Quiz Review</button>
                  </>
                ) : <span className="nav-section-label">Answer templates</span>
              ) : isHistory ? (
                <>
                  <button className="nav-button mode-button" type="button" aria-pressed={kind === "vocabulary"} onClick={() => selectKind("vocabulary")}>Vocabulary</button>
                  <button className="nav-button mode-button" type="button" aria-pressed={kind === "questions"} onClick={() => selectKind("questions")}>Check for understanding</button>
                </>
              ) : isUsaco ? <span className="nav-section-label">Patterns</span> : (
                <>
                  <button className="nav-button mode-button" type="button" aria-pressed={kind === "vocabulary"} onClick={() => selectKind("vocabulary")}>Vocabulary</button>
                  <button className="nav-button mode-button" type="button" aria-pressed={kind === "template"} onClick={() => selectKind("template")}>Answer templates</button>
                  {unit === "u2p1" ? <button className="nav-button mode-button" type="button" aria-pressed={kind === "calculations"} onClick={() => selectKind("calculations")}>Calculations</button> : null}
                </>
              )}
            </div>
            {unit === "u1p2" || unit === "u2p1" ? (
              <div className="day-nav-scroll" aria-label="Study day">
                <div className="day-nav">
                  {dayButtons.map((value) => {
                    const label = value === "all" ? "All days" : "Day " + value;
                    return <button key={value} className="nav-button day-button" type="button" aria-pressed={day === value} onClick={() => {
                      setDay(value);
                      if (unit === "u2p1" && value !== "all") setCategory(kind === "calculations" ? "Calculations" : (u2p1PrimaryCategoryByDay[value] || ""));
                    }}>{label}</button>;
                  })}
                </div>
              </div>
            ) : <div className="nav-spacer" />}
            <label className="search-row" role="search">
              <SearchIcon />
              <span className="sr-only">Search all study content</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                inputMode="search"
                autoComplete="off"
                placeholder="Search all study content"
              />
              {query ? <button className="search-clear" type="button" aria-label="Clear search" title="Clear search" onClick={() => setQuery("")}>×</button> : null}
            </label>
          </nav>
          {!isSearching && pages.length > 1 ? (
            <nav className="category-nav" aria-label="Study categories">
              {pages.map((page) => (
                <button
                  key={page.category}
                  className="nav-button category-button"
                  type="button"
                  aria-pressed={activeCategory === page.category}
                  onClick={() => setCategory(page.category)}
                >
                  {page.category}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      {sidebarOpen && !sidebarDismissed ? (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close sidebar"
          onClick={() => { setSidebarOpen(false); setSidebarDismissed(true); }}
        />
      ) : null}

      <div className={"page-layout" + (sidebarOpen ? " has-sidebar" : "")}>
        {sidebarOpen ? (
          <aside className="sidebar" aria-label="Study units">
            <p className="sidebar-label">Units</p>
            {Object.entries(unitInfo).filter(([id]) => availableUnits.includes(id)).sort((a, b) => a[1].order - b[1].order).map(([id, info]) => (
              <button
                key={id}
                className="unit-link"
                type="button"
                aria-current={unit === id ? "page" : undefined}
                onClick={() => selectUnit(id)}
              >
                {info.title}
              </button>
            ))}
          </aside>
        ) : null}

        <main className="content-main" ref={contentRef}>
          {isSearching ? (
            <section aria-label="Search results">
              <div className="section-heading-row">
                <h2 className="section-heading">Search results</h2>
                <span className="result-count" role="status" aria-live="polite">{searchResults.length}</span>
                {visibleBlurIds.length && !isChemistry ? (
                  <button className="icon-button bulk-blur-button" type="button" aria-label={bulkBlurLabel} title={bulkBlurLabel} onClick={toggleAllAnswers}>
                    <EyeIcon crossed={allVisibleBlurred} />
                  </button>
                ) : null}
              </div>
              {searchResults.length ? (
                <div className="card-list">
                  {searchResults.map((card) => <StudyCard key={card.id} card={card} blurredIds={blurredIds} onToggleBlur={toggleCard} query={query} isChemistry={isChemistry} />)}
                </div>
              ) : <p className="empty-state">No results.</p>}
            </section>
          ) : (
            <section aria-label={activeCategory}>
              {!isChemistry && !isUsaco ? (
                <div className="section-heading-row">
                  <h2 className="section-heading">{activeCategory}</h2>
                  {visibleBlurIds.length ? (
                    <button className="icon-button bulk-blur-button" type="button" aria-label={bulkBlurLabel} title={bulkBlurLabel} onClick={toggleAllAnswers}>
                      <EyeIcon crossed={allVisibleBlurred} />
                    </button>
                  ) : null}
                </div>
              ) : null}
              <div className="card-list">
                {visibleCards.length ? visibleCards.map((card) => <StudyCard key={card.id} card={card} blurredIds={blurredIds} onToggleBlur={toggleCard} isChemistry={isChemistry} />) : unit === "u2p1" && day !== "all" ? <p className="empty-state">No content for this day.</p> : null}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
