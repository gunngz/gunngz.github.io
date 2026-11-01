export const choices = [
  { id: "low", label: "Low pressure", sentences: [
    "At ==low pressure==, gas particles are ==far apart==.",
    "Therefore, ==intermolecular attractions have little effect==, and the particles' own volume is ==negligible compared with the container volume==.",
    "At the ==same temperature, volume, and number of moles==, the pressure is ==approximately equal to== the ideal prediction, so \\(Z\\) is ==approximately equal to 1==.",
  ] },
  { id: "attractions", label: "Attractions dominate", sentences: [
    "At ==intermediate pressures in the attraction-dominated region==, gas particles are ==close enough for attractions to be significant==.",
    "Therefore, ==intermolecular attractions reduce the pressure exerted on the walls==.",
    "At the ==same temperature, volume, and number of moles==, the pressure is ==lower than== the ideal prediction, so \\(Z<1\\).",
  ] },
  { id: "high", label: "Very high pressure", sentences: [
    "At ==very high pressure==, gas particles are ==very close together==.",
    "Therefore, ==finite particle volume and short-range repulsions are significant==.",
    "At the ==same temperature, volume, and number of moles==, the pressure is ==higher than== the ideal prediction when these effects dominate, so \\(Z>1\\).",
  ] },
  { id: "example", label: "Low-pressure example", sentences: [
    "At low pressure, gas particles are ==far apart==.",
    "Intermolecular attractions have little effect, and the particles' own volume is ==negligible compared with the container volume==.",
    "At the ==same temperature, volume, and number of moles==, the pressure is approximately equal to the ideal prediction, so \\(Z\\) approaches 1.",
  ], note: "The total volume occupied by the particles themselves is small compared with the entire container. The ==particles themselves have not become smaller==." },
  { id: "temperature", label: "Higher temperature", sentences: [
    "At ==higher temperatures==, gas particles have ==greater average kinetic energy==.",
    "Therefore, intermolecular attractions are ==less significant relative to their motion==.",
    "Compared with the ideal prediction at the same temperature, volume, and number of moles, the ==relative pressure deficit caused by attractions is smaller==, so the ==attraction-caused deviation of \\(Z\\) from 1 decreases==.",
  ] },
];
export const placeholders = [
  "At **[condition]**, gas particles **[describe their separation or motion]**.",
  "Therefore, **[explain whether intermolecular attractions or particle volume are significant]**.",
  "At the ==same temperature, volume, and number of moles==, the pressure is **[lower than / higher than / approximately equal to]** the ideal prediction, so \\(Z\\) is **[less than / greater than / approximately equal to]** 1.",
];
