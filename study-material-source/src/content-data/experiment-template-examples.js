export const gasExperimentTemplate = {
  flow: "Initial change → Gas behavior → Scientific principle → Final result",
  rows: ["1. Initial change", "2. Gas behavior", "3. Scientific principle", "4. Final result"],
  frames: [
    "First, [operation].",
    "[gas changes].",
    "According to [scientific principle], [scientific reasoning].",
    "As a result, [final phenomenon].",
  ],
  guide: [
    "What did you change first? State the operation.",
    "Explain how ==pressure==, ==volume==, ==temperature==, or the ==amount of gas== changes.",
    "Explain ==why== this happens using the appropriate gas law or pressure principle.",
    "Connect these changes to the ==observed phenomenon==.",
  ],
  extraFrames: [
    "**English template**\n\n> When [operation], [variable] [increases/decreases]. According to [scientific principle], this causes [gas behavior]. As a result, [final phenomenon].",
    "**Essential WHY**\n\nExplain how [essential link].",
  ],
  note: "Explain ==why each change leads to the next==, from the initial operation to the final observation.",
  groupLabel: "Fill the gas experiment explanation",
  choices: [
    { id: "pipet", label: "Pipet sinks", values: {
      operation: "you squeeze the bottle",
      variable: "the pressure on the trapped air",
      "increases/decreases": "increases",
      "gas changes": "Pressure on the trapped air increases, so its volume decreases",
      "scientific principle": "Boyle's law",
      "scientific reasoning": "pressure and volume are inversely related at approximately constant temperature and amount of gas",
      "gas behavior": "the volume of the trapped air to decrease",
      "final phenomenon": "water enters the pipet, increasing its mass while its external volume stays approximately the same; its average density increases, and it sinks when it becomes denser than water",
      "essential link": "increased pressure leads to greater average density and sinking",
    }, equations: ["\\(P\\uparrow\\)", "\\(V_{\\mathrm{air}}\\downarrow\\)", "\\(P_1V_1=P_2V_2\\)"] },
    { id: "flask", label: "Water rises into the flask", values: {
      operation: "you heat, then cool the flask",
      variable: "the gas temperature",
      "increases/decreases": "decreases",
      "gas changes": "Temperature decreases and water vapor condenses; the amount of gas decreases, lowering the internal pressure",
      "scientific principle": "the ideal gas relation and the pressure-difference principle",
      "scientific reasoning": "lower temperature and less gas lower the internal pressure while the gas volume is approximately fixed before water enters; atmospheric pressure then exceeds internal pressure",
      "gas behavior": "the internal pressure to fall as water vapor condenses and the amount of gas decreases",
      "final phenomenon": "the greater atmospheric pressure on the water outside pushes water upward into the flask",
      "essential link": "lower internal pressure creates a pressure difference that lets atmospheric pressure push water upward",
    }, equations: ["\\(T\\downarrow\\)", "\\(n_{\\mathrm{gas}}\\downarrow\\)", "\\(P_{\\mathrm{inside}}\\downarrow\\)", "\\(P=\\frac{nRT}{V}\\)", "\\(P_{\\mathrm{atm}}>P_{\\mathrm{inside}}\\)"] },
  ],
};

export const acidConfirmationTemplate = {
  flow: "Method → Evidence → Limitation",
  rows: ["1. Method", "2. Evidence", "3. Limitation"],
  frames: [
    "We could [procedure].",
    "This would [evidence].",
    "However, [limitation].",
  ],
  groupLabel: "Choose an acid identity confirmation method",
  choices: [
    { id: "melting", label: "Melting behavior", values: {
      procedure: "measure the melting or decomposition behavior of the unknown solid",
      evidence: "let us compare the observed result with reliable reference data for oxalic acid dihydrate; a match would provide additional evidence for the identification",
      limitation: "this method requires a suitable reference and equipment",
    } },
    { id: "titration", label: "Titration curve", values: {
      procedure: "use a calibrated pH meter to record pH versus the volume of \\(\\mathrm{NaOH}\\) added",
      evidence: "allow us to estimate the acid's \\(pK_a\\) values",
      limitation: "the estimated values require comparison with reference data to support the identification",
    } },
    { id: "conductivity", label: "Conductivity", values: {
      procedure: "measure the conductivity of the dissolved acid",
      evidence: "provide information about its ionization behavior",
      limitation: "conductivity alone cannot uniquely identify the acid because many acids produce ions in water",
    } },
    { id: "reactions", label: "Chemical reactions", values: {
      procedure: "compare the unknown's reaction behavior with the expected behavior for the proposed identity",
      evidence: "provide supporting evidence for the proposed identity if the reaction behavior matches",
      limitation: "a matching reaction is not necessarily unique proof of the acid's identity",
    } },
  ],
};
