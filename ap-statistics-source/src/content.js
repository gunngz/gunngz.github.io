import DOMPurify from "dompurify";
import { marked } from "marked";

const rawContent = import.meta.glob("./content/**/*.txt", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const unitInfo = {
  u1p1: { title: "Unit 1 Part 1", heading: "AP Statistics — Unit 1", order: 1 },
  u1p2: { title: "Unit 1 Part 2", heading: "AP Statistics — Unit 1", order: 2 },
  chem1: { title: "AP Chemistry · Unit 1", heading: "AP Chemistry — Unit 1", order: 3 },
};

const categoryOrder = {
  u1p1: {
    vocabulary: ["Study Basics", "Categorical Data", "Quantitative Displays", "Numerical Summaries", "Normal Models"],
    template: ["Study Basics", "Categorical Data", "Quantitative Displays", "Describing Distributions", "Numerical Summaries", "Z-Scores and Transformations", "Normal Models"],
  },
  u1p2: {
    vocabulary: ["Study Basics", "Sampling Methods", "Experimental Design", "Inference and Ethics"],
    template: ["Study Questions and Variables", "Sampling and Surveys", "Experimental Design", "Inference and Ethics"],
  },
  chem1: {
    vocabulary: ["Atoms and Composition", "Electron Configurations and PES", "Periodic Trends", "Bonding and Molecular Structure", "Polarity and Intermolecular Forces", "Chemical Reactions"],
    template: ["Chemistry Explanations", "Atoms and Quantitative Data", "Electron Configurations and PES", "Periodic Trends", "Lewis Structures and Geometry", "Polarity and Intermolecular Forces", "Chemical Reaction FRQs"],
  },
};

function readFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { metadata: {}, body: source };
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return { metadata, body: match[2] };
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseTextFile(path, source) {
  const { metadata, body } = readFrontmatter(source);
  const fileSlug = path.split("/").pop().replace(/\.txt$/, "");
  const chunks = body.split(/^###\s+/m).slice(1);
  return chunks.map((chunk, index) => {
    const newline = chunk.indexOf("\n");
    const heading = (newline < 0 ? chunk : chunk.slice(0, newline)).trim();
    const dayMatch = heading.match(/\s+\{days=([0-9,]+)\}$/);
    const title = dayMatch ? heading.slice(0, dayMatch.index).trim() : heading;
    const days = dayMatch ? dayMatch[1].split(",").map((day) => day.trim()) : [];
    const answer = newline < 0 ? "" : chunk.slice(newline + 1).trim();
    const unit = metadata.unit || "u1p1";
    const kind = metadata.kind || "vocabulary";
    const category = metadata.category || "Study Basics";
    return {
      id: [unit, kind, slug(category), fileSlug, index, slug(title)].join(":"),
      unit,
      kind,
      category,
      title,
      days,
      answer,
      searchText: (title + " " + answer).replace(/==/g, "").replace(/[*_#|]/g, "").toLowerCase(),
    };
  });
}

export const cards = Object.entries(rawContent)
  .flatMap(([path, source]) => parseTextFile(path, source))
  .filter((card) => card.title && card.answer);

const categoryPages = new Map();
for (const card of cards) {
  const key = [card.unit, card.kind, card.category].join("::");
  if (!categoryPages.has(key)) categoryPages.set(key, { unit: card.unit, kind: card.kind, category: card.category, cards: [] });
  categoryPages.get(key).cards.push(card);
}

export function getPages(unit, kind) {
  const order = categoryOrder[unit]?.[kind] || [];
  return [...categoryPages.values()]
    .filter((page) => page.unit === unit && page.kind === kind)
    .sort((a, b) => {
      const ai = order.indexOf(a.category);
      const bi = order.indexOf(b.category);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || a.category.localeCompare(b.category);
    });
}

function escapeRegExp(value) {
  const special = ".*+?^" + "$" + "{}()|[]\\";
  return value.split("").map((character) => special.includes(character) ? "\\" + character : character).join("");
}

export function renderMarkdown(source, inline = false, query = "") {
  const formulas = [];
  const withContentIcons = renderContentMarkers(source);
  const protectedMath = withContentIcons.replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g, (formula) => {
    const token = `MATHJAXTOKEN${formulas.length}END`;
    formulas.push({ token, formula });
    return token;
  });
  const withHighlights = protectedMath.replace(/==([\s\S]+?)==/g, '<mark class="key">$1</mark>');
  const html = inline ? marked.parseInline(withHighlights) : marked.parse(withHighlights, { gfm: true, breaks: true });
  const safe = DOMPurify.sanitize(html, { ADD_TAGS: ["mark", "span"], ADD_ATTR: ["class"] });
  const withMath = restoreMath(safe, formulas);
  return query.trim() ? addSearchHighlights(withMath, query) : withMath;
}

function renderContentMarkers(source) {
  const iconByMarker = {
    "×": "avoid",
    "✓": "check",
    "!": "note",
  };
  return source.replace(/^(\s*[-*]\s*)([×✓!])/gm, (match, bullet, marker) => {
    const icon = iconByMarker[marker];
    return `${bullet}<span class="content-icon content-icon--${icon}" aria-hidden="true">${marker}</span> `;
  });
}

function restoreMath(safeHtml, formulas) {
  if (!formulas.length || typeof document === "undefined") return safeHtml;
  const host = document.createElement("div");
  host.innerHTML = safeHtml;
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (formulas.some(({ token }) => walker.currentNode.nodeValue.includes(token))) nodes.push(walker.currentNode);
  }
  for (const node of nodes) {
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    const tokenPattern = new RegExp(formulas.map(({ token }) => token).join("|"), "g");
    for (const match of text.matchAll(tokenPattern)) {
      if (match.index > cursor) fragment.append(document.createTextNode(text.slice(cursor, match.index)));
      const entry = formulas.find(({ token }) => token === match[0]);
      const span = document.createElement("span");
      span.className = "math";
      span.textContent = entry.formula;
      fragment.append(span);
      cursor = match.index + match[0].length;
    }
    if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
  }
  return host.innerHTML;
}

function addSearchHighlights(safeHtml, query) {
  if (typeof document === "undefined") return safeHtml;
  const terms = [...new Set(query.toLowerCase().trim().split(/\s+/).filter(Boolean))];
  if (!terms.length) return safeHtml;
  const matcher = new RegExp("(" + terms.map(escapeRegExp).join("|") + ")", "gi");
  const host = document.createElement("div");
  host.innerHTML = safeHtml;
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest("code, .math, .search-hit")) continue;
    if (matcher.test(node.nodeValue)) textNodes.push(node);
    matcher.lastIndex = 0;
  }
  for (const node of textNodes) {
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    for (const match of text.matchAll(matcher)) {
      const start = match.index;
      const end = start + match[0].length;
      if (start > cursor) fragment.append(document.createTextNode(text.slice(cursor, start)));
      const hit = document.createElement("mark");
      hit.className = "search-hit";
      hit.textContent = text.slice(start, end);
      fragment.append(hit);
      cursor = end;
    }
    if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
  }
  return host.innerHTML;
}

export function matchesSearch(card, query) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return words.every((word) => card.searchText.includes(word));
}
