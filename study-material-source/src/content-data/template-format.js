export function fillFrames(frames, values) {
  return frames.map(frame => frame.replace(/\[([^\]]+)\]/g, (placeholder, key) => values?.[key] === undefined ? `**${placeholder}**` : `==${values[key]}==`));
}

export function templateMarkdown(config, choice, axis = "speed") {
  const values = choice?.axes ? choice.axes[axis] : choice?.values;
  const sentences = fillFrames(config.frames, values);
  return `**${config.flow}**\n\n| Step | Answer template |\n| --- | --- |\n` + config.rows.map((row, index) => `| ${row} | ${sentences[index]} |`).join("\n") + (config.note ? `\n\nKey idea: ${config.note}` : "");
}

export function templateSearchText(config) {
  return [config.flow, ...config.frames, config.note || "", ...config.choices.flatMap(choice => [choice.label, ...Object.values(choice.values || {}), ...Object.values(choice.axes || {}).flatMap(Object.values)])].join(" ");
}
