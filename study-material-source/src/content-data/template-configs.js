import { zGeneral, zApplications } from "./z-template-examples.js";
import { mbTemplate } from "./mb-template-examples.js";
import { gasExperimentTemplate, acidConfirmationTemplate } from "./experiment-template-examples.js";

export const templateConfigs = {
  "{{z-sentence-template}}": zGeneral,
  "{{z-gas-applications}}": zApplications,
  "{{mb-sentence-template}}": mbTemplate,
  "{{gas-experiment-template}}": gasExperimentTemplate,
  "{{acid-confirmation-template}}": acidConfirmationTemplate,
};
