import React, { useState } from "react";
import speedSvg from "./diagrams/chem2-maxwell-boltzmann.svg?raw";

export default function MaxwellBoltzmannDiagram() {
  const [comparison, setComparison] = useState("temperature");

  return (
    <div className="answer-content mb-diagram" data-comparison={comparison}>
      <div className="z-curve-controls" role="group" aria-label="Choose a speed-distribution comparison">
        <button className="nav-button" type="button" aria-pressed={comparison === "temperature"} onClick={() => setComparison("temperature")}>
          Same gas · different temperatures
        </button>
        <button className="nav-button" type="button" aria-pressed={comparison === "mass"} onClick={() => setComparison("mass")}>
          Same temperature · different molar masses
        </button>
      </div>
      <div className="z-curves-svg" dangerouslySetInnerHTML={{ __html: speedSvg }} />
    </div>
  );
}
