import React, { useState } from "react";
import MathContent from "./MathContent.jsx";
import { choices, placeholders } from "./content-data/z-template-examples.js";

export default function ZTemplateCard({ title, blurControl, blurred, query }) {
  const [selected, setSelected] = useState(null);
  const choice = choices.find(item => item.id === selected);
  const sentences = choice?.sentences || placeholders;
  const rows = ["1. Particle situation", "2. Important factor", "3. Pressure and Z"];
  const value = "**Particle situation → Important factor → Pressure and Z**\n\n| Step | Answer template |\n| --- | --- |\n" + rows.map((row, i) => `| ${row} | ${sentences[i]} |`).join("\n") + (choice?.note ? `\n\nKey idea: ${choice.note}` : "");
  return (
    <article className={"study-card study-card--chemistry study-card--template-picker" + (blurred ? " is-blurred" : "")}>
      <div className="question-side template-heading-row">
        <h3>{title}</h3>
        <div className="template-example-buttons" role="group" aria-label="Fill the three-sentence template">
          {choices.map(item => <button key={item.id} type="button" className="nav-button" aria-pressed={selected === item.id} onClick={() => setSelected(selected === item.id ? null : item.id)}>{item.label}</button>)}
        </div>
      </div>
      <div className="answer-side">
        {blurControl}
        <MathContent value={value} query={query} />
      </div>
    </article>
  );
}
