# Study Pages: AP Statistics, AP Chemistry, U.S. History, and USACO

This is a React/Vite study guide. The app owns the layout and interactions; study material lives in plain-text `.txt` files under `src/content/`. Vite discovers and groups those files automatically.

## Add or extend content

Create a `.txt` file inside `src/content/`. Use this frontmatter block, then add one `###` heading per card:

    ---
    unit: u1p1
    kind: vocabulary
    category: Study Basics
    ---

    ### A term or question
    - A separate point on each line.
    - ✓ **Key idea:** An explanation or distinction.

Use `unit: u1p1`, `unit: u1p2`, or `unit: u2p1` for Statistics; `unit: chem1` or `unit: chem2` for Chemistry; `unit: ushist3` for U.S. History Unit 3; and `unit: usaco` with `kind: patterns` for USACO. Statistics supports vocabulary, answer templates, and (for Unit 2 Part 1) calculations. Chemistry supports answer templates and (for Unit 2) lab review. U.S. History supports vocabulary and check-for-understanding questions. USACO contains problem-solving patterns. Add a category name. New categories are added to the horizontal navigation automatically. Unit 1 Part 2 cards may include `{days=1,3}` at the end of the heading; Unit 2 Part 1 cards may include `{days=1,3}` for its five-day filter.

Use `==important wording==` to highlight an idea, `**[placeholders]**` for fill-in fields, and `\( ... \)` / `\[ ... \]` for LaTeX math. MathJax renders formulas. Use a Markdown table for compact comparisons.

Statistics, Chemistry, U.S. History, and USACO have separate routes and content. Chemistry opens directly to its answer templates; USACO opens to its patterns; Statistics and U.S. History have separate content modes. The pages use warm light colors and keep each category as its own horizontal-navigation page. The centered content width preserves the side margins; on wide screens, the collapsible unit sidebar uses the left margin without shifting the cards. Individual and section-wide eye icons blur answers without removing them.

## Run locally

    npm install
    npm run dev

Create a production build with `npm run build`. The personal site publishes Statistics at `/ap-statistics/`, Chemistry at `/ap-chemistry/`, U.S. History at `/us-history/`, and USACO at `/usaco/`. To add material, add a `.txt` file here, sync the source into `study-material-source/`, and push; the Pages workflow rebuilds the guides without React-component edits for text-only additions.
