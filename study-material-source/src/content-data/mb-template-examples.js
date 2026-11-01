const frames = [
  "At [condition], the particles have [average kinetic energy].",
  "Therefore, [particle explanation].",
  "As a result, the [distribution type] distribution [position], with [width] and [peak].",
];

function values(condition, energy, explanation, distribution, position, width, peak) {
  return { condition, "average kinetic energy": energy, "particle explanation": explanation, "distribution type": distribution, position, width, peak };
}

export const mbTemplate = {
  frames,
  rows: ["1. Condition and average kinetic energy", "2. Particle explanation", "3. Distribution shape"],
  flow: "Condition → Particle explanation → Distribution shape",
  groupLabel: "Fill the Maxwell–Boltzmann template",
  hasAxis: true,
  note: "Temperature comparisons use the same gas; molar-mass comparisons use the same temperature. Peak comparisons assume equal particle counts or normalized curves. For normalized curves, the total areas remain equal.",
  choices: [
    { id: "hot", label: "Higher temperature", axes: {
      speed: values("a higher temperature", "greater average kinetic energy", "their average speed increases, and more frequent collisions allow particles to exchange more energy, resulting in greater variability in particle speeds", "speed", "shifts toward higher speeds", "a broader spread of speeds", "a lower peak"),
      energy: values("a higher temperature", "greater average translational kinetic energy", "a greater fraction of particles have higher energies and their kinetic energies show greater variability", "translational kinetic-energy", "shifts toward higher energies", "a broader spread of energies", "a lower peak"),
    } },
    { id: "cold", label: "Lower temperature", axes: {
      speed: values("a lower temperature", "lower average kinetic energy", "their average speed decreases and their speeds show less variability", "speed", "shifts toward lower speeds", "a narrower spread of speeds", "a higher peak"),
      energy: values("a lower temperature", "lower average translational kinetic energy", "more particles occupy lower energies and their kinetic energies show less variability", "translational kinetic-energy", "shifts toward lower energies", "a narrower spread of energies", "a higher peak"),
    } },
    { id: "light", label: "Smaller molar mass", axes: {
      speed: values("the same temperature", "the same average kinetic energy as the reference gas", "the lighter particles must move faster on average to have the same average kinetic energy", "speed", "shifts toward higher speeds", "a broader spread of speeds", "a lower peak"),
      energy: values("the same temperature", "the same average translational kinetic energy as the reference gas", "the lighter particles move faster on average while retaining the same normalized kinetic-energy distribution at this temperature", "translational kinetic-energy", "overlaps the reference curve", "the same energy spread", "the same peak height"),
    } },
    { id: "heavy", label: "Larger molar mass", axes: {
      speed: values("the same temperature", "the same average kinetic energy as the reference gas", "the heavier particles must move more slowly on average to have the same average kinetic energy", "speed", "shifts toward lower speeds", "a narrower spread of speeds", "a higher peak"),
      energy: values("the same temperature", "the same average translational kinetic energy as the reference gas", "the heavier particles move more slowly on average while retaining the same normalized kinetic-energy distribution at this temperature", "translational kinetic-energy", "overlaps the reference curve", "the same energy spread", "the same peak height"),
    } },
  ],
};
