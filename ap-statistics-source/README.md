# AP Statistics and AP Chemistry Study Pages

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

Use `unit: u1p1` or `unit: u1p2` for Statistics, or `unit: chem1` for Chemistry. Set `kind: vocabulary` or `kind: template`, and add a category name. New categories are added to the horizontal navigation automatically. Unit 1 Part 2 Statistics cards may include `{days=1,3}` at the end of the heading; other pages do not use a day filter.

Use `==important wording==` to highlight an idea, `**[placeholders]**` for fill-in fields, and `\( ... \)` / `\[ ... \]` for LaTeX math. MathJax renders formulas. Use a Markdown table for compact comparisons.

Statistics and Chemistry have separate routes and content. Chemistry opens directly to its answer templates; Statistics retains its vocabulary and answer-template modes. The pages use warm light colors and keep each category as its own horizontal-navigation page. The centered content width preserves the side margins; on wide screens, the collapsible unit sidebar uses the left margin without shifting the cards. Individual and section-wide eye icons blur answers without removing them.

## Run locally

    npm install
    npm run dev

Create a production build with `npm run build`. The personal site publishes Statistics at `/ap-statistics/` and Chemistry at `/ap-chemistry/`. To add material, add a `.txt` file here, sync the source into `ap-statistics-source/`, and push; the Pages workflow rebuilds both guides without React-component edits for text-only additions.
