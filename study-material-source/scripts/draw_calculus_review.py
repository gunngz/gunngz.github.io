"""Draw compact schematic graphs for the supplied calculus review sheet.

Run with Matplotlib and NumPy. These illustrate the rules; they do not
reproduce a released-exam figure.
"""

from pathlib import Path
import xml.etree.ElementTree as ET

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

DEST = Path(__file__).resolve().parents[1] / "public/diagrams"
INK, QUIET, PAPER, LINE = "#282720", "#716d62", "#fffaf1", "#e5dac9"
GREEN, BLUE = "#526f5c", "#628b9c"

plt.rcParams.update({
    "svg.fonttype": "none", "svg.hashsalt": "calculus-review",
    "font.family": "DejaVu Sans", "font.size": 13,
    "text.color": INK, "axes.labelcolor": INK,
    "xtick.color": QUIET, "ytick.color": QUIET,
})


def style(ax, *, ylim):
    ax.set_facecolor(PAPER)
    ax.set(xlim=(-2.4, 2.4), ylim=ylim)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.axhline(0, color=LINE, linewidth=1.5, zorder=1)
    ax.axvline(0, color=LINE, linewidth=1.5, zorder=1)
    ax.text(2.38, -.12, "x", ha="right", va="top", color=QUIET, fontsize=12)


def save(fig, name, title, description):
    path = DEST / f"calculus-{name}.svg"
    fig.savefig(path, metadata={"Date": None}, facecolor=PAPER)
    plt.close(fig)
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    tree = ET.parse(path)
    root = tree.getroot()
    root.set("role", "img")
    root.set("aria-labelledby", f"calculus-{name}-title calculus-{name}-desc")
    font_style = ET.Element("{http://www.w3.org/2000/svg}style")
    font_style.text = "text { font-family: Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important; }"
    root.insert(0, font_style)
    for tag, value in [("title", title), ("desc", description)]:
        element = ET.Element(f"{{http://www.w3.org/2000/svg}}{tag}", {"id": f"calculus-{name}-{tag}"})
        element.text = value
        root.insert(0, element)
    tree.write(path, encoding="unicode", xml_declaration=True)


def absolute_value():
    fig, ax = plt.subplots(figsize=(7.2, 3.3), facecolor=PAPER)
    fig.subplots_adjust(left=.06, right=.96, bottom=.19, top=.93)
    style(ax, ylim=(-.55, 2.8))
    x = np.linspace(-2.1, 2.1, 301)
    ax.plot(x, np.abs(x), color=GREEN, linewidth=3, zorder=3)
    ax.plot(0, 0, "o", color=GREEN, markersize=6, zorder=4)
    ax.text(0, -.20, "0", ha="center", va="top", fontsize=12)
    ax.annotate("Left slope: -1", xy=(-1.2, 1.2), xytext=(-2.1, 2.5),
                arrowprops={"arrowstyle": "->", "color": QUIET}, fontsize=13)
    ax.annotate("Right slope: +1", xy=(1.2, 1.2), xytext=(.65, 2.5),
                arrowprops={"arrowstyle": "->", "color": QUIET}, fontsize=13)
    fig.text(.5, .04, "Continuous at 0; unequal one-sided slopes create a corner.",
             ha="center", color=QUIET, fontsize=12)
    save(fig, "absolute-value", "A continuous corner",
         "The absolute-value graph meets at the origin. Its left slope is negative one and its right slope is positive one, so it is continuous but not differentiable at zero.")


def sign_change(*, crossing):
    fig, ax = plt.subplots(figsize=(4.4, 3.5), facecolor=PAPER)
    fig.subplots_adjust(left=.08, right=.96, bottom=.29, top=.77)
    x = np.linspace(-1.7, 1.7, 301)
    style(ax, ylim=(-2.1, 2.1))
    ax.text(-.15, -.22, "c", ha="right", va="top", fontsize=12)
    ax.plot(0, 0, "o", color=INK, markersize=4, zorder=4)
    color = GREEN if crossing else BLUE
    ax.plot(x, x if crossing else .6 * x**2, color=color, linewidth=3)
    ax.text(-1.6, -.5 if crossing else .3, "-" if crossing else "+", color=color, fontsize=21, weight="bold")
    ax.text(1.25, .3, "+", color=color, fontsize=21, weight="bold")
    fig.text(.08, .93, "Crosses zero" if crossing else "Touches zero", fontsize=14, weight="bold")
    fig.text(.08, .83, "Second derivative (schematic)", color=QUIET, fontsize=11)
    fig.text(.08, .16, "Concave down → concave up" if crossing else "Concave up on both sides", color=color, fontsize=12)
    fig.text(.08, .07, "Inflection if f is continuous at c." if crossing else "No change; no inflection point.", fontsize=11, color=QUIET)
    name = "sign-crossing" if crossing else "sign-touching"
    description = ("The second derivative changes from negative to positive, so the function changes from concave down to concave up."
                   if crossing else "The second derivative is positive on both sides of its zero, so concavity does not change.")
    save(fig, name, "Second derivative: " + name, description)


if __name__ == "__main__":
    DEST.mkdir(parents=True, exist_ok=True)
    absolute_value()
    sign_change(crossing=True)
    sign_change(crossing=False)
