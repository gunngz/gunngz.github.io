"""Generate normalized Maxwell-Boltzmann speed curves and contextual labels.

Reference: https://openstax.org/books/chemistry-2e/pages/9-5-the-kinetic-molecular-theory
The same pair of curves represents a twofold increase in T at fixed mass,
or a twofold decrease in mass at fixed T. Speeds use a schematic scale.
Run in a Python environment containing Matplotlib and NumPy.
"""

from pathlib import Path
import xml.etree.ElementTree as ET

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.offsetbox import AnnotationBbox, TextArea, VPacker
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "src/diagrams/chem2-maxwell-boltzmann.svg"
INK, QUIET, PAPER, LINE = "#302f2a", "#777368", "#fffaf1", "#e7dcc8"
BLUE, GREEN = "#628b9c", "#587565"

plt.rcParams.update({
    "svg.fonttype": "none", "svg.hashsalt": "study-maxwell-boltzmann",
    "font.family": "DejaVu Sans", "font.size": 14,
    "text.color": INK, "axes.labelcolor": INK,
    "xtick.color": QUIET, "ytick.color": QUIET,
})

fig = plt.figure(figsize=(12.5, 7.5), facecolor=PAPER)
ax = fig.add_axes([0.10, 0.18, 0.84, 0.67], facecolor=PAPER)
speed = np.linspace(0, 8, 260)


def density(value, scale):
    return np.sqrt(2 / np.pi) * value**2 / scale**3 * np.exp(-value**2 / (2 * scale**2))


for scale, color in [(1, BLUE), (np.sqrt(2), GREEN)]:
    values = density(speed, scale)
    ax.fill_between(speed, values, color=color, alpha=0.11)
    ax.plot(speed, values, color=color, linewidth=3.2)

ax.set(xlim=(0, 7.1), ylim=(0, 0.95))
ax.set_xticks([0, 7], ["Lower speeds", "Higher speeds"])
ax.set_yticks([])
ax.set_xlabel("Speed (schematic scale)", fontsize=15, labelpad=12)
ax.set_ylabel("Normalized particle density", fontsize=15, labelpad=13)
ax.tick_params(length=0, pad=8, labelsize=13)
for side in ["top", "right"]:
    ax.spines[side].set_visible(False)
for side in ["bottom", "left"]:
    ax.spines[side].set(color=LINE, linewidth=1.6)

for context, title in [
    ("temperature", "Same gas: higher temperature → greater average kinetic energy"),
    ("mass", "Same temperature: both gases have equal average kinetic energy"),
]:
    heading = fig.text(0.10, 0.93, title, fontsize=16, weight="bold")
    heading.set_gid(f"mb-{context}-title")


def callout(context, name, scale, location, title, color):
    peak_speed = np.sqrt(2) * scale
    peak_density = density(peak_speed, scale)
    body = ("Lower average speed\nNarrower distribution\nHigher peak" if scale == 1
            else "Higher average speed\nBroader distribution\nLower peak")
    content = VPacker(children=[
        TextArea(title, textprops={"fontsize": 15, "weight": "bold", "color": color}),
        TextArea(body, textprops={"fontsize": 14, "linespacing": 1.4}),
    ], align="left", pad=0, sep=7)
    label = AnnotationBbox(
        content, (peak_speed, peak_density), xybox=location,
        xycoords="data", boxcoords="axes fraction", frameon=True,
        bboxprops={"boxstyle": "round,pad=0.8,rounding_size=0.7", "fc": PAPER, "ec": LINE, "lw": 1.4},
        arrowprops={"arrowstyle": "-|>", "color": color, "lw": 1.3, "shrinkB": 6},
        annotation_clip=False, zorder=5,
    )
    label.set_gid(f"mb-{context}-{name}")
    ax.add_artist(label)


for context, narrow_title, broad_title in [
    ("temperature", "Lower temperature", "Higher temperature"),
    ("mass", "Larger molar mass", "Smaller molar mass"),
]:
    callout(context, "narrow", 1, (0.19, 0.89), narrow_title, BLUE)
    callout(context, "broad", np.sqrt(2), (0.70, 0.67), broad_title, GREEN)

ax.text(4.3, 0.14, "Equal total areas = 1\nBoth curves are normalized.",
        fontsize=14, color=QUIET, linespacing=1.5)
fig.text(0.10, 0.045, "Horizontal axis: speed. Each curve has the same total area.",
         fontsize=12, color=QUIET)

DESTINATION.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(DESTINATION, format="svg", metadata={"Date": None})
plt.close(fig)

ET.register_namespace("", "http://www.w3.org/2000/svg")
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
tree = ET.parse(DESTINATION)
svg = tree.getroot()
svg.set("id", "mb-curve-svg")
svg.set("role", "img")
svg.set("aria-labelledby", "mb-curve-title mb-curve-description")
title = ET.Element("{http://www.w3.org/2000/svg}title", {"id": "mb-curve-title"})
title.text = "Two normalized Maxwell-Boltzmann speed distributions"
description = ET.Element("{http://www.w3.org/2000/svg}desc", {"id": "mb-curve-description"})
description.text = (
    "The left curve is narrower with a higher peak. The right curve is broader "
    "with a lower peak and greater average speed. Both have equal area. Higher "
    "temperature at fixed gas mass, or smaller molar mass at fixed temperature, "
    "produces the broader distribution."
)
svg.insert(0, description)
svg.insert(0, title)
tree.write(DESTINATION, encoding="unicode")
text = DESTINATION.read_text().replace("*{stroke", "#mb-curve-svg *{stroke").replace("* {stroke", "#mb-curve-svg * {stroke").replace(
    "'DejaVu Sans'", "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
)
DESTINATION.write_text("\n".join(line.rstrip() for line in text.splitlines()) + "\n")
print(DESTINATION)
