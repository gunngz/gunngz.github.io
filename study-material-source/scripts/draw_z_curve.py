"""Illustrative CH4, CO2 and H2 van der Waals isotherms at 350 K.

Parameters are fitted to critical constants, not experimental Z measurements.
H2 and CO2: OpenStax Chemistry 2e 10.4 (33.15 K, 13 bar; 304.25 K, 74 bar).
CH4: NIST Chemistry WebBook (190.6 K, 46.1 bar).
https://openstax.org/books/chemistry-2e/pages/10-4-phase-diagrams
https://webbook.nist.gov/cgi/cbook.cgi?Name=methane&cTP=on
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
INK, QUIET, PAPER, LINE = "#302f2a", "#777368", "#fffaf1", "#e7dcc8"
GREEN, BLUE, GOLD = "#587565", "#628b9c", "#b18a35"
plt.rcParams.update({"svg.fonttype": "none", "svg.hashsalt": "study-three-gas-z-curves", "font.family": "DejaVu Sans", "font.size": 14, "text.color": INK, "axes.labelcolor": INK, "xtick.color": QUIET, "ytick.color": QUIET})
R, T = 0.08314462618, 350.0
gases = {"CO₂": (304.25, 74.0, GREEN), "CH₄": (190.6, 46.1, BLUE), "H₂": (33.15, 13.0, GOLD)}

def z_values(pressure, tc, pc):
    p = np.asarray(pressure, dtype=float)
    a = 27 * R**2 * tc**2 / (64 * pc)
    b = R * tc / (8 * pc)
    low = np.full_like(p, b * (1 + 1e-8))
    high = R * T / p + b
    for _ in range(80):
        volume = (low + high) / 2
        prediction = R * T / (volume - b) - a / volume**2
        low = np.where(prediction > p, volume, low)
        high = np.where(prediction > p, high, volume)
    return p * (low + high) / (2 * R * T)

fig = plt.figure(figsize=(13.3333, 9.7222), facecolor=PAPER)
ax = fig.add_axes([0.09, 0.18, 0.58, 0.69], facecolor=PAPER)
ax.axhspan(1, 2.1, color="#e9efe6", alpha=0.6)
ax.axhspan(0, 1, color="#f7eed8", alpha=0.45)
ax.axhline(1, color=QUIET, linewidth=1.7, linestyle=(0, (6, 5)))
pressure = np.linspace(0.001, 650, 450)
curves = {}
for name, (tc, pc, color) in gases.items():
    z = z_values(pressure, tc, pc)
    curves[name] = z
    ax.plot(np.r_[0, pressure], np.r_[1, z], color=color, linewidth=3.2)
label_y = 2.0
for name in sorted(gases, key=lambda item: curves[item][-1], reverse=True):
    end = float(curves[name][-1])
    label_y = min(end + 0.07, label_y - 0.16)
    color = gases[name][2]
    ax.annotate(name, xy=(650, end), xytext=(675, label_y), color=color, fontsize=17, weight="bold", va="center", arrowprops={"arrowstyle": "-", "color": color, "lw": 1.2}, annotation_clip=False)
ax.set(xlim=(0, 720), ylim=(0, 2.1))
ax.set_xticks([0, 200, 400, 600])
ax.set_yticks([0.5, 1, 1.5, 2], ["0.5", "1", "1.5", "2"])
ax.set_xlabel("Pressure (bar)", fontsize=15, labelpad=13)
ax.set_ylabel("Compressibility factor, Z", fontsize=15, labelpad=13)
ax.tick_params(length=0, pad=8, labelsize=13)
for edge in ["top", "right"]:
    ax.spines[edge].set_visible(False)
for edge in ["left", "bottom"]:
    ax.spines[edge].set(color=LINE, linewidth=1.7)
fig.text(0.09, 0.935, "Same temperature: 350 K · compare each gas with its ideal prediction", fontsize=14, color=QUIET)
ax.text(780, 1, "Z = 1\nIdeal gas", va="center", color=QUIET, fontsize=15, linespacing=1.5, clip_on=False)

def note(region, xy, location, title, body, alignment=(0.5, 0.5)):
    ring = ax.scatter(*xy, s=1100, facecolor="#efdda1", edgecolor=GOLD, linewidth=2, zorder=4, clip_on=False)
    ring.set_gid(f"z-{region}-focus")
    ax.scatter(*xy, s=45, facecolor=GREEN, edgecolor=PAPER, linewidth=1.3, zorder=5)
    content = VPacker(children=[TextArea(title, textprops={"fontsize": 15, "weight": "bold", "color": GREEN}), TextArea(body, textprops={"fontsize": 14, "linespacing": 1.35})], align="left", pad=0, sep=7)
    label = AnnotationBbox(content, xy, xybox=location, xycoords="data", boxcoords="axes fraction", box_alignment=alignment, frameon=True, bboxprops={"boxstyle": "round,pad=0.8,rounding_size=0.7", "fc": PAPER, "ec": LINE, "lw": 1.4}, arrowprops={"arrowstyle": "-|>", "color": GREEN, "lw": 1.2, "shrinkB": 7}, annotation_clip=False, zorder=6)
    label.set_gid(f"z-{region}-label")
    ax.add_artist(label)

note("low-pressure", (8, float(z_values(8, *gases["CO₂"][:2]))), (0.31, 0.79), "Low pressure: Z ≈ 1", "1  Particles are far apart.\n2  Attractions and particle\n    volume have little effect.\n3  Pressure is near ideal.")
minimum = int(np.argmin(curves["CO₂"]))
note("attractions", (pressure[minimum], curves["CO₂"][minimum]), (0.41, 0.12), "Attractions dominate: Z < 1", "1  Particles are close enough.\n2  Attractions lower wall pressure.\n3  Pressure is below ideal.")
note("high-pressure", (590, float(z_values(590, *gases["CH₄"][:2]))), (1.08, 0.72), "Very high pressure: Z > 1", "1  Particles are very close.\n2  Finite volume and\n    repulsions are important.\n3  Pressure is above ideal.", alignment=(0, 0.5))
fig.text(0.09, 0.045, "Illustrative van der Waals model curves, not measured data. Shape depends on temperature.", fontsize=12, color=QUIET)
DESTINATION.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(DESTINATION, format="svg", metadata={"Date": None})
fig.savefig("/tmp/chem2-three-gas-z-curves.png", dpi=110)
plt.close(fig)
ET.register_namespace("", "http://www.w3.org/2000/svg")
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
tree = ET.parse(DESTINATION)
svg = tree.getroot()
svg.set("id", "z-curve-svg")
svg.set("role", "img")
svg.set("aria-labelledby", "z-curve-title z-curve-description")
for tag, name, text in [("title", "title", "CH4, CO2 and H2 compressibility-factor curves at the same temperature"), ("desc", "description", "All curves approach Z equals 1 at low pressure. CO2 has a deeper attraction-driven dip than CH4. H2 rises approximately linearly above 1 over this model range. At high pressure, volume and repulsive effects raise Z. The dashed horizontal ideal-gas line is Z equals 1.")]:
    element = ET.Element(f"{{http://www.w3.org/2000/svg}}{tag}", {"id": f"z-curve-{name}"})
    element.text = text
    svg.insert(0, element)
tree.write(DESTINATION, encoding="unicode")
source = DESTINATION.read_text().replace("*{stroke", "#z-curve-svg *{stroke").replace("* {stroke", "#z-curve-svg * {stroke").replace("'DejaVu Sans'", "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif")
DESTINATION.write_text("\n".join(line.rstrip() for line in source.splitlines()) + "\n")
print(DESTINATION)
