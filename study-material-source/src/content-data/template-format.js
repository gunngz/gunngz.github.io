export function fillFrames(frames, values) {
  return frames.map(frame => frame.replace(/\[([^\]]+)\]/g, (placeholder, key) => values?.[key] === undefined ? `**${placeholder}**` : `==${values[key]}==`));
}

export function templateMarkdown(config, choice, axis = "speed") {
  const values = choice?.axes ? choice.axes[axis] : choice?.values;
  const sentences = !choice && config.guide ? config.guide : fillFrames(config.frames, values);
  const extras = config.extraFrames ? `\n\n${fillFrames(config.extraFrames, values).join("\n\n")}` : "";
  const equations = choice?.equations?.length ? `\n\n**Relations**\n\n${choice.equations.join("\n")}` : "";
  return `**${config.flow}**\n\n| Step | Answer template |\n| --- | --- |\n` + config.rows.map((row, index) => `| ${row} | ${sentences[index]} |`).join("\n") + extras + equations + (config.note ? `\n\nKey idea: ${config.note}` : "");
}

export function templateSearchText(config) {
  return [config.flow, ...config.frames, ...(config.guide || []), ...(config.extraFrames || []), config.note || "", ...config.choices.flatMap(choice => [choice.label, ...(choice.equations || []), ...Object.values(choice.values || {}), ...Object.values(choice.axes || {}).flatMap(Object.values)])].join(" ");
}
