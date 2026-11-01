"""Draw a schematic, annotated Z curve for the study guide.

The dimensionless van der Waals isotherm is above the critical temperature;
it does not represent measurements for a specific gas.
Reference: https://openstax.org/books/chemistry-2e/pages/9-6-non-ideal-gas-behavior
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
DESTINATION = ROOT / "src/diagrams/chem2-z-curves.svg"
INK = "#302f2a"
QUIET = "#777368"
PAPER = "#fffaf1"
LINE = "#e7dcc8"
GREEN = "#587565"
GOLD = "#c09c43"

plt.rcParams.update({
    "svg.fonttype": "none",
    "svg.hashsalt": "study-z-curves",
    "font.family": "DejaVu Sans",
    "text.color": INK,
    "axes.labelcolor": INK,
    "xtick.color": QUIET,
    "ytick.color": QUIET,
    "mathtext.fontset": "dejavusans",
    "font.size": 14,
})

fig = plt.figure(figsize=(13.3333, 9.7222), facecolor=PAPER)
ax = fig.add_axes([0.09, 0.17, 0.60, 0.70], facecolor=PAPER)

# With R = a = b = 1, Tc = 8/27; T = 0.38 is above Tc.
temperature = 0.38
volumes = np.geomspace(20000, 1.39, 1600)
pressures = temperature / (volumes - 1) - 1 / volumes**2
compressibility = pressures * volumes / temperature
pressure_scale = pressures[-1]

ax.axhspan(1, 1.95, color="#e9efe6", alpha=0.6)
ax.axhspan(0, 1, color="#f7eed8", alpha=0.45)
ax.axhline(1, color=QUIET, linewidth=1.7, linestyle=(0, (6, 5)))
ax.plot(pressures / pressure_scale, compressibility, color=GREEN,
        linewidth=3.6, solid_capstyle="round")
ax.set(xlim=(0, 1.04), ylim=(0, 1.95))
ax.set_xticks([0, 1], ["Low", "High"])
ax.set_yticks([0.5, 1, 1.5], ["0.5", "1", "1.5"])
ax.set_xlabel("Pressure (schematic scale)", fontsize=15, labelpad=13)
ax.set_ylabel("Compressibility factor, Z", fontsize=15, labelpad=13)
ax.tick_params(axis="both", labelsize=13, length=0, pad=8)
for side in ["top", "right"]:
    ax.spines[side].set_visible(False)
for side in ["left", "bottom"]:
    ax.spines[side].set(color=LINE, linewidth=1.7)

fig.text(0.09, 0.945, r"$Z=\frac{PV}{nRT}$", fontsize=21, color=INK)
fig.text(0.09, 0.905,
         "Compare pressures at the same temperature, volume, and number of moles.",
         fontsize=13, color=QUIET)
ax.text(1.08, 1, "Z = 1\nIdeal gas", va="center", fontsize=15,
        color=QUIET, linespacing=1.5, clip_on=False)
ax.text(0.91, 1.78, "Real gas", ha="center", fontsize=13, color=GREEN)


def point(volume):
    pressure = temperature / (volume - 1) - 1 / volume**2
    return pressure / pressure_scale, pressure * volume / temperature


def callout(region, volume, location, title, body, result, alignment=(0.5, 0.5)):
    xy = point(volume)
    ring = ax.scatter(*xy, s=1250, facecolor="#efdda1", edgecolor=GOLD,
                      linewidth=2.0, zorder=4, clip_on=False)
    ring.set_gid(f"z-{region}-focus")
    dot = ax.scatter(*xy, s=55, facecolor=GREEN, edgecolor=PAPER,
                     linewidth=1.5, zorder=5)
    dot.set_gid(f"z-{region}-point")
    content = VPacker(children=[
        TextArea(title, textprops={"fontsize": 15, "weight": "bold", "color": GREEN}),
        TextArea(body, textprops={"fontsize": 14, "linespacing": 1.4}),
        TextArea(result, textprops={"fontsize": 14}),
    ], align="left", pad=0, sep=7)
    annotation = AnnotationBbox(
        content, xy, xybox=location, xycoords="data", boxcoords="axes fraction",
        box_alignment=alignment, frameon=True,
        bboxprops={"boxstyle": "round,pad=0.9,rounding_size=0.7",
                   "fc": PAPER, "ec": LINE, "lw": 1.4},
        arrowprops={"arrowstyle": "-|>", "color": GREEN, "lw": 1.3,
                    "shrinkA": 3, "shrinkB": 7},
        annotation_clip=False, zorder=6,
    )
    annotation.set_gid(f"z-{region}-label")
    ax.add_artist(annotation)


callout("low-pressure", 90, (0.30, 0.80), "Low pressure: Z ≈ 1",
        "1  Particles are far apart.\n"
        "2  Attractions have little effect;\n"
        "    particle volume is negligible\n"
        "    relative to the container.",
        r"3  $P_{\mathrm{real}}\approx P_{\mathrm{ideal}}$")

callout("attractions", 2.60, (0.34, 0.13), "Z < 1: attractions dominate",
        "1  Particles are close enough\n"
        "    for attractions to matter.\n"
        "2  Attractions lower wall pressure.",
        r"3  $P_{\mathrm{real}}<P_{\mathrm{ideal}}$")

callout("high-pressure", 1.44, (1.02, 0.72), "Z > 1: very high pressure",
        "1  Particles are very close.\n"
        "2  Finite particle volume\n"
        "    and short-range repulsions\n"
        "    are significant.",
        r"3  $P_{\mathrm{real}}>P_{\mathrm{ideal}}$", alignment=(0, 0.5))

fig.text(0.09, 0.045,
         "Schematic curve at one temperature. Shape depends on the gas and temperature.",
         fontsize=12, color=QUIET)

DESTINATION.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(DESTINATION, format="svg", metadata={"Date": None})
fig.savefig("/tmp/chem2-z-curve-plot.png", dpi=120)
plt.close(fig)

# Native SVG text remains readable and selectable in the interactive figure.
ET.register_namespace("", "http://www.w3.org/2000/svg")
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
tree = ET.parse(DESTINATION)
svg = tree.getroot()
svg.set("id", "z-curve-svg")
svg.set("role", "img")
svg.set("aria-labelledby", "z-curve-title z-curve-description")
title = ET.Element("{http://www.w3.org/2000/svg}title", {"id": "z-curve-title"})
title.text = "Z curve with explanations at low pressure, where attractions dominate, and at very high pressure"
description = ET.Element("{http://www.w3.org/2000/svg}desc", {"id": "z-curve-description"})
description.text = (
    "The dashed ideal-gas line is Z equals 1. A schematic real-gas curve approaches "
    "1 at low pressure, dips below 1 where attractions dominate, and rises above 1 "
    "where finite particle volume and short-range repulsions dominate. Each region "
    "has an attached three-step explanation and compares pressures at the same "
    "temperature, volume, and number of moles."
)
svg.insert(0, description)
svg.insert(0, title)
tree.write(DESTINATION, encoding="unicode")
text = DESTINATION.read_text().replace("*{stroke", "#z-curve-svg *{stroke").replace("* {stroke", "#z-curve-svg * {stroke").replace(
    "'DejaVu Sans'", "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
)
DESTINATION.write_text("\n".join(line.rstrip() for line in text.splitlines()) + "\n")
print(DESTINATION)
