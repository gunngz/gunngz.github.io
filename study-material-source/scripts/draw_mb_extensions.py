"""Render energy distributions and four paired speed comparisons.

Energy-density reference: MIT OCW 5.112, Fall 2005, Lecture 14.
https://ocw.mit.edu/courses/5-112-principles-of-chemical-science-fall-2005/7bdbac682c0d533e8d9d18f5c603f580_5_1122005L14.pdf
All curves are normalized classical translational distributions.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.offsetbox import AnnotationBbox, TextArea, VPacker
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
INK, QUIET, PAPER, LINE = "#302f2a", "#777368", "#fffaf1", "#e7dcc8"
BLUE, GREEN = "#628b9c", "#587565"
plt.rcParams.update({"svg.fonttype": "none", "svg.hashsalt": "study-mb-extensions", "font.family": "DejaVu Sans", "font.size": 14, "text.color": INK, "axes.labelcolor": INK, "xtick.color": QUIET, "ytick.color": QUIET, "mathtext.fontset": "cm"})

def speed_density(v, scale):
    return np.sqrt(2 / np.pi) * v**2 / scale**3 * np.exp(-v**2 / (2 * scale**2))

def energy_density(e, theta):
    return 2 / np.sqrt(np.pi) * np.sqrt(e) / theta**1.5 * np.exp(-e / theta)

def style_axis(ax):
    ax.set_facecolor(PAPER)
    ax.set_yticks([])
    ax.tick_params(length=0, pad=7, labelsize=12)
    for edge in ["top", "right"]:
        ax.spines[edge].set_visible(False)
    for edge in ["left", "bottom"]:
        ax.spines[edge].set(color=LINE, linewidth=1.5)

def save(fig, destination, name, title_text, description_text):
    destination.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(destination, format="svg", metadata={"Date": None})
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
    tree = ET.parse(destination)
    svg = tree.getroot()
    svg.set("id", name)
    svg.set("role", "img")
    svg.set("aria-labelledby", f"{name}-title {name}-description")
    for element, label, text in [("title", "title", title_text), ("desc", "description", description_text)]:
        node = ET.Element(f"{{http://www.w3.org/2000/svg}}{element}", {"id": f"{name}-{label}"})
        node.text = text
        svg.insert(0, node)
    tree.write(destination, encoding="unicode")
    source = destination.read_text().replace("*{stroke", f"#{name} *{{stroke").replace("* {stroke", f"#{name} * {{stroke").replace("'DejaVu Sans'", "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif")
    destination.write_text("\n".join(line.rstrip() for line in source.splitlines()) + "\n")
    print(destination)

def draw_energy():
    fig = plt.figure(figsize=(12.5, 7.5), facecolor=PAPER)
    ax = fig.add_axes([0.10, 0.18, 0.84, 0.67])
    style_axis(ax)
    energy = np.linspace(0, np.sqrt(12), 350)**2
    ax.set(xlim=(0, 12), ylim=(0, 0.80))
    ax.set_xticks([0, 12], ["Lower energies", "Higher energies"])
    ax.set_xlabel(r"Translational kinetic energy, $E_k$ (schematic scale)", fontsize=15, labelpad=12)
    ax.set_ylabel("Normalized particle density", fontsize=15, labelpad=13)
    artists = {"temperature": [], "mass": []}
    def tag(artist, context, label):
        artist.set_gid(f"mb-{context}-energy-{label}")
        artists[context].append(artist)
        return artist
    for theta, color, label in [(1, BLUE, "lower"), (2, GREEN, "higher")]:
        values = energy_density(energy, theta)
        tag(ax.fill_between(energy, values, color=color, alpha=0.10), "temperature", label + "-area")
        tag(ax.plot(energy, values, color=color, linewidth=3.0)[0], "temperature", label + "-curve")
    values = energy_density(energy, 1)
    tag(ax.fill_between(energy, values, color=BLUE, alpha=0.10), "mass", "area")
    tag(ax.plot(energy, values, color=BLUE, linewidth=5.2, alpha=0.65)[0], "mass", "larger-curve")
    tag(ax.plot(energy, values, color=GREEN, linewidth=2.4, linestyle=(0, (5, 4)))[0], "mass", "smaller-curve")
    for context, title in [("temperature", "Same gas: higher temperature → greater average kinetic energy"), ("mass", "Same temperature: the kinetic-energy distributions overlap")]:
        tag(fig.text(0.10, 0.93, title, fontsize=16, weight="bold"), context, "title")
    def note(context, name, xy, location, heading, body, color):
        box = VPacker(children=[TextArea(heading, textprops={"fontsize": 15, "weight": "bold", "color": color}), TextArea(body, textprops={"fontsize": 14, "linespacing": 1.4})], align="left", pad=0, sep=7)
        label = AnnotationBbox(box, xy, xybox=location, xycoords="data", boxcoords="axes fraction", frameon=True, bboxprops={"boxstyle": "round,pad=0.8,rounding_size=0.7", "fc": PAPER, "ec": LINE, "lw": 1.4}, arrowprops={"arrowstyle": "-|>", "color": color, "lw": 1.3, "shrinkB": 7}, annotation_clip=False)
        ax.add_artist(tag(label, context, name))
    note("temperature", "lower-label", (0.5, energy_density(0.5, 1)), (0.23, 0.88), "Lower temperature", "Lower average kinetic energy\nNarrower distribution\nHigher peak", BLUE)
    note("temperature", "higher-label", (1, energy_density(1, 2)), (0.72, 0.60), "Higher temperature", "Higher average kinetic energy\nBroader distribution\nLower peak", GREEN)
    note("mass", "overlap-label", (0.5, energy_density(0.5, 1)), (0.62, 0.73), "Both gases: identical distributions", "Solid blue: larger molar mass\nDashed green: smaller molar mass\nSame average kinetic energy\nSame width and peak", INK)
    ax.text(6.6, 0.12, "Equal total areas = 1\nBoth distributions are normalized.", fontsize=13, color=QUIET, linespacing=1.5)
    fig.text(0.10, 0.045, "Read the horizontal axis: energy distributions are not speed distributions.", fontsize=12, color=QUIET)
    save(fig, ROOT / "src/diagrams/chem2-kinetic-energy.svg", "mb-energy-svg", "Normalized Maxwell-Boltzmann translational kinetic-energy distributions", "Higher temperature broadens the energy distribution and lowers its peak. At the same temperature, different molar masses have exactly the same energy distribution, shown as overlapping solid and dashed curves.")
    for item in artists["mass"]:
        item.set_visible(False)
    fig.savefig("/tmp/chem2-energy-temperature.png", dpi=110)
    for item in artists["temperature"]:
        item.set_visible(False)
    for item in artists["mass"]:
        item.set_visible(True)
    fig.savefig("/tmp/chem2-energy-mass.png", dpi=110)
    plt.close(fig)

def draw_comparisons():
    fig, axes = plt.subplots(2, 2, figsize=(12.5, 10), facecolor=PAPER)
    fig.subplots_adjust(left=0.065, right=0.975, bottom=0.09, top=0.92, hspace=0.40, wspace=0.20)
    speed = np.linspace(0, 6.2, 240)
    cases = [("Same gas: higher temperature", np.sqrt(2), "Higher speeds\nBroader\nLower peak"), ("Same gas: lower temperature", 1 / np.sqrt(2), "Lower speeds\nNarrower\nHigher peak"), ("Same temperature: smaller molar mass", np.sqrt(2), "Higher speeds\nBroader\nLower peak"), ("Same temperature: larger molar mass", 1 / np.sqrt(2), "Lower speeds\nNarrower\nHigher peak")]
    for ax, (title, scale, result) in zip(axes.flat, cases):
        style_axis(ax)
        ax.set(xlim=(0, 6.2), ylim=(0, 1.12))
        ax.set_xticks([0, 6], ["Lower", "Higher"])
        ax.set_xlabel("Speed", fontsize=13, labelpad=8)
        ax.set_title(title, loc="left", fontsize=14, fontweight="bold", pad=14)
        ax.plot(speed, speed_density(speed, 1), color=BLUE, linewidth=2.3, linestyle=(0, (4, 3)))
        ax.plot(speed, speed_density(speed, scale), color=GREEN, linewidth=2.7)
        ax.fill_between(speed, speed_density(speed, scale), color=GREEN, alpha=0.08)
        ax.annotate("Reference", xy=(np.sqrt(2), speed_density(np.sqrt(2), 1)), xytext=(0.15, 0.97), fontsize=12, color=BLUE, arrowprops={"arrowstyle": "-|>", "color": BLUE, "lw": 1.1})
        peak = np.sqrt(2) * scale
        ax.annotate(result, xy=(peak, speed_density(peak, scale)), xytext=(3.75, 0.90), fontsize=12.5, color=INK, va="top", linespacing=1.35, bbox={"boxstyle": "round,pad=0.6", "fc": PAPER, "ec": LINE}, arrowprops={"arrowstyle": "-|>", "color": GREEN, "lw": 1.1})
    fig.text(0.012, 0.53, "Normalized particle density", rotation=90, va="center", fontsize=13)
    fig.text(0.065, 0.025, "Dashed blue: reference. Solid green: after the change. All curves are normalized.", fontsize=12, color=QUIET)
    save(fig, ROOT / "public/diagrams/chem2-mb-shape-comparisons.svg", "mb-shape-comparisons", "Four speed-distribution comparisons with a shared reference curve", "Heating a gas or reducing molar mass shifts the distribution to higher speeds, broadens it, and lowers its peak. Cooling or increasing molar mass shifts it to lower speeds, narrows it, and raises its peak. All four panels use the same reference and axis scales.")
    fig.savefig("/tmp/chem2-speed-comparisons.png", dpi=110)
    plt.close(fig)

if __name__ == "__main__":
    draw_energy()
    draw_comparisons()
