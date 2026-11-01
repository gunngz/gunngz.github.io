const frames = [
  "At [condition], gas particles [particle state].",
  "Therefore, [important factor].",
  "At the ==same temperature, volume, and number of moles==, the pressure is [pressure comparison] the ideal prediction, so \\(Z\\) is [Z comparison] 1.",
];
const shared = {
  frames,
  rows: ["1. Particle situation", "2. Important factor", "3. Pressure and Z"],
  flow: "Particle situation → Important factor → Pressure and Z",
};
const lowPressure = {
  "condition": "low pressure",
  "particle state": "are far apart",
  "important factor": "intermolecular attractions have little effect, and the particles' own volume is negligible compared with the container volume",
  "pressure comparison": "approximately equal to",
  "Z comparison": "approximately equal to",
};

export const zGeneral = {
  ...shared,
  groupLabel: "Fill the Z three-sentence template",
  note: "Particle volume is the space occupied by the particles themselves. A negligible volume relative to the container does not mean the particles have become smaller. Higher-temperature comparisons concern the attraction-caused deviation within the attraction-dominated regime.",
  choices: [
    { id: "low", label: "Low pressure", values: lowPressure },
    { id: "attractions", label: "Attractions dominate", values: {
      "condition": "intermediate pressures in the attraction-dominated region",
      "particle state": "are close enough for attractions to be significant",
      "important factor": "intermolecular attractions reduce the pressure exerted on the walls",
      "pressure comparison": "lower than",
      "Z comparison": "less than",
    } },
    { id: "high", label: "Very high pressure", values: {
      "condition": "very high pressures where volume and repulsive effects dominate",
      "particle state": "are very close together",
      "important factor": "finite particle volume and short-range repulsions are significant",
      "pressure comparison": "higher than",
      "Z comparison": "greater than",
    } },
    { id: "example", label: "Low-pressure example", values: lowPressure },
    { id: "temperature", label: "Higher temperature", values: {
      "condition": "higher temperatures within the attraction-dominated regime",
      "particle state": "have greater average kinetic energy",
      "important factor": "intermolecular attractions are less significant relative to the particles' motion",
      "pressure comparison": "relatively closer to",
      "Z comparison": "closer to",
    } },
  ],
};

export const zApplications = {
  ...shared,
  groupLabel: "Choose a gas-curve explanation",
  defaultSelection: "hydrogen",
  note: "The plotted curves refer to the same temperature. A rising, approximately straight real-gas curve is different from the horizontal ideal-gas reference \\(Z=1\\); its shape can change at other temperatures or pressures.",
  choices: [
    { id: "hydrogen", label: "H₂ rising line", values: {
      "condition": "the plotted temperature and pressure range",
      "particle state": "in \\(\\mathrm{H_2}\\) have the same average kinetic energy as the other gases but interact through very weak attractions",
      "important factor": "attractions produce little downward deviation compared with particle-volume and repulsive effects, leaving an approximately linear rise over this range",
      "pressure comparison": "higher than",
      "Z comparison": "greater than",
    } },
    { id: "dip", label: "CO₂ vs CH₄ dip", values: {
      "condition": "intermediate pressures in the plotted comparison",
      "particle state": "in \\(\\mathrm{CO_2}\\) are close enough for attractions to have a stronger effect than in \\(\\mathrm{CH_4}\\)",
      "important factor": "the stronger attractive effect in \\(\\mathrm{CO_2}\\) produces a larger wall-pressure deficit and a deeper dip than in \\(\\mathrm{CH_4}\\)",
      "pressure comparison": "farther below",
      "Z comparison": "farther below",
    } },
    { id: "rise", label: "High-pressure rises", values: {
      "condition": "very high pressures where volume and repulsive effects dominate",
      "particle state": "are crowded close together",
      "important factor": "effective particle volume, repulsive interactions, and attractions differ between gases, producing different upward rises",
      "pressure comparison": "higher than",
      "Z comparison": "greater than",
    } },
  ],
};
