# AP Statistics Study Pages

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

Use `unit: u1p1` or `unit: u1p2`, `kind: vocabulary` or `kind: template`, and the existing category spelling when adding to a current page. New category names are added to the horizontal navigation automatically. Unit 1 Part 2 cards may include `{days=1,3}` at the end of the heading; Unit 1 Part 1 cards do not use a day filter.

Use `==important wording==` to highlight an idea, `**[placeholders]**` for fill-in fields, and `\( ... \)` / `\[ ... \]` for LaTeX math. MathJax renders formulas. Use a Markdown table for compact comparisons.

The pages use warm light colors and keep each category as its own horizontal-navigation page. The centered content width preserves the side margins; on wide screens, the collapsible unit sidebar uses the left margin without shifting the cards. Search covers the Statistics units. Individual and section-wide eye icons blur answers without removing them.

## Run locally

    npm install
    npm run dev

Create a production build with `npm run build`. The personal site publishes Statistics at `/ap-statistics/`. To add material, add a `.txt` file here, sync the source into `ap-statistics-source/`, and push; the Pages workflow rebuilds the guide without React-component edits for text-only additions.
