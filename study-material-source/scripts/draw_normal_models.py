"""Draw the study guide's Normal-model sketches from the Normal density.

Run with Matplotlib and NumPy. Areas and percentiles use statistics.NormalDist.
"""

from pathlib import Path
from statistics import NormalDist
import xml.etree.ElementTree as ET

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

DEST = Path(__file__).resolve().parents[1] / "public/diagrams"
INK, QUIET, PAPER, LINE = "#282720", "#716d62", "#fffaf1", "#e5dac9"
GREEN, BLUE, GOLD = "#526f5c", "#628b9c", "#f1dfaa"
NORMAL = NormalDist()

plt.rcParams.update({
    "svg.fonttype": "none", "svg.hashsalt": "study-normal-models",
    "font.family": "DejaVu Sans", "font.size": 14,
    "text.color": INK, "axes.labelcolor": INK,
    "xtick.color": QUIET, "ytick.color": QUIET,
})


def pdf(x, sd=1):
    return np.exp(-0.5 * (x / sd) ** 2) / (sd * np.sqrt(2 * np.pi))


def base(title, subtitle="Illustrative Normal model · total area = 1"):
    fig, ax = plt.subplots(figsize=(8, 4.2), facecolor=PAPER)
    fig.subplots_adjust(left=.08, right=.97, bottom=.22, top=.73)
    fig.text(.08, .92, title, weight="bold", fontsize=16)
    fig.text(.08, .83, subtitle, fontsize=12, color=QUIET)
    style(ax)
    return fig, ax


def style(ax):
    ax.set_facecolor(PAPER)
    ax.set(xlim=(-3.5, 3.5), ylim=(0, .5))
    ax.set_yticks([])
    ax.tick_params(axis="x", length=4, color=LINE, labelsize=12, pad=8)
    for side in ["left", "right", "top"]:
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set(color=LINE, linewidth=1.5)


def bell(ax, *, sd=1, color=GREEN):
    x = np.linspace(-4.5, 4.5, 801)
    ax.plot(x, pdf(x, sd), color=color, linewidth=2.8, zorder=3)


def area(ax, lower, upper):
    x = np.linspace(lower, upper, 401)
    ax.fill_between(x, pdf(x), color=GOLD, zorder=2)


def ticks(ax, standard=False):
    labels = ["−3", "−2", "−1", "0", "1", "2", "3"] if standard else [
        "μ − 3σ", "μ − 2σ", "μ − σ", "μ", "μ + σ", "μ + 2σ", "μ + 3σ"]
    ax.set_xticks(range(-3, 4), labels)
    ax.set_xlabel("z-score" if standard else "Value", labelpad=12)


def save(fig, name, description):
    path = DEST / f"u1p1-normal-{name}.svg"
    fig.savefig(path, metadata={"Date": None}, facecolor=PAPER)
    plt.close(fig)
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    tree = ET.parse(path)
    root = tree.getroot()
    root.set("role", "img")
    root.set("aria-labelledby", f"normal-{name}-title normal-{name}-desc")
    font_style = ET.Element("{http://www.w3.org/2000/svg}style")
    font_style.text = "text { font-family: Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important; }"
    root.insert(0, font_style)
    for tag, text in [("title", f"Normal model: {name}"), ("desc", description)]:
        element = ET.Element(f"{{http://www.w3.org/2000/svg}}{tag}", {"id": f"normal-{name}-{tag}"})
        element.text = text
        root.insert(0, element)
    tree.write(path, encoding="unicode", xml_declaration=True)


fig, ax = base("Normal distribution", "Symmetric about the mean μ · spread measured by σ")
bell(ax)
ticks(ax)
ax.axvline(0, 0, .80, color=QUIET, linestyle="--", linewidth=1)
ax.annotate("Mean μ", xy=(0, .4), xytext=(-2.6, .43), color=GREEN,
            arrowprops={"arrowstyle": "->", "color": GREEN}, fontsize=14)
ax.annotate("One standard deviation", xy=(.5, .10), xytext=(.9, .29),
            arrowprops={"arrowstyle": "->", "color": QUIET}, fontsize=13)
ax.annotate("", xy=(0, .07), xytext=(1, .07),
            arrowprops={"arrowstyle": "<->", "color": QUIET})
save(fig, "density", "A symmetric bell curve centered at μ. Tick marks are one standard deviation σ apart. The entire area under the curve is 1.")

fig, ax = base("Standard Normal distribution", "Mean = 0 · standard deviation = 1 · total area = 1")
bell(ax)
ticks(ax, standard=True)
ax.text(0, .16, "Center: z = 0", ha="center", fontsize=14)
ax.axvline(0, 0, .80, color=QUIET, linestyle="--", linewidth=1)
save(fig, "standard", "A standard Normal bell curve with mean 0 and standard deviation 1. The horizontal axis is the z-score.")

fig, ax = base("normalcdf: bounds → probability", "Example: area between z = −1.00 and z = 1.50")
bell(ax)
area(ax, -1, 1.5)
ax.set_xticks([-1, 0, 1.5], ["−1.00\nLower bound", "0\nMean", "1.50\nUpper bound"])
ax.set_xlabel("z-score", labelpad=12)
for x in [-1, 1.5]:
    ax.vlines(x, 0, pdf(x), color=GREEN, linestyle="--", linewidth=1.2)
prob = NORMAL.cdf(1.5) - NORMAL.cdf(-1)
ax.text(.1, .15, f"Area ≈ {prob:.4f}", ha="center", fontsize=15, weight="bold")
save(fig, "probability", "The area between z = −1 and z = 1.5 is shaded. This probability is approximately 0.7745, or 77.45 percent.")

fig, ax = base("inverseNorm: left-tail area → value", "Example: the 80th percentile has cumulative area 0.80")
q = NORMAL.inv_cdf(.8)
bell(ax)
area(ax, -4.5, q)
ax.set_xticks([0, q], ["0", "0.84\n80th percentile"])
ax.set_xlabel("z-score", labelpad=12)
ax.vlines(q, 0, pdf(q), color=GREEN, linestyle="--", linewidth=1.2)
ax.text(-.65, .16, "Left-tail area = 0.80", ha="center", fontsize=14, weight="bold")
ax.annotate("Find this value", xy=(q, pdf(q)), xytext=(1.2, .40),
            arrowprops={"arrowstyle": "->", "color": GREEN}, fontsize=13)
save(fig, "percentile", "The leftmost 80 percent of the Normal curve is shaded. The cutoff is the 80th percentile, at z approximately 0.84.")

fig, ax = base("A complete Normal-distribution sketch", "Label the center, standard deviations, boundaries, and shaded area")
bell(ax)
area(ax, 0, 1)
ticks(ax)
ax.vlines(1, 0, pdf(1), color=GREEN, linestyle="--", linewidth=1.2)
ax.text(.50, .11, "34.1%", ha="center", fontsize=14, weight="bold")
ax.annotate("Requested region", xy=(.6, .24), xytext=(1.3, .40),
            arrowprops={"arrowstyle": "->", "color": GREEN}, fontsize=13)
save(fig, "sketch", "A Normal curve with all marks from μ minus 3σ to μ plus 3σ. The region between μ and μ plus σ is shaded, with area about 0.341, or 34.1 percent.")

fig = plt.figure(figsize=(8, 4.2), facecolor=PAPER)
fig.text(.06, .92, "Empirical rule: 68% · 95% · 99.7%", weight="bold", fontsize=16)
fig.text(.06, .83, "Approximately Normal · same mean μ · total area = 1", fontsize=12, color=QUIET)
for i, (k, percent) in enumerate([(1, "68%"), (2, "95%"), (3, "99.7%")]):
    ax = fig.add_axes([.06 + i * .315, .25, .27, .43])
    style(ax)
    bell(ax)
    area(ax, -k, k)
    offset = "σ" if k == 1 else f"{k}σ"
    ax.set_xticks([-k, k], [f"μ − {offset}", f"μ + {offset}"])
    ax.axvline(0, 0, .8, color=QUIET, linestyle="--", linewidth=.8)
    ax.text(0, .44, percent, ha="center", fontsize=15, weight="bold")
    fig.text(.195 + i * .315, .11, f"Within {k} SD" + ("s" if k > 1 else ""), ha="center", fontsize=13)
save(fig, "empirical-rule", "Three identical Normal curves show the central regions within 1, 2, and 3 standard deviations, containing about 68, 95, and 99.7 percent of the distribution.")

fig, ax = base("Same mean, different standard deviations", "Both Normal curves have the same total area: 1")
ax.set(xlim=(-4.5, 4.5), ylim=(0, .73))
bell(ax, sd=.7, color=GREEN)
bell(ax, sd=1.4, color=BLUE)
ax.set_xticks([0], ["Shared mean"])
ax.set_xlabel("Value", labelpad=12)
ax.annotate("Smaller SD\nTaller and narrower", xy=(0, pdf(0, .7)), xytext=(-4.1, .59),
            color=GREEN, fontsize=14, linespacing=1.5,
            arrowprops={"arrowstyle": "->", "color": GREEN})
ax.annotate("Larger SD\nShorter and wider", xy=(1.3, pdf(1.3, 1.4)), xytext=(1.2, .51),
            color=BLUE, fontsize=14, linespacing=1.5,
            arrowprops={"arrowstyle": "->", "color": BLUE})
save(fig, "spread", "Two Normal curves with the same mean and equal total area. The curve with smaller standard deviation is taller and narrower; the one with larger standard deviation is shorter and wider.")

fig = plt.figure(figsize=(8, 4.2), facecolor=PAPER)
fig.text(.07, .93, "Normal probability plots: check the pattern", weight="bold", fontsize=16)
fig.text(.07, .84, "Illustrative ordered observations compared with expected Normal z-scores", fontsize=12, color=QUIET)
q = np.array([NORMAL.inv_cdf((i - .5) / 16) for i in range(1, 17)])
for i, reasonable in enumerate([True, False]):
    ax = fig.add_axes([.09 + i * .48, .25, .37, .40], facecolor=PAPER)
    observed = q + .06 * np.sin(np.arange(16)) if reasonable else np.exp(.85 * q)
    ax.scatter(q, observed, color=GREEN if reasonable else BLUE, s=24, zorder=3)
    reference = np.quantile(observed, [.25, .75])
    expected = np.array([NORMAL.inv_cdf(.25), NORMAL.inv_cdf(.75)])
    slope = np.diff(reference)[0] / np.diff(expected)[0]
    ax.plot(q, np.median(observed) + slope * q, color=QUIET, linestyle="--", linewidth=1.2)
    ax.set_xlabel("Expected Normal z-score", fontsize=12, labelpad=8)
    ax.set_ylabel("Ordered data", fontsize=12, labelpad=6)
    ax.set_xticks([-2, 0, 2])
    ax.set_yticks([])
    ax.tick_params(labelsize=11, color=LINE)
    for side in ["top", "right"]:
        ax.spines[side].set_visible(False)
    for side in ["left", "bottom"]:
        ax.spines[side].set(color=LINE, linewidth=1.5)
    fig.text(.275 + i * .48, .73, "Roughly linear" if reasonable else "Clearly curved", ha="center", fontsize=14, weight="bold", color=GREEN if reasonable else BLUE)
    fig.text(.275 + i * .48, .08, "Normal model is reasonable" if reasonable else "Normal model is not reasonable", ha="center", fontsize=12)
save(fig, "npp", "Two Normal probability plots. Roughly linear points support a Normal model. Clearly curved points do not support a Normal model.")

print("Generated 8 Normal-model diagrams.")
