"""Generate the diagrams for AP Statistics Unit 2 Part 2."""

from collections import Counter
from itertools import combinations
from math import comb
from pathlib import Path
from statistics import NormalDist
from xml.etree import ElementTree as ET

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

DEST = Path(__file__).resolve().parents[1] / "public/diagrams"
PAPER, INK, QUIET = "#fffaf1", "#282720", "#716d62"
LINE, GREEN, BLUE, GOLD = "#e5dac9", "#526f5c", "#628b9c", "#f1dfaa"
SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)
plt.rcParams.update({
    "svg.fonttype": "none", "svg.hashsalt": "stats-u2p2",
    "font.family": "DejaVu Sans", "font.size": 13,
    "text.color": INK, "axes.labelcolor": INK,
    "xtick.color": QUIET, "ytick.color": QUIET,
})


def save(fig, name, title, description):
    path = DEST / f"u2p2-{name}.svg"
    fig.savefig(path, metadata={"Date": None}, facecolor=PAPER)
    plt.close(fig)
    tree = ET.parse(path)
    root = tree.getroot()
    root.set("role", "img")
    root.set("aria-labelledby", "chart-title chart-desc")
    root.insert(0, ET.Element(f"{{{SVG}}}title", id="chart-title"))
    root[0].text = title
    root.insert(1, ET.Element(f"{{{SVG}}}desc", id="chart-desc"))
    root[1].text = description
    root.insert(2, ET.Element(f"{{{SVG}}}style"))
    root[2].text = "text { font-family: Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important; }"
    tree.write(path, encoding="unicode", xml_declaration=True)


def heading(fig, title, subtitle):
    fig.text(.07, .91, title, fontsize=16, weight="bold")
    fig.text(.07, .82, subtitle, fontsize=12, color=QUIET)


def style(ax, show_y=False):
    ax.set_facecolor(PAPER)
    ax.spines[["top", "right"]].set_visible(False)
    ax.spines["bottom"].set(color=LINE, linewidth=1.4)
    ax.spines["left"].set_visible(show_y)
    ax.spines["left"].set_color(LINE)
    ax.tick_params(axis="both", length=4, color=LINE, labelsize=11, pad=5)
    if not show_y:
        ax.set_yticks([])


def normal_plot(name, title, axis, model, lower, upper, area_label, cutoffs, decimals):
    mean, sd = model.mean, model.stdev
    start, end = mean - 3.7 * sd, mean + 3.7 * sd
    x = np.linspace(start, end, 600)
    peak = model.pdf(mean)
    fig, ax = plt.subplots(figsize=(8, 3.5), facecolor=PAPER)
    fig.subplots_adjust(left=.07, right=.96, bottom=.22, top=.73)
    heading(fig, title, f"Mean {mean:,g} · SD {sd:,g} · {area_label}")
    style(ax)
    shaded = np.linspace(max(lower, start), min(upper, end), 300)
    ax.fill_between(shaded, [model.pdf(v) for v in shaded], color=GOLD)
    ax.plot(x, [model.pdf(v) for v in x], color=GREEN, lw=2.8)
    ax.set(xlim=(start, end), ylim=(0, 1.22 * peak))
    ticks = [mean + k * sd for k in range(-3, 4)]
    ax.set_xticks(ticks, [f"{v:,.{decimals}f}" for v in ticks])
    ax.get_xticklabels()[3].set_weight("bold")
    ax.get_xticklabels()[3].set_color(GREEN)
    ax.set_xlabel(axis, labelpad=9)
    for value, label, side in cutoffs:
        ax.vlines(value, 0, model.pdf(value), color=GREEN, linestyles="--", lw=1.25)
        ax.annotate(label, (value, model.pdf(value)),
                    (mean + side * 3.48 * sd, peak * .89),
                    ha="left" if side < 0 else "right",
                    va="center", color=GREEN, fontsize=13, weight="bold",
                    arrowprops={"arrowstyle": "->", "color": GREEN, "lw": 1})
    save(fig, name, title, f"{axis}. Mean {mean:g}, standard deviation {sd:g}. {area_label}.")


def dotplot(ax, values, color=GREEN):
    positions, heights = [], []
    for value, count in sorted(Counter(values).items()):
        positions.extend([value] * count)
        heights.extend(range(1, count + 1))
    ax.scatter(positions, heights, s=40, color=color, zorder=3)


fig, ax = plt.subplots(figsize=(8, 3.3), facecolor=PAPER)
fig.subplots_adjust(left=.12, right=.96, bottom=.22, top=.71)
heading(fig, "Heads in three fair coin tosses", "Each bar is a probability. All four probabilities sum to 1.")
style(ax, show_y=True)
probabilities = [1/8, 3/8, 3/8, 1/8]
ax.bar(range(4), probabilities, width=.65, color=GREEN)
for x, p, label in zip(range(4), probabilities, ["1/8", "3/8", "3/8", "1/8"]):
    ax.text(x, p + .025, label, ha="center", fontsize=12)
ax.set(xticks=range(4), ylim=(0, .49), yticks=[0, .125, .25, .375],
       xlabel="Number of heads", ylabel="Probability")
save(fig, "discrete-heads", "Heads in three fair coin tosses",
     "Counts 0, 1, 2, and 3 have probabilities one eighth, three eighths, three eighths, and one eighth.")

fig = plt.figure(figsize=(8, 3.5), facecolor=PAPER)
heading(fig, "How success probability changes binomial shape", "Each histogram uses ten trials and the same axis scales.")
for i, (p, shape) in enumerate([(.2, "Right skew"), (.5, "Symmetric"), (.8, "Left skew")]):
    ax = fig.add_axes([.09 + i * .305, .23, .25, .41])
    style(ax, show_y=(i == 0))
    x = np.arange(11)
    ax.bar(x, [comb(10, int(k)) * p**k * (1-p)**(10-k) for k in x],
           width=.82, color=GREEN if i == 1 else BLUE)
    ax.set(xlim=(-.5, 10.5), ylim=(0, .35), xticks=[0, 5, 10],
           xlabel="Success count")
    ax.set_title(f"p = {p} · {shape}", fontsize=12, weight="bold", pad=9)
    if i == 0:
        ax.set(yticks=[0, .1, .2, .3], ylabel="Probability")
save(fig, "binomial-shapes", "Three binomial probability histograms",
     "With ten trials, p equals 0.2 gives right skew, 0.5 gives symmetry, and 0.8 gives left skew.")

fig, ax = plt.subplots(figsize=(8, 3.3), facecolor=PAPER)
fig.subplots_adjust(left=.12, right=.96, bottom=.22, top=.71)
heading(fig, "Uniform train journey time", "The rectangle from 2 to 5 minutes has total area 1.")
style(ax, show_y=True)
ax.fill_between([2, 4], 1/3, color=GOLD)
ax.plot([1.6, 2, 2, 5, 5, 5.4], [0, 0, 1/3, 1/3, 0, 0], color=GREEN, lw=2.5)
ax.vlines(4, 0, 1/3, color=GREEN, linestyles="--", lw=1.3)
ax.text(3, .16, "Shaded area = 2/3", ha="center", weight="bold")
ax.set(xlim=(1.6, 5.4), ylim=(0, .43), xticks=[2, 3, 4, 5], xlabel="Journey time (minutes)")
ax.set_yticks([0, 1/3], ["0", "1/3"])
ax.set_ylabel("Density")
save(fig, "uniform-train", "Uniform train journey time",
     "A density of one third over the interval from 2 to 5 minutes. The shaded interval from 2 to 4 has area two thirds.")

tire = NormalDist(60_000, 8_300)
lamp = NormalDist(350.7, 30.1)
top = lamp.inv_cdf(.90)
q1, q3 = lamp.inv_cdf(.25), lamp.inv_cdf(.75)
normal_plot("normal-tire-left", "Tire life below the warranty limit", "Tire life (miles)",
            tire, -np.inf, 45_000, f"Shaded area {tire.cdf(45_000):.2%}",
            [(45_000, "45,000 miles", -1)], 0)
normal_plot("normal-lamp-right", "Lamp lifetimes above 400 days", "Lifetime (days)",
            lamp, 400, np.inf, f"Shaded area {1-lamp.cdf(400):.4f}",
            [(400, "400 days", 1)], 1)
normal_plot("normal-lamp-between", "Lamp lifetimes between two bounds", "Lifetime (days)",
            lamp, 300, 365, f"Shaded area {lamp.cdf(365)-lamp.cdf(300):.4f}",
            [(300, "300 days", -1), (365, "365 days", 1)], 1)
normal_plot("normal-lamp-top", "Cutoff for the longest 10% of lamp lifetimes", "Lifetime (days)",
            lamp, top, np.inf, "Shaded right area 0.10 · left area 0.90",
            [(top, f"{top:.2f} days", 1)], 1)
normal_plot("normal-lamp-iqr", "Quartiles of lamp lifetimes", "Lifetime (days)",
            lamp, q1, q3, "Shaded middle area 0.50",
            [(q1, f"Q₁ = {q1:.2f}", -1), (q3, f"Q₃ = {q3:.2f}", 1)], 1)
normal_plot("normal-exam-central", "The middle 68% of exam scores", "Exam score (points)",
            NormalDist(100, 20), 80, 120, "Shaded area about 68%",
            [(80, "16th percentile", -1), (120, "84th percentile", 1)], 0)

fig = plt.figure(figsize=(8, 3.5), facecolor=PAPER)
heading(fig, "Population, sample, and sampling distributions", "Every dot represents the quantity named on its axis.")
population = [63, 65, 66, 69]
sample_means = [sum(pair)/2 for pair in combinations(population, 2)]
panels = [
    ("Population", population, "Height (in.)", "All four heights"),
    ("One sample", [63, 69], "Height (in.)", "Two selected heights"),
    ("Sampling distribution", sample_means, "Sample mean (in.)", "All six means for n = 2"),
]
for i, (title, values, axis, caption) in enumerate(panels):
    ax = fig.add_axes([.07 + i * .311, .32, .26, .25])
    style(ax)
    dotplot(ax, values)
    ax.set(xlim=(62.4, 69.6), ylim=(.45, 1.65), xticks=[63, 65, 67, 69], xlabel=axis)
    ax.set_title(title, fontsize=12, weight="bold", pad=8)
    fig.text(.20 + i * .311, .10, caption, fontsize=11, ha="center", color=QUIET)
save(fig, "sampling-levels", "Three distributions from four heights",
     "Population values are 63, 65, 66, and 69. The displayed sample is 63 and 69. All six sample means are 64, 64.5, 65.5, 66, 67, and 67.5.")

fig = plt.figure(figsize=(8, 4.3), facecolor=PAPER)
heading(fig, "Bias and variability of an estimator", "Illustrative sampling distributions on the same scale")
narrow = [-.6, -.4, -.25, -.1, 0, 0, .1, .25, .4, .6]
wide = [-1.5, -1, -.75, -.4, 0, 0, .4, .75, 1, 1.5]
for row, (offsets, spread) in enumerate([(narrow, "Low variability"), (wide, "High variability")]):
    for col, (shift, bias) in enumerate([(0, "Low bias"), (1, "High bias")]):
        ax = fig.add_axes([.07 + col * .46, .48 - row * .34, .39, .19])
        style(ax)
        ax.axvline(0, color=QUIET, linestyle="--", lw=1.2)
        dotplot(ax, [x + shift for x in offsets], GREEN if col == 0 else BLUE)
        ax.set(xlim=(-2, 3), ylim=(.4, 2.5))
        ax.set_xticks([0], ["Target parameter"])
        ax.set_title(f"{bias} · {spread}", fontsize=12, weight="bold", pad=7)
save(fig, "bias-variability", "Bias and variability in four sampling distributions",
     "Bias shifts the center away from the target parameter. Greater variability spreads statistics farther from their own center.")

fig, ax = plt.subplots(figsize=(8, 4.2), facecolor=PAPER)
fig.subplots_adjust(left=.10, right=.96, bottom=.23, top=.61)
heading(fig, "A fully labeled Normal curve", "Illustrative orange-mass model · mean 100 g · SD 10 g")
style(ax)
orange_model = NormalDist(100, 10)
mass = np.linspace(65, 135, 600)
ax.plot(mass, [orange_model.pdf(value) for value in mass], color=GREEN, lw=2.8)
tail = np.linspace(120, 135, 150)
ax.fill_between(tail, [orange_model.pdf(value) for value in tail], color=GOLD)
ax.set(xlim=(65, 135), ylim=(0, .05), xticks=range(70, 131, 10), xlabel="Orange mass X (g)")
ax.axvline(100, color=QUIET, linestyle="--", lw=1)
ax.vlines(120, 0, orange_model.pdf(120), color=GREEN, linestyles="--", lw=1.2)
z_axis = ax.secondary_xaxis("top", functions=(lambda value: (value-100)/10, lambda z: 100+10*z))
z_axis.set_xticks(range(-3, 4))
z_axis.set_xlabel("z-score", fontsize=13, labelpad=7)
z_axis.spines["top"].set(color=LINE, linewidth=1.2)
z_axis.tick_params(length=4, color=LINE, labelsize=11, pad=5)
ax.annotate("Mean = 100 g", (100, orange_model.pdf(100)), (74, .041),
            fontsize=12, color=GREEN, arrowprops={"arrowstyle": "->", "color": GREEN})
ax.annotate("120 g · z = 2", (120, orange_model.pdf(120)), (113, .025),
            fontsize=12, color=GREEN, arrowprops={"arrowstyle": "->", "color": GREEN})
fig.text(.10, .07, "Shaded region represents masses greater than 120 g.", fontsize=12, color=QUIET)
save(fig, "normal-label-checklist", "A fully labeled Normal orange-mass curve",
     "The illustrative distribution has mean 100 grams and standard deviation 10 grams. "
     "Mass ticks from 70 through 130 grams align with z-scores from minus 3 through plus 3. "
     "The shaded upper tail begins at 120 grams, corresponding to z equals 2.")

fig = plt.figure(figsize=(10, 5.4), facecolor=PAPER)
heading(fig, "Disease → Test result → Path probability", "p = prevalence · α = false positive rate · β = false negative rate")
ax = fig.add_axes([.03, .04, .94, .73])
ax.set(xlim=(0, 1), ylim=(0, 1))
ax.set_axis_off()
root = (.04, .50)
disease = (.30, .75)
no_disease = (.30, .25)
end_x = .61
for start, end in [(root, disease), (root, no_disease),
                   (disease, (end_x, .92)), (disease, (end_x, .60)),
                   (no_disease, (end_x, .40)), (no_disease, (end_x, .08))]:
    ax.plot([start[0], end[0]], [start[1], end[1]], color=QUIET, lw=1.8, zorder=1)
for point in [root, disease, no_disease]:
    ax.plot(*point, "o", color=GREEN, markersize=6)
ax.text(.23, .78, "Disease (D)", ha="right", fontsize=12, weight="bold")
ax.text(.23, .20, "No disease (Dᶜ)", ha="right", fontsize=12, weight="bold")
label_box = {"facecolor": PAPER, "edgecolor": "none", "pad": 3}
for x, y, label in [(.13, .68, "p"), (.13, .31, "1 − p"),
                     (.455, .87, "P(+ | D) = 1 − β"), (.455, .63, "P(− | D) = β"),
                     (.455, .37, "P(+ | Dᶜ) = α"), (.455, .13, "P(− | Dᶜ) = 1 − α")]:
    ax.text(x, y, label, ha="center", va="center", fontsize=12, bbox=label_box, zorder=2)
for y, product, outcome, color in [
    (.92, "p(1 − β)", "True positive", GREEN),
    (.60, "pβ", "False negative", BLUE),
    (.40, "(1 − p)α", "False positive", BLUE),
    (.08, "(1 − p)(1 − α)", "True negative", GREEN),
]:
    ax.plot(end_x, y, "o", color=color, markersize=5)
    ax.text(.65, y+.015, product, fontsize=15, weight="bold", color=color, va="center")
    ax.text(.65, y-.05, outcome, fontsize=12, color=QUIET, va="center")
save(fig, "testing-error-tree", "Complete disease-testing probability tree",
     "The disease branch has probability p and the no-disease branch has probability 1 minus p. "
     "Given disease, positive and negative probabilities are 1 minus beta and beta. "
     "Given no disease, positive and negative probabilities are alpha and 1 minus alpha. "
     "The four endpoint products are p times 1 minus beta, p times beta, "
     "1 minus p times alpha, and 1 minus p times 1 minus alpha.")
