# AP Statistics and AP Chemistry Study Guides

This is a React/Vite study guide. The app owns the layout and interactions; study material is in plain-text `.txt` files under `src/content/`. Vite discovers and groups those files automatically.

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

Use `unit: u1p1` or `unit: u1p2` for AP Statistics, or `unit: chem1` for AP Chemistry; `kind: vocabulary` or `kind: template`; and the existing category spelling when adding to a current page. New category names are added to the horizontal navigation automatically. Unit 1 Part 2 cards may include `{days=1,3}` at the end of the heading; the other units have no day filter.

Write answer templates as complete, directly usable answer stems. Keep explanatory notes under a separate **Key idea** point. For chemistry explanations, identify the question type and state which chemical terms or reasoning steps are required; do not force every concept into every answer. Use `==important wording==` to highlight an idea, `**[placeholders]**` for fill-in fields, and `\( ... \)` / `\[ ... \]` for LaTeX math. MathJax renders formulas. Use a Markdown table for compact comparisons.

The page is English-only, uses warm light colors, and keeps each category as its own horizontal-navigation page. The centered content width keeps the original side margins; on wide screens, the collapsible unit sidebar uses the left margin without shifting the cards. Search covers all units and categories; matching answer text uses a blue highlight distinct from the study highlights. Individual and section-wide eye icons blur answers without removing them.

## Run locally

    npm install
    npm run dev

Create a standalone production build with `npm run build`. The personal site keeps its current homepage and publishes this guide at `/ap-statistics/`. The root Pages workflow builds the mirrored `ap-statistics-source/` folder and combines the result with the existing root files. To add material, add a `.txt` file here, sync the source into that folder, and push; the workflow rebuilds the page without edits to the React components.
