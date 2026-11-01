import React, { useState } from "react";
import curveSvg from "./diagrams/chem2-z-curves.svg?raw";
import MathContent from "./MathContent.jsx";

const regions = [
  ["all", "All regions"],
  ["low-pressure", "Low pressure"],
  ["attractions", "Attractions dominate"],
  ["high-pressure", "Very high pressure"],
];

export default function ZCurveDiagram() {
  const [focus, setFocus] = useState("all");

  return (
    <div className="answer-content z-curve-diagram" data-focus={focus}>
      <div className="z-curve-controls" role="group" aria-label="Highlight a curve region">
        {regions.map(([id, label]) => (
          <button key={id} className="nav-button" type="button" aria-pressed={focus === id} onClick={() => setFocus(id)}>
            {label}
          </button>
        ))}
      </div>
      <MathContent value={"\\[Z=\\frac{PV}{nRT}\\]"} className="z-curve-formula" />
      <div className="z-curves-svg" dangerouslySetInnerHTML={{ __html: curveSvg }} />
    </div>
  );
}
