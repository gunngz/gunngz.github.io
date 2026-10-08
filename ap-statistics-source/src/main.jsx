import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { cards, getPages, matchesSearch, renderMarkdown, unitInfo } from "./content.js";
import "./style.css";

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

function StudyCard({ card, blurred, onToggleBlur, query = "" }) {
  return (
    <article className={"study-card" + (blurred ? " is-blurred" : "")}>
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
  const [unit, setUnit] = useState("u1p1");
  const [kind, setKind] = useState("vocabulary");
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [blurredIds, setBlurredIds] = useState(() => new Set());
  const [sidebarDismissed, setSidebarDismissed] = useState(false);
  const contentRef = useRef(null);

  const pages = useMemo(() => getPages(unit, kind), [unit, kind]);
  const activeCategory = pages.some((page) => page.category === category)
    ? category
    : pages[0]?.category || "";
  const activePage = pages.find((page) => page.category === activeCategory);
  const visibleCards = (activePage?.cards || []).filter((card) => day === "all" || card.days.includes(day));
  const searchResults = query.trim() ? cards.filter((card) => matchesSearch(card, query)) : [];
  const visibleIds = query.trim() ? searchResults.map((card) => card.id) : visibleCards.map((card) => card.id);
  const allVisibleBlurred = visibleIds.length > 0 && visibleIds.every((id) => blurredIds.has(id));

  useEffect(() => {
    if (category !== activeCategory) setCategory(activeCategory);
  }, [category, activeCategory]);

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
    updateBlur(visibleIds, !allVisibleBlurred);
  }

  function selectUnit(nextUnit) {
    setUnit(nextUnit);
    setDay("all");
    setCategory("");
    setQuery("");
    setSidebarDismissed(false);
    if (window.matchMedia("(max-width: 760px)").matches) setSidebarOpen(false);
  }

  function selectKind(nextKind) {
    setKind(nextKind);
    setDay("all");
    setCategory("");
  }

  const isSearching = Boolean(query.trim());
  const dayButtons = ["all", "1", "2", "3", "4", "5", "6"];

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="title-row">
            <h1>AP Statistics — Unit 1</h1>
          </div>
        </div>
      </header>

      <div className="sticky-navigation">
        <div className="sticky-navigation-inner">
          <nav className="primary-nav" aria-label="Study controls">
            <div className="mode-nav" role="group" aria-label="Content type">
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
              <button className="nav-button mode-button" type="button" aria-pressed={kind === "vocabulary"} onClick={() => selectKind("vocabulary")}>Vocabulary</button>
              <button className="nav-button mode-button" type="button" aria-pressed={kind === "template"} onClick={() => selectKind("template")}>Answer templates</button>
            </div>
            {unit === "u1p2" ? (
              <div className="day-nav-scroll" aria-label="Study day">
                <div className="day-nav">
                  {dayButtons.map((value) => {
                    const label = value === "all" ? "All days" : "Day " + value;
                    return <button key={value} className="nav-button day-button" type="button" aria-pressed={day === value} onClick={() => setDay(value)}>{label}</button>;
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
          {!isSearching ? (
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
            {Object.entries(unitInfo).sort((a, b) => a[1].order - b[1].order).map(([id, info]) => (
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
                {searchResults.length ? (
                  <button className="icon-button bulk-blur-button" type="button" aria-label={allVisibleBlurred ? "Reveal all answers" : "Blur all answers"} title={allVisibleBlurred ? "Reveal all answers" : "Blur all answers"} onClick={toggleAllAnswers}>
                    <EyeIcon crossed={allVisibleBlurred} />
                  </button>
                ) : null}
              </div>
              {searchResults.length ? (
                <div className="card-list">
                  {searchResults.map((card) => <StudyCard key={card.id} card={card} blurred={blurredIds.has(card.id)} onToggleBlur={toggleCard} query={query} />)}
                </div>
              ) : <p className="empty-state">No results.</p>}
            </section>
          ) : (
            <section aria-label={activeCategory}>
              <div className="section-heading-row">
                <h2 className="section-heading">{activeCategory}</h2>
                {visibleCards.length ? (
                  <button className="icon-button bulk-blur-button" type="button" aria-label={allVisibleBlurred ? "Reveal all answers" : "Blur all answers"} title={allVisibleBlurred ? "Reveal all answers" : "Blur all answers"} onClick={toggleAllAnswers}>
                    <EyeIcon crossed={allVisibleBlurred} />
                  </button>
                ) : null}
              </div>
              <div className="card-list">
                {visibleCards.map((card) => <StudyCard key={card.id} card={card} blurred={blurredIds.has(card.id)} onToggleBlur={toggleCard} />)}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
