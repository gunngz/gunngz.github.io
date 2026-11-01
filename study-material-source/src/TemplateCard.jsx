import React, { useState } from "react";
import MathContent from "./MathContent.jsx";
import { templateMarkdown } from "./content-data/template-format.js";

export default function TemplateCard({ title, config, blurControl, blurred, query, axis, onAxisChange }) {
  const [selected, setSelected] = useState(config.defaultSelection || null);
  const choice = config.choices.find(item => item.id === selected);
  return (
    <article className={"study-card study-card--chemistry study-card--template-picker" + (blurred ? " is-blurred" : "")}>
      <div className="question-side template-heading-row">
        <h3>{title}</h3>
        <div className="template-example-buttons" role="group" aria-label={config.groupLabel}>
          {config.choices.map(item => <button key={item.id} type="button" className="nav-button" aria-pressed={selected === item.id} onClick={() => setSelected(selected === item.id ? null : item.id)}>{item.label}</button>)}
        </div>
      </div>
      <div className="answer-side">
        {blurControl}
        {config.hasAxis ? <div className="z-curve-controls" role="group" aria-label="Choose the template horizontal axis">
          <button className="nav-button" type="button" aria-pressed={axis === "speed"} onClick={() => onAxisChange("speed")}>Speed</button>
          <button className="nav-button" type="button" aria-pressed={axis === "energy"} onClick={() => onAxisChange("energy")}>Kinetic energy (Eₖ)</button>
        </div> : null}
        <MathContent value={templateMarkdown(config, choice, axis)} query={query} />
      </div>
    </article>
  );
}
